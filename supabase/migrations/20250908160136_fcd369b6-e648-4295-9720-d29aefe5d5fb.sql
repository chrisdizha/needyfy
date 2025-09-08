-- Fix remaining security warnings for service role policies

-- 1. Fix rate_limit_log policy to be more restrictive
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limit_log;

-- Create more secure rate limiting policy that checks for specific service operations
CREATE POLICY "secure_rate_limit_management" 
ON public.rate_limit_log 
FOR ALL 
USING (
  -- Only allow access during rate limiting operations or for admins
  (current_setting('role') = 'service_role' AND current_setting('request.jwt.claims', true)::json->>'sub' IS NULL) OR
  public.is_admin(auth.uid())
)
WITH CHECK (
  (current_setting('role') = 'service_role' AND current_setting('request.jwt.claims', true)::json->>'sub' IS NULL) OR
  public.is_admin(auth.uid())
);

-- 2. Improve bookings service role policy
DROP POLICY IF EXISTS "service_role_booking_updates" ON public.bookings;

-- Create more restrictive service role policy for bookings
CREATE POLICY "secure_service_booking_updates" 
ON public.bookings 
FOR UPDATE 
USING (
  -- Only allow service role updates for specific payment/escrow operations
  (current_setting('role') = 'service_role' AND 
   current_setting('request.jwt.claims', true)::json->>'sub' IS NULL AND
   -- Additional check: only allow updates to specific fields during payment processing
   (OLD.status != NEW.status OR OLD.escrow_status != NEW.escrow_status))
)
WITH CHECK (
  (current_setting('role') = 'service_role' AND 
   current_setting('request.jwt.claims', true)::json->>'sub' IS NULL)
);

-- 3. Secure AI interactions table
DROP POLICY IF EXISTS "Service role can insert AI interactions" ON public.ai_interactions;

-- Create more secure AI interactions policy
CREATE POLICY "secure_ai_interactions_insert" 
ON public.ai_interactions 
FOR INSERT 
WITH CHECK (
  -- Only allow service role inserts with valid user context
  (current_setting('role') = 'service_role' AND 
   current_setting('request.jwt.claims', true)::json->>'sub' IS NULL AND
   user_id IS NOT NULL) OR
  -- Or allow users to insert their own interactions
  (auth.uid() = user_id)
);

-- 4. Add security function to validate service role operations
CREATE OR REPLACE FUNCTION public.validate_service_role_operation(
  p_operation text,
  p_context jsonb DEFAULT '{}'::jsonb
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  is_service_role boolean := false;
BEGIN
  -- Check if current role is service_role
  BEGIN
    is_service_role := (current_setting('role') = 'service_role');
  EXCEPTION WHEN OTHERS THEN
    is_service_role := false;
  END;

  -- Log service role operations for auditing
  IF is_service_role THEN
    PERFORM public.log_security_event_enhanced(
      NULL, -- Service role has no user context
      'service_role_operation',
      jsonb_build_object(
        'operation', p_operation,
        'context', p_context,
        'timestamp', NOW()
      ),
      inet_client_addr(),
      NULL,
      'high'
    );
  END IF;

  RETURN is_service_role;
END;
$function$;

-- 5. Create function to monitor suspicious service role activity
CREATE OR REPLACE FUNCTION public.monitor_service_role_activity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Monitor service role operations on sensitive tables
  IF current_setting('role') = 'service_role' AND 
     TG_TABLE_NAME IN ('bookings', 'payout_requests', 'ai_interactions', 'rate_limit_log') THEN
    
    -- Log the operation for security monitoring
    PERFORM public.log_security_event_enhanced(
      NULL,
      'service_role_table_access',
      jsonb_build_object(
        'table_name', TG_TABLE_NAME,
        'operation', TG_OP,
        'record_id', CASE 
          WHEN TG_OP = 'DELETE' THEN OLD.id::text
          ELSE NEW.id::text
        END
      ),
      inet_client_addr(),
      NULL,
      'medium'
    );
  END IF;
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 6. Add monitoring triggers for service role operations
DROP TRIGGER IF EXISTS monitor_bookings_service_access ON public.bookings;
CREATE TRIGGER monitor_bookings_service_access
  BEFORE INSERT OR UPDATE OR DELETE ON public.bookings
  FOR EACH ROW EXECUTE FUNCTION public.monitor_service_role_activity();

DROP TRIGGER IF EXISTS monitor_ai_interactions_service_access ON public.ai_interactions;
CREATE TRIGGER monitor_ai_interactions_service_access
  BEFORE INSERT OR UPDATE OR DELETE ON public.ai_interactions
  FOR EACH ROW EXECUTE FUNCTION public.monitor_service_role_activity();