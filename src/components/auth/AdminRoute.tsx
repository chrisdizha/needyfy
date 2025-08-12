
import { ReactNode } from 'react';
import { EnhancedAdminRoute } from './EnhancedAdminRoute';

interface AdminRouteProps {
  children: ReactNode;
}

export const AdminRoute = ({ children }: AdminRouteProps) => {
  return (
    <EnhancedAdminRoute>
      {children}
    </EnhancedAdminRoute>
  );
};
