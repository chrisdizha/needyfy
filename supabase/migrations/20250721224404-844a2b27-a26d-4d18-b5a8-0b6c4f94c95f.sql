
-- Create equipment_listings table for real equipment data
CREATE TABLE public.equipment_listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text NOT NULL,
  category text NOT NULL,
  price integer NOT NULL, -- price in cents
  price_unit text NOT NULL DEFAULT 'day',
  location text NOT NULL,
  photos text[] DEFAULT '{}',
  availability_calendar jsonb DEFAULT '{}',
  terms_and_conditions text,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  rating numeric(3,2) DEFAULT 0,
  total_ratings integer DEFAULT 0,
  is_verified boolean DEFAULT false
);

-- Create reviews table for real user feedback
CREATE TABLE public.reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  equipment_id uuid REFERENCES equipment_listings(id) ON DELETE CASCADE,
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title text NOT NULL,
  content text NOT NULL,
  context text DEFAULT 'equipment_rental',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_featured boolean DEFAULT false
);

-- Create terms_templates table for dynamic terms
CREATE TABLE public.terms_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  template_content text NOT NULL,
  category text NOT NULL,
  is_default boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on equipment_listings
ALTER TABLE public.equipment_listings ENABLE ROW LEVEL SECURITY;

-- RLS policies for equipment_listings
CREATE POLICY "Anyone can view active equipment listings" ON public.equipment_listings
  FOR SELECT
  USING (status = 'active');

CREATE POLICY "Owners can manage their equipment" ON public.equipment_listings
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- Enable RLS on reviews
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- RLS policies for reviews
CREATE POLICY "Anyone can view reviews" ON public.reviews
  FOR SELECT
  USING (true);

CREATE POLICY "Users can create reviews for their bookings" ON public.reviews
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own reviews" ON public.reviews
  FOR UPDATE
  USING (user_id = auth.uid());

-- Enable RLS on terms_templates
ALTER TABLE public.terms_templates ENABLE ROW LEVEL SECURITY;

-- RLS policies for terms_templates
CREATE POLICY "Anyone can view terms templates" ON public.terms_templates
  FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create templates" ON public.terms_templates
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- Insert default terms templates
INSERT INTO public.terms_templates (name, template_content, category, is_default) VALUES
('Standard Equipment Rental', 'Equipment must be returned in the same condition as provided. Any damage beyond normal wear and tear will result in repair fees. Late returns incur a penalty of $25 per hour. Full refund for cancellations made 48+ hours in advance, 50% refund within 48 hours, no refund for same-day cancellations.', 'general', true),
('Construction Equipment', 'Operator must be certified for equipment use. Daily safety inspections required. Fuel costs are responsibility of renter. Equipment must be returned clean and in working condition. Damage assessments will be made by certified technician.', 'construction', false),
('Vehicle Rental', 'Valid driver''s license required. Insurance verification mandatory. Vehicle must be returned with same fuel level. Smoking prohibited. Mileage restrictions may apply. Traffic violations are responsibility of renter.', 'vehicle', false),
('Event Equipment', 'Setup and breakdown assistance available for additional fee. Equipment must be returned clean and undamaged. Weather protection is responsibility of renter. Cancellation due to weather eligible for full refund with 24-hour notice.', 'event', false);

-- Create function to update equipment rating
CREATE OR REPLACE FUNCTION update_equipment_rating()
RETURNS trigger AS $$
BEGIN
  -- Update the equipment listing with new average rating and total count
  UPDATE equipment_listings 
  SET 
    rating = (
      SELECT AVG(rating)::numeric(3,2) 
      FROM reviews 
      WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
    ),
    total_ratings = (
      SELECT COUNT(*) 
      FROM reviews 
      WHERE equipment_id = COALESCE(NEW.equipment_id, OLD.equipment_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.equipment_id, OLD.equipment_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger for rating updates
CREATE TRIGGER update_equipment_rating_trigger
  AFTER INSERT OR UPDATE OR DELETE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_equipment_rating();
