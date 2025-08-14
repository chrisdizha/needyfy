
-- Add foreign key constraint for owner_id in equipment_listings table
ALTER TABLE public.equipment_listings 
ADD CONSTRAINT equipment_listings_owner_id_fkey 
FOREIGN KEY (owner_id) REFERENCES public.profiles(id) ON DELETE CASCADE;

-- Also ensure the profiles table has proper constraints
ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
