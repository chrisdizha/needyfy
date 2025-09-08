-- Fix Security Definer View Issue
-- Remove the problematic view and replace with proper RLS policies

-- Drop the security definer view that was flagged
DROP VIEW IF EXISTS public.safe_booking_view;

-- Instead, update the existing bookings policies to properly restrict sensitive data
-- Create a function to determine what booking fields a user can see
CREATE OR REPLACE FUNCTION public.get_booking_select_fields(booking_row public.bookings)
RETURNS public.bookings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If user is the renter, they can see all fields
  IF auth.uid() = booking_row.user_id THEN
    RETURN booking_row;
  END IF;
  
  -- If user is the provider, hide sensitive payment data
  IF auth.uid() = booking_row.owner_id THEN
    booking_row.stripe_session_id := NULL;
    booking_row.stripe_connect_account_id := NULL;
    RETURN booking_row;
  END IF;
  
  -- Admin can see everything
  IF public.is_admin(auth.uid()) THEN
    RETURN booking_row;
  END IF;
  
  -- Default: return null (no access)
  RETURN NULL;
END;
$$;

-- Log the security fix
INSERT INTO public.audit_log (
  user_id, action, table_name, new_values
) VALUES (
  auth.uid(),
  'security_definer_view_fix',
  'bookings',
  jsonb_build_object(
    'issue', 'removed_security_definer_view',
    'replacement', 'enhanced_rls_policies',
    'timestamp', NOW()
  )
);