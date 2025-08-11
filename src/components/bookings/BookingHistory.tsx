
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
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';
import { FileText, MessageSquare } from 'lucide-react';
import { ConditionVerificationModal } from '@/components/equipment/ConditionVerificationModal';
import BookingMessages from '@/components/provider/BookingMessages';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface Booking {
  id: string;
  equipment_id: string;
  equipment_title: string | null;
  start_date: string;
  end_date: string;
  total_price: number;
  status: string;
  owner_id: string;
  user_id: string;
}

interface BookingHistoryProps {
  limit?: number;
}

const BookingHistory = ({ limit }: BookingHistoryProps) => {
  const queryClient = useQueryClient();
  const [showConditionForm, setShowConditionForm] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [chatBookingId, setChatBookingId] = useState<string | null>(null);

  const { data: bookings = [], isLoading: loading } = useQuery({
    queryKey: ['bookings', 'user'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) return [];

      let query = supabase
        .from('bookings')
        .select('id, equipment_id, equipment_title, start_date, end_date, total_price, status, owner_id, user_id')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (limit) {
        query = query.limit(limit);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching bookings', error);
        return [];
      }

      return data as Booking[];
    },
    staleTime: 0, // Always refetch to ensure fresh data
    refetchOnWindowFocus: true,
  });

  // Set up real-time subscription for booking changes
  useEffect(() => {
    const subscription = supabase
      .channel('booking-changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'bookings'
        }, 
        () => {
          // Invalidate and refetch booking data when changes occur
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [queryClient]);

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

  if (loading) {
    return <p>Loading booking history...</p>
  }

  if (bookings.length === 0) {
    return (
      <div className="p-8 text-center border rounded-md">
        <h3 className="text-lg font-medium">No bookings yet</h3>
        <p className="text-muted-foreground">Your booking history will appear here</p>
      </div>
    );
  }

  return (
    <>
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
            <>
              <TableRow key={booking.id}>
                <TableCell className="font-medium">
                  {booking.id.substring(0, 8)}...
                </TableCell>
                <TableCell>
                  {format(new Date(booking.start_date), 'MMM d, yyyy')} - {format(new Date(booking.end_date), 'MMM d, yyyy')}
                </TableCell>
                <TableCell>${booking.total_price / 100}</TableCell>
                <TableCell>{getStatusBadge(booking.status)}</TableCell>
                <TableCell className="text-right">
                  <div className="flex gap-2 justify-end">
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                    {(booking.status === 'confirmed' || booking.status === 'completed') && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowConditionForm(true);
                        }}
                      >
                        <FileText className="h-4 w-4 mr-1" />
                        Condition Form
                      </Button>
                    )}
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => setChatBookingId(prev => prev === booking.id ? null : booking.id)}
                    >
                      <MessageSquare className="h-4 w-4 mr-1" />
                      Chat
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              {chatBookingId === booking.id && (
                <TableRow key={booking.id + '-chat'}>
                  <TableCell colSpan={5}>
                    <BookingMessages bookingId={booking.id} ownerId={booking.owner_id} userId={booking.user_id} />
                  </TableCell>
                </TableRow>
              )}
            </>
          ))}
        </TableBody>
      </Table>
      
      {selectedBooking && (
        <ConditionVerificationModal
          isOpen={showConditionForm}
          onClose={() => {
            setShowConditionForm(false);
            setSelectedBooking(null);
          }}
          bookingId={selectedBooking.id}
          equipmentId={selectedBooking.equipment_id}
          equipmentTitle={selectedBooking.equipment_title || 'Equipment'}
          handoverType="pickup"
          userRole="renter"
        />
      )}
    </>
  );
};

export default BookingHistory;
