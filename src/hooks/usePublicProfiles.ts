
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface PublicProfile {
  id: string;
  full_name: string;
  avatar_url?: string;
  updated_at: string;
}

export const usePublicProfiles = () => {
  const { data: profiles, isLoading, error } = useQuery({
    queryKey: ['public-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .order('updated_at', { ascending: false });

      if (error) {
        console.error('Error fetching public profiles:', error);
        throw error;
      }

      return data as PublicProfile[];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    profiles: profiles || [],
    isLoading,
    error
  };
};

export const usePublicProfile = (userId: string) => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['public-profile', userId],
    queryFn: async () => {
      if (!userId) return null;
      
      const { data, error } = await supabase
        .from('public_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No rows returned
          return null;
        }
        console.error('Error fetching public profile:', error);
        throw error;
      }

      return data as PublicProfile;
    },
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    profile,
    isLoading,
    error
  };
};
