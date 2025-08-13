
import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format } from 'date-fns';

interface DateSelectionProps {
  onDateSelect: (dates: { startDate: Date | null; endDate: Date | null }) => void;
  selectedDates: {
    startDate: Date | null;
    endDate: Date | null;
  };
  equipmentId: string;
}

const DateSelection = ({
  onDateSelect,
  selectedDates,
  equipmentId
}: DateSelectionProps) => {
  const [selectingStart, setSelectingStart] = useState(true);

  const handleDateClick = (date: Date | undefined) => {
    if (!date) return;

    if (selectingStart || !selectedDates.startDate) {
      onDateSelect({ startDate: date, endDate: null });
      setSelectingStart(false);
    } else {
      if (date < selectedDates.startDate) {
        onDateSelect({ startDate: date, endDate: selectedDates.startDate });
      } else {
        onDateSelect({ startDate: selectedDates.startDate, endDate: date });
      }
      setSelectingStart(true);
    }
  };

  const clearDates = () => {
    onDateSelect({ startDate: null, endDate: null });
    setSelectingStart(true);
  };

  return (
    <div className="space-y-4">
      <div>
        <h4 className="text-sm font-medium mb-2">Select your rental dates</h4>
        <p className="text-sm text-muted-foreground mb-4">
          {selectingStart ? 'Choose your start date' : 'Choose your end date'}
        </p>
        
        {selectedDates.startDate && (
          <div className="mb-4 p-3 bg-muted rounded-lg">
            <p className="text-sm">
              <strong>Start:</strong> {format(selectedDates.startDate, 'PPP')}
            </p>
            {selectedDates.endDate && (
              <p className="text-sm">
                <strong>End:</strong> {format(selectedDates.endDate, 'PPP')}
              </p>
            )}
          </div>
        )}
      </div>

      <Calendar
        mode="single"
        selected={selectingStart ? selectedDates.startDate || undefined : selectedDates.endDate || undefined}
        onSelect={handleDateClick}
        disabled={(date) => date < new Date()}
        className="rounded-md border"
      />

      <div className="flex gap-2">
        <Button 
          variant="outline" 
          onClick={clearDates}
          size="sm"
        >
          Clear Dates
        </Button>
        <Button 
          onClick={() => selectedDates.startDate && selectedDates.endDate && onDateSelect(selectedDates)}
          disabled={!selectedDates.startDate || !selectedDates.endDate}
          size="sm"
        >
          Confirm Dates
        </Button>
      </div>
    </div>
  );
};

export default DateSelection;
