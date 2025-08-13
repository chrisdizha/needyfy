
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CreditCard, DollarSign } from 'lucide-react';
import PriceBreakdown from './PriceBreakdown';

interface PaymentFormProps {
  equipmentTitle: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  isProcessing: boolean;
  agreedToTerms: boolean;
  onAgreeToTermsChange: (agreed: boolean) => void;
  onPayment: (paymentMethod: 'stripe' | 'paypal') => void;
  onBack: () => void;
  pricePerDay?: number;
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
  onBack,
  pricePerDay
}: PaymentFormProps) => {
  // Convert string dates to Date objects for calculations
  const startDateObj = new Date(startDate);
  const endDateObj = new Date(endDate);
  
  // Calculate price breakdown
  const days = Math.ceil((endDateObj.getTime() - startDateObj.getTime()) / (1000 * 60 * 60 * 24)) + 1;
  const basePrice = Math.round(totalPrice / 1.1); // Remove 10% renter fee to get base
  const renterFee = totalPrice - basePrice;
  
  return (
    <div className="py-4">
      <div className="space-y-4">
        <div className="space-y-4">
          <div className="p-4 border rounded-md">
            <h3 className="font-medium mb-3">Booking Summary</h3>
            <div className="grid grid-cols-2 gap-2">
              <p className="text-sm text-muted-foreground">Equipment:</p>
              <p className="text-sm">{equipmentTitle}</p>
              <p className="text-sm text-muted-foreground">Start Date:</p>
              <p className="text-sm">{format(startDateObj, 'PPP')}</p>
              <p className="text-sm text-muted-foreground">End Date:</p>
              <p className="text-sm">{format(endDateObj, 'PPP')}</p>
            </div>
          </div>
          
          <PriceBreakdown
            basePrice={basePrice * 100} // Convert to cents
            renterFee={renterFee * 100} // Convert to cents  
            totalPrice={totalPrice * 100} // Convert to cents
            days={days}
            pricePerDay={pricePerDay || basePrice / days}
          />
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

      <div className="mt-6">
        <Tabs defaultValue="stripe" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="stripe" className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Card Payment
            </TabsTrigger>
            <TabsTrigger value="paypal" className="flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              PayPal
            </TabsTrigger>
          </TabsList>

          <TabsContent value="stripe" className="mt-4">
            <div className="p-4 border rounded-md bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <CreditCard className="h-5 w-5 text-primary" />
                <h4 className="font-medium">Secure Card Payment</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Pay securely with your credit or debit card through Stripe.
              </p>
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack} disabled={isProcessing}>
                  Back
                </Button>
                <Button 
                  onClick={() => onPayment('stripe')}
                  disabled={isProcessing || !agreedToTerms}
                  className="min-w-[140px]"
                >
                  {isProcessing ? 'Processing...' : 'Pay with Card'}
                </Button>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="paypal" className="mt-4">
            <div className="p-4 border rounded-md bg-muted/20">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <h4 className="font-medium">PayPal Payment</h4>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Pay securely using your PayPal account or PayPal guest checkout.
              </p>
              <div className="flex justify-between items-center">
                <Button variant="outline" onClick={onBack} disabled={isProcessing}>
                  Back
                </Button>
                <Button 
                  onClick={() => onPayment('paypal')}
                  disabled={isProcessing || !agreedToTerms}
                  className="min-w-[140px] bg-[#0070ba] hover:bg-[#005ea6] text-white"
                >
                  {isProcessing ? 'Processing...' : 'Pay with PayPal'}
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default PaymentForm;
