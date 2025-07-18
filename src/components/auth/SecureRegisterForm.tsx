
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { registerSchema, RegisterFormData } from '@/lib/schemas/registerSchema';
import { SecureContactInput } from './SecureContactInput';
import { SecurePasswordInput } from './SecurePasswordInput';
import { supabase } from '@/integrations/supabase/client';
import { useFormRateLimit, validateInput } from '@/components/security/SecurityEnhancements';
import { useSecureAuth } from '@/hooks/useSecureAuth';

export const SecureRegisterForm = () => {
  const navigate = useNavigate();
  const { checkRateLimit } = useFormRateLimit(3, 300000); // 3 attempts per 5 minutes
  const { logSecurityEvent } = useSecureAuth();
  
  const form = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      agreeToTerms: false,
    },
  });

  const onSubmit = async (data: RegisterFormData) => {
    try {
      // Rate limiting check
      if (!checkRateLimit()) {
        return;
      }
      
      // Additional server-side validation
      if (!validateInput.email(data.email!)) {
        toast.error('Please enter a valid email address.');
        return;
      }
      
      if (data.phone && !validateInput.phone(data.phone)) {
        toast.error('Please enter a valid phone number.');
        return;
      }
      
      const passwordValidation = validateInput.password(data.password);
      if (!passwordValidation.valid) {
        toast.error('Password does not meet security requirements.');
        return;
      }
      
      // Sanitize inputs
      const sanitizedData = {
        ...data,
        name: validateInput.sanitizeHtml(data.name),
        email: data.email!.toLowerCase().trim(),
        phone: data.phone ? validateInput.sanitizeHtml(data.phone) : '',
      };
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: data.password,
        options: {
          data: {
            name: sanitizedData.name,
            phone: sanitizedData.phone,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Log security event for failed registration
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Registration failed: ${error.message}`
        });
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please try logging in instead.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else if (error.message.includes('Password')) {
          toast.error('Password must meet security requirements.');
        } else {
          toast.error(`Registration failed: ${error.message}`);
        }
      } else {
        toast.success("Registration successful! Please check your email to verify your account.");
        navigate('/');
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
      
      // Log security event for unexpected errors
      await logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: Date.now(),
        details: `Unexpected registration error: ${error}`
      });
      
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Full Name</FormLabel>
              <div className="relative">
                <User className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    placeholder="Enter your name"
                    className="pl-10"
                    {...field}
                    onChange={(e) => {
                      // Sanitize input to prevent XSS
                      const sanitizedValue = validateInput.sanitizeHtml(e.target.value);
                      field.onChange(sanitizedValue);
                    }}
                    autoComplete="name"
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <SecureContactInput type="email" />
        <SecureContactInput type="phone" />
        <SecurePasswordInput />
        
        <FormField
          control={form.control}
          name="agreeToTerms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  I agree to the <a href="/terms" className="text-needyfy-blue hover:underline">Terms of Service</a> and <a href="/privacy" className="text-needyfy-blue hover:underline">Privacy Policy</a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Create Account
        </Button>
      </form>
    </Form>
  );
};
