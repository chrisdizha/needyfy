-- Fix critical security vulnerability: user_profile_summary table is publicly readable
-- Enable Row Level Security and create proper access policies

-- Enable RLS on user_profile_summary table
ALTER TABLE public.user_profile_summary ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile summary
CREATE POLICY "Users can view their own profile summary only"
ON public.user_profile_summary
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Policy: Admins can view all profile summaries for administration
CREATE POLICY "Admins can view all profile summaries"
ON public.user_profile_summary
FOR SELECT
TO authenticated
USING (public.is_admin(auth.uid()));

-- Policy: Users can update their own profile summary (excluding sensitive admin fields)
CREATE POLICY "Users can update their own profile summary"
ON public.user_profile_summary
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (
  auth.uid() = id 
  AND suspended IS NOT DISTINCT FROM OLD.suspended 
  AND suspended_at IS NOT DISTINCT FROM OLD.suspended_at 
  AND suspension_reason IS NOT DISTINCT FROM OLD.suspension_reason
);

-- Policy: Only admins can manage suspension-related fields
CREATE POLICY "Only admins can manage suspension data"
ON public.user_profile_summary
FOR UPDATE
TO authenticated
USING (public.is_admin(auth.uid()))
WITH CHECK (public.is_admin(auth.uid()));

-- Policy: Users can insert their own profile summary
CREATE POLICY "Users can insert their own profile summary"
ON public.user_profile_summary
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = id);