
import React from 'react';
import { AuditTrailDashboard } from '@/components/admin/AuditTrailDashboard';
import { ComplianceReporting } from '@/components/admin/ComplianceReporting';
import { SystemHealthMonitor } from '@/components/admin/SystemHealthMonitor';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, Activity } from 'lucide-react';

const AdminAuditTrail = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <Tabs defaultValue="audit" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="audit" className="gap-2">
            <Shield className="h-4 w-4" />
            Audit Trail
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-2">
            <FileText className="h-4 w-4" />
            Compliance
          </TabsTrigger>
          <TabsTrigger value="health" className="gap-2">
            <Activity className="h-4 w-4" />
            System Health
          </TabsTrigger>
        </TabsList>

        <TabsContent value="audit">
          <AuditTrailDashboard />
        </TabsContent>

        <TabsContent value="compliance">
          <ComplianceReporting />
        </TabsContent>

        <TabsContent value="health">
          <SystemHealthMonitor />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAuditTrail;
