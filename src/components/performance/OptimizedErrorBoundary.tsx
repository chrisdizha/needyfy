
import { Component, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorId: string;
  retryCount: number;
  componentStack?: string;
  isReactHookError: boolean;
}

class OptimizedErrorBoundary extends Component<Props, State> {
  private retryTimeoutId: NodeJS.Timeout | null = null;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      errorId: '',
      retryCount: 0,
      isReactHookError: false
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const isReactHookError = 
      error.message?.includes('useState') || 
      error.message?.includes('useContext') ||
      error.message?.includes('useEffect') ||
      error.message?.includes('Cannot read properties of null') ||
      error.message?.includes('hooks') ||
      error.message?.includes('Hook');

    console.error('🚨 Error Boundary - getDerivedStateFromError:', {
      message: error.message,
      isReactHookError,
      stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack
    });

    return {
      hasError: true,
      error,
      errorId: `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      retryCount: 0,
      isReactHookError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Enhanced logging with component stack
    console.group(`🚨 Error Boundary Caught Error [${this.state.errorId}]`);
    console.error('Error:', error);
    console.error('Error Info:', errorInfo);
    console.error('Component Stack:', errorInfo.componentStack);
    console.error('Error Stack:', error.stack);
    
    // Enhanced React-specific issue detection
    if (this.state.isReactHookError) {
      console.error('🔍 React Hooks Error Detected - this typically requires a page reload');
      
      if (error.message?.includes('Cannot read properties of null')) {
        console.error('  ❌ Null reference in React hooks - possible causes:');
        console.error('    • Multiple React instances loaded');
        console.error('    • React hooks imported incorrectly');
        console.error('    • Component rendered outside React context');
        console.error('    • Hooks called conditionally');
        console.error('    • React internals corrupted');
      }
    }
    
    // Memory usage at time of error
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      console.warn('Memory at error:', {
        used: Math.round(memory.usedJSHeapSize / 1024 / 1024) + 'MB',
        total: Math.round(memory.totalJSHeapSize / 1024 / 1024) + 'MB',
        limit: Math.round(memory.jsHeapSizeLimit / 1024 / 1024) + 'MB'
      });
    }
    console.groupEnd();

    // Store component stack for debugging
    this.setState({ componentStack: errorInfo.componentStack });

    // Call optional error handler
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }

    // Track error in analytics (if available)
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'exception', {
        description: error.message,
        fatal: false,
        custom_map: {
          component: errorInfo.componentStack,
          error_id: this.state.errorId,
          is_react_hook_error: this.state.isReactHookError
        }
      });
    }
  }

  handleRetry = () => {
    const { retryCount } = this.state;
    
    console.log(`🔄 Retry attempt ${retryCount + 1}/3 for error ${this.state.errorId}`);
    
    // For React hook errors, force page reload immediately
    if (this.state.isReactHookError) {
      console.log('React hook error - forcing page reload for recovery');
      window.location.reload();
      return;
    }
    
    // Limit retries to prevent infinite loops
    if (retryCount >= 3) {
      // Force page reload as last resort
      console.log('Max retries reached - forcing page reload');
      window.location.reload();
      return;
    }

    // Clear any existing retry timeout
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }

    // Use exponential backoff for non-hook errors
    const delay = Math.min(1000 * Math.pow(2, retryCount), 5000);
    
    this.retryTimeoutId = setTimeout(() => {
      this.setState(prevState => ({
        hasError: false,
        error: undefined,
        errorId: '',
        retryCount: prevState.retryCount + 1,
        componentStack: undefined,
        isReactHookError: false
      }));
    }, delay);
  };

  handleReload = () => {
    console.log('🔄 Force reload requested');
    window.location.reload();
  };

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <div className="max-w-md w-full space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Something went wrong</AlertTitle>
              <AlertDescription className="mt-2">
                {this.state.error?.message || 'An unexpected error occurred'}
                {this.state.isReactHookError && (
                  <div className="mt-2 text-sm">
                    <strong>React Hook Error:</strong> This appears to be a React hooks issue. 
                    A page reload is required to recover.
                  </div>
                )}
              </AlertDescription>
            </Alert>
            
            <div className="flex space-x-2">
              <Button 
                onClick={this.handleRetry} 
                variant="outline" 
                size="sm"
                disabled={this.state.retryCount >= 3}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                {this.state.isReactHookError
                  ? 'Reload Page'
                  : this.state.retryCount >= 3 
                    ? 'Max Retries' 
                    : `Retry (${this.state.retryCount}/3)`
                }
              </Button>
              
              <Button 
                onClick={this.handleReload} 
                variant="default" 
                size="sm"
              >
                Force Reload
              </Button>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="mt-4 p-3 bg-muted rounded-md text-sm">
                <summary className="cursor-pointer font-medium">Error Details</summary>
                <div className="mt-2 space-y-2">
                  <div>
                    <strong>Error ID:</strong> {this.state.errorId}
                  </div>
                  <div>
                    <strong>React Hook Error:</strong> {this.state.isReactHookError ? 'Yes' : 'No'}
                  </div>
                  <div>
                    <strong>Message:</strong> {this.state.error?.message}
                  </div>
                  <div>
                    <strong>Component Stack:</strong>
                    <pre className="mt-1 text-xs bg-background p-2 rounded overflow-auto">
                      {this.state.componentStack}
                    </pre>
                  </div>
                  <div>
                    <strong>Error Stack:</strong>
                    <pre className="mt-1 text-xs bg-background p-2 rounded overflow-auto">
                      {this.state.error?.stack}
                    </pre>
                  </div>
                </div>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default OptimizedErrorBoundary;
