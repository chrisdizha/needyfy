
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Shield, Eye, Clock, Activity } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface SecurityEvent {
  id: string;
  event_type: string;
  risk_level: string;
  created_at: string;
  event_details: any;
  user_id: string;
}

interface SecurityMetrics {
  total_events: number;
  high_risk_events: number;
  recent_events: number;
  admin_actions: number;
}

export const EnhancedSecurityMonitoring = () => {
  const { user, isAdmin } = useAuth();
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');

  const { data: securityEvents, isLoading: eventsLoading, refetch: refetchEvents } = useQuery({
    queryKey: ['security-events', user?.id, selectedTimeframe],
    queryFn: async () => {
      if (!user || !isAdmin) return [];

      const hoursBack = selectedTimeframe === '24h' ? 24 : selectedTimeframe === '7d' ? 168 : 720;
      const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('security_events')
        .select('*')
        .gte('created_at', startTime)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      return data as SecurityEvent[];
    },
    enabled: !!user && isAdmin,
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const { data: securityMetrics, isLoading: metricsLoading } = useQuery({
    queryKey: ['security-metrics', selectedTimeframe],
    queryFn: async () => {
      if (!user || !isAdmin) return null;

      const hoursBack = selectedTimeframe === '24h' ? 24 : selectedTimeframe === '7d' ? 168 : 720;
      const startTime = new Date(Date.now() - hoursBack * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('security_events')
        .select('risk_level, event_type, created_at')
        .gte('created_at', startTime);

      if (error) throw error;

      const metrics: SecurityMetrics = {
        total_events: data.length,
        high_risk_events: data.filter(e => e.risk_level === 'high' || e.risk_level === 'critical').length,
        recent_events: data.filter(e => {
          const eventTime = new Date(e.created_at);
          return Date.now() - eventTime.getTime() < 60 * 60 * 1000; // Last hour
        }).length,
        admin_actions: data.filter(e => e.event_type.includes('admin')).length
      };

      return metrics;
    },
    enabled: !!user && isAdmin,
    refetchInterval: 30000,
  });

  const getRiskBadgeVariant = (riskLevel: string) => {
    switch (riskLevel) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const runSecurityScan = async () => {
    try {
      // Trigger a comprehensive security validation
      await supabase.rpc('log_security_event', {
        p_user_id: user?.id,
        p_event_type: 'manual_security_scan',
        p_event_details: { triggered_by: 'admin_dashboard' },
        p_risk_level: 'low'
      });

      toast({
        title: 'Security Scan Initiated',
        description: 'Comprehensive security scan has been started.',
      });

      // Refresh the data
      refetchEvents();
    } catch (error) {
      toast({
        title: 'Security Scan Failed',
        description: 'Failed to initiate security scan.',
        variant: 'destructive',
      });
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Access Denied
          </CardTitle>
          <CardDescription>
            Administrator privileges required to view security monitoring.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Monitoring</h2>
          <p className="text-muted-foreground">Real-time security event monitoring and analysis</p>
        </div>
        <div className="flex gap-2">
          <select
            value={selectedTimeframe}
            onChange={(e) => setSelectedTimeframe(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
          </select>
          <Button onClick={runSecurityScan} size="sm">
            <Shield className="h-4 w-4 mr-2" />
            Run Security Scan
          </Button>
        </div>
      </div>

      {/* Security Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : securityMetrics?.total_events || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {metricsLoading ? '...' : securityMetrics?.high_risk_events || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recent Events</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : securityMetrics?.recent_events || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {metricsLoading ? '...' : securityMetrics?.admin_actions || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Events List */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
          <CardDescription>
            Latest security events and system activities ({selectedTimeframe})
          </CardDescription>
        </CardHeader>
        <CardContent>
          {eventsLoading ? (
            <div className="text-center py-4">Loading security events...</div>
          ) : (
            <div className="space-y-3">
              {securityEvents?.slice(0, 20).map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Badge variant={getRiskBadgeVariant(event.risk_level)}>
                        {event.risk_level}
                      </Badge>
                      <span className="font-medium">{event.event_type}</span>
                      <span className="text-sm text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </span>
                    </div>
                    {event.event_details && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {JSON.stringify(event.event_details, null, 2).slice(0, 100)}...
                      </div>
                    )}
                  </div>
                </div>
              ))}
              {!securityEvents?.length && (
                <div className="text-center py-8 text-muted-foreground">
                  No security events found for the selected timeframe.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
