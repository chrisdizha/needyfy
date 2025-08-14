
-- Phase 1: Critical Data Protection - Strengthen RLS Policies

-- 1. Remove overly permissive profile policies and add stricter ones
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_admin" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;

-- Create more restrictive profile policies
CREATE POLICY "profiles_select_own_only" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin_verified" ON public.profiles
  FOR SELECT 
  USING (
    is_admin(auth.uid()) AND 
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role = 'admin' AND user_id = auth.uid()
    )
  );

CREATE POLICY "profiles_update_own_basic" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id AND
    -- Prevent users from modifying sensitive financial fields
    (OLD.visa_card_number_encrypted IS NOT DISTINCT FROM NEW.visa_card_number_encrypted) AND
    (OLD.visa_card_last_four IS NOT DISTINCT FROM NEW.visa_card_last_four) AND
    (OLD.visa_card_holder_name IS NOT DISTINCT FROM NEW.visa_card_holder_name) AND
    (OLD.suspended IS NOT DISTINCT FROM NEW.suspended) AND
    (OLD.suspension_reason IS NOT DISTINCT FROM NEW.suspension_reason) AND
    (OLD.suspended_at IS NOT DISTINCT FROM NEW.suspended_at)
  );

CREATE POLICY "profiles_update_admin_verified" ON public.profiles
  FOR UPDATE 
  USING (
    is_admin(auth.uid()) AND 
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role = 'admin' AND user_id = auth.uid()
    )
  )
  WITH CHECK (
    is_admin(auth.uid()) AND 
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role = 'admin' AND user_id = auth.uid()
    )
  );

-- 2. Strengthen booking security policies
DROP POLICY IF EXISTS "Providers can view booking details for their equipment" ON public.bookings;
DROP POLICY IF EXISTS "Renters can view their booking details" ON public.bookings;
DROP POLICY IF EXISTS "Providers can update booking status only" ON public.bookings;

CREATE POLICY "bookings_select_owner_only" ON public.bookings
  FOR SELECT 
  USING (auth.uid() = owner_id);

CREATE POLICY "bookings_select_renter_only" ON public.bookings
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "bookings_update_owner_status_only" ON public.bookings
  FOR UPDATE 
  USING (auth.uid() = owner_id)
  WITH CHECK (
    auth.uid() = owner_id AND
    -- Only allow status updates, protect financial data
    (OLD.total_price IS NOT DISTINCT FROM NEW.total_price) AND
    (OLD.base_price IS NOT DISTINCT FROM NEW.base_price) AND
    (OLD.stripe_session_id IS NOT DISTINCT FROM NEW.stripe_session_id) AND
    (OLD.stripe_connect_account_id IS NOT DISTINCT FROM NEW.stripe_connect_account_id)
  );

-- 3. Secure financial tables completely
DROP POLICY IF EXISTS "Providers can view their own payouts" ON public.payout_requests;
DROP POLICY IF EXISTS "Providers can create their own payouts" ON public.payout_requests;

CREATE POLICY "payout_requests_select_owner_verified" ON public.payout_requests
  FOR SELECT 
  USING (
    auth.uid() = provider_id AND
    -- Additional verification that user owns the bookings
    NOT EXISTS (
      SELECT 1 FROM unnest(booking_ids) AS booking_id
      WHERE booking_id NOT IN (
        SELECT id FROM public.bookings WHERE owner_id = auth.uid()
      )
    )
  );

CREATE POLICY "payout_requests_insert_owner_verified" ON public.payout_requests
  FOR INSERT 
  WITH CHECK (
    auth.uid() = provider_id AND
    -- Verify all booking IDs belong to the requesting user
    NOT EXISTS (
      SELECT 1 FROM unnest(booking_ids) AS booking_id
      WHERE booking_id NOT IN (
        SELECT id FROM public.bookings WHERE owner_id = auth.uid()
      )
    )
  );

-- 4. Lock down security and audit tables completely
DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;
DROP POLICY IF EXISTS "Admins can view payment audit logs" ON public.payment_audit_log;

-- Create super-restrictive admin-only policies
CREATE POLICY "security_events_super_admin_only" ON public.security_events
  FOR ALL
  USING (
    is_admin(auth.uid()) AND
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role = 'admin' AND user_id = auth.uid()
    ) AND
    -- Additional check: must be a verified admin with recent activity
    EXISTS (
      SELECT 1 FROM public.audit_log 
      WHERE user_id = auth.uid() 
      AND created_at > NOW() - INTERVAL '30 days'
    )
  );

CREATE POLICY "audit_log_super_admin_only" ON public.audit_log
  FOR SELECT
  USING (
    is_admin(auth.uid()) AND
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role = 'admin' AND user_id = auth.uid()
    )
  );

CREATE POLICY "payment_audit_super_admin_only" ON public.payment_audit_log
  FOR SELECT
  USING (
    is_admin(auth.uid()) AND
    auth.uid() IN (
      SELECT user_id FROM public.user_roles 
      WHERE role = 'admin' AND user_id = auth.uid()
    )
  );

-- 5. Add data access logging trigger for sensitive tables
CREATE OR REPLACE FUNCTION public.log_sensitive_data_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to profiles table
  IF TG_TABLE_NAME = 'profiles' THEN
    PERFORM public.log_security_event(
      auth.uid(),
      'sensitive_data_access',
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'target_user_id', COALESCE(NEW.id, OLD.id),
        'accessed_fields', CASE 
          WHEN TG_OP = 'SELECT' THEN jsonb_build_array('profile_data')
          ELSE jsonb_build_array('profile_modification')
        END
      ),
      inet_client_addr(),
      NULL,
      'medium'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add triggers for sensitive data access logging
CREATE TRIGGER profiles_access_log
  AFTER SELECT OR UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.log_sensitive_data_access();

-- 6. Create enhanced admin verification function
CREATE OR REPLACE FUNCTION public.is_verified_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Multi-layered admin verification
  RETURN (
    -- Must be authenticated
    _user_id IS NOT NULL AND
    -- Must have admin role
    EXISTS (
      SELECT 1 FROM public.user_roles 
      WHERE user_id = _user_id AND role = 'admin'
    ) AND
    -- Must not be suspended
    NOT EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = _user_id AND suspended = true
    ) AND
    -- Must have recent legitimate activity
    EXISTS (
      SELECT 1 FROM public.audit_log 
      WHERE user_id = _user_id 
      AND created_at > NOW() - INTERVAL '90 days'
      AND action NOT LIKE '%_violation%'
    )
  );
END;
$$;

-- 7. Add financial data protection trigger
CREATE OR REPLACE FUNCTION public.protect_financial_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Log any financial data access
  IF TG_TABLE_NAME IN ('payout_requests', 'payment_audit_log', 'escrow_releases') THEN
    PERFORM public.log_security_event(
      auth.uid(),
      'financial_data_access',
      jsonb_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', COALESCE(NEW.id, OLD.id)::text
      ),
      inet_client_addr(),
      NULL,
      'high'
    );
  END IF;
  
  -- Additional validation for high-value operations
  IF TG_TABLE_NAME = 'payout_requests' AND NEW.amount > 100000 THEN -- $1000+
    PERFORM public.log_security_event(
      auth.uid(),
      'high_value_payout_request',
      jsonb_build_object(
        'amount', NEW.amount,
        'provider_id', NEW.provider_id
      ),
      inet_client_addr(),
      NULL,
      'critical'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add financial data protection triggers
CREATE TRIGGER payout_requests_protection
  AFTER INSERT OR UPDATE ON public.payout_requests
  FOR EACH ROW EXECUTE FUNCTION public.protect_financial_data();

CREATE TRIGGER escrow_releases_protection
  AFTER SELECT OR UPDATE ON public.escrow_releases
  FOR EACH ROW EXECUTE FUNCTION public.protect_financial_data();
