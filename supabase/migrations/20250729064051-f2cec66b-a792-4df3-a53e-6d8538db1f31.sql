-- Create sample user profiles and reviews
-- First, insert sample profiles to serve as review authors

INSERT INTO public.profiles (
  id,
  full_name,
  avatar_url
) VALUES
(
  '550e8400-e29b-41d4-a716-446655440001',
  'Sarah Johnson',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
),
(
  '550e8400-e29b-41d4-a716-446655440002', 
  'Mike Chen',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  'Emma Rodriguez',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=emma'
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  'David Thompson',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  'Lisa Park',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa'
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  'James Wilson',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=james'
),
(
  '550e8400-e29b-41d4-a716-446655440007',
  'Anna Martinez',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=anna'
),
(
  '550e8400-e29b-41d4-a716-446655440008',
  'Alex Kim',
  'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
);

-- Now insert sample reviews using the profile IDs
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
(
  '550e8400-e29b-41d4-a716-446655440001',
  gen_random_uuid(),
  5,
  'Excellent Camera Equipment!',
  'The camera quality was outstanding and the owner was very professional. Equipment was delivered on time and in perfect condition. Would definitely rent again!',
  'equipment_rental',
  true,
  now() - interval '2 days'
),
(
  '550e8400-e29b-41d4-a716-446655440002',
  gen_random_uuid(),
  4,
  'Great Experience Overall',
  'Really good equipment and smooth rental process. The setup instructions were clear and the equipment worked flawlessly during our event. Minor delay in pickup but otherwise perfect.',
  'equipment_rental',
  true,
  now() - interval '5 days'
),
(
  '550e8400-e29b-41d4-a716-446655440003',
  gen_random_uuid(),
  5,
  'Professional Grade Equipment',
  'Exactly what we needed for our production. The equipment was well-maintained and the owner provided excellent support throughout the rental period.',
  'equipment_rental',
  false,
  now() - interval '1 week'
),
(
  '550e8400-e29b-41d4-a716-446655440004',
  gen_random_uuid(),
  4,
  'Reliable and Clean',
  'Equipment arrived clean and ready to use. Owner was responsive to questions and the rental process was straightforward. Good value for money.',
  'equipment_rental',
  false,
  now() - interval '10 days'
),
(
  '550e8400-e29b-41d4-a716-446655440005',
  gen_random_uuid(),
  5,
  'Outstanding Service',
  'From booking to return, everything was seamless. The equipment exceeded expectations and the owner went above and beyond to ensure our event was successful.',
  'equipment_rental',
  true,
  now() - interval '2 weeks'
),
(
  '550e8400-e29b-41d4-a716-446655440006',
  gen_random_uuid(),
  3,
  'Good but Could Be Better',
  'Equipment worked well but had some minor issues with setup. Owner was helpful in resolving problems. Overall satisfied but room for improvement.',
  'equipment_rental',
  false,
  now() - interval '3 weeks'
),
(
  '550e8400-e29b-41d4-a716-446655440007',
  gen_random_uuid(),
  5,
  'Perfect for Our Wedding',
  'Amazing sound equipment that made our wedding day special. Crystal clear audio and the owner helped with setup. Highly recommend for events!',
  'equipment_rental',
  true,
  now() - interval '1 month'
),
(
  '550e8400-e29b-41d4-a716-446655440008',
  gen_random_uuid(),
  4,
  'Professional and Timely',
  'Great experience renting lighting equipment. Everything was professional from start to finish. Will use again for future projects.',
  'equipment_rental',
  false,
  now() - interval '6 weeks'
);