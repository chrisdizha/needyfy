
-- Comprehensive Security Refactor Plan Implementation
-- Step 1: Clean up existing problematic views and policies

-- Drop the problematic user_profile_summary view
DROP VIEW IF EXISTS public.user_profile_summary;

-- Step 2: Normalize profiles table RLS policies
-- First, drop all existing policies on profiles to start fresh
DROP POLICY IF EXISTS "Authenticated users can view essential profile info" ON public.profiles;
DROP POLICY IF EXISTS "Block public access to sensitive profile fields" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile only" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own complete profile" ON public.profiles;
DROP POLICY IF EXISTS "Verified admins can manage all profiles" ON public.profiles;

-- Create minimal, canonical RLS policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_select_admin" ON public.profiles
  FOR SELECT USING (public.is_admin(auth.uid()));

CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_admin" ON public.profiles
  FOR UPDATE USING (public.is_admin(auth.uid())) WITH CHECK (public.is_admin(auth.uid()));

-- Step 3: Create minimal public_profiles view for non-sensitive data
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  updated_at
FROM public.profiles
WHERE NOT suspended AND full_name IS NOT NULL;

-- Step 4: Create secure RPC functions for sensitive data access

-- Function for users to get their own complete profile
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS TABLE(
  id uuid,
  full_name text,
  phone text,
  avatar_url text,
  suspended boolean,
  suspension_reason text,
  suspended_at timestamptz,
  visa_card_verified boolean,
  minimum_payout_amount integer,
  payout_method text,
  payout_schedule text,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.suspended,
    p.suspension_reason,
    p.suspended_at,
    p.visa_card_verified,
    p.minimum_payout_amount,
    p.payout_method,
    p.payout_schedule,
    p.updated_at
  FROM public.profiles p
  WHERE p.id = auth.uid();
END;
$$;

-- Function for admins to get any user's profile
CREATE OR REPLACE FUNCTION public.admin_get_profile(target_user_id uuid)
RETURNS TABLE(
  id uuid,
  full_name text,
  phone text,
  avatar_url text,
  suspended boolean,
  suspension_reason text,
  suspended_at timestamptz,
  visa_card_verified boolean,
  minimum_payout_amount integer,
  payout_method text,
  payout_schedule text,
  updated_at timestamptz,
  visa_card_number_encrypted text,
  visa_card_last_four text,
  visa_card_holder_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Must be authenticated admin
  IF NOT public.is_admin(auth.uid()) THEN
    RAISE EXCEPTION 'Admin access required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    p.phone,
    p.avatar_url,
    p.suspended,
    p.suspension_reason,
    p.suspended_at,
    p.visa_card_verified,
    p.minimum_payout_amount,
    p.payout_method,
    p.payout_schedule,
    p.updated_at,
    p.visa_card_number_encrypted,
    p.visa_card_last_four,
    p.visa_card_holder_name
  FROM public.profiles p
  WHERE p.id = target_user_id;
END;
$$;

-- Step 5: Create validation function to check migration integrity
CREATE OR REPLACE FUNCTION public.validate_security_migration()
RETURNS TABLE(
  check_name text,
  status text,
  details text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if problematic view is gone
  RETURN QUERY
  SELECT 
    'user_profile_summary_removed'::text,
    CASE WHEN NOT EXISTS (
      SELECT 1 FROM information_schema.views 
      WHERE table_schema = 'public' AND table_name = 'user_profile_summary'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Problematic user_profile_summary view should be removed'::text;
  
  -- Check if public_profiles view exists
  RETURN QUERY
  SELECT 
    'public_profiles_exists'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.views 
      WHERE table_schema = 'public' AND table_name = 'public_profiles'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Safe public_profiles view should exist'::text;
  
  -- Check if RPC functions exist
  RETURN QUERY
  SELECT 
    'rpc_functions_exist'::text,
    CASE WHEN EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_name = 'get_my_profile'
    ) AND EXISTS (
      SELECT 1 FROM information_schema.routines 
      WHERE routine_schema = 'public' AND routine_name = 'admin_get_profile'
    ) THEN 'PASS' ELSE 'FAIL' END::text,
    'Security RPC functions should exist'::text;
  
  -- Check profiles RLS policies
  RETURN QUERY
  SELECT 
    'profiles_rls_policies'::text,
    CASE WHEN (
      SELECT COUNT(*) FROM pg_policies 
      WHERE schemaname = 'public' AND tablename = 'profiles'
    ) >= 4 THEN 'PASS' ELSE 'FAIL' END::text,
    'Profiles table should have proper RLS policies'::text;
END;
$$;
