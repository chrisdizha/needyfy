-- Final security hardening to address remaining concerns

-- 1. Enhance security events table protection
DROP POLICY IF EXISTS "Admins can view security events" ON public.security_events;

CREATE POLICY "strict_admin_security_events_access" 
ON public.security_events 
FOR SELECT 
USING (
  public.is_admin(auth.uid()) AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 2. Secure audit log table
DROP POLICY IF EXISTS "Admins can view audit logs" ON public.audit_log;

CREATE POLICY "verified_admin_audit_access" 
ON public.audit_log 
FOR SELECT 
USING (
  public.is_admin(auth.uid()) AND 
  EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = auth.uid() AND role = 'admin')
);

-- 3. Add data masking for sensitive profile fields
CREATE OR REPLACE FUNCTION public.get_masked_profile(profile_user_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  phone text,
  avatar_url text,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only return full data to profile owner or admin
  IF auth.uid() = profile_user_id OR public.is_admin(auth.uid()) THEN
    RETURN QUERY
    SELECT p.id, p.full_name, p.phone, p.avatar_url, p.updated_at
    FROM public.profiles p
    WHERE p.id = profile_user_id;
  ELSE
    -- Return masked data for other users
    RETURN QUERY
    SELECT 
      p.id,
      CASE WHEN p.full_name IS NOT NULL THEN LEFT(p.full_name, 1) || '***' ELSE NULL END,
      NULL::text, -- Never expose phone to others
      p.avatar_url,
      p.updated_at
    FROM public.profiles p
    WHERE p.id = profile_user_id;
  END IF;
END;
$function$;

-- 4. Enhance disputes table security
CREATE POLICY "dispute_participant_admin_only" 
ON public.disputes 
FOR ALL 
USING (
  (opened_by = auth.uid() OR against_user_id = auth.uid() OR public.is_admin(auth.uid())) AND
  NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND suspended = true)
)
WITH CHECK (
  (opened_by = auth.uid() OR public.is_admin(auth.uid())) AND
  NOT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND suspended = true)
);

-- Replace existing dispute policies
DROP POLICY IF EXISTS "Parties to a dispute can view the dispute" ON public.disputes;
DROP POLICY IF EXISTS "Users can create disputes" ON public.disputes;

-- 5. Add comprehensive financial data protection
CREATE OR REPLACE FUNCTION public.mask_financial_data(
  p_table_name text,
  p_record jsonb,
  p_requesting_user_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Only admins see full financial data
  IF public.is_admin(p_requesting_user_id) THEN
    RETURN p_record;
  END IF;
  
  -- For non-admins, mask sensitive financial fields
  CASE p_table_name
    WHEN 'bookings' THEN
      RETURN p_record - 'stripe_session_id' - 'stripe_connect_account_id';
    WHEN 'payout_requests' THEN
      RETURN p_record - 'visa_card_last_four' - 'visa_transaction_id';
    ELSE
      RETURN p_record;
  END CASE;
END;
$function$;

-- 6. Create comprehensive security status function
CREATE OR REPLACE FUNCTION public.get_security_status()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
DECLARE
  security_score integer := 0;
  total_checks integer := 0;
  results jsonb := '[]'::jsonb;
  check_result record;
BEGIN
  -- Must be admin to check security status
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN jsonb_build_object('error', 'Admin access required');
  END IF;
  
  -- Run security completeness check
  FOR check_result IN 
    SELECT * FROM public.validate_security_completeness()
  LOOP
    total_checks := total_checks + 1;
    IF check_result.status = 'PASS' THEN
      security_score := security_score + 1;
    END IF;
    
    results := results || jsonb_build_object(
      'check', check_result.check_name,
      'status', check_result.status,
      'details', check_result.details,
      'severity', check_result.severity
    );
  END LOOP;
  
  -- Return comprehensive security status
  RETURN jsonb_build_object(
    'security_score', ROUND((security_score::float / total_checks::float) * 100),
    'total_checks', total_checks,
    'passed_checks', security_score,
    'last_updated', NOW(),
    'checks', results
  );
END;
$function$;

-- 7. Log this security hardening completion
INSERT INTO public.security_events (
  user_id,
  event_type,
  event_details,
  risk_level
) VALUES (
  NULL,
  'security_hardening_completed',
  jsonb_build_object(
    'timestamp', NOW(),
    'action', 'comprehensive_security_fixes_applied',
    'fixes_applied', ARRAY[
      'removed_anonymous_equipment_access',
      'secured_profile_data_access', 
      'restricted_payment_audit_logs',
      'enhanced_payout_security',
      'improved_service_role_policies',
      'secured_security_logs',
      'enhanced_dispute_privacy',
      'added_data_masking'
    ]
  ),
  'high'
);