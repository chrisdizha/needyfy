-- Insert sample reviews to populate the reviews system
-- These will serve as demo content while preserving user review functionality

INSERT INTO public.reviews (
  user_id,
  equipment_id,
  rating,
  title,
  content,
  context,
  is_featured,
  created_at
) VALUES
-- Sample reviews with realistic content
(
  gen_random_uuid(),
  gen_random_uuid(),
  5,
  'Excellent Camera Equipment!',
  'The camera quality was outstanding and the owner was very professional. Equipment was delivered on time and in perfect condition. Would definitely rent again!',
  'equipment_rental',
  true,
  now() - interval '2 days'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  4,
  'Great Experience Overall',
  'Really good equipment and smooth rental process. The setup instructions were clear and the equipment worked flawlessly during our event. Minor delay in pickup but otherwise perfect.',
  'equipment_rental',
  true,
  now() - interval '5 days'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  5,
  'Professional Grade Equipment',
  'Exactly what we needed for our production. The equipment was well-maintained and the owner provided excellent support throughout the rental period.',
  'equipment_rental',
  false,
  now() - interval '1 week'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  4,
  'Reliable and Clean',
  'Equipment arrived clean and ready to use. Owner was responsive to questions and the rental process was straightforward. Good value for money.',
  'equipment_rental',
  false,
  now() - interval '10 days'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  5,
  'Outstanding Service',
  'From booking to return, everything was seamless. The equipment exceeded expectations and the owner went above and beyond to ensure our event was successful.',
  'equipment_rental',
  true,
  now() - interval '2 weeks'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  3,
  'Good but Could Be Better',
  'Equipment worked well but had some minor issues with setup. Owner was helpful in resolving problems. Overall satisfied but room for improvement.',
  'equipment_rental',
  false,
  now() - interval '3 weeks'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  5,
  'Perfect for Our Wedding',
  'Amazing sound equipment that made our wedding day special. Crystal clear audio and the owner helped with setup. Highly recommend for events!',
  'equipment_rental',
  true,
  now() - interval '1 month'
),
(
  gen_random_uuid(),
  gen_random_uuid(),
  4,
  'Professional and Timely',
  'Great experience renting lighting equipment. Everything was professional from start to finish. Will use again for future projects.',
  'equipment_rental',
  false,
  now() - interval '6 weeks'
);