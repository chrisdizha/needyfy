
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Mail, Phone, CheckCircle, XCircle } from 'lucide-react';
import { validateInput } from '@/components/security/SecurityEnhancements';

interface SecureContactInputProps {
  type?: 'email' | 'phone';
}

export const SecureContactInput = ({ type = 'email' }: SecureContactInputProps) => {
  const { control, watch } = useFormContext();
  
  const isEmail = type === 'email';
  const fieldName = isEmail ? 'email' : 'phone';
  const value = watch(fieldName) || '';
  
  const isValid = isEmail ? validateInput.email(value) : validateInput.phone(value);
  
  const getValidationIcon = () => {
    if (!value) return null;
    return isValid ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  return (
    <FormField
      control={control}
      name={fieldName}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>{isEmail ? 'Email' : 'Phone Number'}</FormLabel>
          <div className="relative">
            {isEmail ? (
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            ) : (
              <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            )}
            <FormControl>
              <Input
                type={isEmail ? 'email' : 'tel'}
                placeholder={isEmail ? 'Enter your email' : 'Enter your phone number'}
                className="pl-10 pr-10"
                {...field}
                onChange={(e) => {
                  // Sanitize input to prevent XSS
                  const sanitizedValue = validateInput.sanitizeHtml(e.target.value);
                  field.onChange(sanitizedValue);
                }}
                autoComplete={isEmail ? 'email' : 'tel'}
              />
            </FormControl>
            <div className="absolute right-3 top-2.5">
              {getValidationIcon()}
            </div>
          </div>
          
          {value && !isValid && (
            <p className="text-sm text-red-600">
              {isEmail 
                ? 'Please enter a valid email address' 
                : 'Please enter a valid phone number (e.g., +1234567890)'
              }
            </p>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
