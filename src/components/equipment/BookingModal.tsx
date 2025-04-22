
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { addDays, format } from 'date-fns';
import { toast } from '@/components/ui/sonner';
import { v4 as uuidv4 } from 'uuid';
import { BookingDetails } from '@/types/booking';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipmentTitle: string;
  equipmentId: string;
  pricePerDay: number;
}

const BookingModal = ({ 
  isOpen, 
  onClose, 
  equipmentTitle, 
  equipmentId,
  pricePerDay 
}: BookingModalProps) => {
  const [startDate, setStartDate] = useState<Date>();
  const [endDate, setEndDate] = useState<Date>();
  const [totalPrice, setTotalPrice] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [step, setStep] = useState<'dates' | 'payment' | 'confirmation'>('dates');

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

  const handleProceedToPayment = () => {
    if (!startDate || !endDate) return;
    setStep('payment');
  };

  const handlePayment = () => {
    if (!startDate || !endDate) return;
    
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      const bookingDetails: BookingDetails = {
        id: uuidv4(),
        equipmentId,
        startDate,
        endDate,
        totalPrice,
        status: 'confirmed',
      };
      
      // Store booking in localStorage (in a real app, this would go to a database)
      const existingBookings = JSON.parse(localStorage.getItem('bookings') || '[]');
      localStorage.setItem('bookings', JSON.stringify([...existingBookings, bookingDetails]));
      
      setIsProcessing(false);
      setStep('confirmation');
      toast.success('Booking confirmed successfully!');
    }, 1500);
  };

  const handleClose = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setTotalPrice(0);
    setStep('dates');
    onClose();
  };

  const resetBooking = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setTotalPrice(0);
    setStep('dates');
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {equipmentTitle}</DialogTitle>
          <DialogDescription>
            {step === 'dates' && 'Select your rental dates. The total price will be calculated automatically.'}
            {step === 'payment' && 'Review your booking details and proceed with payment.'}
            {step === 'confirmation' && 'Your booking has been confirmed!'}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'dates' && (
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

            <div className="flex justify-end gap-4 mt-4">
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button 
                onClick={handleProceedToPayment}
                disabled={!startDate || !endDate}
              >
                Proceed to Payment
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && (
          <div className="py-4">
            <div className="space-y-4">
              <div className="p-4 border rounded-md">
                <h3 className="font-medium">Booking Summary</h3>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <p className="text-sm text-muted-foreground">Equipment:</p>
                  <p className="text-sm">{equipmentTitle}</p>
                  <p className="text-sm text-muted-foreground">Start Date:</p>
                  <p className="text-sm">{format(startDate!, 'PPP')}</p>
                  <p className="text-sm text-muted-foreground">End Date:</p>
                  <p className="text-sm">{format(endDate!, 'PPP')}</p>
                  <p className="text-sm text-muted-foreground">Total Price:</p>
                  <p className="text-sm font-bold">${totalPrice}</p>
                </div>
              </div>

              {/* Simplified payment form - in a real app this would integrate with Stripe */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium mb-1">Card Number</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded" 
                      placeholder="4242 4242 4242 4242"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Expiry Date</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded" 
                      placeholder="MM/YY"
                      disabled={isProcessing}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">CVC</label>
                    <input 
                      type="text" 
                      className="w-full p-2 border rounded" 
                      placeholder="123"
                      disabled={isProcessing}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button variant="outline" onClick={() => setStep('dates')} disabled={isProcessing}>
                Back
              </Button>
              <Button 
                onClick={handlePayment}
                disabled={isProcessing}
              >
                {isProcessing ? 'Processing...' : 'Complete Booking'}
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && (
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
                From {startDate && format(startDate, 'PPP')} to {endDate && format(endDate, 'PPP')}
              </p>
              <p className="text-sm font-bold mt-2">
                Total: ${totalPrice}
              </p>
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <Button onClick={handleClose}>Close</Button>
              <Button variant="outline" onClick={resetBooking}>
                Book Another
              </Button>
            </div>
          </div>
        )}
        
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
