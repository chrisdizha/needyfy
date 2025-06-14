
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock } from 'lucide-react';

const PasswordInput = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { control } = useFormContext();

  return (
    <FormField
      control={control}
      name="password"
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>Password</FormLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <FormControl>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a password"
                className="pl-10 pr-10"
                {...field}
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  );
};

export default PasswordInput;
