
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Phone } from 'lucide-react';

const ContactInput = () => {
  const [isUsingPhone, setIsUsingPhone] = useState(false);
  const { control, setValue } = useFormContext();

  const toggleInputMethod = () => {
    if (isUsingPhone) {
      setValue('phone', '');
    } else {
      setValue('email', '');
    }
    setIsUsingPhone(!isUsingPhone);
  };

  return (
    <>
      {!isUsingPhone ? (
        <FormField
          control={control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Email</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      ) : (
        <FormField
          control={control}
          name="phone"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Phone Number</FormLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />
      )}

      <div className="text-center">
        <Button
          type="button"
          variant="link"
          className="text-needyfy-blue text-sm p-0"
          onClick={toggleInputMethod}
        >
          {isUsingPhone ? "Use email instead" : "Use phone number instead"}
        </Button>
      </div>
    </>
  );
};

export default ContactInput;
