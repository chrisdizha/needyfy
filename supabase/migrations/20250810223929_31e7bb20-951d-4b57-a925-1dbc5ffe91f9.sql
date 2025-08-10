-- Create referral and rewards schema additions
-- Create referral_codes table
CREATE TABLE IF NOT EXISTS public.referral_codes (
  user_id uuid PRIMARY KEY,
  code TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.referral_codes ENABLE ROW LEVEL SECURITY;

-- Policies for referral_codes
CREATE POLICY "Users can view their own referral code"
ON public.referral_codes
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own referral code"
ON public.referral_codes
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own referral code"
ON public.referral_codes
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Function to resolve a referral code to a user id (SECURITY DEFINER)
CREATE OR REPLACE FUNCTION public.get_referrer_by_code(p_code text)
RETURNS uuid
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  referrer uuid;
BEGIN
  SELECT user_id INTO referrer FROM public.referral_codes WHERE code = p_code;
  RETURN referrer;
END;
$$;

-- Create referrals table
CREATE TABLE IF NOT EXISTS public.referrals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id uuid NOT NULL,
  referred_id uuid NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  reward_granted BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT referrals_unique_pair UNIQUE (referrer_id, referred_id)
);

ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

-- Policies for referrals
CREATE POLICY "Users can view their related referrals"
ON public.referrals
FOR SELECT
USING (referrer_id = auth.uid() OR referred_id = auth.uid());

CREATE POLICY "Users can create their own referral record"
ON public.referrals
FOR INSERT
WITH CHECK (referred_id = auth.uid());

-- Only admins can update referral status/rewards
CREATE POLICY "Admins can update referrals"
ON public.referrals
FOR UPDATE
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Create points_transactions table
CREATE TABLE IF NOT EXISTS public.points_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  points INTEGER NOT NULL,
  reason TEXT NOT NULL,
  source TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.points_transactions ENABLE ROW LEVEL SECURITY;

-- Policies for points_transactions
CREATE POLICY "Users can view their own points"
ON public.points_transactions
FOR SELECT
USING (user_id = auth.uid());

-- Only admins can insert/update/delete points directly
CREATE POLICY "Admins can manage points"
ON public.points_transactions
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));

-- Helper to get current user's total points
CREATE OR REPLACE FUNCTION public.get_user_points_total(_user_id uuid DEFAULT auth.uid())
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(points), 0)::integer FROM public.points_transactions WHERE user_id = _user_id;
$$;

-- Optional: controlled function to award points to self for allowed reasons
CREATE OR REPLACE FUNCTION public.award_points(p_user_id uuid, p_points int, p_reason text, p_source text DEFAULT NULL)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  new_id uuid;
BEGIN
  -- Only allow users to award points to themselves
  IF p_user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'You can only award points to your own account';
  END IF;

  -- Basic validations to prevent abuse
  IF p_points < 1 OR p_points > 200 THEN
    RAISE EXCEPTION 'Invalid points amount';
  END IF;

  IF p_reason NOT IN ('rental', 'review', 'referral') THEN
    RAISE EXCEPTION 'Invalid reason';
  END IF;

  INSERT INTO public.points_transactions (user_id, points, reason, source)
  VALUES (p_user_id, p_points, p_reason, p_source)
  RETURNING id INTO new_id;

  RETURN new_id;
END;
$$;

-- Create user_badges table
CREATE TABLE IF NOT EXISTS public.user_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  badge TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT user_badges_unique UNIQUE (user_id, badge)
);

ALTER TABLE public.user_badges ENABLE ROW LEVEL SECURITY;

-- Policies for user_badges
CREATE POLICY "Users can view their own badges"
ON public.user_badges
FOR SELECT
USING (user_id = auth.uid());

-- Only admins can assign badges directly
CREATE POLICY "Admins can manage badges"
ON public.user_badges
FOR ALL
USING (is_admin(auth.uid()))
WITH CHECK (is_admin(auth.uid()));