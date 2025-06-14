
-- Create a table for bookings
CREATE TABLE public.bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  equipment_id TEXT NOT NULL,
  equipment_title TEXT,
  start_date TIMESTAMPTZ NOT NULL,
  end_date TIMESTAMPTZ NOT NULL,
  total_price INTEGER NOT NULL, -- Stored in cents
  status TEXT NOT NULL DEFAULT 'pending', -- e.g., pending, confirmed, cancelled
  stripe_session_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row-Level Security
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own bookings
CREATE POLICY "Users can view their own bookings." ON public.bookings
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to create their own bookings
CREATE POLICY "Users can create their own bookings." ON public.bookings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow service roles (like edge functions) to update bookings
CREATE POLICY "Allow service role to update bookings." ON public.bookings
  FOR UPDATE USING (true);

