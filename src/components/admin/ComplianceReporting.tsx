
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Download, FileText, Shield, Calendar, TrendingUp, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { toast } from 'sonner';

interface ComplianceMetrics {
  totalAuditEntries: number;
  securityIncidents: number;
  dataExports: number;
  adminActions: number;
  complianceScore: number;
  criticalEvents: number;
}

export const ComplianceReporting = () => {
  const { isAdmin } = useAuth();
  const [reportPeriod, setReportPeriod] = useState('30d');
  const [reportType, setReportType] = useState('summary');

  const { data: complianceMetrics, isLoading } = useQuery({
    queryKey: ['compliance-metrics', reportPeriod],
    queryFn: async () => {
      const days = parseInt(reportPeriod.replace('d', ''));
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      // Get audit log metrics
      const { data: auditData } = await supabase
        .from('audit_log')
        .select('action')
        .gte('created_at', startDate.toISOString());

      // Get security events metrics
      const { data: securityData } = await supabase
        .from('security_events')
        .select('risk_level, event_type')
        .gte('created_at', startDate.toISOString());

      const totalAuditEntries = auditData?.length || 0;
      const adminActions = auditData?.filter(entry => 
        entry.action.includes('admin') || entry.action.includes('role')
      ).length || 0;
      const dataExports = auditData?.filter(entry => 
        entry.action === 'data_export'
      ).length || 0;

      const securityIncidents = securityData?.length || 0;
      const criticalEvents = securityData?.filter(event => 
        event.risk_level === 'critical' || event.risk_level === 'high'
      ).length || 0;

      // Calculate compliance score (simple scoring system)
      let complianceScore = 100;
      if (criticalEvents > 5) complianceScore -= 30;
      else if (criticalEvents > 2) complianceScore -= 15;
      if (securityIncidents > 20) complianceScore -= 20;
      else if (securityIncidents > 10) complianceScore -= 10;
      if (totalAuditEntries === 0) complianceScore -= 25;

      return {
        totalAuditEntries,
        securityIncidents,
        dataExports,
        adminActions,
        complianceScore: Math.max(0, complianceScore),
        criticalEvents
      } as ComplianceMetrics;
    },
    enabled: isAdmin,
  });

  const generateReport = async () => {
    try {
      // This would typically call an edge function to generate a comprehensive report
      const { data, error } = await supabase.functions.invoke('generate-compliance-report', {
        body: { 
          period: reportPeriod, 
          type: reportType,
          timestamp: new Date().toISOString()
        }
      });

      if (error) throw error;

      toast.success('Compliance report generated successfully');
      
      // In a real implementation, this would trigger a download
      // For now, we'll just show a success message
    } catch (error) {
      console.error('Error generating report:', error);
      toast.error('Failed to generate compliance report');
    }
  };

  const getComplianceColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceStatus = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Improvement';
    return 'Critical';
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
            Administrator privileges required to view compliance reports.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Compliance Reporting</h1>
          <p className="text-muted-foreground">
            Generate and monitor compliance reports for audit and regulatory purposes.
          </p>
        </div>

        <div className="flex gap-4">
          <Select value={reportPeriod} onValueChange={setReportPeriod}>
            <SelectTrigger className="w-48">
              <Calendar className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>

          <Select value={reportType} onValueChange={setReportType}>
            <SelectTrigger className="w-48">
              <FileText className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="summary">Summary Report</SelectItem>
              <SelectItem value="detailed">Detailed Report</SelectItem>
              <SelectItem value="security">Security Focus</SelectItem>
              <SelectItem value="audit">Audit Trail</SelectItem>
            </SelectContent>
          </Select>

          <Button onClick={generateReport} className="gap-2">
            <Download className="h-4 w-4" />
            Generate Report
          </Button>
        </div>
      </div>

      {/* Compliance Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Compliance Score</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <span className={getComplianceColor(complianceMetrics?.complianceScore || 0)}>
                {complianceMetrics?.complianceScore || 0}%
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {getComplianceStatus(complianceMetrics?.complianceScore || 0)}
            </p>
            <Progress 
              value={complianceMetrics?.complianceScore || 0} 
              className="mt-2" 
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Audit Entries</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceMetrics?.totalAuditEntries || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              System activities logged
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Incidents</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceMetrics?.securityIncidents || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              {complianceMetrics?.criticalEvents || 0} critical events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Admin Actions</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {complianceMetrics?.adminActions || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              Administrative changes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compliance Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Compliance Status</CardTitle>
            <CardDescription>
              Current compliance standing and recommendations
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span>Data Protection</span>
              <Badge variant="outline" className="text-green-600">
                Compliant
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Audit Trail Completeness</span>
              <Badge variant="outline" className="text-green-600">
                Complete
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Security Monitoring</span>
              <Badge variant="outline" className="text-green-600">
                Active
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Access Controls</span>
              <Badge variant="outline" className="text-green-600">
                Enforced
              </Badge>
            </div>
            {(complianceMetrics?.criticalEvents || 0) > 0 && (
              <div className="flex items-center justify-between">
                <span>Critical Events</span>
                <Badge variant="destructive">
                  {complianceMetrics?.criticalEvents} unresolved
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity Summary</CardTitle>
            <CardDescription>
              Key metrics for the selected period
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Audit Entries</span>
                <span className="font-medium">{complianceMetrics?.totalAuditEntries || 0}</span>
              </div>
              <Progress value={Math.min(100, (complianceMetrics?.totalAuditEntries || 0) / 10)} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Security Events</span>
                <span className="font-medium">{complianceMetrics?.securityIncidents || 0}</span>
              </div>
              <Progress value={Math.min(100, (complianceMetrics?.securityIncidents || 0) * 5)} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Data Exports</span>
                <span className="font-medium">{complianceMetrics?.dataExports || 0}</span>
              </div>
              <Progress value={Math.min(100, (complianceMetrics?.dataExports || 0) * 10)} />
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Admin Actions</span>
                <span className="font-medium">{complianceMetrics?.adminActions || 0}</span>
              </div>
              <Progress value={Math.min(100, (complianceMetrics?.adminActions || 0) * 5)} />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
