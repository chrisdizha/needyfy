-- Fix: Replace public_profiles view with a secure version that respects authentication

-- Drop the existing insecure view
DROP VIEW IF EXISTS public.public_profiles;

-- Create a secure view that only shows data to authenticated users
CREATE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  updated_at
FROM public.profiles
WHERE 
  NOT suspended 
  AND full_name IS NOT NULL
  AND (
    -- Only show profiles to authenticated users
    auth.uid() IS NOT NULL
  );

-- Grant appropriate permissions
GRANT SELECT ON public.public_profiles TO authenticated;
REVOKE ALL ON public.public_profiles FROM anon;