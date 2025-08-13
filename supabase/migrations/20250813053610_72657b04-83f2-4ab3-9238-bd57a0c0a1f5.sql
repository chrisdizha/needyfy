
-- Phase 1: Critical Security Fixes

-- 1. Fix equipment listings access - require authentication for detailed access
-- Drop existing policies
DROP POLICY IF EXISTS "Anyone can view active equipment listings" ON public.equipment_listings;

-- Create new policies with proper authentication requirements
CREATE POLICY "Public can view basic equipment info" ON public.equipment_listings
  FOR SELECT 
  USING (status = 'active' AND auth.uid() IS NULL);

CREATE POLICY "Authenticated users can view full equipment details" ON public.equipment_listings
  FOR SELECT 
  USING (status = 'active' AND auth.uid() IS NOT NULL);

-- 2. Restrict review access to relevant parties only
-- Drop existing broad policy
DROP POLICY IF EXISTS "Authenticated users can view reviews" ON public.reviews;

-- Create restrictive policies
CREATE POLICY "Users can view reviews for equipment they own" ON public.reviews
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    equipment_id IN (
      SELECT id FROM public.equipment_listings WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can view reviews for equipment they've booked" ON public.reviews
  FOR SELECT
  USING (
    auth.uid() IS NOT NULL AND 
    booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can view their own reviews" ON public.reviews
  FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Admins can view all reviews" ON public.reviews
  FOR SELECT
  USING (public.is_admin(auth.uid()));

-- 3. Secure terms templates access
-- Drop existing broad policy
DROP POLICY IF EXISTS "Authenticated users can view terms templates" ON public.terms_templates;

-- Create role-based access policies
CREATE POLICY "Public templates are viewable by authenticated users" ON public.terms_templates
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND category = 'public');

CREATE POLICY "Private templates require admin access" ON public.terms_templates
  FOR SELECT
  USING (public.is_admin(auth.uid()) AND category = 'private');

CREATE POLICY "Default templates are viewable by authenticated users" ON public.terms_templates
  FOR SELECT
  USING (auth.uid() IS NOT NULL AND is_default = true);

-- 4. Add enhanced security event logging
CREATE OR REPLACE FUNCTION public.log_security_event_enhanced(
  p_user_id uuid,
  p_event_type text,
  p_event_details jsonb DEFAULT NULL::jsonb,
  p_ip_address inet DEFAULT inet_client_addr(),
  p_user_agent text DEFAULT NULL::text,
  p_risk_level text DEFAULT 'low'::text,
  p_session_id text DEFAULT NULL::text
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  event_id uuid;
  violation_count integer;
BEGIN
  -- Insert the security event
  INSERT INTO public.security_events (
    user_id, event_type, event_details, ip_address, user_agent, risk_level
  ) VALUES (
    p_user_id, p_event_type, 
    jsonb_build_object(
      'details', p_event_details,
      'session_id', p_session_id,
      'timestamp', NOW()
    ),
    p_ip_address, p_user_agent, p_risk_level
  ) RETURNING id INTO event_id;
  
  -- Check for repeated violations from same IP/user
  SELECT COUNT(*) INTO violation_count
  FROM public.security_events
  WHERE (ip_address = p_ip_address OR user_id = p_user_id)
    AND risk_level IN ('high', 'critical')
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- Escalate risk level if repeated violations
  IF violation_count >= 3 THEN
    UPDATE public.security_events 
    SET risk_level = 'critical',
        event_details = event_details || jsonb_build_object('escalated', true, 'violation_count', violation_count)
    WHERE id = event_id;
  END IF;
  
  RETURN event_id;
END;
$$;

-- 5. Enhanced rate limiting function
CREATE OR REPLACE FUNCTION public.check_enhanced_rate_limit(
  p_identifier text,
  p_max_requests integer DEFAULT 10,
  p_window_minutes integer DEFAULT 15,
  p_action_type text DEFAULT 'general'
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  request_count integer;
  window_start timestamptz;
  result jsonb;
  block_until timestamptz;
BEGIN
  window_start := NOW() - (p_window_minutes || ' minutes')::interval;
  
  -- Count requests in window
  SELECT COUNT(*) INTO request_count
  FROM public.rate_limit_log
  WHERE identifier = p_identifier 
    AND created_at > window_start;
  
  -- Check if limit exceeded
  IF request_count >= p_max_requests THEN
    -- Calculate progressive blocking
    block_until := NOW() + (POWER(2, LEAST(request_count - p_max_requests, 6)) || ' minutes')::interval;
    
    -- Log security event for rate limit violation
    PERFORM public.log_security_event_enhanced(
      auth.uid(),
      'rate_limit_violation',
      jsonb_build_object(
        'action_type', p_action_type,
        'request_count', request_count,
        'max_requests', p_max_requests,
        'block_until', block_until
      ),
      inet_client_addr(),
      NULL,
      CASE 
        WHEN request_count > p_max_requests * 2 THEN 'critical'
        WHEN request_count > p_max_requests * 1.5 THEN 'high'
        ELSE 'medium'
      END
    );
    
    result := jsonb_build_object(
      'allowed', false,
      'requests_made', request_count,
      'max_requests', p_max_requests,
      'reset_time', window_start + (p_window_minutes || ' minutes')::interval,
      'block_until', block_until,
      'message', 'Rate limit exceeded. Progressive blocking applied.'
    );
  ELSE
    -- Log the request
    INSERT INTO public.rate_limit_log (identifier) VALUES (p_identifier);
    
    result := jsonb_build_object(
      'allowed', true,
      'requests_made', request_count + 1,
      'max_requests', p_max_requests,
      'remaining', p_max_requests - request_count - 1,
      'reset_time', window_start + (p_window_minutes || ' minutes')::interval
    );
  END IF;
  
  RETURN result;
END;
$$;

-- 6. Add session security validation function
CREATE OR REPLACE FUNCTION public.validate_session_security(
  p_user_id uuid DEFAULT auth.uid(),
  p_device_fingerprint text DEFAULT NULL,
  p_ip_address inet DEFAULT inet_client_addr()
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  last_login_ip inet;
  last_fingerprint text;
  suspicious_indicators text[] := '{}';
  risk_score integer := 0;
  result jsonb;
BEGIN
  -- Check for suspicious IP changes
  SELECT event_details->>'ip_address', event_details->>'device_fingerprint'
  INTO last_login_ip, last_fingerprint
  FROM public.security_events
  WHERE user_id = p_user_id 
    AND event_type = 'login'
    AND created_at > NOW() - INTERVAL '30 days'
  ORDER BY created_at DESC
  LIMIT 1;
  
  -- Analyze risk factors
  IF last_login_ip IS NOT NULL AND last_login_ip != p_ip_address THEN
    suspicious_indicators := array_append(suspicious_indicators, 'ip_change');
    risk_score := risk_score + 25;
  END IF;
  
  IF last_fingerprint IS NOT NULL AND last_fingerprint != p_device_fingerprint THEN
    suspicious_indicators := array_append(suspicious_indicators, 'device_change');
    risk_score := risk_score + 30;
  END IF;
  
  -- Check for multiple rapid logins
  IF (SELECT COUNT(*) FROM public.security_events 
      WHERE user_id = p_user_id 
        AND event_type = 'login' 
        AND created_at > NOW() - INTERVAL '1 hour') > 3 THEN
    suspicious_indicators := array_append(suspicious_indicators, 'rapid_logins');
    risk_score := risk_score + 20;
  END IF;
  
  -- Log session validation
  PERFORM public.log_security_event_enhanced(
    p_user_id,
    'session_validation',
    jsonb_build_object(
      'risk_score', risk_score,
      'suspicious_indicators', suspicious_indicators,
      'device_fingerprint', p_device_fingerprint
    ),
    p_ip_address,
    NULL,
    CASE 
      WHEN risk_score >= 70 THEN 'critical'
      WHEN risk_score >= 40 THEN 'high'
      WHEN risk_score >= 20 THEN 'medium'
      ELSE 'low'
    END
  );
  
  result := jsonb_build_object(
    'valid', risk_score < 80,
    'risk_score', risk_score,
    'suspicious_indicators', suspicious_indicators,
    'requires_additional_verification', risk_score >= 50
  );
  
  RETURN result;
END;
$$;

-- 7. Create security configuration table
CREATE TABLE IF NOT EXISTS public.security_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  config_key text UNIQUE NOT NULL,
  config_value jsonb NOT NULL,
  updated_by uuid REFERENCES auth.users(id),
  created_at timestamptz DEFAULT NOW(),
  updated_at timestamptz DEFAULT NOW()
);

-- Enable RLS on security config
ALTER TABLE public.security_config ENABLE ROW LEVEL SECURITY;

-- Only admins can manage security config
CREATE POLICY "Admins can manage security config" ON public.security_config
  FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Insert default security configurations
INSERT INTO public.security_config (config_key, config_value) VALUES
  ('rate_limits', jsonb_build_object(
    'login_attempts', 5,
    'registration_attempts', 3,
    'password_reset_attempts', 3,
    'payment_attempts', 3,
    'window_minutes', 15
  )),
  ('session_security', jsonb_build_object(
    'max_session_age_hours', 24,
    'require_device_verification', true,
    'suspicious_login_threshold', 50,
    'force_logout_threshold', 80
  )),
  ('monitoring', jsonb_build_object(
    'alert_on_critical_events', true,
    'log_retention_days', 90,
    'auto_block_repeated_violations', true
  ))
ON CONFLICT (config_key) DO NOTHING;
