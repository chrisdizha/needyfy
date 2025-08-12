-- Fix: Add RLS policies to public_profiles table for proper access control

-- Enable RLS on public_profiles table
ALTER TABLE public.public_profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: Authenticated users can view all public profiles
-- This maintains the "public" nature while requiring authentication
CREATE POLICY "Authenticated users can view public profiles" 
  ON public.public_profiles 
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

-- Policy 2: Users can insert their own public profile record
CREATE POLICY "Users can insert their own public profile" 
  ON public.public_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Policy 3: Users can update their own public profile record
CREATE POLICY "Users can update their own public profile" 
  ON public.public_profiles 
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Policy 4: Only admins can delete public profile records
CREATE POLICY "Admins can delete public profiles" 
  ON public.public_profiles 
  FOR DELETE 
  USING (public.is_admin(auth.uid()));