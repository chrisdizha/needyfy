-- Create payout_requests table for tracking provider payouts
CREATE TABLE public.payout_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  provider_id UUID NOT NULL,
  amount INTEGER NOT NULL, -- Amount in cents
  currency TEXT NOT NULL DEFAULT 'USD',
  payout_method TEXT NOT NULL DEFAULT 'visa_direct', -- visa_direct, bank_transfer
  visa_card_last_four TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, processing, completed, failed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  failure_reason TEXT,
  visa_transaction_id TEXT,
  booking_ids UUID[] DEFAULT '{}', -- Array of booking IDs included in this payout
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.payout_requests ENABLE ROW LEVEL SECURITY;

-- Providers can view their own payout requests
CREATE POLICY "Providers can view their own payouts"
ON public.payout_requests
FOR SELECT
USING (auth.uid() = provider_id);

-- Providers can create their own payout requests
CREATE POLICY "Providers can create their own payouts"
ON public.payout_requests
FOR INSERT
WITH CHECK (auth.uid() = provider_id);

-- Add VISA card fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN visa_card_number_encrypted TEXT,
ADD COLUMN visa_card_last_four TEXT,
ADD COLUMN visa_card_holder_name TEXT,
ADD COLUMN visa_card_verified BOOLEAN DEFAULT false,
ADD COLUMN payout_method TEXT DEFAULT 'manual', -- manual, visa_direct, bank_transfer
ADD COLUMN payout_schedule TEXT DEFAULT 'weekly', -- daily, weekly, monthly
ADD COLUMN minimum_payout_amount INTEGER DEFAULT 2000; -- Minimum payout in cents ($20)

-- Create function to calculate provider earnings
CREATE OR REPLACE FUNCTION public.get_provider_pending_earnings(provider_user_id UUID)
RETURNS INTEGER
LANGUAGE SQL
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT COALESCE(SUM(total_price), 0)::INTEGER
  FROM public.bookings
  WHERE owner_id = provider_user_id
    AND status = 'completed'
    AND id NOT IN (
      SELECT UNNEST(booking_ids)
      FROM public.payout_requests
      WHERE provider_id = provider_user_id
        AND status IN ('completed', 'processing')
    );
$$;

-- Create function to trigger automatic payouts
CREATE OR REPLACE FUNCTION public.create_automatic_payout(provider_user_id UUID)
RETURNS UUID
LANGUAGE PLPGSQL
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  pending_amount INTEGER;
  min_amount INTEGER;
  payout_id UUID;
  eligible_bookings UUID[];
BEGIN
  -- Get provider's minimum payout amount
  SELECT minimum_payout_amount INTO min_amount
  FROM public.profiles
  WHERE id = provider_user_id;
  
  -- Get pending earnings amount
  SELECT public.get_provider_pending_earnings(provider_user_id) INTO pending_amount;
  
  -- Check if amount meets minimum threshold
  IF pending_amount < COALESCE(min_amount, 2000) THEN
    RETURN NULL;
  END IF;
  
  -- Get eligible booking IDs
  SELECT ARRAY_AGG(id) INTO eligible_bookings
  FROM public.bookings
  WHERE owner_id = provider_user_id
    AND status = 'completed'
    AND id NOT IN (
      SELECT UNNEST(booking_ids)
      FROM public.payout_requests
      WHERE provider_id = provider_user_id
        AND status IN ('completed', 'processing')
    );
  
  -- Create payout request
  INSERT INTO public.payout_requests (
    provider_id, amount, booking_ids, payout_method
  ) VALUES (
    provider_user_id, pending_amount, eligible_bookings,
    (SELECT payout_method FROM public.profiles WHERE id = provider_user_id)
  ) RETURNING id INTO payout_id;
  
  RETURN payout_id;
END;
$$;