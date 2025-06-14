
import { Input } from "@/components/ui/input";

interface EquipmentTitleFieldProps {
  title: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EquipmentTitleField = ({ title, onChange }: EquipmentTitleFieldProps) => (
  <div>
    <label htmlFor="title" className="block text-sm font-medium mb-1">
      Title <span className="text-destructive">*</span>
    </label>
    <Input
      id="title"
      name="title"
      placeholder="e.g., Professional DSLR Camera"
      value={title}
      onChange={onChange}
      required
    />
  </div>
);

export default EquipmentTitleField;
