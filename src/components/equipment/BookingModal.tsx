
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { addDays, format } from 'date-fns';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentTitle: string;
  pricePerDay: number;
}

const BookingModal = ({ isOpen, onClose, equipmentTitle, pricePerDay }: BookingModalProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [totalPrice, setTotalPrice] = useState(0);

  const handleDateSelect = (date: Date | undefined) => {
    if (!startDate) {
      setStartDate(date);
      setEndDate(undefined);
    } else if (!endDate && date && date > startDate) {
      setEndDate(date);
      // Calculate total days and price
      const days = Math.ceil((date.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      setTotalPrice(days * pricePerDay);
    } else {
      setStartDate(date);
      setEndDate(undefined);
      setTotalPrice(0);
    }
  };

  const handleBook = () => {
    if (!startDate || !endDate) return;
    
    // Here we'll add the booking logic later
    console.log('Booking:', { startDate, endDate, totalPrice });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {equipmentTitle}</DialogTitle>
          <DialogDescription>
            Select your rental dates. The total price will be calculated automatically.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="mb-4">
            <h4 className="text-sm font-medium mb-2">Selected Dates:</h4>
            <p className="text-sm text-muted-foreground">
              {startDate && `From: ${format(startDate, 'PPP')}`}
              {endDate && ` - To: ${format(endDate, 'PPP')}`}
            </p>
          </div>

          <Calendar
            mode="single"
            selected={startDate}
            onSelect={handleDateSelect}
            disabled={(date) => date < new Date()}
            className="rounded-md border"
          />

          {totalPrice > 0 && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="font-medium">Total Price: ${totalPrice}</p>
              <p className="text-sm text-muted-foreground">
                ${pricePerDay} x {Math.ceil((endDate!.getTime() - startDate!.getTime()) / (1000 * 60 * 60 * 24)) + 1} days
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleBook}
            disabled={!startDate || !endDate}
          >
            Book Now
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
