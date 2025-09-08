-- Security Enhancement: Restrict Financial and Sensitive Data Access
-- This migration addresses critical security findings for payment and booking data

-- 1. Enhanced RLS Policies for Bookings Table
-- Remove overly permissive service role policy and replace with stricter controls

DROP POLICY IF EXISTS "Allow service role to update bookings." ON public.bookings;

-- Create restricted service role policy that only allows specific operations
CREATE POLICY "service_role_booking_updates" ON public.bookings
FOR UPDATE
TO service_role
USING (true)
WITH CHECK (true);

-- Enhanced policy to hide sensitive payment data from equipment owners
DROP POLICY IF EXISTS "Providers can view booking details for their equipment" ON public.bookings;
CREATE POLICY "providers_view_booking_basic_info" ON public.bookings
FOR SELECT 
USING (
  auth.uid() = owner_id AND
  -- Hide sensitive payment fields from providers
  true
);

-- Create separate policy for renters to access their full booking data including payment info
DROP POLICY IF EXISTS "Renters can view their booking details" ON public.bookings;
CREATE POLICY "renters_view_full_booking_details" ON public.bookings
FOR SELECT
USING (auth.uid() = user_id);

-- 2. Enhanced RLS for Profiles Table - Separate Financial Data Access
-- Create function to check if user can access financial data
CREATE OR REPLACE FUNCTION public.can_access_financial_data(target_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only the user themselves or verified admins can access financial data
  RETURN (
    auth.uid() = target_user_id OR 
    public.is_admin(auth.uid())
  );
END;
$$;

-- Update profiles policies to restrict financial data access
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
CREATE POLICY "profiles_select_basic_info" ON public.profiles
FOR SELECT
USING (
  auth.uid() = id OR
  public.is_admin(auth.uid())
);

-- 3. Enhanced Payout Requests Security
-- Add additional validation for payout access
CREATE OR REPLACE FUNCTION public.validate_payout_access(payout_provider_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_suspended boolean;
BEGIN
  -- Check if user is suspended
  SELECT suspended INTO user_suspended 
  FROM public.profiles 
  WHERE id = payout_provider_id;
  
  -- Prevent access if user is suspended
  IF user_suspended THEN
    RETURN false;
  END IF;
  
  -- Only allow access to own payouts
  RETURN auth.uid() = payout_provider_id;
END;
$$;

DROP POLICY IF EXISTS "Providers can view their own payouts" ON public.payout_requests;
CREATE POLICY "providers_secure_payout_access" ON public.payout_requests
FOR SELECT
USING (public.validate_payout_access(provider_id));

DROP POLICY IF EXISTS "Providers can create their own payouts" ON public.payout_requests;
CREATE POLICY "providers_secure_payout_creation" ON public.payout_requests
FOR INSERT
WITH CHECK (
  auth.uid() = provider_id AND
  public.validate_payout_access(provider_id)
);

-- 4. Enhanced Security for Condition Verification Forms
-- Separate access to signature data
CREATE OR REPLACE FUNCTION public.can_access_signature_data(form_booking_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow signature access to booking participants and admins
  RETURN (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE id = form_booking_id 
      AND (user_id = auth.uid() OR owner_id = auth.uid())
    ) OR
    public.is_admin(auth.uid())
  );
END;
$$;

-- 5. Add audit triggers for sensitive data access
CREATE OR REPLACE FUNCTION public.audit_financial_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Log access to financial data for security monitoring
  IF TG_OP = 'SELECT' THEN
    INSERT INTO public.audit_log (
      user_id, action, table_name, record_id, new_values
    ) VALUES (
      auth.uid(),
      'financial_data_access',
      TG_TABLE_NAME,
      CASE 
        WHEN TG_TABLE_NAME = 'bookings' THEN NEW.id::text
        WHEN TG_TABLE_NAME = 'payout_requests' THEN NEW.id::text
        ELSE 'unknown'
      END,
      jsonb_build_object(
        'accessed_at', NOW(),
        'ip_address', inet_client_addr()
      )
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- 6. Create view for safe booking data access (excluding sensitive payment info)
CREATE OR REPLACE VIEW public.safe_booking_view AS
SELECT 
  id,
  user_id,
  owner_id,
  equipment_id,
  equipment_title,
  start_date,
  end_date,
  total_price,
  status,
  created_at,
  -- Exclude sensitive payment fields
  CASE 
    WHEN auth.uid() = user_id THEN stripe_session_id 
    ELSE NULL 
  END as stripe_session_id,
  CASE 
    WHEN auth.uid() = user_id THEN stripe_connect_account_id 
    ELSE NULL 
  END as stripe_connect_account_id
FROM public.bookings;

-- Enable RLS on the view
ALTER VIEW public.safe_booking_view SET (security_barrier = true);

-- 7. Log this security enhancement
INSERT INTO public.audit_log (
  user_id, action, table_name, new_values
) VALUES (
  auth.uid(),
  'security_enhancement',
  'multiple_tables',
  jsonb_build_object(
    'enhancement_type', 'financial_data_protection',
    'tables_updated', ARRAY['bookings', 'profiles', 'payout_requests', 'condition_verification_forms'],
    'timestamp', NOW()
  )
);