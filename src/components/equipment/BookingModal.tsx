import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { BookingDetails } from '@/types/booking';
import DateSelection from './DateSelection';
import PaymentForm from './PaymentForm';
import BookingConfirmation from './BookingConfirmation';

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
  const [bookedDates, setBookedDates] = useState<Date[]>([]);
  const [agreedToTerms, setAgreedToTerms] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const allBookings: BookingDetails[] = JSON.parse(localStorage.getItem('bookings') || '[]');
      const equipmentBookings = allBookings.filter(b => b.equipmentId === equipmentId);
      
      const disabledDates: Date[] = [];
      equipmentBookings.forEach(booking => {
          let currentDate = new Date(booking.startDate);
          const lastDate = new Date(booking.endDate);
          while (currentDate <= lastDate) {
              disabledDates.push(new Date(currentDate));
              currentDate.setDate(currentDate.getDate() + 1);
          }
      });
      setBookedDates(disabledDates);
    }
  }, [isOpen, equipmentId]);

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
    if (!startDate || !endDate) {
      toast.error('Please select both start and end dates');
      return;
    }
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
    setAgreedToTerms(false);
    onClose();
  };

  const resetBooking = () => {
    setStartDate(undefined);
    setEndDate(undefined);
    setTotalPrice(0);
    setStep('dates');
    setAgreedToTerms(false);
  };

  const getDialogDescription = () => {
    switch (step) {
      case 'dates':
        return 'Select your rental dates. The total price will be calculated automatically.';
      case 'payment':
        return 'Review your booking details and proceed with payment.';
      case 'confirmation':
        return 'Your booking has been confirmed!';
      default:
        return '';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Book {equipmentTitle}</DialogTitle>
          <DialogDescription>
            {getDialogDescription()}
          </DialogDescription>
        </DialogHeader>
        
        {step === 'dates' && (
          <DateSelection
            startDate={startDate}
            endDate={endDate}
            pricePerDay={pricePerDay}
            bookedDates={bookedDates}
            onDateSelect={handleDateSelect}
            onProceedToPayment={handleProceedToPayment}
            onCancel={handleClose}
          />
        )}

        {step === 'payment' && startDate && endDate && (
          <PaymentForm
            equipmentTitle={equipmentTitle}
            startDate={startDate}
            endDate={endDate}
            totalPrice={totalPrice}
            isProcessing={isProcessing}
            agreedToTerms={agreedToTerms}
            onAgreeToTermsChange={setAgreedToTerms}
            onPayment={handlePayment}
            onBack={() => setStep('dates')}
          />
        )}

        {step === 'confirmation' && startDate && endDate && (
          <BookingConfirmation
            equipmentTitle={equipmentTitle}
            startDate={startDate}
            endDate={endDate}
            totalPrice={totalPrice}
            onClose={handleClose}
            onBookAnother={resetBooking}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
