
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { Navigate, Link } from 'react-router-dom';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';
import ProfileManagement from '@/components/profile/ProfileManagement';
import BookingHistory from '@/components/bookings/BookingHistory';
import { useI18n } from '@/hooks/useI18n';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar, User } from 'lucide-react';

const Profile = () => {
  const { user, loading } = useAuth();
  const { t } = useI18n();

  console.log('Profile page - Auth state:', { user: !!user, loading });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('Profile page - No user, redirecting to login');
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

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile Settings
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                My Bookings
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="profile" className="mt-6">
              <ProfileManagement />
            </TabsContent>
            
            <TabsContent value="bookings" className="mt-6">
              <Card>
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle>My Bookings</CardTitle>
                    <Button asChild variant="outline">
                      <Link to="/bookings">View All Bookings</Link>
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <BookingHistory limit={5} />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Profile;
