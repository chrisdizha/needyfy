-- Create sample reviews with anonymous profiles
-- This bypasses the auth.users foreign key constraint by using a different approach

-- First, let's check if we can insert reviews with generic user data
-- We'll create reviews that can be viewed by everyone but don't require specific auth users

INSERT INTO public.reviews (
  user_id,
  equipment_id,
  rating,
  title,
  content,
  context,
  is_featured,
  created_at
) 
SELECT 
  '00000000-0000-0000-0000-000000000001'::uuid as user_id,
  gen_random_uuid() as equipment_id,
  rating,
  title,
  content,
  context,
  is_featured,
  created_at
FROM (VALUES
  (5, 'Excellent Camera Equipment!', 'The camera quality was outstanding and the owner was very professional. Equipment was delivered on time and in perfect condition. Would definitely rent again!', 'equipment_rental', true, now() - interval '2 days'),
  (4, 'Great Experience Overall', 'Really good equipment and smooth rental process. The setup instructions were clear and the equipment worked flawlessly during our event. Minor delay in pickup but otherwise perfect.', 'equipment_rental', true, now() - interval '5 days'),
  (5, 'Professional Grade Equipment', 'Exactly what we needed for our production. The equipment was well-maintained and the owner provided excellent support throughout the rental period.', 'equipment_rental', false, now() - interval '1 week'),
  (4, 'Reliable and Clean', 'Equipment arrived clean and ready to use. Owner was responsive to questions and the rental process was straightforward. Good value for money.', 'equipment_rental', false, now() - interval '10 days'),
  (5, 'Outstanding Service', 'From booking to return, everything was seamless. The equipment exceeded expectations and the owner went above and beyond to ensure our event was successful.', 'equipment_rental', true, now() - interval '2 weeks'),
  (3, 'Good but Could Be Better', 'Equipment worked well but had some minor issues with setup. Owner was helpful in resolving problems. Overall satisfied but room for improvement.', 'equipment_rental', false, now() - interval '3 weeks'),
  (5, 'Perfect for Our Wedding', 'Amazing sound equipment that made our wedding day special. Crystal clear audio and the owner helped with setup. Highly recommend for events!', 'equipment_rental', true, now() - interval '1 month'),
  (4, 'Professional and Timely', 'Great experience renting lighting equipment. Everything was professional from start to finish. Will use again for future projects.', 'equipment_rental', false, now() - interval '6 weeks')
) AS sample_reviews(rating, title, content, context, is_featured, created_at);