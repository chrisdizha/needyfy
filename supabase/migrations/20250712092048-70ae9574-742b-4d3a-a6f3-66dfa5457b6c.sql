-- Create condition verification forms table
CREATE TABLE public.condition_verification_forms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  booking_id uuid NOT NULL,
  equipment_id text NOT NULL,
  equipment_title text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  handover_type text NOT NULL CHECK (handover_type IN ('pickup', 'return')),
  condition_rating integer NOT NULL CHECK (condition_rating >= 1 AND condition_rating <= 5),
  condition_notes text,
  damages_reported text[],
  photos text[],
  renter_signature text,
  renter_name text NOT NULL,
  renter_signed_at timestamp with time zone,
  provider_signature text,
  provider_name text,
  provider_signed_at timestamp with time zone,
  completed boolean NOT NULL DEFAULT false
);

-- Enable RLS
ALTER TABLE public.condition_verification_forms ENABLE ROW LEVEL SECURITY;

-- Create policies for condition verification forms
CREATE POLICY "Users can view forms for their bookings" 
ON public.condition_verification_forms 
FOR SELECT 
USING (
  booking_id IN (
    SELECT bookings.id 
    FROM bookings 
    WHERE (bookings.user_id = auth.uid() OR bookings.owner_id = auth.uid())
  )
);

CREATE POLICY "Users can create forms for their bookings" 
ON public.condition_verification_forms 
FOR INSERT 
WITH CHECK (
  booking_id IN (
    SELECT bookings.id 
    FROM bookings 
    WHERE (bookings.user_id = auth.uid() OR bookings.owner_id = auth.uid())
  )
);

CREATE POLICY "Users can update forms for their bookings" 
ON public.condition_verification_forms 
FOR UPDATE 
USING (
  booking_id IN (
    SELECT bookings.id 
    FROM bookings 
    WHERE (bookings.user_id = auth.uid() OR bookings.owner_id = auth.uid())
  )
);

-- Create storage bucket for condition verification photos
INSERT INTO storage.buckets (id, name, public) VALUES ('condition-photos', 'condition-photos', true);

-- Create policies for condition verification photos
CREATE POLICY "Users can view condition photos for their bookings" 
ON storage.objects 
FOR SELECT 
USING (
  bucket_id = 'condition-photos' AND 
  (storage.foldername(name))[1]::uuid IN (
    SELECT cf.id::text 
    FROM condition_verification_forms cf 
    JOIN bookings b ON cf.booking_id = b.id 
    WHERE (b.user_id = auth.uid() OR b.owner_id = auth.uid())
  )
);

CREATE POLICY "Users can upload condition photos for their bookings" 
ON storage.objects 
FOR INSERT 
WITH CHECK (
  bucket_id = 'condition-photos' AND 
  (storage.foldername(name))[1]::uuid IN (
    SELECT cf.id::text 
    FROM condition_verification_forms cf 
    JOIN bookings b ON cf.booking_id = b.id 
    WHERE (b.user_id = auth.uid() OR b.owner_id = auth.uid())
  )
);

CREATE POLICY "Users can update condition photos for their bookings" 
ON storage.objects 
FOR UPDATE 
USING (
  bucket_id = 'condition-photos' AND 
  (storage.foldername(name))[1]::uuid IN (
    SELECT cf.id::text 
    FROM condition_verification_forms cf 
    JOIN bookings b ON cf.booking_id = b.id 
    WHERE (b.user_id = auth.uid() OR b.owner_id = auth.uid())
  )
);

CREATE POLICY "Users can delete condition photos for their bookings" 
ON storage.objects 
FOR DELETE 
USING (
  bucket_id = 'condition-photos' AND 
  (storage.foldername(name))[1]::uuid IN (
    SELECT cf.id::text 
    FROM condition_verification_forms cf 
    JOIN bookings b ON cf.booking_id = b.id 
    WHERE (b.user_id = auth.uid() OR b.owner_id = auth.uid())
  )
);