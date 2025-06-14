
import { Textarea } from "@/components/ui/textarea";

interface EquipmentDescriptionFieldProps {
  description: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
}

const EquipmentDescriptionField = ({ description, onChange }: EquipmentDescriptionFieldProps) => (
  <div>
    <label htmlFor="description" className="block text-sm font-medium mb-1">
      Description <span className="text-destructive">*</span>
    </label>
    <Textarea
      id="description"
      name="description"
      placeholder="Describe your equipment, condition, special features, etc."
      rows={4}
      value={description}
      onChange={onChange}
      required
    />
  </div>
);

export default EquipmentDescriptionField;
