import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, XCircle, Shield } from 'lucide-react';
import { toast } from 'sonner';

interface SecurityCheck {
  check_name: string;
  status: string;
  details: string;
  severity: string;
}

export const SecurityValidationDashboard = () => {
  const [checks, setChecks] = useState<SecurityCheck[]>([]);
  const [isValidating, setIsValidating] = useState(false);

  const runSecurityValidation = useCallback(async () => {
    setIsValidating(true);
    try {
      const { data, error } = await supabase.rpc('validate_security_completeness');
      
      if (error) {
        console.error('Security validation error:', error);
        toast.error('Failed to run security validation');
        return;
      }

      setChecks(data || []);
      
      const criticalIssues = data?.filter(check => check.severity === 'critical' && check.status === 'FAIL') || [];
      const highIssues = data?.filter(check => check.severity === 'high' && check.status === 'FAIL') || [];
      
      if (criticalIssues.length > 0) {
        toast.error(`Found ${criticalIssues.length} critical security issues`);
      } else if (highIssues.length > 0) {
        toast.warning(`Found ${highIssues.length} high-priority security issues`);
      } else {
        toast.success('Security validation completed successfully');
      }
    } catch (error) {
      console.error('Security validation error:', error);
      toast.error('Failed to run security validation');
    } finally {
      setIsValidating(false);
    }
  }, []);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PASS': return <CheckCircle className="h-4 w-4 text-success" />;
      case 'FAIL': return <XCircle className="h-4 w-4 text-destructive" />;
      case 'WARNING': return <AlertTriangle className="h-4 w-4 text-warning" />;
      default: return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Validation Dashboard
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Button 
          onClick={runSecurityValidation} 
          disabled={isValidating}
          className="w-full"
        >
          {isValidating ? 'Running Validation...' : 'Run Security Validation'}
        </Button>

        {checks.length > 0 && (
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div 
                key={index}
                className="flex items-center justify-between p-3 border rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(check.status)}
                  <div>
                    <p className="font-medium">{check.check_name.replace(/_/g, ' ')}</p>
                    <p className="text-sm text-muted-foreground">{check.details}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={getSeverityColor(check.severity)}>
                    {check.severity}
                  </Badge>
                  <Badge variant={check.status === 'PASS' ? 'default' : 'outline'}>
                    {check.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}

        {checks.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            Click "Run Security Validation" to check your application's security status
          </div>
        )}
      </CardContent>
    </Card>
  );
};