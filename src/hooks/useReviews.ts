
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type Review = {
  id: string;
  user_id: string;
  equipment_id: string | null;
  booking_id: string | null;
  rating: number;
  title: string;
  content: string;
  context: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  profiles?: {
    full_name: string | null;
    avatar_url: string | null;
  } | null;
};

// Type guard to check if profiles data is valid
const isValidProfileData = (profiles: any): profiles is { full_name: string | null; avatar_url: string | null } => {
  return profiles && typeof profiles === 'object' && !profiles.error && 'full_name' in profiles && 'avatar_url' in profiles;
};

// Sample reviews for demo purposes
const getSampleReviews = (): Review[] => [
  {
    id: 'sample-1',
    user_id: 'sample-user-1',
    equipment_id: null,
    booking_id: null,
    rating: 5,
    title: 'Excellent Camera Equipment!',
    content: 'The camera quality was outstanding and the owner was very professional. Equipment was delivered on time and in perfect condition. Would definitely rent again!',
    context: 'equipment_rental',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
    profiles: {
      full_name: 'Sarah Johnson',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah'
    }
  },
  {
    id: 'sample-2',
    user_id: 'sample-user-2',
    equipment_id: null,
    booking_id: null,
    rating: 4,
    title: 'Great Experience Overall',
    content: 'Really good equipment and smooth rental process. The setup instructions were clear and the equipment worked flawlessly during our event. Minor delay in pickup but otherwise perfect.',
    context: 'equipment_rental',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
    profiles: {
      full_name: 'Mike Chen',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike'
    }
  },
  {
    id: 'sample-3',
    user_id: 'sample-user-3',
    equipment_id: null,
    booking_id: null,
    rating: 5,
    title: 'Professional Grade Equipment',
    content: 'Exactly what we needed for our production. The equipment was well-maintained and the owner provided excellent support throughout the rental period.',
    context: 'equipment_rental',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    profiles: {
      full_name: 'Emma Rodriguez',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma'
    }
  },
  {
    id: 'sample-4',
    user_id: 'sample-user-4',
    equipment_id: null,
    booking_id: null,
    rating: 4,
    title: 'Reliable and Clean',
    content: 'Equipment arrived clean and ready to use. Owner was responsive to questions and the rental process was straightforward. Good value for money.',
    context: 'equipment_rental',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    profiles: {
      full_name: 'David Thompson',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david'
    }
  },
  {
    id: 'sample-5',
    user_id: 'sample-user-5',
    equipment_id: null,
    booking_id: null,
    rating: 5,
    title: 'Outstanding Service',
    content: 'From booking to return, everything was seamless. The equipment exceeded expectations and the owner went above and beyond to ensure our event was successful.',
    context: 'equipment_rental',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
    profiles: {
      full_name: 'Lisa Park',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa'
    }
  },
  {
    id: 'sample-6',
    user_id: 'sample-user-6',
    equipment_id: null,
    booking_id: null,
    rating: 3,
    title: 'Good but Could Be Better',
    content: 'Equipment worked well but had some minor issues with setup. Owner was helpful in resolving problems. Overall satisfied but room for improvement.',
    context: 'equipment_rental',
    created_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    profiles: {
      full_name: 'James Wilson',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=james'
    }
  },
  {
    id: 'sample-7',
    user_id: 'sample-user-7',
    equipment_id: null,
    booking_id: null,
    rating: 5,
    title: 'Perfect for Our Wedding',
    content: 'Amazing sound equipment that made our wedding day special. Crystal clear audio and the owner helped with setup. Highly recommend for events!',
    context: 'equipment_rental',
    created_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: true,
    profiles: {
      full_name: 'Anna Martinez',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=anna'
    }
  },
  {
    id: 'sample-8',
    user_id: 'sample-user-8',
    equipment_id: null,
    booking_id: null,
    rating: 4,
    title: 'Professional and Timely',
    content: 'Great experience renting lighting equipment. Everything was professional from start to finish. Will use again for future projects.',
    context: 'equipment_rental',
    created_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
    is_featured: false,
    profiles: {
      full_name: 'Alex Kim',
      avatar_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=alex'
    }
  }
];

export const useReviews = (equipmentId?: string) => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const {
    data: reviews,
    isLoading,
    error
  } = useQuery({
    queryKey: ['reviews', equipmentId],
    queryFn: async () => {
      try {
        let baseQuery = supabase
          .from('reviews')
          .select('*')
          .order('created_at', { ascending: false });

        if (equipmentId) {
          baseQuery = baseQuery.eq('equipment_id', equipmentId);
        }

        const { data } = await baseQuery;
        const databaseReviews = (data || []) as Review[];

        const sampleReviews = equipmentId ? [] : getSampleReviews();
        const allReviews = [...databaseReviews, ...sampleReviews].sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        return allReviews;
      } catch (err) {
        return equipmentId ? [] : getSampleReviews();
      }
    },
  });

  const createReview = useMutation({
    mutationFn: async (review: Omit<Review, 'id' | 'created_at' | 'updated_at' | 'profiles'>) => {
      const { data, error } = await supabase
        .from('reviews')
        .insert(review)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      queryClient.invalidateQueries({ queryKey: ['featured-reviews'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-listings'] });
      toast({
        title: "Review Submitted",
        description: "Thank you for your feedback!",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit review. Please try again.",
        variant: "destructive",
      });
      console.error('Error creating review:', error);
    },
  });

  return {
    reviews,
    isLoading,
    error,
    createReview: createReview.mutate,
    isCreating: createReview.isPending,
  };
};

export const useFeaturedReviews = () => {
  return useQuery({
    queryKey: ['featured-reviews'],
    queryFn: async () => {
      try {
        // First, try to get featured reviews with profiles
        const { data, error } = await supabase
          .from('reviews')
          .select(`
            *,
            profiles(full_name, avatar_url)
          `)
          .eq('is_featured', true)
          .order('created_at', { ascending: false })
          .limit(3);

        let databaseReviews: Review[] = [];

        if (error) {
          console.error('Error fetching featured reviews with profiles:', error);
          
          // Fallback: get featured reviews without profiles
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('reviews')
            .select('*')
            .eq('is_featured', true)
            .order('created_at', { ascending: false })
            .limit(3);
          
          if (fallbackError) {
            console.error('Fallback query error:', fallbackError);
          } else {
            // Return reviews without profiles data
            databaseReviews = (fallbackData || []).map(item => ({
              ...item,
              profiles: null
            })) as Review[];
          }
        } else {
          // Successfully got reviews with profiles - ensure proper typing
          databaseReviews = (data || []).map(item => ({
            ...item,
            profiles: isValidProfileData(item.profiles) ? {
              full_name: item.profiles.full_name,
              avatar_url: item.profiles.avatar_url
            } : null
          })) as Review[];
        }
        
        // Get sample featured reviews
        const sampleReviews = getSampleReviews().filter(review => review.is_featured);
        
        // Combine and sort by created_at descending, then limit to 3
        const allReviews = [...databaseReviews, ...sampleReviews]
          .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 3);
        
        return allReviews;
        
      } catch (err) {
        console.error('Error in useFeaturedReviews:', err);
        // Return sample featured reviews as fallback
        return getSampleReviews().filter(review => review.is_featured).slice(0, 3);
      }
    },
  });
};
