import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"

const categoryItems = [
  { id: 'construction', label: 'Construction' },
  { id: 'vehicles', label: 'Vehicles' },
  { id: 'electronics', label: 'Electronics' },
  { id: 'event_equipment', label: 'Event Equipment' },
  { id: 'home_garden', label: 'Home & Garden' },
  { id: 'photography', label: 'Photography' },
  { id: 'sports', label: 'Sports & Recreation' },
  { id: 'music', label: 'Musical Instruments' },
] as const;

const preferencesSchema = z.object({
  interests: z.array(z.string()).min(1, {
    message: 'Please select at least one category of interest',
  }),
  notifications: z.object({
    email: z.boolean().default(true),
    sms: z.boolean().default(false),
    push: z.boolean().default(true),
  }),
  role: z.enum(['renter', 'provider', 'both']).default('both'),
});

type PreferencesData = z.infer<typeof preferencesSchema>;

interface PreferencesProps {
  userData: any;
  onNext: (data: PreferencesData) => void;
  onBack?: () => void;
}

const OnboardingPreferences = ({ userData, onNext, onBack }: PreferencesProps) => {
  const form = useForm<PreferencesData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      interests: userData.interests || [],
      notifications: {
        email: userData.notifications?.email !== false,
        sms: userData.notifications?.sms || false,
        push: userData.notifications?.push !== false,
      },
      role: userData.role || 'both',
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Your Preferences</h2>
        <p className="text-muted-foreground">
          Customize your experience by telling us what you're interested in
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <FormField
            control={form.control}
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
                      control={form.control}
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

          <FormField
            control={form.control}
            name="notifications"
            render={() => (
              <FormItem>
                <FormLabel className="text-base">Notification Preferences</FormLabel>
                <FormDescription>
                  Select how you would like to receive notifications
                </FormDescription>
                <div className="grid grid-cols-1 gap-4 mt-3">
                  <FormField
                    control={form.control}
                    name="notifications.email"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">Email notifications</FormLabel>
                          <FormDescription>
                            Receive updates about bookings and messages via email
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notifications.sms"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">SMS notifications</FormLabel>
                          <FormDescription>
                            Receive important updates via SMS
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="notifications.push"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel className="font-normal">Push notifications</FormLabel>
                          <FormDescription>
                            Receive real-time updates in the app
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
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

          <div className="pt-6 flex justify-between">
            <Button type="button" variant="outline" onClick={onBack}>
              Back
            </Button>
            <Button type="submit">
              Next Step
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OnboardingPreferences;
