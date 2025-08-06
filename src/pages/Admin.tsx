
import { useAuth } from '@/main';
import { Navigate } from 'react-router-dom';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';
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
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <SecurityStatusPanel />
      </main>
      <Footer />
    </div>
  );
};

export default Admin;
