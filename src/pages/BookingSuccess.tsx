
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const confirmBooking = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError('No session ID found.');
        setLoading(false);
        return;
      }

      try {
        const { data, error: funcError } = await supabase.functions.invoke('confirm-booking', {
          body: { session_id: sessionId },
        });

        if (funcError) throw funcError;
        
        if (data.booking) {
          setBookingId(data.booking.id);
        } else {
          setError('Booking confirmation failed. Please contact support.');
        }

      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    confirmBooking();
  }, [searchParams]);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center p-8 border rounded-lg shadow-lg">
          {loading ? (
            <>
              <Loader2 className="h-12 w-12 mx-auto animate-spin text-primary mb-4" />
              <h1 className="text-2xl font-bold mb-2">Confirming your booking...</h1>
              <p className="text-muted-foreground">Please wait while we confirm your payment.</p>
            </>
          ) : error ? (
            <>
              <h1 className="text-2xl font-bold text-destructive mb-2">Error</h1>
              <p className="text-muted-foreground">{error}</p>
              <Button asChild className="mt-4">
                <Link to="/">Go to Homepage</Link>
              </Button>
            </>
          ) : (
            <>
              <CheckCircle className="h-12 w-12 mx-auto text-green-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
              <p className="text-muted-foreground">Your payment was successful and your booking is confirmed.</p>
              <div className="flex gap-4 justify-center mt-6">
                <Button asChild>
                  <Link to="/bookings">View My Bookings</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link to="/">Continue Browsing</Link>
                </Button>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default BookingSuccess;
