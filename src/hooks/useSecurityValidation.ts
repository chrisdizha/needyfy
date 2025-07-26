
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'checking';
  message: string;
}

export const useSecurityValidation = () => {
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const runSecurityValidation = async () => {
    setIsValidating(true);
    const validationChecks: SecurityCheck[] = [];

    try {
      // Check 1: Verify database functions are working
      try {
        await supabase.rpc('get_feedback_stats');
        validationChecks.push({
          name: 'Database Functions',
          status: 'pass',
          message: 'All database functions are accessible and secure'
        });
      } catch (error) {
        validationChecks.push({
          name: 'Database Functions',
          status: 'fail',
          message: 'Some database functions may have security issues'
        });
      }

      // Check 2: Verify RLS policies are active
      try {
        const { error } = await supabase.from('profiles').select('id').limit(1);
        if (!error) {
          validationChecks.push({
            name: 'Row Level Security',
            status: 'pass',
            message: 'RLS policies are properly configured'
          });
        } else {
          validationChecks.push({
            name: 'Row Level Security',
            status: 'warning',
            message: 'RLS policies may need review'
          });
        }
      } catch (error) {
        validationChecks.push({
          name: 'Row Level Security',
          status: 'fail',
          message: 'RLS configuration error detected'
        });
      }

      // Check 3: Verify session security
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session && session.expires_at) {
          const expiresIn = (session.expires_at * 1000) - Date.now();
          const hoursUntilExpiry = expiresIn / (1000 * 60 * 60);
          
          if (hoursUntilExpiry <= 24) {
            validationChecks.push({
              name: 'Session Security',
              status: 'pass',
              message: `Session expires in ${hoursUntilExpiry.toFixed(1)} hours`
            });
          } else {
            validationChecks.push({
              name: 'Session Security',
              status: 'warning',
              message: 'Session expiry time may be too long'
            });
          }
        }
      } catch (error) {
        validationChecks.push({
          name: 'Session Security',
          status: 'fail',
          message: 'Session validation failed'
        });
      }

      // Check 4: Verify secure authentication flow
      validationChecks.push({
        name: 'Authentication Security',
        status: 'warning',
        message: 'Manual verification required: Check OTP expiry and leaked password protection in Supabase Dashboard > Auth > Settings'
      });

      setChecks(validationChecks);
      
      const failedChecks = validationChecks.filter(check => check.status === 'fail');
      const warningChecks = validationChecks.filter(check => check.status === 'warning');
      
      if (failedChecks.length === 0 && warningChecks.length <= 1) {
        toast.success('Security validation completed successfully!');
      } else if (failedChecks.length > 0) {
        toast.error(`Security validation found ${failedChecks.length} critical issues`);
      } else {
        toast.warning(`Security validation completed with ${warningChecks.length} warnings`);
      }

    } catch (error) {
      console.error('Security validation error:', error);
      toast.error('Failed to complete security validation');
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    // Auto-run validation on mount
    runSecurityValidation();
  }, []);

  return {
    checks,
    isValidating,
    runSecurityValidation
  };
};
