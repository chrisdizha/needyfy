
import { useState } from 'react';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import DateSelection from './DateSelection';
import PriceBreakdown from './PriceBreakdown';
import PaymentForm from './PaymentForm';
import PolicyCards from '@/components/booking/PolicyCards';
import { toast } from 'sonner';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  equipment: {
    id: string;
    title: string;
    price: number;
    owner_id: string;
  };
}

const BookingModal = ({ isOpen, onClose, equipment }: BookingModalProps) => {
  const { user } = useAuth();
  const [currentStep, setCurrentStep] = useState<'dates' | 'policies' | 'payment'>('dates');
  const [selectedDates, setSelectedDates] = useState<{
    startDate: Date | null;
    endDate: Date | null;
  }>({
    startDate: null,
    endDate: null,
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [policiesAccepted, setPoliciesAccepted] = useState(false);

  // Check if user is trying to book their own equipment
  if (user?.id === equipment.owner_id) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cannot Book Your Own Equipment</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            You cannot book your own equipment. This listing belongs to you.
          </p>
          <Button onClick={onClose} className="mt-4">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    );
  }

  const handleDateConfirm = (dates: { startDate: Date | null; endDate: Date | null }) => {
    if (!dates.startDate || !dates.endDate) {
      toast.error('Please select both start and end dates');
      return;
    }

    setSelectedDates(dates);
    
    // Calculate total price (basic calculation)
    const days = Math.ceil((dates.endDate.getTime() - dates.startDate.getTime()) / (1000 * 60 * 60 * 24));
    const basePrice = equipment.price * days;
    const serviceFee = Math.round(basePrice * 0.1); // 10% service fee
    setTotalPrice(basePrice + serviceFee);
    
    setCurrentStep('policies');
  };

  const handlePoliciesAccepted = () => {
    if (!policiesAccepted) {
      toast.error('Please accept the rental policies to continue');
      return;
    }
    setCurrentStep('payment');
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 'dates':
        return (
          <DateSelection
            onDateSelect={handleDateConfirm}
            selectedDates={selectedDates}
            equipmentId={equipment.id}
          />
        );
      
      case 'policies':
        return (
          <div className="space-y-6">
            <PolicyCards
              onPolicyAccepted={setPoliciesAccepted}
              cancellationPolicy="moderate"
              depositAmount={Math.round(equipment.price * 0.3)} // 30% of daily rate as deposit
              lateFeePolicy="Late returns incur a fee of 25% of the daily rate for each day or partial day late."
              damagePolicy="Renter is responsible for any damage beyond normal wear and tear. Repairs will be deducted from the security deposit."
            />
            <PriceBreakdown
              basePrice={equipment.price}
              startDate={selectedDates.startDate}
              endDate={selectedDates.endDate}
              totalPrice={totalPrice}
            />
            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setCurrentStep('dates')}
                className="flex-1"
              >
                Back to Dates
              </Button>
              <Button 
                onClick={handlePoliciesAccepted}
                disabled={!policiesAccepted}
                className="flex-1"
              >
                Continue to Payment
              </Button>
            </div>
          </div>
        );
      
      case 'payment':
        return (
          <div className="space-y-6">
            <PriceBreakdown
              basePrice={equipment.price}
              startDate={selectedDates.startDate}
              endDate={selectedDates.endDate}
              totalPrice={totalPrice}
            />
            <PaymentForm
              equipmentId={equipment.id}
              equipmentTitle={equipment.title}
              startDate={selectedDates.startDate!.toISOString()}
              endDate={selectedDates.endDate!.toISOString()}
              totalPrice={totalPrice}
              onSuccess={() => {
                toast.success('Booking request submitted successfully!');
                onClose();
              }}
              onError={(error) => {
                toast.error(error);
              }}
            />
            <Button 
              variant="outline" 
              onClick={() => setCurrentStep('policies')}
              className="w-full"
            >
              Back to Policies
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  const getStepTitle = () => {
    switch (currentStep) {
      case 'dates':
        return `Book ${equipment.title}`;
      case 'policies':
        return 'Review Policies & Pricing';
      case 'payment':
        return 'Complete Payment';
      default:
        return 'Book Equipment';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getStepTitle()}</DialogTitle>
        </DialogHeader>
        {renderStepContent()}
      </DialogContent>
    </Dialog>
  );
};

export default BookingModal;
