
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DateSelectionProps {
  startDate?: Date;
  endDate?: Date;
  pricePerDay: number;
  onDateSelect: (date: Date | undefined) => void;
  onProceedToPayment: () => void;
  onCancel: () => void;
}

const DateSelection = ({
  startDate,
  endDate,
  pricePerDay,
  onDateSelect,
  onProceedToPayment,
  onCancel
}: DateSelectionProps) => {
  const totalPrice = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) * pricePerDay + pricePerDay
    : 0;

  const totalDays = startDate && endDate 
    ? Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
    : 0;

  return (
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
        onSelect={onDateSelect}
        disabled={(date) => date < new Date()}
        className="rounded-md border"
      />

      {totalPrice > 0 && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="font-medium">Total Price: ${totalPrice}</p>
          <p className="text-sm text-muted-foreground">
            ${pricePerDay} x {totalDays} days
          </p>
        </div>
      )}

      <div className="flex justify-end gap-4 mt-4">
        <Button variant="outline" onClick={onCancel}>Cancel</Button>
        <Button 
          onClick={onProceedToPayment}
          disabled={!startDate || !endDate}
        >
          Proceed to Payment
        </Button>
      </div>
    </div>
  );
};

export default DateSelection;
