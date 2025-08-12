
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { toast } from 'sonner';

export const useEnhancedAdminVerification = () => {
  const { user, isAdmin } = useAuth();
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerification, setLastVerification] = useState<Date | null>(null);

  const verifyAdminStatus = useCallback(async (): Promise<boolean> => {
    if (!user || !isAdmin) {
      return false;
    }

    setIsVerifying(true);
    
    try {
      // Backend verification using the new secure function
      const { data, error } = await supabase.rpc('validate_admin_action', {
        action_type: 'verify'
      });

      if (error) {
        console.error('Admin verification failed:', error);
        toast.error('Admin verification failed. Access denied.');
        return false;
      }

      setLastVerification(new Date());
      
      // Log successful verification
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: 'admin_verification',
        p_event_details: { verification_result: 'success' },
        p_risk_level: 'low'
      });

      return data === true;
    } catch (error) {
      console.error('Admin verification error:', error);
      toast.error('Admin verification error. Please try again.');
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [user, isAdmin]);

  const verifyAdminAction = useCallback(async (actionType: string, targetUserId?: string): Promise<boolean> => {
    if (!user || !isAdmin) {
      return false;
    }

    try {
      const { data, error } = await supabase.rpc('validate_admin_action', {
        action_type: actionType,
        target_user_id: targetUserId || null
      });

      if (error || !data) {
        // Log failed verification attempt
        await supabase.rpc('log_security_event', {
          p_user_id: user.id,
          p_event_type: 'admin_verification_failed',
          p_event_details: { 
            action_type: actionType,
            target_user_id: targetUserId,
            error: error?.message 
          },
          p_risk_level: 'medium'
        });
        
        toast.error('Admin action not authorized.');
        return false;
      }

      return true;
    } catch (error) {
      console.error('Admin action verification error:', error);
      return false;
    }
  }, [user, isAdmin]);

  return {
    verifyAdminStatus,
    verifyAdminAction,
    isVerifying,
    lastVerification
  };
};
