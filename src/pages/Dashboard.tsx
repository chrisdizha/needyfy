
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import AuthenticatedNavbar from '@/components/layout/AuthenticatedNavbar';
import Footer from '@/components/layout/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Calendar, 
  DollarSign, 
  Plus, 
  TrendingUp, 
  Clock,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/hooks/useI18n';

interface DashboardStats {
  totalListings: number;
  activeBookings: number;
  totalEarnings: number;
  pendingBookings: number;
  completedBookings: number;
  recentActivity: any[];
}

const Dashboard = () => {
  const { user, loading } = useAuth();
  const { t } = useI18n();
  const [stats, setStats] = useState<DashboardStats>({
    totalListings: 0,
    activeBookings: 0,
    totalEarnings: 0,
    pendingBookings: 0,
    completedBookings: 0,
    recentActivity: []
  });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      // Fetch user's bookings as renter
      const { data: renterBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('user_id', user?.id);

      // Fetch user's bookings as provider
      const { data: providerBookings } = await supabase
        .from('bookings')
        .select('*')
        .eq('owner_id', user?.id);

      const allBookings = [...(renterBookings || []), ...(providerBookings || [])];
      const activeBookings = allBookings.filter(b => b.status === 'confirmed').length;
      const pendingBookings = allBookings.filter(b => b.status === 'pending').length;
      const completedBookings = allBookings.filter(b => b.status === 'completed').length;
      
      // Calculate total earnings from provider bookings
      const totalEarnings = (providerBookings || [])
        .filter(b => b.status === 'completed')
        .reduce((sum, booking) => sum + booking.total_price, 0);

      setStats({
        totalListings: 0, // This would need equipment table
        activeBookings,
        totalEarnings: totalEarnings / 100, // Convert from cents
        pendingBookings,
        completedBookings,
        recentActivity: allBookings.slice(0, 5)
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setStatsLoading(false);
    }
  };

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

  const quickActions = [
    {
      title: t('dashboard.listEquipment'),
      description: t('dashboard.listEquipmentDesc'),
      icon: Plus,
      href: '/list-equipment',
      color: 'bg-blue-500 hover:bg-blue-600'
    },
    {
      title: t('dashboard.myBookings'),
      description: t('dashboard.myBookingsDesc'),
      icon: Calendar,
      href: '/bookings',
      color: 'bg-green-500 hover:bg-green-600'
    },
    {
      title: t('dashboard.browse'),
      description: t('dashboard.browseDesc'),
      icon: Package,
      href: '/categories',
      color: 'bg-purple-500 hover:bg-purple-600'
    }
  ];

  const statCards = [
    {
      title: t('dashboard.totalEarnings'),
      value: `$${stats.totalEarnings.toFixed(2)}`,
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    },
    {
      title: t('dashboard.activeBookings'),
      value: stats.activeBookings.toString(),
      icon: Calendar,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
    {
      title: t('dashboard.pendingRequests'),
      value: stats.pendingBookings.toString(),
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50'
    },
    {
      title: t('dashboard.completedBookings'),
      value: stats.completedBookings.toString(),
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedNavbar />
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.welcome')}, {user.user_metadata?.full_name || user.email}!
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.welcomeMessage')}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">
                        {stat.title}
                      </p>
                      <p className="text-2xl font-bold text-foreground">
                        {statsLoading ? '...' : stat.value}
                      </p>
                    </div>
                    <div className={`p-3 rounded-full ${stat.bgColor}`}>
                      <IconComponent className={`h-6 w-6 ${stat.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {quickActions.map((action, index) => {
            const IconComponent = action.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${action.color} text-white`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    {action.title}
                  </CardTitle>
                  <CardDescription>
                    {action.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild className="w-full">
                    <Link to={action.href}>{t('common.getStarted')}</Link>
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('dashboard.recentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentActivity.length > 0 ? (
              <div className="space-y-4">
                {stats.recentActivity.map((activity, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <Calendar className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {activity.equipment_title || t('dashboard.bookingActivity')}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant={
                      activity.status === 'confirmed' ? 'default' :
                      activity.status === 'pending' ? 'secondary' : 'outline'
                    }>
                      {activity.status}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>{t('dashboard.noRecentActivity')}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>

      <Footer />
    </div>
  );
};

export default Dashboard;
