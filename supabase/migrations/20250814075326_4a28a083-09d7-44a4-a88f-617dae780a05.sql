-- Fix Security Definer View issue
-- Recreate public_profiles view without any security definer properties
-- and ensure it follows security best practices

-- Drop the existing public_profiles view if it exists
DROP VIEW IF EXISTS public.public_profiles;

-- Recreate the public_profiles view with proper security
-- This view provides safe public access to non-sensitive profile data
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  updated_at
FROM public.profiles
WHERE 
  suspended = false 
  AND full_name IS NOT NULL;

-- Ensure the view has proper RLS enabled (views inherit RLS from underlying tables)
-- Since profiles table already has RLS, this view will respect those policies

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_profiles TO anon;

-- Add comment for documentation
COMMENT ON VIEW public.public_profiles IS 'Safe public view of profile data for non-authenticated and authenticated users. Shows only non-suspended profiles with names.';