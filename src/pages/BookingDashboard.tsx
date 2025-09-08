
import { useState } from 'react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { Navigate } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import BookingHistory from '@/components/bookings/BookingHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useBookings } from '@/hooks/useBookings';

const BookingDashboard = () => {
  const { user, loading } = useAuth();
  const { bookings } = useBookings();
  const [activeTab, setActiveTab] = useState('all');

  console.log('BookingDashboard - Auth state:', { user: !!user, loading });

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    console.log('BookingDashboard - No user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  const confirmedBookings = bookings.filter(b => b.status === 'confirmed');
  const pendingBookings = bookings.filter(b => b.status === 'pending');
  const completedBookings = bookings.filter(b => b.status === 'completed');
  const totalRevenue = completedBookings.reduce((sum, booking) => sum + (booking.total_price / 100), 0);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Booking Dashboard</h1>
            <p className="text-muted-foreground">Manage all your equipment bookings</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Bookings</CardTitle>
              <CardDescription>All-time booking count</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{bookings.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Active Bookings</CardTitle>
              <CardDescription>Currently ongoing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{confirmedBookings.length}</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Revenue</CardTitle>
              <CardDescription>From all bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">${totalRevenue.toFixed(2)}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all">All Bookings</TabsTrigger>
            <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            <BookingHistory />
          </TabsContent>
        </Tabs>
      </main>
      <Footer />
    </div>
  );
};

export default BookingDashboard;
