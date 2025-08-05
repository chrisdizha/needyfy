-- Fix function search path security warning by updating the function
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';