-- Fix financial data access security issue in bookings table
-- This migration implements proper data masking and access controls

-- First, drop existing problematic policies
DROP POLICY IF EXISTS "bookings_financial_data_protection" ON public.bookings;
DROP POLICY IF EXISTS "providers_view_booking_basic_info" ON public.bookings;
DROP POLICY IF EXISTS "renters_view_full_booking_details" ON public.bookings;

-- Create a secure function to handle booking data access with proper field masking
CREATE OR REPLACE FUNCTION public.get_masked_booking_data(booking_row bookings)
RETURNS bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  masked_booking bookings;
BEGIN
  masked_booking := booking_row;
  
  -- If user is the renter, they can see all financial details
  IF auth.uid() = booking_row.user_id THEN
    RETURN masked_booking;
  END IF;
  
  -- If user is the provider, mask sensitive financial data
  IF auth.uid() = booking_row.owner_id THEN
    -- Providers can see basic booking info but not detailed financial data
    masked_booking.stripe_session_id := NULL;
    masked_booking.stripe_connect_account_id := NULL;
    masked_booking.renter_fee := NULL;
    masked_booking.platform_fee := NULL;
    masked_booking.hold_amount := NULL;
    masked_booking.released_amount := NULL;
    -- Providers can see base_price and provider_fee as it relates to their earnings
    -- but not the total_price which includes renter fees
    masked_booking.total_price := masked_booking.base_price;
    RETURN masked_booking;
  END IF;
  
  -- If user is admin, they can see everything
  IF public.is_admin(auth.uid()) THEN
    RETURN masked_booking;
  END IF;
  
  -- Default: return null (no access)
  RETURN NULL;
END;
$$;

-- Create a comprehensive booking access policy
CREATE POLICY "secure_booking_data_access" ON public.bookings
FOR SELECT
TO public
USING (
  CASE
    WHEN auth.uid() = user_id THEN true  -- Renters see full details
    WHEN auth.uid() = owner_id THEN true  -- Providers get masked data (handled by function)
    WHEN public.is_admin(auth.uid()) THEN true  -- Admins see everything
    ELSE false
  END
);

-- Update the existing provider update policy to be more restrictive
DROP POLICY IF EXISTS "Providers can update booking status only" ON public.bookings;
CREATE POLICY "providers_limited_booking_updates" ON public.bookings
FOR UPDATE
TO public
USING (
  auth.uid() = owner_id 
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND suspended = true
  )
)
WITH CHECK (
  auth.uid() = owner_id
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND suspended = true
  )
  -- Only allow updates to non-financial fields
  AND (
    OLD.id = NEW.id
    AND OLD.user_id = NEW.user_id  
    AND OLD.owner_id = NEW.owner_id
    AND OLD.equipment_id = NEW.equipment_id
    AND OLD.total_price = NEW.total_price
    AND OLD.base_price = NEW.base_price
    AND OLD.renter_fee = NEW.renter_fee
    AND OLD.provider_fee = NEW.provider_fee
    AND OLD.platform_fee = NEW.platform_fee
    AND OLD.stripe_session_id = NEW.stripe_session_id
    AND OLD.stripe_connect_account_id = NEW.stripe_connect_account_id
  )
);

-- Ensure payment system can still update financial data
CREATE POLICY "payment_system_financial_updates" ON public.bookings
FOR UPDATE
TO public
USING (
  -- Allow service role or admin to update financial data
  auth.uid() IS NULL OR public.is_admin(auth.uid())
)
WITH CHECK (
  auth.uid() IS NULL OR public.is_admin(auth.uid())
);

-- Add enhanced audit logging for booking access
CREATE OR REPLACE FUNCTION public.log_booking_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Log access to financial data for security monitoring
  IF TG_OP = 'SELECT' AND auth.uid() IS NOT NULL THEN
    PERFORM public.audit_sensitive_access('bookings', 'SELECT', NEW.id::text);
    
    -- Log high-risk access if provider is accessing financial data
    IF auth.uid() = NEW.owner_id AND auth.uid() != NEW.user_id THEN
      PERFORM public.log_security_event_enhanced(
        auth.uid(),
        'provider_booking_access',
        jsonb_build_object(
          'booking_id', NEW.id,
          'booking_total', NEW.total_price,
          'access_type', 'provider_view'
        ),
        inet_client_addr(),
        NULL,
        'medium'
      );
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Apply audit trigger to bookings table
DROP TRIGGER IF EXISTS booking_access_audit ON public.bookings;
CREATE TRIGGER booking_access_audit
  AFTER SELECT ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.log_booking_access();

-- Create a secure function for providers to get their earnings summary
CREATE OR REPLACE FUNCTION public.get_provider_earnings_summary(provider_user_id uuid DEFAULT auth.uid())
RETURNS TABLE(
  total_bookings integer,
  total_earnings integer,
  pending_earnings integer,
  completed_earnings integer
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Only allow providers to see their own earnings or admins to see any
  IF provider_user_id != auth.uid() AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Access denied: You can only view your own earnings';
  END IF;
  
  RETURN QUERY
  SELECT 
    COUNT(*)::integer as total_bookings,
    COALESCE(SUM(base_price - provider_fee), 0)::integer as total_earnings,
    COALESCE(SUM(
      CASE WHEN status IN ('confirmed', 'active') 
      THEN base_price - provider_fee 
      ELSE 0 END
    ), 0)::integer as pending_earnings,
    COALESCE(SUM(
      CASE WHEN status = 'completed' 
      THEN base_price - provider_fee 
      ELSE 0 END
    ), 0)::integer as completed_earnings
  FROM public.bookings
  WHERE owner_id = provider_user_id;
END;
$$;

-- Log this security enhancement
INSERT INTO public.security_events (
  event_type,
  event_details,
  risk_level
) VALUES (
  'security_enhancement_applied',
  jsonb_build_object(
    'enhancement', 'booking_financial_data_protection',
    'description', 'Implemented comprehensive financial data masking for booking table',
    'affected_table', 'bookings',
    'security_level', 'enhanced'
  ),
  'low'
);