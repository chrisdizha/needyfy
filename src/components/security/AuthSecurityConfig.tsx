
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
    const checkAuthConfiguration = async () => {
      try {
        console.log('🔒 Security Configuration Check:');
        console.log('==========================================');
        
        // Check current session for expiry information
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const expiresAt = new Date(session.expires_at! * 1000);
          const now = new Date();
          const timeUntilExpiry = Math.round((expiresAt.getTime() - now.getTime()) / (1000 * 60));
          
          console.log(`📅 Current session expires at: ${expiresAt.toLocaleString()}`);
          console.log(`⏰ Time until expiry: ${timeUntilExpiry} minutes`);
        }
        
        // Log critical security recommendations
        console.log('');
        console.log('🚨 CRITICAL SECURITY ISSUES TO FIX:');
        console.log('==========================================');
        console.log('❌ 1. OTP Expiry: Currently > 1 hour (SECURITY RISK)');
        console.log('   → Fix: Set to 600 seconds (10 minutes) in Supabase Dashboard');
        console.log('   → Path: Dashboard → Auth → Settings → Security → OTP Expiry');
        console.log('');
        console.log('❌ 2. Leaked Password Protection: DISABLED (SECURITY RISK)');
        console.log('   → Fix: Enable "Check passwords against HaveIBeenPwned" in Supabase Dashboard');
        console.log('   → Path: Dashboard → Auth → Settings → Security → Password Protection');
        console.log('');
        console.log('⚠️  3. Recommended: Enable email confirmation for new signups');
        console.log('   → Path: Dashboard → Auth → Settings → User Signups');
        console.log('==========================================');
        console.log('');
        console.log('🔗 Quick link to fix: https://supabase.com/dashboard/project/figxavvmvnjldkzcscaf/auth/settings');
        
        // Show toast notification for critical issues
        toast.error('Critical security issues detected! Check console for details and fix in Supabase Dashboard.', {
          duration: 8000,
          action: {
            label: 'Open Dashboard',
            onClick: () => window.open('https://supabase.com/dashboard/project/figxavvmvnjldkzcscaf/auth/settings', '_blank')
          }
        });
        
      } catch (error) {
        console.error('❌ Failed to check auth configuration:', error);
        toast.error('Failed to check authentication security configuration');
      }
    };

    checkAuthConfiguration();
  }, []);

  return null; // This is a utility component that doesn't render anything
};
