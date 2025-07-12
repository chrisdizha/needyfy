-- CRITICAL SECURITY FIXES

-- 1. Fix user_roles RLS policies to prevent unauthorized access
DROP POLICY IF EXISTS "Users can read their own roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admins can insert/update/delete roles" ON public.user_roles;

-- Create secure function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  )
$$;

-- Create secure function to get current user's roles
CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid DEFAULT auth.uid())
RETURNS SETOF public.app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$$;

-- Secure RLS policy: Users can only see their own roles
CREATE POLICY "Users can view own roles only" ON public.user_roles
FOR SELECT 
USING (auth.uid() = user_id);

-- Secure RLS policy: Only admins can assign/remove roles, but not to themselves
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL 
USING (public.is_admin() AND user_id != auth.uid())
WITH CHECK (public.is_admin() AND user_id != auth.uid());

-- 2. Fix profiles table - restrict access properly
DROP POLICY IF EXISTS "Users can view their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile." ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;

-- Create secure policies for profiles
CREATE POLICY "Users can view own profile" ON public.profiles
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON public.profiles
FOR INSERT 
WITH CHECK (auth.uid() = id);

-- Admins can view and modify any profile for suspension management
CREATE POLICY "Admins can manage all profiles" ON public.profiles
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. Make user_id fields NOT NULL and add constraints
ALTER TABLE public.bookings 
ALTER COLUMN user_id SET NOT NULL,
ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE public.reports 
ALTER COLUMN reporter_id SET NOT NULL;

ALTER TABLE public.disputes 
ALTER COLUMN opened_by SET NOT NULL,
ALTER COLUMN against_user_id SET NOT NULL;

-- 4. Add CHECK constraints for data validation
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_valid_dates CHECK (end_date > start_date),
ADD CONSTRAINT bookings_positive_price CHECK (total_price > 0),
ADD CONSTRAINT bookings_valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed'));

ALTER TABLE public.reports 
ADD CONSTRAINT reports_valid_status CHECK (status IN ('open', 'investigating', 'resolved', 'closed')),
ADD CONSTRAINT reports_valid_type CHECK (type IN ('user', 'listing', 'other'));

ALTER TABLE public.disputes 
ADD CONSTRAINT disputes_valid_status CHECK (status IN ('open', 'investigating', 'resolved', 'closed'));

ALTER TABLE public.profiles
ADD CONSTRAINT profiles_valid_phone CHECK (phone IS NULL OR phone ~ '^\+?[1-9]\d{1,14}$');

-- 5. Fix message policies to prevent data leakage
DROP POLICY IF EXISTS "Booking participants can view messages" ON public.messages;
DROP POLICY IF EXISTS "Booking participants can send messages" ON public.messages;

-- More secure message policies
CREATE POLICY "Users can view messages for their bookings" ON public.messages
FOR SELECT 
USING (
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE user_id = auth.uid() OR owner_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages for their bookings" ON public.messages
FOR INSERT 
WITH CHECK (
  sender_id = auth.uid() AND
  booking_id IN (
    SELECT id FROM public.bookings 
    WHERE user_id = auth.uid() OR owner_id = auth.uid()
  )
);

-- 6. Create audit log table for compliance
CREATE TABLE IF NOT EXISTS public.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  action text NOT NULL,
  table_name text,
  record_id text,
  old_values jsonb,
  new_values jsonb,
  ip_address inet,
  user_agent text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit log
ALTER TABLE public.audit_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view audit logs
CREATE POLICY "Admins can view audit logs" ON public.audit_log
FOR SELECT 
USING (public.is_admin());

-- Create function to log admin actions
CREATE OR REPLACE FUNCTION public.log_admin_action(
  p_action text,
  p_table_name text DEFAULT NULL,
  p_record_id text DEFAULT NULL,
  p_old_values jsonb DEFAULT NULL,
  p_new_values jsonb DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.audit_log (
    user_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values
  );
END;
$$;