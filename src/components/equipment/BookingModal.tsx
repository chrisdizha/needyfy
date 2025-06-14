import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { eachDayOfInterval } from 'date-fns';
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
      const fetchBookedDates = async () => {
        const { data, error } = await supabase
          .from('bookings')
          .select('start_date, end_date')
          .eq('equipment_id', equipmentId)
          .in('status', ['confirmed', 'pending']); // consider pending as booked too

        if (error) {
          toast.error('Could not fetch booked dates.');
          return;
        }
        
        const disabledDates = data.flatMap(booking => 
          eachDayOfInterval({
            start: new Date(booking.start_date),
            end: new Date(booking.end_date)
          })
        );
        setBookedDates(disabledDates);
      };
      fetchBookedDates();
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

  const handlePayment = async () => {
    if (!startDate || !endDate) return;
    
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout-session', {
        body: {
          equipmentId,
          equipmentTitle,
          startDate: startDate.toISOString(),
          endDate: endDate.toISOString(),
          totalPrice: totalPrice,
        },
      });

      if (error) throw error;

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error('Could not initiate payment. Please try again.');
        setIsProcessing(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'An error occurred during payment.');
      setIsProcessing(false);
    }
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
