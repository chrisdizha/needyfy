-- Fix the security definer view issue - remove SECURITY DEFINER to enforce proper RLS

-- Drop the current view
DROP VIEW IF EXISTS public.public_profiles;

-- Create a view WITHOUT security definer to ensure proper RLS enforcement
-- This view will rely on the underlying table's RLS policies
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  updated_at
FROM public.profiles
WHERE 
  NOT suspended 
  AND full_name IS NOT NULL;