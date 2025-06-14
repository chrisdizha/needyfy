
-- Step 1: Ensure equipment is owned by a provider (minimal implementation, since no equipment table exists, add owner_id to bookings).
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS owner_id uuid;

-- Step 2: Add a messages table for provider/renter communication per booking.
CREATE TABLE IF NOT EXISTS public.messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  message text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE
);

-- Step 3: RLS for messages. Only allow involved users to see/contribute.
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Booking participants can view messages" ON public.messages
  FOR SELECT
  USING (
    sender_id = auth.uid()
    OR booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

CREATE POLICY "Booking participants can send messages" ON public.messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND booking_id IN (
      SELECT id FROM public.bookings WHERE user_id = auth.uid() OR owner_id = auth.uid()
    )
  );

-- Step 4: Provider (owner) can update booking status to 'confirmed' or 'cancelled'
-- (We'll enforce this in the client, with backend RLS if requested later.)
