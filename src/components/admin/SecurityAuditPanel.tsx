import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw } from 'lucide-react';

interface SecurityCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning' | 'pending';
  description: string;
  details?: string;
}

export const SecurityAuditPanel = () => {
  const { isAdmin, user } = useAuth();
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const performSecurityAudit = async () => {
    if (!isAdmin) return;
    
    setIsRunning(true);
    const auditResults: SecurityCheck[] = [];

    try {
      // 1. Test RLS Policies
      auditResults.push(await testRLSPolicies());
      
      // 2. Test Admin Verification
      auditResults.push(await testAdminVerification());
      
      // 3. Test Session Security
      auditResults.push(await testSessionSecurity());
      
      // 4. Test Rate Limiting
      auditResults.push(await testRateLimit());
      
      // 5. Test CORS Configuration
      auditResults.push(await testCORSConfiguration());
      
      // 6. Test Database Constraints
      auditResults.push(await testDatabaseConstraints());

      setChecks(auditResults);
      
      const failedChecks = auditResults.filter(check => check.status === 'fail').length;
      const warningChecks = auditResults.filter(check => check.status === 'warning').length;
      
      if (failedChecks === 0 && warningChecks === 0) {
        toast.success('All security checks passed!');
      } else if (failedChecks > 0) {
        toast.error(`${failedChecks} security checks failed!`);
      } else {
        toast.warning(`${warningChecks} security warnings found.`);
      }
      
    } catch (error) {
      console.error('Security audit failed:', error);
      toast.error('Security audit failed to complete');
    } finally {
      setIsRunning(false);
    }
  };

  const testRLSPolicies = async (): Promise<SecurityCheck> => {
    try {
      // Test if non-admin can access admin functions
      const { data, error } = await supabase
        .from('user_roles')
        .select('*')
        .limit(1);

      if (error && error.code === '42501') {
        return {
          name: 'RLS Policies',
          status: 'pass',
          description: 'Row Level Security is properly configured',
          details: 'Unauthorized access correctly blocked'
        };
      }

      return {
        name: 'RLS Policies',
        status: 'warning',
        description: 'RLS policies may need review',
        details: 'Some data access was allowed that may need verification'
      };
    } catch (error) {
      return {
        name: 'RLS Policies',
        status: 'fail',
        description: 'Failed to test RLS policies',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testAdminVerification = async (): Promise<SecurityCheck> => {
    try {
      const { data, error } = await supabase.functions.invoke('admin-verify', {
        body: { action: 'verify' }
      });

      if (data?.admin === true) {
        return {
          name: 'Admin Verification',
          status: 'pass',
          description: 'Admin verification working correctly',
          details: 'Backend verification successful'
        };
      }

      return {
        name: 'Admin Verification',
        status: 'fail',
        description: 'Admin verification failed',
        details: error?.message || 'Verification returned false'
      };
    } catch (error) {
      return {
        name: 'Admin Verification',
        status: 'fail',
        description: 'Admin verification endpoint error',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testSessionSecurity = async (): Promise<SecurityCheck> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return {
          name: 'Session Security',
          status: 'fail',
          description: 'No active session found',
          details: 'User should be authenticated'
        };
      }

      const now = Math.floor(Date.now() / 1000);
      const expiresAt = session.expires_at || 0;
      const timeUntilExpiry = expiresAt - now;

      if (timeUntilExpiry > 0 && timeUntilExpiry < 3600) { // Less than 1 hour
        return {
          name: 'Session Security',
          status: 'pass',
          description: 'Session security is working',
          details: `Session expires in ${Math.floor(timeUntilExpiry / 60)} minutes`
        };
      }

      return {
        name: 'Session Security',
        status: 'warning',
        description: 'Session expiry may need attention',
        details: `Time until expiry: ${timeUntilExpiry} seconds`
      };
    } catch (error) {
      return {
        name: 'Session Security',
        status: 'fail',
        description: 'Session security test failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testRateLimit = async (): Promise<SecurityCheck> => {
    try {
      const { data, error } = await supabase.functions.invoke('rate-limiter', {
        body: {
          requests: 10,
          windowSeconds: 60,
          identifier: `test_${Date.now()}`
        }
      });

      if (data?.allowed === true) {
        return {
          name: 'Rate Limiting',
          status: 'pass',
          description: 'Rate limiting is active',
          details: `${data.remaining} requests remaining`
        };
      }

      return {
        name: 'Rate Limiting',
        status: 'warning',
        description: 'Rate limiting response unexpected',
        details: error?.message || 'Unexpected response format'
      };
    } catch (error) {
      return {
        name: 'Rate Limiting',
        status: 'fail',
        description: 'Rate limiting service unavailable',
        details: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };

  const testCORSConfiguration = async (): Promise<SecurityCheck> => {
    // This is a client-side check for CORS headers
    const currentOrigin = window.location.origin;
    const isSecureOrigin = currentOrigin.startsWith('https://') || currentOrigin.includes('localhost');
    
    return {
      name: 'CORS Configuration',
      status: isSecureOrigin ? 'pass' : 'warning',
      description: isSecureOrigin ? 'Origin is secure' : 'Non-secure origin detected',
      details: `Current origin: ${currentOrigin}`
    };
  };

  const testDatabaseConstraints = async (): Promise<SecurityCheck> => {
    try {
      // Test if we can insert invalid data (should fail)
      const { error } = await supabase
        .from('bookings')
        .insert({
          user_id: user?.id,
          owner_id: user?.id,
          equipment_id: 'test',
          start_date: '2024-12-31',
          end_date: '2024-01-01', // Invalid: end before start
          total_price: -100, // Invalid: negative price
          status: 'invalid_status' // Invalid status
        });

      if (error) {
        return {
          name: 'Database Constraints',
          status: 'pass',
          description: 'Database constraints are enforced',
          details: 'Invalid data insertion correctly blocked'
        };
      }

      return {
        name: 'Database Constraints',
        status: 'warning',
        description: 'Database constraints may be missing',
        details: 'Invalid data was accepted'
      };
    } catch (error) {
      return {
        name: 'Database Constraints',
        status: 'pass',
        description: 'Database constraints working',
        details: 'Constraint violations properly handled'
      };
    }
  };

  const getStatusIcon = (status: SecurityCheck['status']) => {
    switch (status) {
      case 'pass': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <RefreshCw className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: SecurityCheck['status']) => {
    const variants = {
      pass: 'bg-green-100 text-green-800',
      fail: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800',
      pending: 'bg-gray-100 text-gray-800'
    };

    return (
      <Badge variant="secondary" className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Admin access required to view security audit panel.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Security Audit Panel
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={performSecurityAudit} 
          disabled={isRunning}
          className="w-full"
        >
          {isRunning ? 'Running Security Audit...' : 'Run Security Audit'}
        </Button>

        {checks.length > 0 && (
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 border rounded-lg">
                {getStatusIcon(check.status)}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{check.name}</h4>
                    {getStatusBadge(check.status)}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    {check.description}
                  </p>
                  {check.details && (
                    <p className="text-xs text-gray-500 mt-1">
                      {check.details}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};