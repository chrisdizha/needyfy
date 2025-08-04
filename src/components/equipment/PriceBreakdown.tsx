import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

interface PriceBreakdownProps {
  basePrice: number;
  renterFee: number;
  totalPrice: number;
  days: number;
  pricePerDay: number;
}

const PriceBreakdown = ({ 
  basePrice, 
  renterFee, 
  totalPrice, 
  days, 
  pricePerDay 
}: PriceBreakdownProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount / 100);
  };

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">
            {formatCurrency(pricePerDay * 100)} × {days} day{days > 1 ? 's' : ''}
          </span>
          <span className="text-sm">{formatCurrency(basePrice)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-sm text-muted-foreground">Service fee (10%)</span>
          <span className="text-sm">{formatCurrency(renterFee)}</span>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center font-semibold">
          <span>Total</span>
          <span>{formatCurrency(totalPrice)}</span>
        </div>
      </CardContent>
    </Card>
  );
};

export default PriceBreakdown;