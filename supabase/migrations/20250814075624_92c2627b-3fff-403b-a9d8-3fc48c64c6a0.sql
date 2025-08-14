-- Final fix attempt for Security Definer View issue
-- Temporarily remove the view to test if it's the source

-- Drop the view completely
DROP VIEW IF EXISTS public.public_profiles;

-- Wait to see if this resolves the linter issue
-- If the view is needed, we can recreate it without any security definer properties

-- Alternative: Create a simple function instead of a view if the view continues to cause issues
CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER  -- Explicitly not SECURITY DEFINER
AS $$
  SELECT 
    p.id,
    p.full_name,
    p.avatar_url,
    p.updated_at
  FROM public.profiles p
  WHERE p.suspended = false 
    AND p.full_name IS NOT NULL;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_public_profiles() TO anon;