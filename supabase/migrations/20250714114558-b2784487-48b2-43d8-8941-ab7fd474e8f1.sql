-- Critical Security Fixes Migration

-- 1. Fix vulnerable user_roles RLS policies
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert/update/delete roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own roles only" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;

-- Create secure user_roles policies
CREATE POLICY "Users can view own roles only" ON public.user_roles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Only verified admins can manage roles" ON public.user_roles
  FOR ALL 
  USING (public.is_admin(auth.uid()) AND user_id != auth.uid())
  WITH CHECK (public.is_admin(auth.uid()) AND user_id != auth.uid());

-- 2. Fix message policies to prevent booking reference leakage
DROP POLICY IF EXISTS "Users can view messages for their bookings" ON public.messages;
DROP POLICY IF EXISTS "Users can send messages for their bookings" ON public.messages;

CREATE POLICY "Users can view messages for their own bookings only" ON public.messages
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = messages.booking_id 
      AND (bookings.user_id = auth.uid() OR bookings.owner_id = auth.uid())
    )
  );

CREATE POLICY "Users can send messages for verified bookings only" ON public.messages
  FOR INSERT 
  WITH CHECK (
    sender_id = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.bookings 
      WHERE bookings.id = booking_id 
      AND (bookings.user_id = auth.uid() OR bookings.owner_id = auth.uid())
    )
  );

-- 3. Secure profiles table with stricter access
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view own profile only" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile only" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Verified admins can manage all profiles" ON public.profiles
  FOR ALL 
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- 4. Make user_id fields NOT NULL for data integrity
ALTER TABLE public.bookings 
  ALTER COLUMN user_id SET NOT NULL,
  ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE public.reports 
  ALTER COLUMN reporter_id SET NOT NULL;

ALTER TABLE public.disputes 
  ALTER COLUMN opened_by SET NOT NULL,
  ALTER COLUMN against_user_id SET NOT NULL;

-- 5. Add CHECK constraints for validated inputs
ALTER TABLE public.bookings 
  ADD CONSTRAINT check_booking_dates CHECK (end_date > start_date),
  ADD CONSTRAINT check_booking_price CHECK (total_price > 0),
  ADD CONSTRAINT check_booking_status CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled'));

ALTER TABLE public.reports 
  ADD CONSTRAINT check_report_status CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
  ADD CONSTRAINT check_report_type CHECK (type IN ('spam', 'inappropriate', 'fraud', 'safety', 'other'));

ALTER TABLE public.disputes 
  ADD CONSTRAINT check_dispute_status CHECK (status IN ('open', 'investigating', 'resolved', 'closed'));

-- 6. Add proper foreign key constraints with CASCADE options
ALTER TABLE public.user_roles 
  ADD CONSTRAINT fk_user_roles_user_id 
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE public.profiles 
  ADD CONSTRAINT fk_profiles_id 
  FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- 7. Create security function for enhanced admin validation
CREATE OR REPLACE FUNCTION public.validate_admin_action(action_type text, target_user_id uuid DEFAULT NULL)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
STABLE
AS $$
BEGIN
  -- Must be authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Must be admin
  IF NOT public.is_admin(auth.uid()) THEN
    RETURN false;
  END IF;
  
  -- Cannot perform actions on self (except verification)
  IF action_type != 'verify' AND target_user_id IS NOT NULL AND target_user_id = auth.uid() THEN
    RETURN false;
  END IF;
  
  RETURN true;
END;
$$;

-- 8. Add indexes for performance on security-critical queries
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id_role ON public.user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_bookings_user_owner ON public.bookings(user_id, owner_id);
CREATE INDEX IF NOT EXISTS idx_messages_booking_sender ON public.messages(booking_id, sender_id);

-- 9. Create secure view for user profile summaries (prevents data leakage)
CREATE OR REPLACE VIEW public.user_profile_summary AS
SELECT 
  id,
  full_name,
  CASE 
    WHEN auth.uid() = id THEN phone 
    ELSE NULL 
  END as phone,
  suspended,
  CASE 
    WHEN public.is_admin(auth.uid()) THEN suspension_reason 
    ELSE NULL 
  END as suspension_reason,
  CASE 
    WHEN public.is_admin(auth.uid()) THEN suspended_at 
    ELSE NULL 
  END as suspended_at
FROM public.profiles;

-- Enable RLS on the view
ALTER VIEW public.user_profile_summary SET (security_invoker = true);