
import { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import { validateInput } from '@/components/security/SecurityEnhancements';

interface SecurePasswordInputProps {
  name?: string;
  label?: string;
  placeholder?: string;
}

export const SecurePasswordInput = ({ 
  name = "password", 
  label = "Password",
  placeholder = "Create a secure password"
}: SecurePasswordInputProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const { control, watch } = useFormContext();
  
  const passwordValue = watch(name) || '';
  const validation = validateInput.password(passwordValue);
  
  const getStrengthColor = () => {
    if (!passwordValue) return 'text-gray-400';
    if (validation.valid) return 'text-green-600';
    if (passwordValue.length >= 6) return 'text-yellow-600';
    return 'text-red-600';
  };
  
  const getStrengthText = () => {
    if (!passwordValue) return 'Enter a password';
    if (validation.valid) return 'Strong password';
    if (passwordValue.length >= 6) return 'Moderate password';
    return 'Weak password';
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className="space-y-2">
          <FormLabel>{label}</FormLabel>
          <div className="relative">
            <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
            <FormControl>
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder={placeholder}
                className="pl-10 pr-10"
                {...field}
                autoComplete="new-password"
              />
            </FormControl>
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
          
          {/* Password strength indicator */}
          {passwordValue && (
            <div className="space-y-2">
              <div className={`flex items-center gap-2 text-sm ${getStrengthColor()}`}>
                {validation.valid ? (
                  <CheckCircle className="h-4 w-4" />
                ) : (
                  <XCircle className="h-4 w-4" />
                )}
                <span>{getStrengthText()}</span>
              </div>
              
              {validation.errors.length > 0 && (
                <div className="space-y-1">
                  {validation.errors.map((error, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-red-600">
                      <XCircle className="h-3 w-3" />
                      <span>{error}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
