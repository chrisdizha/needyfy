
-- Fix nullable user_id columns in security-critical tables
-- These tables should always have a valid user association for security tracking

-- Fix ai_interactions table
ALTER TABLE public.ai_interactions 
ALTER COLUMN user_id SET NOT NULL;

-- Fix audit_log table  
ALTER TABLE public.audit_log
ALTER COLUMN user_id SET NOT NULL;

-- Fix feedback table
ALTER TABLE public.feedback
ALTER COLUMN user_id SET NOT NULL;

-- Fix payment_audit_log table
ALTER TABLE public.payment_audit_log
ALTER COLUMN user_id SET NOT NULL;

-- Fix security_events table
ALTER TABLE public.security_events
ALTER COLUMN user_id SET NOT NULL;

-- Add validation triggers to prevent null user_id insertions
CREATE OR REPLACE FUNCTION public.validate_user_id_not_null()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    RAISE EXCEPTION 'user_id cannot be null in security-critical table %', TG_TABLE_NAME;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply validation triggers to security-critical tables
CREATE TRIGGER validate_ai_interactions_user_id
  BEFORE INSERT OR UPDATE ON public.ai_interactions
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_id_not_null();

CREATE TRIGGER validate_audit_log_user_id
  BEFORE INSERT OR UPDATE ON public.audit_log
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_id_not_null();

CREATE TRIGGER validate_feedback_user_id
  BEFORE INSERT OR UPDATE ON public.feedback
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_id_not_null();

CREATE TRIGGER validate_payment_audit_log_user_id
  BEFORE INSERT OR UPDATE ON public.payment_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_id_not_null();

CREATE TRIGGER validate_security_events_user_id
  BEFORE INSERT OR UPDATE ON public.security_events
  FOR EACH ROW EXECUTE FUNCTION public.validate_user_id_not_null();

-- Enhanced security event logging function with stricter validation
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_user_id uuid, 
  p_event_type text, 
  p_event_details jsonb DEFAULT NULL::jsonb, 
  p_ip_address inet DEFAULT NULL::inet, 
  p_user_agent text DEFAULT NULL::text, 
  p_risk_level text DEFAULT 'low'::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  event_id uuid;
  current_user_id uuid;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Ensure user_id is never null for security events
  IF p_user_id IS NULL THEN
    IF current_user_id IS NULL THEN
      RAISE EXCEPTION 'Cannot log security event: no valid user_id provided and no authenticated user';
    END IF;
    p_user_id := current_user_id;
  END IF;
  
  -- Validate risk level
  IF p_risk_level NOT IN ('low', 'medium', 'high', 'critical') THEN
    p_risk_level := 'low';
  END IF;
  
  -- Insert with guaranteed non-null user_id
  INSERT INTO public.security_events (
    user_id, event_type, event_details, ip_address, user_agent, risk_level
  ) VALUES (
    p_user_id, p_event_type, p_event_details, p_ip_address, p_user_agent, p_risk_level
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

-- Update the existing log_security_event function to use the enhanced version
DROP FUNCTION IF EXISTS public.log_security_event(uuid, text, jsonb, inet, text, text);
ALTER FUNCTION public.log_security_event_enhanced(uuid, text, jsonb, inet, text, text) 
RENAME TO log_security_event;

-- Enhanced audit logging with user validation
CREATE OR REPLACE FUNCTION public.log_admin_action_enhanced(
  p_action text, 
  p_table_name text DEFAULT NULL::text, 
  p_record_id text DEFAULT NULL::text, 
  p_old_values jsonb DEFAULT NULL::jsonb, 
  p_new_values jsonb DEFAULT NULL::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Ensure we have a valid user for audit logging
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Cannot log admin action: no authenticated user';
  END IF;
  
  -- Insert audit log with guaranteed non-null user_id
  INSERT INTO public.audit_log (
    user_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    current_user_id, p_action, p_table_name, p_record_id, p_old_values, p_new_values
  );
  
  -- Also log as security event for high-risk actions
  IF p_action IN ('admin_role_assigned', 'user_suspended', 'user_deleted', 'data_export') THEN
    PERFORM public.log_security_event(
      current_user_id,
      'admin_action',
      jsonb_build_object(
        'action', p_action,
        'table_name', p_table_name,
        'record_id', p_record_id
      ),
      NULL,
      NULL,
      'high'
    );
  END IF;
END;
$function$;

-- Replace the existing function
DROP FUNCTION IF EXISTS public.log_admin_action(text, text, text, jsonb, jsonb);
ALTER FUNCTION public.log_admin_action_enhanced(text, text, text, jsonb, jsonb) 
RENAME TO log_admin_action;

-- Enhanced payment audit logging with user validation
CREATE OR REPLACE FUNCTION public.log_payment_action_enhanced(
  p_user_id uuid, 
  p_booking_id uuid, 
  p_action text, 
  p_amount integer DEFAULT NULL::integer, 
  p_payment_method text DEFAULT NULL::text, 
  p_stripe_session_id text DEFAULT NULL::text, 
  p_metadata jsonb DEFAULT '{}'::jsonb, 
  p_ip_address inet DEFAULT NULL::inet, 
  p_user_agent text DEFAULT NULL::text
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  log_id uuid;
  current_user_id uuid;
BEGIN
  -- Get current authenticated user
  current_user_id := auth.uid();
  
  -- Ensure user_id is never null for payment audit
  IF p_user_id IS NULL THEN
    IF current_user_id IS NULL THEN
      RAISE EXCEPTION 'Cannot log payment action: no valid user_id provided and no authenticated user';
    END IF;
    p_user_id := current_user_id;
  END IF;
  
  -- Insert payment audit log with guaranteed non-null user_id
  INSERT INTO public.payment_audit_log (
    user_id, booking_id, action, amount, payment_method, 
    stripe_session_id, metadata, ip_address, user_agent
  ) VALUES (
    p_user_id, p_booking_id, p_action, p_amount, p_payment_method,
    p_stripe_session_id, p_metadata, p_ip_address, p_user_agent
  ) RETURNING id INTO log_id;
  
  -- Also log as high-risk security event for critical actions
  IF p_action IN ('payment_processed', 'refund_issued', 'escrow_released') THEN
    PERFORM public.log_security_event(
      p_user_id,
      'payment_action',
      jsonb_build_object(
        'action', p_action,
        'booking_id', p_booking_id,
        'amount', p_amount
      ),
      p_ip_address,
      p_user_agent,
      'high'
    );
  END IF;
  
  RETURN log_id;
END;
$function$;

-- Replace the existing function
DROP FUNCTION IF EXISTS public.log_payment_action(uuid, uuid, text, integer, text, text, jsonb, inet, text);
ALTER FUNCTION public.log_payment_action_enhanced(uuid, uuid, text, integer, text, text, jsonb, inet, text) 
RENAME TO log_payment_action;
