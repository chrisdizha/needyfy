-- Add separate fee tracking fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN base_price INTEGER,
ADD COLUMN renter_fee INTEGER DEFAULT 0,
ADD COLUMN provider_fee INTEGER DEFAULT 0;

-- Update the calculate_escrow_schedule function to use correct provider fee (15% of base price)
CREATE OR REPLACE FUNCTION public.calculate_escrow_schedule(
  p_booking_id uuid, 
  p_total_amount integer, 
  p_start_date timestamp with time zone, 
  p_end_date timestamp with time zone
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  rental_days INTEGER;
  release_schedule JSONB := '[]';
  base_price INTEGER;
  provider_fee INTEGER;
  provider_amount INTEGER;
  weekly_amount INTEGER;
  release_date TIMESTAMPTZ;
  remaining_amount INTEGER;
BEGIN
  -- Get the base price and provider fee from the booking
  SELECT 
    COALESCE(base_price, total_price), -- fallback for existing bookings
    COALESCE(provider_fee, ROUND(COALESCE(base_price, total_price) * 0.15)) -- 15% provider fee
  INTO base_price, provider_fee
  FROM public.bookings 
  WHERE id = p_booking_id;
  
  -- Calculate rental duration in days
  rental_days := EXTRACT(epoch FROM (p_end_date - p_start_date)) / 86400;
  
  -- Provider receives base price minus 15% provider fee
  provider_amount := base_price - provider_fee;
  
  -- Determine release schedule based on rental duration
  IF rental_days <= 3 THEN
    -- Short rentals: Release 100% on completion
    release_schedule := jsonb_build_array(
      jsonb_build_object(
        'amount', provider_amount,
        'release_date', p_end_date,
        'type', 'completion'
      )
    );
  ELSIF rental_days <= 14 THEN
    -- Medium rentals: 50% at start, 50% on completion
    release_schedule := jsonb_build_array(
      jsonb_build_object(
        'amount', provider_amount / 2,
        'release_date', p_start_date,
        'type', 'partial'
      ),
      jsonb_build_object(
        'amount', provider_amount - (provider_amount / 2),
        'release_date', p_end_date,
        'type', 'completion'
      )
    );
  ELSE
    -- Long rentals: Weekly installments
    weekly_amount := provider_amount / CEIL(rental_days::float / 7);
    release_date := p_start_date;
    remaining_amount := provider_amount;
    
    WHILE release_date < p_end_date LOOP
      IF remaining_amount <= weekly_amount THEN
        -- Last payment
        release_schedule := release_schedule || jsonb_build_array(
          jsonb_build_object(
            'amount', remaining_amount,
            'release_date', LEAST(release_date + INTERVAL '7 days', p_end_date),
            'type', 'weekly'
          )
        );
        EXIT;
      ELSE
        release_schedule := release_schedule || jsonb_build_array(
          jsonb_build_object(
            'amount', weekly_amount,
            'release_date', release_date + INTERVAL '7 days',
            'type', 'weekly'
          )
        );
        remaining_amount := remaining_amount - weekly_amount;
      END IF;
      release_date := release_date + INTERVAL '7 days';
    END LOOP;
  END IF;
  
  RETURN release_schedule;
END;
$function$;

-- Update setup_escrow_releases to work with new fee structure
CREATE OR REPLACE FUNCTION public.setup_escrow_releases(p_booking_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
DECLARE
  booking_record RECORD;
  release_schedule JSONB;
  release_item JSONB;
  base_price INTEGER;
  provider_fee INTEGER;
  provider_amount INTEGER;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record
  FROM public.bookings
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;
  
  -- Get base price and provider fee
  base_price := COALESCE(booking_record.base_price, booking_record.total_price);
  provider_fee := COALESCE(booking_record.provider_fee, ROUND(base_price * 0.15));
  provider_amount := base_price - provider_fee;
  
  -- Calculate release schedule
  release_schedule := public.calculate_escrow_schedule(
    p_booking_id,
    booking_record.total_price,
    booking_record.start_date,
    booking_record.end_date
  );
  
  -- Create escrow release records
  FOR release_item IN SELECT * FROM jsonb_array_elements(release_schedule)
  LOOP
    INSERT INTO public.escrow_releases (
      booking_id,
      amount,
      release_type,
      scheduled_for
    ) VALUES (
      p_booking_id,
      (release_item->>'amount')::INTEGER,
      release_item->>'type',
      (release_item->>'release_date')::TIMESTAMPTZ
    );
  END LOOP;
  
  -- Update booking with escrow info
  UPDATE public.bookings
  SET 
    scheduled_releases = release_schedule,
    hold_amount = provider_amount, -- Hold the amount provider will receive
    platform_fee = provider_fee + COALESCE(renter_fee, ROUND(base_price * 0.10)), -- Total platform revenue
    escrow_status = 'holding'
  WHERE id = p_booking_id;
END;
$function$;