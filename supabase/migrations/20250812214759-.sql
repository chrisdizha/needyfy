-- Fix critical security vulnerability: Secure user_profile_summary table
-- This table currently has NO RLS policies and exposes sensitive personal data

-- Enable RLS on user_profile_summary table
ALTER TABLE public.user_profile_summary ENABLE ROW LEVEL SECURITY;

-- Create secure policies for user_profile_summary access
-- Policy 1: Users can only view their own profile summary
CREATE POLICY "Users can view own profile summary only"
ON public.user_profile_summary
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy 2: Admins can view all profile summaries
CREATE POLICY "Admins can view all profile summaries"
ON public.user_profile_summary
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy 3: Block all anonymous access completely
CREATE POLICY "Block anonymous access to profile summaries"
ON public.user_profile_summary
FOR ALL
TO anon
USING (false);

-- Policy 4: Restrict UPDATE/INSERT/DELETE operations
-- Only allow admins to modify profile summaries
CREATE POLICY "Only admins can modify profile summaries"
ON public.user_profile_summary
FOR ALL
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Add additional security: Create a secure view that filters sensitive data
-- This view will only show phone numbers to the profile owner or admins
CREATE OR REPLACE VIEW public.secure_user_profiles AS
SELECT 
  id,
  full_name,
  CASE 
    WHEN auth.uid() = id OR public.is_admin(auth.uid()) THEN phone
    ELSE NULL
  END AS phone,
  CASE
    WHEN auth.uid() = id OR public.is_admin(auth.uid()) THEN suspended
    ELSE false
  END AS suspended,
  CASE
    WHEN public.is_admin(auth.uid()) THEN suspension_reason
    ELSE NULL
  END AS suspension_reason,
  CASE
    WHEN public.is_admin(auth.uid()) THEN suspended_at
    ELSE NULL
  END AS suspended_at
FROM public.user_profile_summary
WHERE auth.uid() IS NOT NULL;