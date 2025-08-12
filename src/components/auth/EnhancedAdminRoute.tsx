
import { ReactNode, useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { useEnhancedAdminVerification } from '@/hooks/useEnhancedAdminVerification';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface EnhancedAdminRouteProps {
  children: ReactNode;
  requiresAction?: string;
  targetUserId?: string;
}

export const EnhancedAdminRoute = ({ 
  children, 
  requiresAction,
  targetUserId 
}: EnhancedAdminRouteProps) => {
  const { user, isAdmin, loading } = useAuth();
  const { verifyAdminStatus, verifyAdminAction, isVerifying } = useEnhancedAdminVerification();
  const [adminVerified, setAdminVerified] = useState<boolean | null>(null);
  const [actionVerified, setActionVerified] = useState<boolean | null>(null);

  useEffect(() => {
    const performVerification = async () => {
      if (user && isAdmin) {
        // First verify admin status
        const statusVerified = await verifyAdminStatus();
        setAdminVerified(statusVerified);
        
        // If a specific action is required, verify that too
        if (statusVerified && requiresAction) {
          const actionAllowed = await verifyAdminAction(requiresAction, targetUserId);
          setActionVerified(actionAllowed);
        } else if (statusVerified) {
          setActionVerified(true);
        }
      } else {
        setAdminVerified(false);
        setActionVerified(false);
      }
    };

    performVerification();
  }, [user, isAdmin, verifyAdminStatus, verifyAdminAction, requiresAction, targetUserId]);

  if (loading || isVerifying || adminVerified === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2 className="h-5 w-5 animate-spin" />
              Verifying Access
            </CardTitle>
            <CardDescription>
              Performing security validation...
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (!adminVerified || (requiresAction && !actionVerified)) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Access Denied
            </CardTitle>
            <CardDescription>
              {!adminVerified 
                ? "Administrator privileges required and could not be verified."
                : "This action is not authorized for your account."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => window.location.href = '/'}
              className="w-full"
            >
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};
