
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormDescription } from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';

export const NotificationPreferences = () => {
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="notifications"
      render={() => (
        <FormItem>
          <FormLabel className="text-base">Notification Preferences</FormLabel>
          <FormDescription>
            Select how you would like to receive notifications
          </FormDescription>
          <div className="grid grid-cols-1 gap-4 mt-3">
            <FormField
              control={control}
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
              control={control}
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
              control={control}
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
  );
};
