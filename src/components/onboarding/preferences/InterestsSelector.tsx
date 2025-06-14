
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { categoryItems } from '@/lib/schemas/preferencesSchema';

export const InterestsSelector = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="interests"
      render={() => (
        <FormItem>
          <FormLabel className="text-base">Categories of Interest</FormLabel>
          <FormDescription>
            Select categories you're interested in renting or providing
          </FormDescription>
          <div className="grid grid-cols-2 gap-4 mt-3">
            {categoryItems.map((item) => (
              <FormField
                key={item.id}
                control={control}
                name="interests"
                render={({ field }) => {
                  return (
                    <FormItem
                      key={item.id}
                      className="flex flex-row items-start space-x-3 space-y-0"
                    >
                      <FormControl>
                        <Checkbox
                          checked={field.value?.includes(item.id)}
                          onCheckedChange={(checked) => {
                            return checked
                              ? field.onChange([...field.value, item.id])
                              : field.onChange(
                                  field.value?.filter(
                                    (value) => value !== item.id
                                  )
                                )
                          }}
                        />
                      </FormControl>
                      <FormLabel className="font-normal">
                        {item.label}
                      </FormLabel>
                    </FormItem>
                  )
                }}
              />
            ))}
          </div>
        </FormItem>
      )}
    />
  );
};
