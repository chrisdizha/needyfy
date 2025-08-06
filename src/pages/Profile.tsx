
import { useAuth } from '@/contexts/SimpleAuthContext';
import { Navigate } from 'react-router-dom';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';
import ProfileManagement from '@/components/profile/ProfileManagement';
import { useI18n } from '@/hooks/useI18n';

const Profile = () => {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              {t('profile.title')}
            </h1>
            <p className="text-muted-foreground">
              {t('profile.subtitle')}
            </p>
          </div>

          <ProfileManagement />
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
