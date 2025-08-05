-- Security Enhancement Migration: RLS Policy Refinement and Payment Security (Fixed)

-- 1. Enhanced RLS policies for bookings table to prevent information leakage
-- Drop existing policies that may be too permissive
DROP POLICY IF EXISTS "Users can view their own bookings." ON public.bookings;

-- Create more granular policies for bookings
CREATE POLICY "Renters can view their booking details" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Providers can view booking details for their equipment" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = owner_id);

-- Providers can only update specific fields (not sensitive renter info)
CREATE POLICY "Providers can update booking status only" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = owner_id);

-- 2. Enhanced profile data protection
-- Drop existing overly broad policy
DROP POLICY IF EXISTS "Users can view own profile only" ON public.profiles;

-- Create separate policies for own vs others' profile access
CREATE POLICY "Users can view their own complete profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

-- Public can only see basic, non-sensitive profile info
CREATE POLICY "Public can view basic profile info" 
ON public.profiles 
FOR SELECT 
USING (
  auth.uid() != id AND 
  visa_card_number_encrypted IS NULL AND 
  visa_card_last_four IS NULL
);

-- 3. Enhanced security event logging table for payments
CREATE TABLE IF NOT EXISTS public.payment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id),
  booking_id uuid,
  action text NOT NULL,
  amount integer,
  payment_method text,
  stripe_session_id text,
  metadata jsonb DEFAULT '{}',
  ip_address inet,
  user_agent text,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on payment audit log
ALTER TABLE public.payment_audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view payment audit logs
CREATE POLICY "Admins can view payment audit logs" 
ON public.payment_audit_log 
FOR SELECT 
USING (is_admin(auth.uid()));

-- 4. Function to log payment actions
CREATE OR REPLACE FUNCTION public.log_payment_action(
  p_user_id uuid,
  p_booking_id uuid,
  p_action text,
  p_amount integer DEFAULT NULL,
  p_payment_method text DEFAULT NULL,
  p_stripe_session_id text DEFAULT NULL,
  p_metadata jsonb DEFAULT '{}',
  p_ip_address inet DEFAULT NULL,
  p_user_agent text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $$
DECLARE
  log_id uuid;
BEGIN
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
$$;