
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { Navigate } from 'react-router-dom';
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
  AlertCircle,
  Eye,
  Edit
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useI18n } from '@/hooks/useI18n';
import { useUserProfile } from '@/hooks/useUserProfile';
import { useUserEquipmentListings } from '@/hooks/useEquipmentListings';

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
  const { profile } = useUserProfile();
  const { userListings, isLoading: listingsLoading } = useUserEquipmentListings();
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
        totalListings: userListings?.length || 0,
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

  // Update total listings when userListings changes
  useEffect(() => {
    if (userListings) {
      setStats(prev => ({ ...prev, totalListings: userListings.length }));
    }
  }, [userListings]);

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
      title: 'Equipment Listings',
      value: stats.totalListings.toString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50'
    },
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
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            {t('dashboard.welcome')}, {profile?.full_name || user.user_metadata?.full_name || user.user_metadata?.name || user.email}!
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
                        {statsLoading && !listingsLoading ? '...' : stat.value}
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-xl font-semibold">Quick Actions</h2>
            <div className="grid gap-4">
              {quickActions.map((action, index) => {
                const IconComponent = action.icon;
                return (
                  <Card key={index} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${action.color} text-white flex-shrink-0`}>
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="flex-grow">
                          <h3 className="font-medium">{action.title}</h3>
                          <p className="text-sm text-muted-foreground">{action.description}</p>
                        </div>
                        <Button asChild size="sm">
                          <Link to={action.href}>Go</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* My Equipment Listings */}
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold">My Equipment</h2>
              <Button asChild size="sm" variant="outline">
                <Link to="/list-equipment">Add New</Link>
              </Button>
            </div>
            <Card>
              <CardContent className="p-4">
                {listingsLoading ? (
                  <div className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="animate-pulse">
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    ))}
                  </div>
                ) : userListings && userListings.length > 0 ? (
                  <div className="space-y-4">
                    {userListings.slice(0, 5).map((listing) => (
                      <div key={listing.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          {listing.photos && listing.photos.length > 0 ? (
                            <img 
                              src={listing.photos[0]} 
                              alt={listing.title}
                              className="w-12 h-12 object-cover rounded"
                            />
                          ) : (
                            <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center">
                              <Package className="h-6 w-6 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{listing.title}</p>
                            <p className="text-sm text-muted-foreground">
                              ${(listing.price / 100).toFixed(2)}/{listing.price_unit}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={listing.status === 'active' ? 'default' : 'secondary'}>
                            {listing.status}
                          </Badge>
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {userListings.length > 5 && (
                      <div className="text-center pt-2">
                        <Button variant="outline" size="sm">
                          View All {userListings.length} Listings
                        </Button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="mb-4">No equipment listed yet</p>
                    <Button asChild>
                      <Link to="/list-equipment">List Your First Item</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
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
