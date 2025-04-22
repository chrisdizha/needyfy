
import { useState } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import BookingHistory from '@/components/bookings/BookingHistory';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BookingFilters } from '@/types/booking';

const BookingDashboard = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [filters, setFilters] = useState<BookingFilters>({});

  const handleFilterChange = (status?: 'pending' | 'confirmed' | 'cancelled' | 'completed') => {
    setFilters({ ...filters, status });
    setActiveTab(status || 'all');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
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
              <p className="text-4xl font-bold">
                {JSON.parse(localStorage.getItem('bookings') || '[]').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Active Bookings</CardTitle>
              <CardDescription>Currently ongoing</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                {JSON.parse(localStorage.getItem('bookings') || '[]')
                  .filter((b: any) => b.status === 'confirmed').length}
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xl">Total Revenue</CardTitle>
              <CardDescription>From all bookings</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">
                ${JSON.parse(localStorage.getItem('bookings') || '[]')
                  .reduce((sum: number, booking: any) => sum + booking.totalPrice, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all" value={activeTab} className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all" onClick={() => handleFilterChange()}>
              All Bookings
            </TabsTrigger>
            <TabsTrigger value="confirmed" onClick={() => handleFilterChange('confirmed')}>
              Confirmed
            </TabsTrigger>
            <TabsTrigger value="pending" onClick={() => handleFilterChange('pending')}>
              Pending
            </TabsTrigger>
            <TabsTrigger value="cancelled" onClick={() => handleFilterChange('cancelled')}>
              Cancelled
            </TabsTrigger>
            <TabsTrigger value="completed" onClick={() => handleFilterChange('completed')}>
              Completed
            </TabsTrigger>
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
