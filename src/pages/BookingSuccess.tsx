
import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

const BookingSuccess = () => {
  const [searchParams] = useSearchParams();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);

  useEffect(() => {
    const confirmBooking = async () => {
      const sessionId = searchParams.get('session_id');
      if (!sessionId) {
        setError(
          "We couldn't find your payment session. This can happen if you navigated here directly, refreshed the page, or if there was an issue completing payment. Please check your email for updates, try your booking again, or contact our support team if you need help."
        );
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
          
          // Invalidate relevant queries to update dashboard immediately
          queryClient.invalidateQueries({ queryKey: ['user-equipment-listings'] });
          queryClient.invalidateQueries({ queryKey: ['equipment-listings'] });
          // Add specific invalidation for dashboard stats and bookings
          queryClient.invalidateQueries({ queryKey: ['bookings'] });
          queryClient.invalidateQueries({ queryKey: ['provider-bookings'] });
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
  }, [searchParams, queryClient]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
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
              <Alert variant="destructive" className="mb-4 text-left">
                <AlertTriangle className="w-6 h-6 text-destructive" />
                <div>
                  <AlertTitle>There was a problem confirming your booking</AlertTitle>
                  <AlertDescription>
                    <p className="mb-3">{error}</p>
                    <ul className="list-disc ml-6 text-sm mb-2">
                      <li>Make sure you completed payment with Stripe.</li>
                      <li>If unsure, check your email for booking/payment confirmation from Needyfy.</li>
                      <li><span className="font-semibold">Still having trouble?</span> <a href="/contact" className="underline text-primary">Contact support</a></li>
                    </ul>
                  </AlertDescription>
                </div>
              </Alert>
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
                  <Link to="/dashboard">View My Dashboard</Link>
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
