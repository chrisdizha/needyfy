-- Security Enhancement: Add robust database triggers for admin role protection

-- 1. Enhanced trigger to prevent any role escalation attempts
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

-- Drop existing trigger if it exists and create new enhanced version
DROP TRIGGER IF EXISTS on_role_change ON public.user_roles;
CREATE TRIGGER on_role_change_enhanced
  BEFORE INSERT OR UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.prevent_role_escalation_enhanced();

-- 2. Enhanced profiles security trigger
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

-- Add trigger to profiles table
DROP TRIGGER IF EXISTS protect_profile_security ON public.profiles;
CREATE TRIGGER protect_profile_security
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_sensitive_profile_data();

-- 3. Enhanced RLS policies for profiles table
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;
CREATE POLICY "Public can view basic profile info" ON public.profiles
FOR SELECT USING (
  (auth.uid() <> id) 
  AND (visa_card_number_encrypted IS NULL) 
  AND (visa_card_last_four IS NULL)
  AND (NOT suspended OR public.is_admin(auth.uid()))
);

-- 4. Add function to validate payment operations
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