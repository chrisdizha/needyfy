
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { XCircle } from 'lucide-react';

const BookingCancelled = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center p-8 border rounded-lg shadow-lg">
        <XCircle className="h-12 w-12 mx-auto text-destructive mb-4" />
        <h1 className="text-2xl font-bold mb-2">Booking Cancelled</h1>
        <p className="text-muted-foreground">
          Your booking process was cancelled. You have not been charged.
        </p>
        <div className="flex gap-4 justify-center mt-6">
          <Button asChild>
            <Link to="/">Continue Browsing</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default BookingCancelled;
