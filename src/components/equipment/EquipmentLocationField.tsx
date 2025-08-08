
import LocationPicker from '@/components/location/LocationPicker';

interface EquipmentLocationFieldProps {
  location: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  countryCode?: string;
}

const EquipmentLocationField = ({ location, onChange, countryCode }: EquipmentLocationFieldProps) => {
  return (
    <div>
      <label htmlFor="location" className="block text-sm font-medium mb-1">
        Location <span className="text-destructive">*</span>
      </label>
      <LocationPicker
        value={location}
        onChange={(value) => {
          // Convert to the expected event format
          const syntheticEvent = {
            target: { name: 'location', value },
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
        }}
        placeholder="Enter equipment location (city, area)"
        countryCode={countryCode}
      />
      <p className="text-sm text-muted-foreground">
        Specify where the equipment can be picked up or where you can deliver it.
      </p>
    </div>
  );
};

export default EquipmentLocationField;
