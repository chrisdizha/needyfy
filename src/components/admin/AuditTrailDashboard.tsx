
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Calendar, Shield, User, AlertTriangle, Search, Filter } from 'lucide-react';
import { useAuth } from '@/contexts/OptimizedAuthContext';

interface AuditLogEntry {
  id: string;
  user_id: string;
  action: string;
  table_name: string;
  record_id: string;
  old_values: any;
  new_values: any;
  ip_address: string;
  user_agent: string;
  created_at: string;
}

interface SecurityEvent {
  id: string;
  user_id: string;
  event_type: string;
  event_details: any;
  risk_level: string;
  ip_address: string;
  created_at: string;
}

export const AuditTrailDashboard = () => {
  const { isAdmin } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [actionFilter, setActionFilter] = useState('all');
  const [dateRange, setDateRange] = useState('7d');

  const { data: auditLogs, isLoading: auditLoading } = useQuery({
    queryKey: ['audit-logs', searchTerm, actionFilter, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply date filter
      if (dateRange !== 'all') {
        const days = parseInt(dateRange.replace('d', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply action filter
      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      // Apply search filter
      if (searchTerm) {
        query = query.or(`action.ilike.%${searchTerm}%,table_name.ilike.%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as AuditLogEntry[];
    },
    enabled: isAdmin,
  });

  const { data: securityEvents, isLoading: securityLoading } = useQuery({
    queryKey: ['security-events', riskFilter, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('security_events')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      // Apply date filter
      if (dateRange !== 'all') {
        const days = parseInt(dateRange.replace('d', ''));
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        query = query.gte('created_at', startDate.toISOString());
      }

      // Apply risk filter
      if (riskFilter !== 'all') {
        query = query.eq('risk_level', riskFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as SecurityEvent[];
    },
    enabled: isAdmin,
  });

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'secondary';
      case 'low': return 'outline';
      default: return 'outline';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('admin')) return <Shield className="h-4 w-4" />;
    if (action.includes('user')) return <User className="h-4 w-4" />;
    return <AlertTriangle className="h-4 w-4" />;
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
            Administrator privileges required to view audit trails.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Audit Trail Dashboard</h1>
          <p className="text-muted-foreground">
            Monitor system activities and security events across the platform.
          </p>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search actions, tables..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger>
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Last 24 hours</SelectItem>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="all">All time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={actionFilter} onValueChange={setActionFilter}>
            <SelectTrigger>
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All actions</SelectItem>
              <SelectItem value="admin_role_assigned">Role assignments</SelectItem>
              <SelectItem value="user_suspended">User suspensions</SelectItem>
              <SelectItem value="data_export">Data exports</SelectItem>
              <SelectItem value="payment_action">Payment actions</SelectItem>
            </SelectContent>
          </Select>

          <Select value={riskFilter} onValueChange={setRiskFilter}>
            <SelectTrigger>
              <AlertTriangle className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by risk" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All risk levels</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="low">Low</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="audit" className="space-y-4">
        <TabsList>
          <TabsTrigger value="audit">Audit Logs</TabsTrigger>
          <TabsTrigger value="security">Security Events</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Audit Logs</CardTitle>
              <CardDescription>
                Detailed record of all administrative actions and data changes.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {auditLoading ? (
                    <div className="text-center py-4">Loading audit logs...</div>
                  ) : auditLogs?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No audit logs found for the selected criteria.
                    </div>
                  ) : (
                    auditLogs?.map((log) => (
                      <Card key={log.id} className="border-l-4 border-l-blue-500">
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              {getActionIcon(log.action)}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{log.action}</span>
                                  {log.table_name && (
                                    <Badge variant="outline">{log.table_name}</Badge>
                                  )}
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  User ID: {log.user_id?.slice(0, 8)}...
                                  {log.record_id && ` | Record: ${log.record_id.slice(0, 8)}...`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(log.created_at).toLocaleString()}
                                  {log.ip_address && ` | IP: ${log.ip_address}`}
                                </p>
                                {(log.old_values || log.new_values) && (
                                  <details className="text-xs">
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                      View changes
                                    </summary>
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                                      {log.old_values && (
                                        <div>
                                          <strong>Before:</strong>
                                          <pre>{JSON.stringify(log.old_values, null, 2)}</pre>
                                        </div>
                                      )}
                                      {log.new_values && (
                                        <div>
                                          <strong>After:</strong>
                                          <pre>{JSON.stringify(log.new_values, null, 2)}</pre>
                                        </div>
                                      )}
                                    </div>
                                  </details>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Events</CardTitle>
              <CardDescription>
                Real-time security monitoring and threat detection logs.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {securityLoading ? (
                    <div className="text-center py-4">Loading security events...</div>
                  ) : securityEvents?.length === 0 ? (
                    <div className="text-center py-4 text-muted-foreground">
                      No security events found for the selected criteria.
                    </div>
                  ) : (
                    securityEvents?.map((event) => (
                      <Card key={event.id} className={`border-l-4 ${
                        event.risk_level === 'critical' ? 'border-l-red-500' :
                        event.risk_level === 'high' ? 'border-l-orange-500' :
                        event.risk_level === 'medium' ? 'border-l-yellow-500' :
                        'border-l-green-500'
                      }`}>
                        <CardContent className="pt-4">
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <AlertTriangle className={`h-4 w-4 mt-1 ${
                                event.risk_level === 'critical' ? 'text-red-500' :
                                event.risk_level === 'high' ? 'text-orange-500' :
                                event.risk_level === 'medium' ? 'text-yellow-500' :
                                'text-green-500'
                              }`} />
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{event.event_type}</span>
                                  <Badge variant={getRiskBadgeVariant(event.risk_level)}>
                                    {event.risk_level}
                                  </Badge>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  User ID: {event.user_id?.slice(0, 8)}...
                                  {event.ip_address && ` | IP: ${event.ip_address}`}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {new Date(event.created_at).toLocaleString()}
                                </p>
                                {event.event_details && (
                                  <details className="text-xs">
                                    <summary className="cursor-pointer text-blue-600 hover:text-blue-800">
                                      View details
                                    </summary>
                                    <div className="mt-2 p-2 bg-gray-50 rounded text-xs font-mono">
                                      <pre>{JSON.stringify(event.event_details, null, 2)}</pre>
                                    </div>
                                  </details>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
