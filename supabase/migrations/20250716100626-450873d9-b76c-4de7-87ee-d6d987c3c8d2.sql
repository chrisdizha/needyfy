-- Fix database functions to have proper search_path for security
-- Update existing functions to have secure search_path

-- Update handle_new_user function with proper security
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
begin
  insert into public.profiles (id, full_name, phone)
  values (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'name', new.raw_user_meta_data->>'full_name'),
    new.raw_user_meta_data->>'phone'
  );
  return new;
exception
  when others then
    -- Log the error but don't fail the user creation
    raise log 'Error creating profile for user %: %', new.id, SQLERRM;
    return new;
end;
$function$;

-- Update other security definer functions
CREATE OR REPLACE FUNCTION public.is_admin(_user_id uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles 
    WHERE user_id = _user_id AND role = 'admin'
  )
$function$;

CREATE OR REPLACE FUNCTION public.get_user_roles(_user_id uuid DEFAULT auth.uid())
RETURNS SETOF app_role
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT role FROM public.user_roles WHERE user_id = _user_id
$function$;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$function$;

CREATE OR REPLACE FUNCTION public.validate_admin_action(action_type text, target_user_id uuid DEFAULT NULL::uuid)
RETURNS boolean
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.log_admin_action(p_action text, p_table_name text DEFAULT NULL::text, p_record_id text DEFAULT NULL::text, p_old_values jsonb DEFAULT NULL::jsonb, p_new_values jsonb DEFAULT NULL::jsonb)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  INSERT INTO public.audit_log (
    user_id, action, table_name, record_id, old_values, new_values
  ) VALUES (
    auth.uid(), p_action, p_table_name, p_record_id, p_old_values, p_new_values
  );
END;
$function$;

-- Create notifications table for storing user notifications
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  message text NOT NULL,
  type text NOT NULL DEFAULT 'info', -- 'info', 'success', 'warning', 'error'
  read boolean NOT NULL DEFAULT false,
  data jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone
);

-- Enable RLS on notifications table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create policy for notifications
CREATE POLICY "Users can view their own notifications" ON public.notifications
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" ON public.notifications
FOR UPDATE USING (auth.uid() = user_id);

-- Create function to send notifications
CREATE OR REPLACE FUNCTION public.send_notification(
  p_user_id uuid,
  p_title text,
  p_message text,
  p_type text DEFAULT 'info',
  p_data jsonb DEFAULT NULL,
  p_expires_at timestamp with time zone DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  notification_id uuid;
BEGIN
  INSERT INTO public.notifications (user_id, title, message, type, data, expires_at)
  VALUES (p_user_id, p_title, p_message, p_type, p_data, p_expires_at)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$function$;

-- Create function to mark notification as read
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  UPDATE public.notifications 
  SET read = true 
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$function$;

-- Create function to get unread notification count
CREATE OR REPLACE FUNCTION public.get_unread_count(p_user_id uuid DEFAULT auth.uid())
RETURNS integer
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $function$
  SELECT COUNT(*)::integer
  FROM public.notifications
  WHERE user_id = p_user_id 
    AND read = false 
    AND (expires_at IS NULL OR expires_at > now())
$function$;

-- Enable realtime for notifications
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Create triggers for booking-related notifications
CREATE OR REPLACE FUNCTION public.notify_booking_update()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Notify renter about booking status changes
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    PERFORM public.send_notification(
      NEW.user_id,
      'Booking Status Update',
      'Your booking for ' || COALESCE(NEW.equipment_title, 'equipment') || ' is now ' || NEW.status,
      CASE NEW.status
        WHEN 'confirmed' THEN 'success'
        WHEN 'cancelled' THEN 'error'
        ELSE 'info'
      END,
      jsonb_build_object('booking_id', NEW.id, 'status', NEW.status)
    );
    
    -- Notify owner about booking updates
    PERFORM public.send_notification(
      NEW.owner_id,
      'Booking Update',
      'A booking for your ' || COALESCE(NEW.equipment_title, 'equipment') || ' has been ' || NEW.status,
      CASE NEW.status
        WHEN 'confirmed' THEN 'success'
        WHEN 'cancelled' THEN 'warning'
        ELSE 'info'
      END,
      jsonb_build_object('booking_id', NEW.id, 'status', NEW.status)
    );
  END IF;
  
  -- Notify owner about new bookings
  IF TG_OP = 'INSERT' THEN
    PERFORM public.send_notification(
      NEW.owner_id,
      'New Booking Request',
      'You have a new booking request for ' || COALESCE(NEW.equipment_title, 'your equipment'),
      'info',
      jsonb_build_object('booking_id', NEW.id)
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Create trigger for booking notifications
DROP TRIGGER IF EXISTS booking_notification_trigger ON public.bookings;
CREATE TRIGGER booking_notification_trigger
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_update();

-- Create trigger for new messages
CREATE OR REPLACE FUNCTION public.notify_new_message()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  booking_record record;
  recipient_id uuid;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record 
  FROM public.bookings 
  WHERE id = NEW.booking_id;
  
  -- Determine recipient (the other party in the conversation)
  IF NEW.sender_id = booking_record.user_id THEN
    recipient_id := booking_record.owner_id;
  ELSE
    recipient_id := booking_record.user_id;
  END IF;
  
  -- Send notification to recipient
  PERFORM public.send_notification(
    recipient_id,
    'New Message',
    'You have a new message about your booking',
    'info',
    jsonb_build_object('booking_id', NEW.booking_id, 'message_id', NEW.id)
  );
  
  RETURN NEW;
END;
$function$;

-- Create trigger for message notifications
DROP TRIGGER IF EXISTS message_notification_trigger ON public.messages;
CREATE TRIGGER message_notification_trigger
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();