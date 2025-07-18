import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';


interface PaymentFormProps {
  equipmentTitle: string;
  startDate: Date;
  endDate: Date;
  totalPrice: number;
  isProcessing: boolean;
  agreedToTerms: boolean;
  onAgreeToTermsChange: (agreed: boolean) => void;
  onPayment: () => void;
  onBack: () => void;
}

const PaymentForm = ({
  equipmentTitle,
  startDate,
  endDate,
  totalPrice,
  isProcessing,
  agreedToTerms,
  onAgreeToTermsChange,
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
            <p className="text-sm text-muted-foreground">Rental Amount:</p>
            <p className="text-sm">${Math.round(totalPrice / 1.1).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground">Service Fee (10%):</p>
            <p className="text-sm">${(totalPrice - Math.round(totalPrice / 1.1)).toFixed(2)}</p>
            <p className="text-sm text-muted-foreground font-medium">Total Price:</p>
            <p className="text-sm font-bold">${totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 mt-6">
        <Checkbox 
          id="terms" 
          checked={agreedToTerms} 
          onCheckedChange={(checked) => onAgreeToTermsChange(checked === true)}
          disabled={isProcessing}
        />
        <Label htmlFor="terms" className="text-sm font-normal text-muted-foreground">
          I agree to the rental terms and cancellation policy.
        </Label>
      </div>

      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={onBack} disabled={isProcessing}>
          Back
        </Button>
        <Button 
          onClick={onPayment}
          disabled={isProcessing || !agreedToTerms}
        >
          {isProcessing ? 'Processing...' : 'Proceed to Payment'}
        </Button>
      </div>
    </div>
  );
};

export default PaymentForm;
