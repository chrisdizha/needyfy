-- Secure the user_profile_summary view by adding proper RLS policies
-- Since it's a view, we need to create policies that control access

-- Drop the existing view and recreate it as a table with RLS
DROP VIEW IF EXISTS public.user_profile_summary;

-- Create user_profile_summary as a secure view with access controls
CREATE OR REPLACE VIEW public.user_profile_summary
WITH (security_invoker = true) AS
SELECT 
  id,
  full_name,
  phone,
  suspended,
  suspension_reason,
  suspended_at
FROM public.get_secure_user_profile_summary(auth.uid())
WHERE auth.uid() IS NOT NULL;

-- Enable RLS on the profiles table (the source of the data) if not already enabled
-- This ensures the underlying data is protected
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;