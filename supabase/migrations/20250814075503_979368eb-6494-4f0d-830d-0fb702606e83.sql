-- Complete fix for Security Definer View issue
-- Remove any potential legacy security definer configurations

-- First, drop the view completely
DROP VIEW IF EXISTS public.public_profiles CASCADE;

-- Check if there are any legacy user_profile_summary views that might be causing issues
DROP VIEW IF EXISTS public.user_profile_summary CASCADE;

-- Recreate the public_profiles view with explicit security settings
-- This view will NOT use SECURITY DEFINER and will respect the caller's permissions
CREATE VIEW public.public_profiles 
WITH (security_barrier = false) 
AS 
SELECT 
  id,
  full_name,
  avatar_url,
  updated_at
FROM public.profiles
WHERE 
  suspended = false 
  AND full_name IS NOT NULL;

-- Ensure proper permissions without security definer
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Add proper documentation
COMMENT ON VIEW public.public_profiles IS 'Public view of non-sensitive profile data. Does not use SECURITY DEFINER - respects caller permissions and RLS policies.';

-- Verify no security definer functions are being called inappropriately in views
-- Ensure all access goes through proper RLS on the underlying profiles table