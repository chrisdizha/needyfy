
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { toast } from 'sonner';

interface AuditEntry {
  action: string;
  table_name?: string;
  record_id?: string;
  old_values?: any;
  new_values?: any;
  metadata?: any;
}

export const useAuditTrail = () => {
  const { user } = useAuth();
  const [isLogging, setIsLogging] = useState(false);

  const logAuditEvent = useCallback(async (entry: AuditEntry) => {
    if (!user) return null;

    setIsLogging(true);
    try {
      // Use the enhanced audit logging function
      await supabase.rpc('log_admin_action', {
        p_action: entry.action,
        p_table_name: entry.table_name || null,
        p_record_id: entry.record_id || null,
        p_old_values: entry.old_values || null,
        p_new_values: entry.new_values || null
      });

      return true;
    } catch (error) {
      console.error('Failed to log audit event:', error);
      toast.error('Failed to log audit event');
      return false;
    } finally {
      setIsLogging(false);
    }
  }, [user]);

  const logSecurityEvent = useCallback(async (
    eventType: string,
    details: any,
    riskLevel: 'low' | 'medium' | 'high' | 'critical' = 'low'
  ) => {
    if (!user) return null;

    try {
      await supabase.rpc('log_security_event_enhanced', {
        p_user_id: user.id,
        p_event_type: eventType,
        p_event_details: details,
        p_risk_level: riskLevel
      });

      return true;
    } catch (error) {
      console.error('Failed to log security event:', error);
      return false;
    }
  }, [user]);

  const logUserAction = useCallback(async (
    action: string,
    details?: any,
    targetUserId?: string
  ) => {
    if (!user) return null;

    const entry: AuditEntry = {
      action,
      metadata: {
        details,
        target_user_id: targetUserId,
        timestamp: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip_address: 'client-side' // Would be populated server-side
      }
    };

    return logAuditEvent(entry);
  }, [user, logAuditEvent]);

  const logDataAccess = useCallback(async (
    tableName: string,
    action: 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE',
    recordId?: string,
    details?: any
  ) => {
    if (!user) return null;

    const entry: AuditEntry = {
      action: `data_${action.toLowerCase()}`,
      table_name: tableName,
      record_id: recordId,
      metadata: {
        sql_action: action,
        details,
        timestamp: new Date().toISOString()
      }
    };

    return logAuditEvent(entry);
  }, [user, logAuditEvent]);

  const logAdminAction = useCallback(async (
    action: string,
    targetTable?: string,
    targetRecord?: string,
    changes?: { old: any; new: any }
  ) => {
    if (!user) return null;

    const entry: AuditEntry = {
      action: `admin_${action}`,
      table_name: targetTable,
      record_id: targetRecord,
      old_values: changes?.old,
      new_values: changes?.new,
      metadata: {
        admin_user_id: user.id,
        timestamp: new Date().toISOString()
      }
    };

    return logAuditEvent(entry);
  }, [user, logAuditEvent]);

  return {
    logAuditEvent,
    logSecurityEvent,
    logUserAction,
    logDataAccess,
    logAdminAction,
    isLogging
  };
};
