
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { useSecureAuthSafe } from './useSecureAuthSafe';
import { toast } from 'sonner';

interface SecureProfileData {
  id: string;
  full_name?: string;
  phone?: string;
  avatar_url?: string;
  suspended?: boolean;
  minimum_payout_amount?: number;
  payout_method?: string;
  payout_schedule?: string;
  updated_at?: string;
}

export const useSecureProfile = () => {
  const { user } = useAuth();
  const { logSecurityEvent, validateSession } = useSecureAuthSafe();
  const queryClient = useQueryClient();

  const { data: profile, isLoading, error, refetch } = useQuery({
    queryKey: ['secure-profile', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      
      // Validate session before accessing sensitive data
      const sessionValid = await validateSession();
      if (!sessionValid) {
        throw new Error('Session validation failed');
      }
      
      // Use the secure RPC function that logs access
      const { data, error } = await supabase
        .rpc('get_my_profile');

      if (error) {
        // Log failed profile access attempt
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Profile access failed: ${error.message}`
        });
        
        console.error('Error fetching secure profile:', error);
        throw error;
      }

      // Log successful profile access
      await logSecurityEvent({
        type: 'login', // Using login type for legitimate access
        timestamp: Date.now(),
        details: 'Profile data accessed successfully'
      });

      return data?.[0] || null;
    },
    enabled: !!user?.id,
    staleTime: 30 * 1000, // 30 seconds cache
    retry: (failureCount, error) => {
      // Don't retry on authentication errors
      if (error?.message?.includes('Session validation failed')) {
        return false;
      }
      return failureCount < 2;
    },
  });

  const updateProfile = async (updates: Partial<SecureProfileData>) => {
    if (!user?.id) throw new Error('Not authenticated');
    
    try {
      // Validate session before updating
      const sessionValid = await validateSession();
      if (!sessionValid) {
        throw new Error('Session validation failed');
      }

      // Sanitize updates to prevent injection attacks
      const sanitizedUpdates = {
        ...updates,
        // Remove any fields users shouldn't be able to modify
        suspended: undefined,
        suspension_reason: undefined,
        suspended_at: undefined,
      };
      
      const { error } = await supabase
        .from('profiles')
        .update(sanitizedUpdates)
        .eq('id', user.id);

      if (error) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Profile update failed: ${error.message}`
        });
        throw error;
      }

      // Log successful update
      await logSecurityEvent({
        type: 'login', // Using login type for legitimate activity
        timestamp: Date.now(),
        details: 'Profile updated successfully'
      });

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ['secure-profile', user.id] });
      toast.success('Profile updated successfully');
      
    } catch (error) {
      console.error('Profile update error:', error);
      toast.error('Failed to update profile');
      throw error;
    }
  };

  return {
    profile: profile as SecureProfileData | null,
    isLoading,
    error,
    refetch,
    updateProfile
  };
};
