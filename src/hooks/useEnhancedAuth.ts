
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const useEnhancedAuth = () => {
  const { user, signOut: authSignOut } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [sessionTimeout, setSessionTimeout] = useState<NodeJS.Timeout | null>(null);

  // Enhanced sign out with proper cleanup
  const enhancedSignOut = async () => {
    if (isSigningOut) return;
    
    setIsSigningOut(true);
    
    try {
      // Clear any pending timeouts
      if (sessionTimeout) {
        clearTimeout(sessionTimeout);
        setSessionTimeout(null);
      }

      // Clear local storage items
      localStorage.removeItem('device_fingerprint');
      localStorage.removeItem('active_sessions');
      localStorage.removeItem('security_events');
      
      // Sign out from Supabase
      await authSignOut();
      
      // Force page reload to ensure complete cleanup
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('Enhanced sign out error:', error);
      toast.error('Failed to sign out. Please try again.');
    } finally {
      setIsSigningOut(false);
    }
  };

  // Monitor session expiration
  useEffect(() => {
    if (!user) return;

    const checkSessionExpiration = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          toast.error('Your session has expired. Please sign in again.');
          await enhancedSignOut();
          return;
        }

        const now = Math.floor(Date.now() / 1000);
        const expiresAt = session.expires_at || 0;
        const timeUntilExpiry = expiresAt - now;

        // If session expires in 5 minutes, show warning
        if (timeUntilExpiry > 0 && timeUntilExpiry < 300) {
          toast.warning('Your session will expire soon. Please refresh the page to continue.', {
            duration: 10000,
            action: {
              label: 'Refresh',
              onClick: () => window.location.reload()
            }
          });
        }

        // If session is expired, sign out
        if (timeUntilExpiry <= 0) {
          toast.error('Your session has expired. Please sign in again.');
          await enhancedSignOut();
        }
      } catch (error) {
        console.error('Session check error:', error);
      }
    };

    // Check immediately
    checkSessionExpiration();

    // Set up periodic checks
    const interval = setInterval(checkSessionExpiration, 60000); // Every minute

    return () => clearInterval(interval);
  }, [user]);

  // Auto-refresh session tokens
  useEffect(() => {
    if (!user) return;

    const refreshSession = async () => {
      try {
        const { error } = await supabase.auth.refreshSession();
        if (error) {
          console.error('Session refresh error:', error);
        }
      } catch (error) {
        console.error('Session refresh failed:', error);
      }
    };

    // Refresh session every 30 minutes
    const refreshInterval = setInterval(refreshSession, 30 * 60 * 1000);

    return () => clearInterval(refreshInterval);
  }, [user]);

  return {
    enhancedSignOut,
    isSigningOut
  };
};
