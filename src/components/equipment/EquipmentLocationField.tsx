
import { Input } from "@/components/ui/input";

interface EquipmentLocationFieldProps {
  location: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EquipmentLocationField = ({ location, onChange }: EquipmentLocationFieldProps) => (
  <div>
    <label htmlFor="location" className="block text-sm font-medium mb-1">
      Location <span className="text-destructive">*</span>
    </label>
    <Input
      id="location"
      name="location"
      placeholder="Enter city, state or zip code"
      value={location}
      onChange={onChange}
      required
    />
  </div>
);

export default EquipmentLocationField;
