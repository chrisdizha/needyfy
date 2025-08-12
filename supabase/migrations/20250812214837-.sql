-- Fix critical security vulnerability: Secure user_profile_summary view
-- The existing view has no security and exposes sensitive data publicly

-- Drop the insecure view
DROP VIEW IF EXISTS public.user_profile_summary;

-- Create a secure replacement view with proper access controls
-- This view will only show data to authenticated users and filters sensitive information
CREATE OR REPLACE VIEW public.user_profile_summary AS
SELECT 
  p.id,
  p.full_name,
  -- Only show phone to the profile owner or admins
  CASE 
    WHEN auth.uid() = p.id OR public.is_admin(auth.uid()) THEN p.phone
    ELSE NULL
  END AS phone,
  -- Only show suspension status to the profile owner or admins
  CASE
    WHEN auth.uid() = p.id OR public.is_admin(auth.uid()) THEN p.suspended
    ELSE false
  END AS suspended,
  -- Only show suspension reason to admins
  CASE
    WHEN public.is_admin(auth.uid()) THEN p.suspension_reason
    ELSE NULL
  END AS suspension_reason,
  -- Only show suspension date to admins
  CASE
    WHEN public.is_admin(auth.uid()) THEN p.suspended_at
    ELSE NULL
  END AS suspended_at
FROM public.profiles p
WHERE 
  -- Only return data for authenticated users
  auth.uid() IS NOT NULL
  AND (
    -- Users can see their own data
    auth.uid() = p.id 
    OR 
    -- Admins can see all data
    public.is_admin(auth.uid())
  );