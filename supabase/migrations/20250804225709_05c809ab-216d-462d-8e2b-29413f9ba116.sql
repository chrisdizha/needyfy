-- Add AI interactions tracking table
CREATE TABLE public.ai_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  feature_type TEXT NOT NULL, -- 'description_generation', 'price_suggestion', 'smart_search', 'chatbot'
  input_data JSONB,
  output_data JSONB,
  tokens_used INTEGER DEFAULT 0,
  cost_usd DECIMAL(10,6) DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.ai_interactions ENABLE ROW LEVEL SECURITY;

-- Users can view their own AI interactions
CREATE POLICY "Users can view own AI interactions" 
ON public.ai_interactions 
FOR SELECT 
USING (auth.uid() = user_id);

-- Service role can insert AI interactions
CREATE POLICY "Service role can insert AI interactions" 
ON public.ai_interactions 
FOR INSERT 
WITH CHECK (true);

-- Add payment method tracking to bookings
ALTER TABLE public.bookings 
ADD COLUMN payment_method TEXT DEFAULT 'stripe';

-- Add AI-generated content flags to equipment listings
ALTER TABLE public.equipment_listings 
ADD COLUMN ai_generated_description BOOLEAN DEFAULT false,
ADD COLUMN ai_suggested_price BOOLEAN DEFAULT false;