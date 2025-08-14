
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { Navigate } from 'react-router-dom';
import { SecurityStatusPanel } from '@/components/security/SecurityStatusPanel';

const Admin = () => {
  const { isAdmin, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAdmin) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
      <SecurityStatusPanel />
    </div>
  );
};

export default Admin;
