
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthConfig {
  otp_expiry: number;
  password_min_length: number;
  enable_leak_protection: boolean;
}

export const AuthSecurityConfig = () => {
  useEffect(() => {
    const updateAuthConfig = async () => {
      try {
        // These settings should be configured in the Supabase dashboard
        // Auth > Settings > Security settings
        console.log('Auth security recommendations:');
        console.log('1. Set OTP expiry to 600 seconds (10 minutes) in Auth Settings');
        console.log('2. Enable leaked password protection in Auth Settings');
        console.log('3. Consider enabling email confirmations for all users');
        
        // Log current auth configuration status
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log('Current session expires at:', new Date(session.expires_at! * 1000));
        }
        
      } catch (error) {
        console.error('Failed to check auth configuration:', error);
      }
    };

    updateAuthConfig();
  }, []);

  return null; // This is a utility component that doesn't render anything
};
