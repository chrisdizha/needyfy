
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface PaymentFormProps {
  equipmentTitle: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  isProcessing: boolean;
  onPayment: () => void;
  onBack: () => void;
}

const PaymentForm = ({
  equipmentTitle,
  startDate,
  endDate,
  totalPrice,
  isProcessing,
  onPayment,
  onBack
}: PaymentFormProps) => {
  return (
    <div className="py-4">
      <div className="space-y-4">
        <div className="p-4 border rounded-md">
          <h3 className="font-medium">Booking Summary</h3>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <p className="text-sm text-muted-foreground">Equipment:</p>
            <p className="text-sm">{equipmentTitle}</p>
            <p className="text-sm text-muted-foreground">Start Date:</p>
            <p className="text-sm">{format(startDate, 'PPP')}</p>
            <p className="text-sm text-muted-foreground">End Date:</p>
            <p className="text-sm">{format(endDate, 'PPP')}</p>
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
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button 
          onClick={onPayment}
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : 'Complete Booking'}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
