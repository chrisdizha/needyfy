
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

export const RoleSelector = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="role"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-base">How will you use Needyfy?</FormLabel>
          <FormDescription>
            Select your primary role on the platform
          </FormDescription>
          <FormControl>
            <RadioGroup
              onValueChange={field.onChange}
              value={field.value}
              className="grid grid-cols-1 gap-4 mt-3"
            >
              <div>
                <RadioGroupItem value="renter" id="renter" className="sr-only" />
                <Label
                  htmlFor="renter"
                  className={`border rounded-md p-4 cursor-pointer block font-normal ${field.value === 'renter' ? 'border-needyfy-blue bg-blue-50' : 'border-gray-200'}`}
                >
                  <span className="font-medium block">I want to rent equipment</span>
                  <span className="text-sm text-muted-foreground block">
                    Browse and rent items from providers
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="provider" id="provider" className="sr-only" />
                <Label
                  htmlFor="provider"
                  className={`border rounded-md p-4 cursor-pointer block font-normal ${field.value === 'provider' ? 'border-needyfy-blue bg-blue-50' : 'border-gray-200'}`}
                >
                  <span className="font-medium block">I want to list equipment</span>
                  <span className="text-sm text-muted-foreground block">
                    List your items for others to rent
                  </span>
                </Label>
              </div>
              <div>
                <RadioGroupItem value="both" id="both" className="sr-only" />
                <Label
                  htmlFor="both"
                  className={`border rounded-md p-4 cursor-pointer block font-normal ${field.value === 'both' ? 'border-needyfy-blue bg-blue-50' : 'border-gray-200'}`}
                >
                  <span className="font-medium block">I want to do both</span>
                  <span className="text-sm text-muted-foreground block">
                    Rent items and list my own equipment
                  </span>
                </Label>
              </div>
            </RadioGroup>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
