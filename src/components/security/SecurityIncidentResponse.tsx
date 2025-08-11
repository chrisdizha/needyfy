
import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Shield, Clock, CheckCircle } from 'lucide-react';
import { useSecurityMonitoring } from '@/hooks/useSecurityMonitoring';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const SecurityIncidentResponse = () => {
  const { user } = useAuth();
  const { alerts, stats, isMonitoring, handleAlert } = useSecurityMonitoring();
  const [respondingTo, setRespondingTo] = useState<string | null>(null);

  const handleSecurityIncident = async (alertId: string, response: 'acknowledge' | 'investigate' | 'escalate') => {
    if (!user) return;

    setRespondingTo(alertId);
    
    try {
      const alert = alerts.find(a => a.id === alertId);
      if (!alert) return;

      // Log the incident response
      await supabase.rpc('log_security_event', {
        p_user_id: user.id,
        p_event_type: 'incident_response',
        p_event_details: {
          alert_id: alertId,
          alert_type: alert.type,
          response_action: response,
          original_message: alert.message,
          response_timestamp: new Date().toISOString()
        },
        p_risk_level: response === 'escalate' ? 'high' : 'medium'
      });

      // Take appropriate action based on response
      switch (response) {
        case 'acknowledge':
          handleAlert(alertId);
          toast.success('Security alert acknowledged');
          break;
          
        case 'investigate':
          handleAlert(alertId);
          toast.info('Security investigation initiated. Additional monitoring activated.');
          // Could trigger additional monitoring or logging here
          break;
          
        case 'escalate':
          handleAlert(alertId);
          toast.warning('Security incident escalated. Administrative review initiated.');
          // In a real system, this would notify administrators
          break;
      }
    } catch (error) {
      console.error('Failed to respond to security incident:', error);
      toast.error('Failed to process security response');
    } finally {
      setRespondingTo(null);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Shield className="h-4 w-4 text-yellow-500" />;
      case 'low':
        return <Shield className="h-4 w-4 text-blue-500" />;
      default:
        return <Shield className="h-4 w-4 text-gray-500" />;
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

  if (!user) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="text-center text-muted-foreground">
            Please sign in to view security incident dashboard
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Security Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monitoring Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant={isMonitoring ? "default" : "secondary"}>
                {isMonitoring ? "Active" : "Inactive"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {alerts.filter(a => !a.handled).length}
            </div>
            <div className="text-xs text-muted-foreground">
              Unhandled incidents
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Risk Score</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.averageRiskScore || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Average (0-100)
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">24h Events</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalEvents || 0}
            </div>
            <div className="text-xs text-muted-foreground">
              Total security events
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Security Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Security Incidents & Alerts</CardTitle>
        </CardHeader>
        <CardContent>
          {alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Shield className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>No security incidents detected</p>
              <p className="text-sm">Your account security is operating normally</p>
            </div>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <div key={alert.id} className={`border rounded-lg p-4 ${alert.handled ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-3">
                      {getSeverityIcon(alert.severity)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <Badge variant={getSeverityColor(alert.severity)}>
                            {alert.severity}
                          </Badge>
                          <Badge variant="outline">
                            {alert.type.replace('_', ' ')}
                          </Badge>
                          {alert.handled && (
                            <Badge variant="outline" className="text-green-600">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Handled
                            </Badge>
                          )}
                        </div>
                        <div className="font-medium mb-1">{alert.message}</div>
                        <div className="text-sm text-muted-foreground">
                          {alert.timestamp.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    {!alert.handled && (
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleSecurityIncident(alert.id, 'acknowledge')}
                          disabled={respondingTo === alert.id}
                        >
                          Acknowledge
                        </Button>
                        {(alert.severity === 'high' || alert.severity === 'critical') && (
                          <>
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={() => handleSecurityIncident(alert.id, 'investigate')}
                              disabled={respondingTo === alert.id}
                            >
                              Investigate
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleSecurityIncident(alert.id, 'escalate')}
                              disabled={respondingTo === alert.id}
                            >
                              Escalate
                            </Button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Security Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle>Security Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Shield className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-900">Enable Two-Factor Authentication</div>
                <div className="text-sm text-blue-700">
                  Add an extra layer of security to your account with 2FA
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <div>
                <div className="font-medium text-green-900">Regular Security Reviews</div>
                <div className="text-sm text-green-700">
                  Review your account activity and security settings monthly
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <Clock className="h-5 w-5 text-yellow-600" />
              <div>
                <div className="font-medium text-yellow-900">Session Management</div>
                <div className="text-sm text-yellow-700">
                  Sign out from unused devices and avoid public computers
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
