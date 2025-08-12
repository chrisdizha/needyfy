
-- Phase 1: Critical Database Security Fixes

-- 1. Create secure function to check user roles (prevents infinite recursion)
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- 2. Create function to get user roles safely
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid DEFAULT auth.uid())
RETURNS SETOF app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

-- 3. Fix terms_templates table - restrict to authenticated users only
DROP POLICY IF EXISTS "Anyone can view terms templates" ON public.terms_templates;
CREATE POLICY "Authenticated users can view terms templates" 
  ON public.terms_templates 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 4. Fix reviews table - restrict public access for business data protection
DROP POLICY IF EXISTS "Anyone can view reviews" ON public.reviews;
CREATE POLICY "Authenticated users can view reviews" 
  ON public.reviews 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- 5. Create admin verification function for backend security
CREATE OR REPLACE FUNCTION public.validate_admin_action(
  action_type text,
  target_user_id uuid DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- 6. Enhanced security event logging function
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
SET search_path TO ''
AS $$
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
$$;

-- 7. Create enhanced audit logging function
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_table_name text DEFAULT NULL,
  p_record_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
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
$$;

-- 8. Add trigger to prevent unauthorized role escalation
CREATE OR REPLACE FUNCTION public.prevent_role_escalation_enhanced()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Only allow admin role assignment by existing admins
  IF NEW.role = 'admin' THEN
    IF NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only admins can assign admin roles';
    END IF;
    
    -- Additional check: prevent mass admin role assignment
    IF (SELECT COUNT(*) FROM public.user_roles WHERE role = 'admin') >= 10 THEN
      RAISE EXCEPTION 'Maximum number of admin users reached';
    END IF;
    
    -- Log admin role assignment with enhanced details
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
    VALUES (
      auth.uid(),
      'admin_role_assigned',
      'user_roles',
      NEW.user_id::text,
      jsonb_build_object(
        'role', NEW.role, 
        'assigned_by', auth.uid(),
        'timestamp', NOW(),
        'ip_address', inet_client_addr()
      )
    );
    
    -- Log high-risk security event
    PERFORM public.log_security_event(
      auth.uid(),
      'admin_role_assignment',
      jsonb_build_object(
        'target_user', NEW.user_id,
        'role_assigned', NEW.role
      ),
      inet_client_addr(),
      NULL,
      'high'
    );
  END IF;
  
  -- Prevent self-role modification
  IF NEW.user_id = auth.uid() AND TG_OP = 'INSERT' THEN
    RAISE EXCEPTION 'Users cannot assign roles to themselves';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger
DROP TRIGGER IF EXISTS prevent_role_escalation_enhanced_trigger ON public.user_roles;
CREATE TRIGGER prevent_role_escalation_enhanced_trigger
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation_enhanced();

-- 9. Secure payment validation function
CREATE OR REPLACE FUNCTION public.validate_payment_operation(
  p_user_id uuid,
  p_operation text,
  p_amount integer DEFAULT NULL
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Check if user is suspended
  IF EXISTS (SELECT 1 FROM public.profiles WHERE id = p_user_id AND suspended = true) THEN
    RETURN false;
  END IF;
  
  -- Additional validation for high-value transactions
  IF p_amount IS NOT NULL AND p_amount > 100000 THEN -- $1000+
    PERFORM public.log_security_event(
      p_user_id,
      'high_value_transaction',
      jsonb_build_object(
        'operation', p_operation,
        'amount', p_amount
      ),
      inet_client_addr(),
      NULL,
      'high'
    );
  END IF;
  
  RETURN true;
END;
$$;

-- 10. Create trigger to protect sensitive profile data
CREATE OR REPLACE FUNCTION public.protect_sensitive_profile_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
BEGIN
  -- Prevent unauthorized access to financial data
  IF (OLD.visa_card_number_encrypted IS DISTINCT FROM NEW.visa_card_number_encrypted 
      OR OLD.visa_card_last_four IS DISTINCT FROM NEW.visa_card_last_four)
     AND NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Only administrators can modify payment information';
  END IF;
  
  -- Log sensitive data changes
  IF OLD.visa_card_number_encrypted IS DISTINCT FROM NEW.visa_card_number_encrypted THEN
    PERFORM public.log_security_event(
      auth.uid(),
      'payment_data_modification',
      jsonb_build_object(
        'target_user', NEW.id,
        'action', 'visa_card_update'
      ),
      inet_client_addr(),
      NULL,
      'high'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create the trigger for profile protection
DROP TRIGGER IF EXISTS protect_sensitive_profile_data_trigger ON public.profiles;
CREATE TRIGGER protect_sensitive_profile_data_trigger
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_sensitive_profile_data();
