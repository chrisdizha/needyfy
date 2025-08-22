
-- Remove the existing public access policy for equipment_listings
DROP POLICY IF EXISTS "Public can view basic equipment info" ON public.equipment_listings;

-- Create a secure view for anonymous users that only shows safe, public information
CREATE OR REPLACE VIEW public.public_equipment_preview AS
SELECT 
  id,
  title,
  category,
  price,
  price_unit,
  CASE 
    WHEN photos IS NOT NULL AND array_length(photos, 1) > 0 
    THEN ARRAY[photos[1]] 
    ELSE '{}'::text[]
  END as photos,
  rating,
  total_ratings,
  is_verified,
  -- Show only city/region, not full address
  CASE 
    WHEN location IS NOT NULL 
    THEN split_part(location, ',', 1) || ', ' || split_part(location, ',', -1)
    ELSE 'Location not specified'
  END as general_location,
  created_at
FROM public.equipment_listings
WHERE status = 'active';

-- Grant access to the public view for anonymous users
GRANT SELECT ON public.public_equipment_preview TO anon;

-- Update the equipment_listings policies to be more restrictive
-- Only authenticated users can see full details
CREATE POLICY "Authenticated users can view full equipment details" 
  ON public.equipment_listings 
  FOR SELECT 
  USING (status = 'active' AND auth.uid() IS NOT NULL);

-- Owners can still manage their equipment
-- (This policy already exists but let's ensure it's correct)
DROP POLICY IF EXISTS "Owners can manage their equipment" ON public.equipment_listings;
CREATE POLICY "Owners can manage their equipment" 
  ON public.equipment_listings 
  FOR ALL 
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());
