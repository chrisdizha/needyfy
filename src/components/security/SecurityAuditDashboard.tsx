
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/SimpleAuthContext';
import { AlertTriangle, Shield, Activity, Users } from 'lucide-react';

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_details: any;
  risk_level: 'low' | 'medium' | 'high' | 'critical';
  created_at: string;
  ip_address?: string | null;
  user_agent?: string | null;
}

export const SecurityAuditDashboard = () => {
  const { isAdmin } = useAuth();
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalEvents: 0,
    highRiskEvents: 0,
    suspiciousUsers: 0,
    activeThreats: 0
  });

  useEffect(() => {
    if (!isAdmin) return;
    
    fetchSecurityEvents();
    const interval = setInterval(fetchSecurityEvents, 30000); // Refresh every 30 seconds
    
    return () => clearInterval(interval);
  }, [isAdmin]);

  const fetchSecurityEvents = async () => {
    try {
      const { data: eventsData, error } = await supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;

      // Type-safe transformation of the data
      const typedEvents: SecurityEvent[] = (eventsData || []).map(event => ({
        id: event.id,
        user_id: event.user_id || '',
        event_type: event.event_type || '',
        event_details: event.event_details,
        risk_level: ['low', 'medium', 'high', 'critical'].includes(event.risk_level) 
          ? event.risk_level as 'low' | 'medium' | 'high' | 'critical'
          : 'low', // fallback to 'low' if invalid value
        created_at: event.created_at || '',
        ip_address: event.ip_address ? String(event.ip_address) : null,
        user_agent: event.user_agent ? String(event.user_agent) : null
      }));

      setEvents(typedEvents);
      
      // Calculate statistics
      const totalEvents = typedEvents.length;
      const highRiskEvents = typedEvents.filter(e => ['high', 'critical'].includes(e.risk_level)).length;
      const suspiciousUsers = new Set(typedEvents.filter(e => e.risk_level === 'high').map(e => e.user_id)).size;
      const activeThreats = typedEvents.filter(e => 
        e.risk_level === 'critical' && 
        new Date(e.created_at) > new Date(Date.now() - 24 * 60 * 60 * 1000)
      ).length;

      setStats({
        totalEvents,
        highRiskEvents,
        suspiciousUsers,
        activeThreats
      });
    } catch (error) {
      console.error('Error fetching security events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const handleThreatResponse = async (eventId: string, action: string) => {
    try {
      await supabase.rpc('log_admin_action', {
        p_action: `security_response_${action}`,
        p_table_name: 'security_events',
        p_record_id: eventId,
        p_new_values: { response_action: action, responded_at: new Date().toISOString() }
      });
      
      fetchSecurityEvents(); // Refresh data
    } catch (error) {
      console.error('Error handling threat response:', error);
    }
  };

  if (!isAdmin) {
    return (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Access denied. Admin privileges required.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">High Risk Events</CardTitle>
            <AlertTriangle className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-500">{stats.highRiskEvents}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suspicious Users</CardTitle>
            <Users className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.suspiciousUsers}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Threats</CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.activeThreats}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Security Events</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading security events...</div>
          ) : (
            <div className="space-y-4">
              {events.map((event) => (
                <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center space-x-4">
                    <Badge className={`${getRiskColor(event.risk_level)} text-white`}>
                      {event.risk_level.toUpperCase()}
                    </Badge>
                    <div>
                      <div className="font-medium">{event.event_type}</div>
                      <div className="text-sm text-muted-foreground">
                        {event.event_details?.details || 'No details available'}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(event.created_at).toLocaleString()}
                      </div>
                    </div>
                  </div>
                  
                  {event.risk_level === 'critical' && (
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleThreatResponse(event.id, 'investigate')}
                      >
                        Investigate
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleThreatResponse(event.id, 'block')}
                      >
                        Block User
                      </Button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
