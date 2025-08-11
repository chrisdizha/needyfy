
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface ProfileData {
  full_name?: string;
  phone?: string;
  avatar_url?: string;
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: profile, isLoading: loading, refetch } = useQuery({
    queryKey: ['user-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, phone, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    },
    enabled: !!user?.id,
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnWindowFocus: true,
  });

  // Set up real-time subscription for profile changes
  useEffect(() => {
    if (!user?.id) return;

    const subscription = supabase
      .channel('profile-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles',
          filter: `id=eq.${user.id}`
        }, 
        () => {
          // Invalidate and refetch profile data when changes occur
          queryClient.invalidateQueries({ queryKey: ['user-profile', user.id] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user?.id, queryClient]);

  const getUserDisplayName = () => {
    if (profile?.full_name) {
      return profile.full_name;
    }
    
    // Fallback to user metadata
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    if (user?.user_metadata?.name) {
      return user.user_metadata.name;
    }
    
    // Final fallback to email
    return user?.email || 'User';
  };

  const getUserAvatar = () => {
    if (profile?.avatar_url) {
      return profile.avatar_url;
    }
    
    return user?.user_metadata?.avatar_url || user?.user_metadata?.picture;
  };

  return {
    profile,
    loading,
    getUserDisplayName,
    getUserAvatar,
    refetch
  };
};
