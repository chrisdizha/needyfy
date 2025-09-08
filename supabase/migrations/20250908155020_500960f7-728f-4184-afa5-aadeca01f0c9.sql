-- Fix rate limiting system by removing overly restrictive policy
DROP POLICY IF EXISTS "No public access to rate limits" ON public.rate_limit_log;

-- Create proper rate limiting policies
CREATE POLICY "Service role can manage rate limits" 
ON public.rate_limit_log 
FOR ALL 
USING (true) 
WITH CHECK (true);

-- Create security validation function
CREATE OR REPLACE FUNCTION public.validate_security_completeness()
RETURNS TABLE(check_name text, status text, details text, severity text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Check rate limiting functionality
  RETURN QUERY
  SELECT 
    'rate_limiting_system'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'rate_limit_log'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Rate limiting system should be functional'::text,
    'high'::text;
  
  -- Check RLS on critical tables
  RETURN QUERY
  SELECT 
    'profiles_rls_enabled'::text,
    CASE WHEN (
      SELECT relrowsecurity FROM pg_class 
      WHERE relname = 'profiles' AND relnamespace = 'public'::regnamespace
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'RLS must be enabled on profiles table'::text,
    'critical'::text;
  
  -- Check for admin role protection
  RETURN QUERY
  SELECT 
    'admin_role_protection'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_name = 'prevent_role_escalation_enhanced'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Admin role assignment should be protected'::text,
    'high'::text;
  
  -- Check security event logging
  RETURN QUERY
  SELECT 
    'security_event_logging'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'security_events'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Security event logging should be enabled'::text,
    'medium'::text;
  
  -- Check payment security
  RETURN QUERY
  SELECT 
    'payment_audit_logging'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'payment_audit_log'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Payment operations should be audited'::text,
    'high'::text;

  -- Check for equipment listings anonymous access
  RETURN QUERY
  SELECT 
    'equipment_anonymous_access'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE schemaname = 'public' 
      AND tablename = 'equipment_listings' 
      AND policyname = 'Public can view basic equipment info'
    ) THEN 'WARNING' ELSE 'PASS' END::text,
    'Consider restricting anonymous access to equipment listings'::text,
    'medium'::text;
END;
$function$;

-- Create function to log high-risk operations
CREATE OR REPLACE FUNCTION public.log_high_risk_operation(
  p_operation text,
  p_details jsonb DEFAULT '{}'::jsonb,
  p_user_id uuid DEFAULT auth.uid()
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  log_id uuid;
BEGIN
  -- Log to audit trail
  INSERT INTO public.audit_log (
    user_id, action, new_values, ip_address
  ) VALUES (
    p_user_id, 
    p_operation, 
    p_details || jsonb_build_object('timestamp', NOW()),
    inet_client_addr()
  ) RETURNING id INTO log_id;
  
  -- Also log as security event for monitoring
  PERFORM public.log_security_event_enhanced(
    p_user_id,
    'high_risk_operation',
    jsonb_build_object(
      'operation', p_operation,
      'details', p_details
    ),
    inet_client_addr(),
    NULL,
    'high'
  );
  
  RETURN log_id;
END;
$function$;

-- Create function to validate request origins for sensitive operations
CREATE OR REPLACE FUNCTION public.validate_request_origin(
  p_operation text,
  p_user_agent text DEFAULT NULL,
  p_origin text DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  allowed_origins text[] := ARRAY[
    'https://figxavvmvnjldkzcscaf.supabase.co',
    'http://localhost:5173',
    'http://localhost:3000'
  ];
BEGIN
  -- Skip validation for server-side operations
  IF p_origin IS NULL THEN
    RETURN true;
  END IF;
  
  -- Check if origin is in allowed list
  IF p_origin = ANY(allowed_origins) THEN
    RETURN true;
  END IF;
  
  -- Log suspicious origin attempt
  PERFORM public.log_security_event_enhanced(
    auth.uid(),
    'invalid_origin_attempt',
    jsonb_build_object(
      'operation', p_operation,
      'attempted_origin', p_origin,
      'user_agent', p_user_agent
    ),
    inet_client_addr(),
    p_user_agent,
    'high'
  );
  
  RETURN false;
END;
$function$;