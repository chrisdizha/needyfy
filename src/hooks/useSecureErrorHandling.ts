
import { useCallback } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface ErrorContext {
  component?: string;
  action?: string;
  userId?: string;
  additional?: Record<string, any>;
}

interface SanitizedError {
  message: string;
  code?: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  shouldLog: boolean;
}

export const useSecureErrorHandling = () => {
  
  const sanitizeErrorMessage = useCallback((error: any): SanitizedError => {
    // Default sanitized response
    let sanitizedMessage = 'An unexpected error occurred. Please try again.';
    let code: string | undefined;
    let severity: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    let shouldLog = true;

    if (typeof error === 'string') {
      // Handle string errors
      if (error.toLowerCase().includes('network')) {
        sanitizedMessage = 'Network connection issue. Please check your internet connection.';
        severity = 'low';
      } else if (error.toLowerCase().includes('permission') || error.toLowerCase().includes('unauthorized')) {
        sanitizedMessage = 'You do not have permission to perform this action.';
        severity = 'high';
      }
    } else if (error && typeof error === 'object') {
      // Handle object errors (like Supabase errors)
      if (error.code) {
        code = error.code;
        
        switch (error.code) {
          case 'PGRST301':
          case 'PGRST302':
            sanitizedMessage = 'Access denied. Please sign in and try again.';
            severity = 'medium';
            break;
          case 'PGRST116':
            sanitizedMessage = 'The requested resource was not found.';
            severity = 'low';
            break;
          case '23505':
            sanitizedMessage = 'This action conflicts with existing data. Please try a different approach.';
            severity = 'low';
            break;
          case '23503':
            sanitizedMessage = 'This action cannot be completed due to data dependencies.';
            severity = 'medium';
            break;
          case '42501':
            sanitizedMessage = 'Insufficient permissions for this operation.';
            severity = 'high';
            break;
          default:
            if (error.message && typeof error.message === 'string') {
              // Sanitize known safe error patterns
              if (error.message.includes('Invalid login credentials')) {
                sanitizedMessage = 'Invalid email or password. Please check your credentials.';
                severity = 'low';
              } else if (error.message.includes('Email not confirmed')) {
                sanitizedMessage = 'Please verify your email address before signing in.';
                severity = 'low';
              } else if (error.message.includes('Too many requests')) {
                sanitizedMessage = 'Too many attempts. Please wait before trying again.';
                severity = 'medium';
              } else if (error.message.includes('JWT')) {
                sanitizedMessage = 'Your session has expired. Please sign in again.';
                severity = 'medium';
              } else if (error.message.includes('Rate limit')) {
                sanitizedMessage = 'Please wait before making another request.';
                severity = 'low';
                shouldLog = false; // Rate limit errors are expected
              }
            }
        }
      }

      // Check for auth-specific errors
      if (error.status === 401) {
        sanitizedMessage = 'Authentication required. Please sign in.';
        severity = 'medium';
      } else if (error.status === 403) {
        sanitizedMessage = 'Access forbidden. You do not have permission for this action.';
        severity = 'high';
      } else if (error.status === 429) {
        sanitizedMessage = 'Too many requests. Please wait before trying again.';
        severity = 'low';
        shouldLog = false;
      } else if (error.status >= 500) {
        sanitizedMessage = 'Server error. Our team has been notified. Please try again later.';
        severity = 'critical';
      }
    }

    return {
      message: sanitizedMessage,
      code,
      severity,
      shouldLog
    };
  }, []);

  const logSecureError = useCallback(async (
    error: any, 
    context: ErrorContext = {}
  ) => {
    const sanitized = sanitizeErrorMessage(error);
    
    if (!sanitized.shouldLog) {
      return;
    }

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Log the error as a security event for monitoring
        await supabase.rpc('log_security_event', {
          p_user_id: user.id,
          p_event_type: 'application_error',
          p_event_details: {
            sanitized_message: sanitized.message,
            error_code: sanitized.code,
            severity: sanitized.severity,
            component: context.component,
            action: context.action,
            user_agent: navigator.userAgent,
            url: window.location.href,
            timestamp: new Date().toISOString(),
            // Only include safe context data, never raw error details
            additional_context: context.additional ? 
              JSON.stringify(context.additional).substring(0, 500) : null
          },
          p_risk_level: sanitized.severity === 'critical' ? 'high' : 
                        sanitized.severity === 'high' ? 'medium' : 'low'
        });
      }
    } catch (logError) {
      // If logging fails, don't show this to the user
      console.error('Failed to log error securely:', logError);
    }
  }, [sanitizeErrorMessage]);

  const handleSecureError = useCallback(async (
    error: any, 
    context: ErrorContext = {},
    showToast: boolean = true
  ) => {
    const sanitized = sanitizeErrorMessage(error);
    
    // Log the error securely
    await logSecureError(error, context);
    
    // Show user-friendly message
    if (showToast) {
      switch (sanitized.severity) {
        case 'critical':
          toast.error(sanitized.message, { duration: 8000 });
          break;
        case 'high':
          toast.error(sanitized.message, { duration: 6000 });
          break;
        case 'medium':
          toast.warning(sanitized.message, { duration: 4000 });
          break;
        case 'low':
          toast.info(sanitized.message, { duration: 3000 });
          break;
      }
    }
    
    return sanitized;
  }, [sanitizeErrorMessage, logSecureError]);

  const createSecureErrorHandler = useCallback((
    component: string,
    action?: string
  ) => {
    return async (error: any, additionalContext?: Record<string, any>) => {
      return handleSecureError(error, {
        component,
        action,
        additional: additionalContext
      });
    };
  }, [handleSecureError]);

  return {
    sanitizeErrorMessage,
    logSecureError,
    handleSecureError,
    createSecureErrorHandler
  };
};
