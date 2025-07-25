
-- Fix critical database security issues

-- 1. Fix search path vulnerability in existing functions
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid DEFAULT auth.uid())
RETURNS SETOF public.app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.validate_admin_action(action_type text, target_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Must be admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN false;
  END IF;
  
  -- Cannot perform actions on self (except verification)
  IF action_type != 'verify' AND target_user_id IS NOT NULL AND target_user_id = auth.uid() THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$function$;

-- 2. Add role escalation protection
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Only allow admin role assignment by existing admins
  IF NEW.role = 'admin' THEN
    IF NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only admins can assign admin roles';
    END IF;
    
    -- Log admin role assignment
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
    VALUES (
      auth.uid(),
      'admin_role_assigned',
      'user_roles',
      NEW.user_id::text,
      jsonb_build_object('role', NEW.role, 'assigned_by', auth.uid())
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for role escalation protection
DROP TRIGGER IF EXISTS prevent_role_escalation_trigger ON public.user_roles;
CREATE TRIGGER prevent_role_escalation_trigger
  BEFORE INSERT ON public.user_roles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_escalation();

-- 3. Create enhanced security monitoring table
CREATE TABLE IF NOT EXISTS public.security_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  event_type text NOT NULL,
  event_details jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone DEFAULT now(),
  risk_level text DEFAULT 'low' CHECK (risk_level IN ('low', 'medium', 'high', 'critical'))
);

-- Enable RLS on security_events
ALTER TABLE public.security_events ENABLE ROW LEVEL SECURITY;

-- Only admins can view security events
CREATE POLICY "Admins can view security events"
ON public.security_events
FOR SELECT
USING (public.is_admin(auth.uid()));

-- 4. Create function to log security events
CREATE OR REPLACE FUNCTION public.log_security_event(
  p_user_id uuid,
  p_event_type text,
  p_event_details jsonb DEFAULT NULL,
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_risk_level text DEFAULT 'low'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  event_id uuid;
BEGIN
  INSERT INTO public.security_events (
    user_id, event_type, event_details, ip_address, user_agent, risk_level
  ) VALUES (
    p_user_id, p_event_type, p_event_details, p_ip_address, p_user_agent, p_risk_level
  ) RETURNING id INTO event_id;
  
  RETURN event_id;
END;
$function$;

-- 5. Enhanced audit logging for sensitive operations
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text, 
  p_table_name text DEFAULT NULL::text, 
  p_record_id text DEFAULT NULL::text, 
  p_old_values jsonb DEFAULT NULL::jsonb, 
  p_new_values jsonb DEFAULT NULL::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.audit_log (
    user_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values
  );
  
  -- Also log as security event for high-risk actions
  IF p_action IN ('admin_role_assigned', 'user_suspended', 'user_deleted', 'data_export') THEN
    PERFORM public.log_security_event(
      auth.uid(),
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
