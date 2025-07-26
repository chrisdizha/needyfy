
-- Fix search path vulnerabilities and enhance security for all database functions

-- 1. Update get_feedback_stats function
CREATE OR REPLACE FUNCTION public.get_feedback_stats()
 RETURNS json
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO ''
AS $function$
  SELECT json_build_object(
    'total_feedback', COUNT(*),
    'average_rating', ROUND(AVG(rating)::numeric, 2),
    'rating_distribution', json_build_object(
      '5_star', COUNT(*) FILTER (WHERE rating = 5),
      '4_star', COUNT(*) FILTER (WHERE rating = 4),
      '3_star', COUNT(*) FILTER (WHERE rating = 3),
      '2_star', COUNT(*) FILTER (WHERE rating = 2),
      '1_star', COUNT(*) FILTER (WHERE rating = 1)
    ),
    'category_breakdown', (
      SELECT json_object_agg(category, count)
      FROM (
        SELECT category, COUNT(*) as count
        FROM public.feedback
        GROUP BY category
      ) as category_stats
    )
  )
  FROM public.feedback;
$function$;

-- 2. Update send_notification function
CREATE OR REPLACE FUNCTION public.send_notification(p_user_id uuid, p_title text, p_message text, p_type text DEFAULT 'info'::text, p_data jsonb DEFAULT NULL::jsonb, p_expires_at timestamp with time zone DEFAULT NULL::timestamp with time zone)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- 3. Update mark_notification_read function
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  UPDATE public.notifications 
  SET read = true 
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$function$;

-- 4. Update notify_booking_update function
CREATE OR REPLACE FUNCTION public.notify_booking_update()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- 5. Update notify_new_message function
CREATE OR REPLACE FUNCTION public.notify_new_message()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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

-- 6. Update prevent_role_escalation function
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
BEGIN
  -- Only allow admin role assignment by existing admins
  IF NEW.role = 'admin' THEN
    IF NOT public.is_admin(auth.uid()) THEN
      RAISE EXCEPTION 'Only admins can assign admin roles';
    END IF;
    
    -- Log admin role assignment
    INSERT INTO public.audit_log (user_id, action, table_name, record_id, new_values)
    VALUES (
      auth.uid(),
      'admin_role_assigned',
      'user_roles',
      NEW.user_id::text,
      jsonb_build_object('role', NEW.role, 'assigned_by', auth.uid())
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- 7. Update update_equipment_rating function
CREATE OR REPLACE FUNCTION public.update_equipment_rating()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
BEGIN
  -- Update the equipment listing with new average rating and total count
  UPDATE public.equipment_listings 
  SET 
    rating = (
      SELECT AVG(rating)::numeric(3,2) 
      FROM public.reviews 
      WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM public.reviews 
      WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.equipment_id, OLD.equipment_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$function$;

-- 8. Update handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
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
