-- Add escrow-related fields to bookings table
ALTER TABLE public.bookings 
ADD COLUMN escrow_status TEXT DEFAULT 'pending',
ADD COLUMN scheduled_releases JSONB DEFAULT '[]',
ADD COLUMN released_amount INTEGER DEFAULT 0,
ADD COLUMN hold_amount INTEGER DEFAULT 0,
ADD COLUMN platform_fee INTEGER DEFAULT 0,
ADD COLUMN stripe_connect_account_id TEXT,
ADD COLUMN release_schedule TEXT DEFAULT 'on_completion';

-- Update booking status to include rental lifecycle states
ALTER TABLE public.bookings 
DROP CONSTRAINT IF EXISTS bookings_status_check;

-- Add check constraint for new status values
ALTER TABLE public.bookings 
ADD CONSTRAINT bookings_status_check 
CHECK (status IN ('pending', 'confirmed', 'in_progress', 'ready_for_return', 'returned', 'completed', 'cancelled', 'disputed'));

-- Create escrow_releases table for tracking fund releases
CREATE TABLE public.escrow_releases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  release_type TEXT NOT NULL CHECK (release_type IN ('scheduled', 'completion', 'manual', 'dispute_resolution')),
  scheduled_for TIMESTAMPTZ,
  released_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  stripe_transfer_id TEXT,
  failure_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS on escrow_releases
ALTER TABLE public.escrow_releases ENABLE ROW LEVEL SECURITY;

-- Create policies for escrow_releases
CREATE POLICY "Providers can view their escrow releases" ON public.escrow_releases
FOR SELECT
USING (
  booking_id IN (
    SELECT id FROM public.bookings WHERE owner_id = auth.uid()
  )
);

CREATE POLICY "Renters can view escrow releases for their bookings" ON public.escrow_releases
FOR SELECT
USING (
  booking_id IN (
    SELECT id FROM public.bookings WHERE user_id = auth.uid()
  )
);

-- Function to calculate escrow release schedule
CREATE OR REPLACE FUNCTION public.calculate_escrow_schedule(
  p_booking_id UUID,
  p_total_amount INTEGER,
  p_start_date TIMESTAMPTZ,
  p_end_date TIMESTAMPTZ
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to create escrow releases for a booking
CREATE OR REPLACE FUNCTION public.setup_escrow_releases(p_booking_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Function to get provider's escrow balance
CREATE OR REPLACE FUNCTION public.get_provider_escrow_balance(provider_user_id UUID)
RETURNS TABLE(
  total_held INTEGER,
  pending_releases INTEGER,
  available_for_payout INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
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