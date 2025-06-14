
-- Add 'suspended', 'suspension_reason', and 'suspended_at' fields to profiles for provider suspension controls
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS suspended boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS suspension_reason text,
  ADD COLUMN IF NOT EXISTS suspended_at timestamp with time zone;

-- Optional: future-friendly RLS policy update (no changes here since all access is already restricted to self)
-- If you later want admin access, add an admin role & adjust policies accordingly.
