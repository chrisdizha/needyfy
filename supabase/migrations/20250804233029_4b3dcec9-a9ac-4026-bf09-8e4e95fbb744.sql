-- Fix search_path security warnings for new functions
CREATE OR REPLACE FUNCTION public.calculate_escrow_schedule(
  p_booking_id UUID,
  p_total_amount INTEGER,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  rental_days INTEGER;
  release_schedule JSONB := '[]';
  platform_fee INTEGER;
  provider_amount INTEGER;
  weekly_amount INTEGER;
  release_date TIMESTAMPTZ;
  remaining_amount INTEGER;
BEGIN
  -- Calculate rental duration in days
  rental_days := EXTRACT(epoch FROM (p_end_date - p_start_date)) / 86400;
  
  -- Calculate platform fee (5%)
  platform_fee := (p_total_amount * 5) / 100;
  provider_amount := p_total_amount - platform_fee;
  
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
$$;

-- Fix search_path for setup_escrow_releases function
CREATE OR REPLACE FUNCTION public.setup_escrow_releases(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  booking_record RECORD;
  release_schedule JSONB;
  release_item JSONB;
BEGIN
  -- Get booking details
  SELECT * INTO booking_record
  FROM public.bookings
  WHERE id = p_booking_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Booking not found: %', p_booking_id;
  END IF;
  
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
    hold_amount = booking_record.total_price,
    platform_fee = (booking_record.total_price * 5) / 100,
    escrow_status = 'holding'
  WHERE id = p_booking_id;
END;
$$;

-- Fix search_path for get_provider_escrow_balance function
CREATE OR REPLACE FUNCTION public.get_provider_escrow_balance(provider_user_id UUID)
RETURNS TABLE(
  total_held INTEGER,
  pending_releases INTEGER,
  available_for_payout INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(
      CASE WHEN b.escrow_status = 'holding' THEN b.hold_amount - b.released_amount ELSE 0 END
    ), 0)::INTEGER as total_held,
    COALESCE(SUM(
      CASE WHEN er.status = 'pending' AND er.scheduled_for <= now() THEN er.amount ELSE 0 END
    ), 0)::INTEGER as pending_releases,
    COALESCE(SUM(
      CASE WHEN er.status = 'completed' THEN er.amount ELSE 0 END
    ), 0)::INTEGER as available_for_payout
  FROM public.bookings b
  LEFT JOIN public.escrow_releases er ON b.id = er.booking_id
  WHERE b.owner_id = provider_user_id;
END;
$$;