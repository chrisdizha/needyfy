
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
  };
};

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
      let query = supabase
        .from('reviews')
        .select(`
          *,
          profiles!inner(full_name, avatar_url)
        `)
        .order('created_at', { ascending: false });

      if (equipmentId) {
        query = query.eq('equipment_id', equipmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      return data as Review[];
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
      const { data, error } = await supabase
        .from('reviews')
        .select(`
          *,
          profiles!inner(full_name, avatar_url)
        `)
        .eq('is_featured', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      return data as Review[];
    },
  });
};
