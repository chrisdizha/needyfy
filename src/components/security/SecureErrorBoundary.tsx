
import React, { Component, ReactNode } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  errorId: string;
  errorCount: number;
}

export class SecureErrorBoundary extends Component<Props, State> {
  private errorTimeout: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { 
      hasError: false, 
      errorId: '',
      errorCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): State {
    const errorId = `ERR_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Log sanitized error (no sensitive data)
    console.error('Application error:', {
      errorId,
      message: 'An error occurred',
      timestamp: new Date().toISOString()
    });

    return {
      hasError: true,
      errorId,
      errorCount: 1
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Sanitize error information before logging
    const sanitizedError = {
      errorId: this.state.errorId,
      type: 'client_error',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      // Don't include stack trace or sensitive error details
      hasError: true
    };

    // Log to security monitoring
    this.logSecurityEvent(sanitizedError);

    // Auto-recovery attempt after 5 seconds
    this.errorTimeout = setTimeout(() => {
      this.setState({ hasError: false, errorCount: this.state.errorCount + 1 });
    }, 5000);
  }

  private logSecurityEvent = async (errorData: any) => {
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.rpc('log_security_event', {
        p_user_id: user?.id || null,
        p_event_type: 'application_error',
        p_event_details: errorData,
        p_risk_level: this.state.errorCount > 3 ? 'medium' : 'low'
      });
    } catch (error) {
      console.error('Failed to log security event:', error);
    }
  };

  componentWillUnmount() {
    if (this.errorTimeout) {
      clearTimeout(this.errorTimeout);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold">Application Error</h3>
                  <p className="text-sm text-muted-foreground">
                    Something went wrong. The application will attempt to recover automatically.
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Error ID: {this.state.errorId}
                  </p>
                </div>
                
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reload Page
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => this.setState({ hasError: false })}
                  >
                    Try Again
                  </Button>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}
