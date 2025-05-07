
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PriceFieldProps {
  price: string;
  priceUnit: string;
  onPriceChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPriceUnitChange: (value: string) => void;
}

const PriceField = ({ 
  price, 
  priceUnit, 
  onPriceChange, 
  onPriceUnitChange 
}: PriceFieldProps) => {
  return (
    <div>
      <label htmlFor="price" className="block text-sm font-medium mb-1">
        Price
      </label>
      <div className="flex space-x-2">
        <Input
          id="price"
          name="price"
          type="number"
          min="0"
          step="0.01"
          placeholder="0.00"
          value={price}
          onChange={onPriceChange}
          className="w-2/3"
        />
        
        <div className="w-1/3">
          <Select
            value={priceUnit}
            onValueChange={onPriceUnitChange}
          >
            <SelectTrigger>
              <SelectValue placeholder="Per" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="hour">Per Hour</SelectItem>
              <SelectItem value="day">Per Day</SelectItem>
              <SelectItem value="week">Per Week</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default PriceField;
