
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, Shield, RefreshCw, Clock, Users, Lock } from 'lucide-react';
import { useEnhancedSecurityValidation } from '@/hooks/useEnhancedSecurityValidation';
import { useEnhancedSessionSecurity } from '@/hooks/useEnhancedSessionSecurity';
import { useAuth } from '@/contexts/OptimizedAuthContext';

export const SecurityDashboard = () => {
  const { user } = useAuth();
  const { 
    checks, 
    metrics, 
    isValidating, 
    lastValidation, 
    runEnhancedSecurityValidation 
  } = useEnhancedSecurityValidation();
  
  const { 
    securityMetrics, 
    isMonitoring, 
    lastSecurityCheck, 
    refreshSessionSecurity 
  } = useEnhancedSessionSecurity();

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please sign in to view security dashboard
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pass': return 'bg-green-500';
      case 'warning': return 'bg-yellow-500';
      case 'fail': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getRiskLevelColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'text-red-600 bg-red-50';
      case 'high': return 'text-orange-600 bg-orange-50';
      case 'medium': return 'text-yellow-600 bg-yellow-50';
      case 'low': return 'text-green-600 bg-green-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="space-y-6">
      {/* Overall Security Score */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Score</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metrics?.overallScore || 0}/100
            </div>
            <Progress 
              value={metrics?.overallScore || 0} 
              className="mt-2"
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Session Security</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getRiskLevelColor(securityMetrics?.riskLevel || 'low')}`}>
              {securityMetrics?.riskLevel?.toUpperCase() || 'CHECKING'}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Score: {securityMetrics?.securityScore || 0}/100
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(metrics?.criticalIssues || 0) + (metrics?.highIssues || 0) + (securityMetrics?.threats.length || 0)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              Critical & High Priority
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Validation Results */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Security Validation Results</CardTitle>
            <Button
              onClick={runEnhancedSecurityValidation}
              disabled={isValidating}
              size="sm"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isValidating ? 'animate-spin' : ''}`} />
              {isValidating ? 'Validating...' : 'Refresh'}
            </Button>
          </div>
          {lastValidation && (
            <p className="text-sm text-muted-foreground">
              Last checked: {lastValidation.toLocaleString()}
            </p>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {checks.map((check, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${getStatusColor(check.status)}`} />
                  <div>
                    <div className="font-medium">{check.name}</div>
                    <div className="text-sm text-muted-foreground">{check.message}</div>
                    {check.action && (
                      <div className="text-xs text-blue-600 mt-1">{check.action}</div>
                    )}
                  </div>
                </div>
                <Badge variant={getSeverityColor(check.severity)}>
                  {check.severity}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Session Security Details */}
      {securityMetrics && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Session Security Monitoring</CardTitle>
              <div className="flex items-center space-x-2">
                <Badge variant={isMonitoring ? "default" : "secondary"}>
                  {isMonitoring ? "Active" : "Inactive"}
                </Badge>
                <Button onClick={refreshSessionSecurity} size="sm" variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Refresh Session
                </Button>
              </div>
            </div>
            {lastSecurityCheck && (
              <p className="text-sm text-muted-foreground">
                Last security check: {lastSecurityCheck.toLocaleString()}
              </p>
            )}
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-sm font-medium">Session Age</div>
                <div className="text-2xl font-bold">{securityMetrics.sessionAge} min</div>
              </div>
              <div>
                <div className="text-sm font-medium">Time Until Expiry</div>
                <div className="text-2xl font-bold">{securityMetrics.timeUntilExpiry} min</div>
              </div>
            </div>

            {securityMetrics.threats.length > 0 && (
              <div>
                <div className="text-sm font-medium mb-2 flex items-center">
                  <AlertTriangle className="h-4 w-4 mr-2 text-orange-500" />
                  Active Threats
                </div>
                <div className="space-y-2">
                  {securityMetrics.threats.map((threat, index) => (
                    <div key={index} className="p-2 bg-orange-50 border border-orange-200 rounded text-sm">
                      {threat}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Security Metrics Summary */}
      {metrics && (
        <Card>
          <CardHeader>
            <CardTitle>Security Issues Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{metrics.criticalIssues}</div>
                <div className="text-sm text-muted-foreground">Critical</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{metrics.highIssues}</div>
                <div className="text-sm text-muted-foreground">High</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{metrics.mediumIssues}</div>
                <div className="text-sm text-muted-foreground">Medium</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{metrics.lowIssues}</div>
                <div className="text-sm text-muted-foreground">Low</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
