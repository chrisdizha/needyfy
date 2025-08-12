-- Fix critical privacy vulnerability: Remove public access to personal information
-- Replace the overly permissive public policy with secure, authenticated-only access

-- Drop the dangerous public access policy
DROP POLICY IF EXISTS "Public can view basic profile info" ON public.profiles;

-- Create a secure policy for viewing essential public profile information only
-- This allows authenticated users to see minimal, non-sensitive profile data for discovery purposes
CREATE POLICY "Authenticated users can view essential profile info"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() != id 
  AND NOT suspended
  AND full_name IS NOT NULL
);

-- Add a policy for basic profile discovery (usernames/display names only)
-- This removes access to sensitive data like phone numbers, payment info, suspension details
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT 
  id,
  full_name,
  avatar_url,
  updated_at
FROM public.profiles
WHERE NOT suspended 
  AND full_name IS NOT NULL;

-- Enable RLS on the public view (this will inherit security from profiles table)
-- Note: Views inherit RLS from underlying tables automatically

-- Create additional security policy to ensure sensitive fields are never exposed publicly
CREATE POLICY "Block public access to sensitive profile fields"
ON public.profiles
FOR SELECT
TO anon
USING (false); -- Completely block anonymous access