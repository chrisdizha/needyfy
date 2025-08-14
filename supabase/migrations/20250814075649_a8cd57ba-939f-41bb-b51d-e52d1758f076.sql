-- Fix Function Search Path Mutable warning
-- Update the function to have a secure search path

CREATE OR REPLACE FUNCTION public.get_public_profiles()
RETURNS TABLE(
  id uuid,
  full_name text,
  avatar_url text,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = ''  -- Secure search path
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