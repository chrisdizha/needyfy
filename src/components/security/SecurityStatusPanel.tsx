
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Shield, CheckCircle, AlertTriangle, XCircle, RefreshCw, ExternalLink } from 'lucide-react';
import { useSecurityValidation } from '@/hooks/useSecurityValidation';

export const SecurityStatusPanel = () => {
  const { checks, isValidating, runSecurityValidation } = useSecurityValidation();

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'fail':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pass: 'default',
      warning: 'secondary',
      fail: 'destructive',
      checking: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const openSupabaseDashboard = () => {
    window.open('https://supabase.com/dashboard/project/figxavvmvnjldkzcscaf/auth/settings', '_blank');
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Security Status
          <Button
            variant="outline"
            size="sm"
            onClick={runSecurityValidation}
            disabled={isValidating}
          >
            {isValidating ? (
              <RefreshCw className="h-4 w-4 animate-spin" />
            ) : (
              'Refresh'
            )}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {checks.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              Running security validation...
            </div>
          ) : (
            checks.map((check, index) => (
              <div key={index} className="p-4 border rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(check.status)}
                    <div>
                      <p className="font-medium">{check.name}</p>
                      <p className="text-sm text-muted-foreground">{check.message}</p>
                    </div>
                  </div>
                  {getStatusBadge(check.status)}
                </div>
                {check.action && (
                  <div className="ml-7 p-2 bg-muted rounded-md text-sm">
                    <strong>Action Required:</strong> {check.action}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
        
        <div className="mt-6 space-y-4">
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <h4 className="font-semibold text-red-900 mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Critical Security Issues Detected
            </h4>
            <div className="text-sm text-red-800 space-y-2">
              <p><strong>1. OTP Expiry Too Long:</strong> Currently set to more than 1 hour, recommended: 10 minutes (600 seconds)</p>
              <p><strong>2. Leaked Password Protection Disabled:</strong> Users can register with compromised passwords</p>
              <Button 
                onClick={openSupabaseDashboard} 
                className="mt-2" 
                size="sm"
                variant="destructive"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Fix in Supabase Dashboard
              </Button>
            </div>
          </div>

          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h4 className="font-semibold text-blue-900 mb-2">Step-by-Step Fix Instructions</h4>
            <div className="text-sm text-blue-800 space-y-2">
              <p><strong>Step 1:</strong> Click "Fix in Supabase Dashboard" button above</p>
              <p><strong>Step 2:</strong> Navigate to Authentication → Settings → Security</p>
              <p><strong>Step 3:</strong> Set "OTP Expiry" to 600 seconds (10 minutes)</p>
              <p><strong>Step 4:</strong> Enable "Check passwords against HaveIBeenPwned"</p>
              <p><strong>Step 5:</strong> Save changes and refresh this security check</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
