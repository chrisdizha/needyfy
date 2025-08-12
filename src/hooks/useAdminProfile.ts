
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';

interface AdminProfileData {
  id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  suspended?: boolean;
  suspension_reason?: string;
  suspended_at?: string;
  visa_card_verified?: boolean;
  minimum_payout_amount?: number;
  payout_method?: string;
  payout_schedule?: string;
  updated_at?: string;
  visa_card_number_encrypted?: string;
  visa_card_last_four?: string;
  visa_card_holder_name?: string;
}

export const useAdminProfile = (targetUserId: string) => {
  const { isAdmin } = useAuth();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['admin-profile', targetUserId],
    queryFn: async () => {
      if (!targetUserId || !isAdmin) return null;
      
      const { data, error } = await supabase
        .rpc('admin_get_profile', { target_user_id: targetUserId });

      if (error) {
        console.error('Error fetching admin profile:', error);
        throw error;
      }

      return data?.[0] || null;
    },
    enabled: !!targetUserId && isAdmin,
    staleTime: 30 * 1000, // 30 seconds for admin data
  });

  return {
    profile: profile as AdminProfileData | null,
    isLoading,
    error,
    refetch
  };
};
