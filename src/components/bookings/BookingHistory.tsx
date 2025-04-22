
import { useState, useEffect } from 'react';
import { 
  Table, 
  TableBody, 
  TableCaption, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { BookingDetails } from '@/types/booking';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

interface BookingHistoryProps {
  limit?: number;
}

const BookingHistory = ({ limit }: BookingHistoryProps) => {
  const [bookings, setBookings] = useState<BookingDetails[]>([]);

  useEffect(() => {
    // Fetch bookings from localStorage in a real app this would be an API call
    const storedBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
    
    // Convert date strings to Date objects
    const processedBookings = storedBookings.map((booking: any) => ({
      ...booking,
      startDate: new Date(booking.startDate),
      endDate: new Date(booking.endDate),
      created: booking.created ? new Date(booking.created) : new Date(),
    }));
    
    // Sort by created date, newest first
    processedBookings.sort((a: BookingDetails, b: BookingDetails) => {
      return (b.created?.getTime() || 0) - (a.created?.getTime() || 0);
    });
    
    // Apply limit if provided
    setBookings(limit ? processedBookings.slice(0, limit) : processedBookings);
  }, [limit]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Confirmed</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Pending</Badge>;
      case 'cancelled':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Cancelled</Badge>;
      case 'completed':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center border rounded-md">
        <h3 className="text-lg font-medium">No bookings yet</h3>
        <p className="text-muted-foreground">Your booking history will appear here</p>
      </div>
    );
  }

  return (
    <Table>
      <TableCaption>Your booking history</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Booking ID</TableHead>
          <TableHead>Dates</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {bookings.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="font-medium">
              {booking.id.substring(0, 8)}...
            </TableCell>
            <TableCell>
              {format(booking.startDate, 'MMM d, yyyy')} - {format(booking.endDate, 'MMM d, yyyy')}
            </TableCell>
            <TableCell>${booking.totalPrice}</TableCell>
            <TableCell>{getStatusBadge(booking.status)}</TableCell>
            <TableCell className="text-right">
              <Button variant="outline" size="sm">
                View Details
              </Button>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default BookingHistory;
