
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface BookingConfirmationProps {
  equipmentTitle: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  onClose: () => void;
  onBookAnother: () => void;
}

const BookingConfirmation = ({
  equipmentTitle,
  startDate,
  endDate,
  totalPrice,
  onClose,
  onBookAnother
}: BookingConfirmationProps) => {
  return (
    <div className="py-4">
      <div className="p-6 bg-green-50 border border-green-200 rounded-lg text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Booking Confirmed!</h3>
        <p className="text-gray-600 mb-4">
          Your booking for {equipmentTitle} has been confirmed.
        </p>
        <p className="text-sm text-gray-500">
          From {format(startDate, 'PPP')} to {format(endDate, 'PPP')}
        </p>
        <p className="text-sm font-bold mt-2">
          Total: ${totalPrice}
        </p>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button onClick={onClose}>Close</Button>
        <Button variant="outline" onClick={onBookAnother}>
          Book Another
        </Button>
      </div>
    </div>
  );
};

export default BookingConfirmation;
