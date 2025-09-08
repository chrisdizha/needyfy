-- Fix critical security issues identified in security scan

-- 1. Restrict profiles table access more strictly
DROP POLICY IF EXISTS "profiles_select_basic_info" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_admin" ON public.profiles;

-- Create more restrictive profile access policies
CREATE POLICY "profiles_own_data_only" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_admin_full_access" 
ON public.profiles 
FOR ALL 
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- 2. Secure equipment listings - remove anonymous access
DROP POLICY IF EXISTS "Public can view basic equipment info" ON public.equipment_listings;

-- Only authenticated users can view equipment listings
CREATE POLICY "authenticated_users_equipment_access" 
ON public.equipment_listings 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND status = 'active');

-- 3. Ensure payment audit log is admin-only
DROP POLICY IF EXISTS "Admins can view payment audit logs" ON public.payment_audit_log;

CREATE POLICY "admin_only_payment_audit_access" 
ON public.payment_audit_log 
FOR SELECT 
USING (public.is_admin(auth.uid()));

-- 4. Strengthen payout request access control
DROP POLICY IF EXISTS "providers_secure_payout_access" ON public.payout_requests;
DROP POLICY IF EXISTS "providers_secure_payout_creation" ON public.payout_requests;

CREATE POLICY "strict_payout_owner_access" 
ON public.payout_requests 
FOR SELECT 
USING (
  auth.uid() = provider_id 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = provider_id AND suspended = true)
);

CREATE POLICY "strict_payout_creation" 
ON public.payout_requests 
FOR INSERT 
WITH CHECK (
  auth.uid() = provider_id 
  AND NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = provider_id AND suspended = true)
  AND public.validate_payment_operation(provider_id, 'payout_request', amount)
);

-- 5. Add additional security for bookings table
CREATE POLICY "bookings_financial_data_protection" 
ON public.bookings 
FOR SELECT 
USING (
  CASE 
    WHEN auth.uid() = user_id THEN true  -- Renter sees all
    WHEN auth.uid() = owner_id THEN (stripe_session_id IS NULL OR stripe_session_id = '')  -- Provider sees limited
    WHEN public.is_admin(auth.uid()) THEN true  -- Admin sees all
    ELSE false
  END
);

-- 6. Create function to audit sensitive data access
CREATE OR REPLACE FUNCTION public.audit_sensitive_access(
  p_table_name text,
  p_access_type text,
  p_record_id text DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log access to sensitive data
  INSERT INTO public.audit_log (
    user_id, action, table_name, record_id, new_values, ip_address
  ) VALUES (
    auth.uid(),
    p_access_type || '_sensitive_data',
    p_table_name,
    p_record_id,
    jsonb_build_object(
      'timestamp', NOW(),
      'user_agent', current_setting('request.headers', true)::json->>'user-agent'
    ),
    inet_client_addr()
  );

  -- Log high-risk access as security event
  IF p_table_name IN ('profiles', 'payout_requests', 'payment_audit_log') THEN
    PERFORM public.log_security_event_enhanced(
      auth.uid(),
      'sensitive_data_access',
      jsonb_build_object(
        'table', p_table_name,
        'access_type', p_access_type,
        'record_id', p_record_id
      ),
      inet_client_addr(),
      current_setting('request.headers', true)::json->>'user-agent',
      'medium'
    );
  END IF;
END;
$function$;

-- 7. Add triggers to audit sensitive table access
CREATE OR REPLACE FUNCTION public.trigger_audit_sensitive_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only audit SELECT operations on sensitive tables
  IF TG_OP = 'SELECT' AND TG_TABLE_NAME IN ('profiles', 'payout_requests', 'payment_audit_log') THEN
    PERFORM public.audit_sensitive_access(
      TG_TABLE_NAME,
      'SELECT',
      CASE 
        WHEN TG_TABLE_NAME = 'profiles' THEN NEW.id::text
        WHEN TG_TABLE_NAME = 'payout_requests' THEN NEW.id::text  
        WHEN TG_TABLE_NAME = 'payment_audit_log' THEN NEW.id::text
        ELSE NULL
      END
    );
  END IF;
  
  RETURN NEW;
END;
$function$;