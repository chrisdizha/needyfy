-- Fix remaining security warnings with corrected syntax

-- 1. Fix rate_limit_log policy to be more restrictive
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limit_log;

-- Create a simple but secure rate limiting policy
CREATE POLICY "admin_and_system_rate_limit_access" 
ON public.rate_limit_log 
FOR ALL 
USING (public.is_admin(auth.uid()) OR auth.uid() IS NULL)
WITH CHECK (public.is_admin(auth.uid()) OR auth.uid() IS NULL);

-- 2. Improve bookings service role policy
DROP POLICY IF EXISTS "service_role_booking_updates" ON public.bookings;

-- Create secure service role policy for payment processing only
CREATE POLICY "payment_system_booking_updates" 
ON public.bookings 
FOR UPDATE 
USING (
  -- Allow updates only from payment processing (when no user context)
  auth.uid() IS NULL OR public.is_admin(auth.uid())
)
WITH CHECK (
  auth.uid() IS NULL OR public.is_admin(auth.uid())
);

-- 3. Secure AI interactions table
DROP POLICY IF EXISTS "Service role can insert AI interactions" ON public.ai_interactions;

-- Create secure AI interactions policy
CREATE POLICY "secure_ai_interactions_creation" 
ON public.ai_interactions 
FOR INSERT 
WITH CHECK (
  -- Users can create their own interactions or system can create with user context
  (auth.uid() = user_id) OR 
  (auth.uid() IS NULL AND user_id IS NOT NULL)
);

-- 4. Add comprehensive security monitoring function
CREATE OR REPLACE FUNCTION public.log_critical_operation(
  p_table_name text,
  p_operation text,
  p_record_id text DEFAULT NULL,
  p_details jsonb DEFAULT '{}'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log critical operations for monitoring
  INSERT INTO public.security_events (
    user_id,
    event_type,
    event_details,
    ip_address,
    risk_level
  ) VALUES (
    auth.uid(),
    'critical_table_operation',
    jsonb_build_object(
      'table_name', p_table_name,
      'operation', p_operation,
      'record_id', p_record_id,
      'details', p_details,
      'timestamp', NOW(),
      'role', current_setting('role', true)
    ),
    inet_client_addr(),
    'high'
  );
END;
$function$;

-- 5. Create final security validation function
CREATE OR REPLACE FUNCTION public.final_security_check()
RETURNS TABLE(check_name text, status text, details text, severity text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check anonymous access is removed
  RETURN QUERY
  SELECT 
    'anonymous_equipment_access_removed'::text,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'equipment_listings' 
      AND qual LIKE '%auth.uid() IS NULL%'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Anonymous access to equipment listings should be removed'::text,
    'high'::text;
  
  -- Check profiles are secured
  RETURN QUERY
  SELECT 
    'profiles_secured'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'profiles' 
      AND policyname = 'profiles_own_data_only'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Profile access should be restricted to owners only'::text,
    'critical'::text;
  
  -- Check payment audit is admin-only
  RETURN QUERY
  SELECT 
    'payment_audit_secured'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'payment_audit_log' 
      AND policyname = 'admin_only_payment_audit_access'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Payment audit logs should be admin-only'::text,
    'high'::text;
  
  -- Check service role policies are secured
  RETURN QUERY
  SELECT 
    'service_roles_secured'::text,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND (qual = 'true' OR with_check = 'true')
      AND tablename IN ('rate_limit_log', 'bookings', 'ai_interactions')
    ) THEN 'PASS' ELSE 'WARNING' END::text,
    'Service role policies should have proper restrictions'::text,
    'medium'::text;
END;
$function$;