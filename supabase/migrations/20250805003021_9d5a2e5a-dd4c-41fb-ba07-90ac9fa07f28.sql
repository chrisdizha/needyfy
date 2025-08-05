-- Enable real-time for notifications table
ALTER TABLE public.notifications REPLICA IDENTITY FULL;

-- Add notifications table to realtime publication
BEGIN;
  -- Remove the table from publication first (in case it exists)
  DROP PUBLICATION IF EXISTS supabase_realtime_notifications;
  
  -- Create publication including notifications table
  CREATE PUBLICATION supabase_realtime_notifications FOR TABLE public.notifications;
  
  -- Add to the main realtime publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
COMMIT;

-- Create trigger to setup escrow when booking is confirmed
CREATE OR REPLACE FUNCTION public.setup_booking_escrow_on_confirm()
RETURNS TRIGGER AS $$
BEGIN
  -- Only process when status changes to 'confirmed'
  IF NEW.status = 'confirmed' AND (OLD.status IS NULL OR OLD.status != 'confirmed') THEN
    -- Setup escrow releases for this booking
    PERFORM public.setup_escrow_releases(NEW.id);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for booking confirmation
DROP TRIGGER IF EXISTS trigger_setup_escrow_on_booking_confirm ON public.bookings;
CREATE TRIGGER trigger_setup_escrow_on_booking_confirm
  AFTER UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.setup_booking_escrow_on_confirm();

-- Create trigger for booking notifications
DROP TRIGGER IF EXISTS trigger_notify_booking_update ON public.bookings;
CREATE TRIGGER trigger_notify_booking_update
  AFTER INSERT OR UPDATE ON public.bookings
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_booking_update();

-- Create trigger for message notifications  
DROP TRIGGER IF EXISTS trigger_notify_new_message ON public.messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON public.messages
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_new_message();