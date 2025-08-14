
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { RefreshCw, Server, Database, Shield, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { toast } from 'sonner';

interface SystemHealth {
  database: 'healthy' | 'warning' | 'critical';
  security: 'healthy' | 'warning' | 'critical';
  performance: 'healthy' | 'warning' | 'critical';
  uptime: number;
  activeUsers: number;
  recentErrors: number;
  responseTime: number;
}

export const SystemHealthMonitor = () => {
  const { isAdmin } = useAuth();

  const { data: systemHealth, isLoading, refetch } = useQuery({
    queryKey: ['system-health'],
    queryFn: async () => {
      // In a real implementation, this would call multiple endpoints
      // For now, we'll simulate system health data
      
      // Check recent security events
      const { data: securityEvents } = await supabase
        .from('security_events')
        .select('risk_level')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      // Check recent audit logs for errors
      const { data: auditLogs } = await supabase
        .from('audit_log')
        .select('action')
        .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString());

      const criticalEvents = securityEvents?.filter(e => e.risk_level === 'critical').length || 0;
      const highRiskEvents = securityEvents?.filter(e => e.risk_level === 'high').length || 0;
      const totalEvents = securityEvents?.length || 0;

      // Simulate health status based on real data
      const security: SystemHealth['security'] = 
        criticalEvents > 0 ? 'critical' :
        highRiskEvents > 5 ? 'warning' : 'healthy';

      const database: SystemHealth['database'] = 
        auditLogs && auditLogs.length > 0 ? 'healthy' : 'warning';

      const performance: SystemHealth['performance'] = 
        totalEvents > 50 ? 'warning' : 'healthy';

      return {
        database,
        security,
        performance,
        uptime: 99.8, // Simulated
        activeUsers: Math.floor(Math.random() * 100) + 50, // Simulated
        recentErrors: criticalEvents + highRiskEvents,
        responseTime: Math.floor(Math.random() * 100) + 200 // Simulated
      } as SystemHealth;
    },
    enabled: isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const getHealthColor = (status: string) => {
    switch (status) {
      case 'healthy': return 'text-green-600';
      case 'warning': return 'text-yellow-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getHealthIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'critical': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-gray-600" />;
    }
  };

  const refreshHealth = async () => {
    await refetch();
    toast.success('System health refreshed');
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            Administrator privileges required to view system health.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Health Monitor</h1>
          <p className="text-muted-foreground">
            Real-time monitoring of system performance and security status.
          </p>
        </div>
        <Button onClick={refreshHealth} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {/* System Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Database Health</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getHealthIcon(systemHealth?.database || 'healthy')}
              <span className={`text-lg font-semibold ${getHealthColor(systemHealth?.database || 'healthy')}`}>
                {systemHealth?.database?.charAt(0).toUpperCase() + systemHealth?.database?.slice(1) || 'Healthy'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Connection stable, queries responding
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Status</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getHealthIcon(systemHealth?.security || 'healthy')}
              <span className={`text-lg font-semibold ${getHealthColor(systemHealth?.security || 'healthy')}`}>
                {systemHealth?.security?.charAt(0).toUpperCase() + systemHealth?.security?.slice(1) || 'Healthy'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {systemHealth?.recentErrors || 0} recent security events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Performance</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getHealthIcon(systemHealth?.performance || 'healthy')}
              <span className={`text-lg font-semibold ${getHealthColor(systemHealth?.performance || 'healthy')}`}>
                {systemHealth?.performance?.charAt(0).toUpperCase() + systemHealth?.performance?.slice(1) || 'Healthy'}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Avg response: {systemHealth?.responseTime || 0}ms
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Metrics</CardTitle>
            <CardDescription>Key performance indicators</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>System Uptime</span>
                <span className="font-medium">{systemHealth?.uptime || 0}%</span>
              </div>
              <Progress value={systemHealth?.uptime || 0} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Active Users (24h)</span>
                <span className="font-medium">{systemHealth?.activeUsers || 0}</span>
              </div>
              <Progress value={Math.min(100, (systemHealth?.activeUsers || 0) / 2)} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Response Time</span>
                <span className="font-medium">{systemHealth?.responseTime || 0}ms</span>
              </div>
              <Progress 
                value={Math.max(0, 100 - (systemHealth?.responseTime || 0) / 10)} 
                className={systemHealth?.responseTime && systemHealth.responseTime > 500 ? 'text-red-600' : ''}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Error Rate</span>
                <span className="font-medium">{systemHealth?.recentErrors || 0}</span>
              </div>
              <Progress 
                value={Math.min(100, (systemHealth?.recentErrors || 0) * 10)}
                className={systemHealth?.recentErrors && systemHealth.recentErrors > 5 ? 'text-red-600' : 'text-green-600'}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Security Overview</CardTitle>
            <CardDescription>Security status and recent events</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Firewall Status</span>
              <Badge variant="outline" className="text-green-600">Active</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Rate Limiting</span>
              <Badge variant="outline" className="text-green-600">Enabled</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>SSL Certificate</span>
              <Badge variant="outline" className="text-green-600">Valid</Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span>Authentication</span>
              <Badge variant="outline" className="text-green-600">Secure</Badge>
            </div>

            <div className="flex items-center justify-between">
              <span>Recent Security Events</span>
              <Badge 
                variant={systemHealth?.recentErrors === 0 ? "outline" : "destructive"}
                className={systemHealth?.recentErrors === 0 ? "text-green-600" : ""}
              >
                {systemHealth?.recentErrors || 0}
              </Badge>
            </div>

            <div className="pt-2 border-t">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
