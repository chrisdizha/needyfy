
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { User, Mail, Phone } from 'lucide-react';
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
import { supabase } from '@/integrations/supabase/client';
import { useFormRateLimit, validateInput } from '@/components/security/SecurityEnhancements';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { SecurePasswordInput } from './SecurePasswordInput';
import CountrySelector from '@/components/location/CountrySelector';
import LocationPicker from '@/components/location/LocationPicker';

const enhancedRegisterSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  phone: z.string().optional(),
  password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
  country: z.string().min(1, { message: 'Please select your country' }),
  countryName: z.string(),
  location: z.string().optional(),
  agreeToTerms: z.boolean().refine(val => val === true, {
    message: 'You must agree to the terms and conditions'
  }),
});

type EnhancedRegisterFormData = z.infer<typeof enhancedRegisterSchema>;

export const EnhancedRegisterForm = () => {
  const navigate = useNavigate();
  const { checkRateLimit } = useFormRateLimit(3, 300000);
  const { logSecurityEvent } = useSecureAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<EnhancedRegisterFormData>({
    resolver: zodResolver(enhancedRegisterSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      country: '',
      countryName: '',
      location: '',
      agreeToTerms: false,
    },
  });

  const watchedCountry = form.watch('country');

  const onSubmit = async (data: EnhancedRegisterFormData) => {
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      if (!checkRateLimit()) {
        return;
      }
      
      if (!validateInput.email(data.email)) {
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
      
      const sanitizedData = {
        ...data,
        name: validateInput.sanitizeHtml(data.name),
        email: data.email.toLowerCase().trim(),
        phone: data.phone ? validateInput.sanitizeHtml(data.phone) : '',
        location: data.location ? validateInput.sanitizeHtml(data.location) : '',
      };
      
      const { error } = await supabase.auth.signUp({
        email: sanitizedData.email,
        password: data.password,
        options: {
          data: {
            name: sanitizedData.name,
            phone: sanitizedData.phone,
            country: data.country,
            country_name: data.countryName,
            location: sanitizedData.location,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Registration error:', error);
        
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Registration failed: ${error.message}`
        });
        
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
      
      await logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: Date.now(),
        details: `Unexpected registration error: ${error}`
      });
      
      toast.error('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
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
                    placeholder="Enter your full name"
                    className="pl-10"
                    {...field}
                    onChange={(e) => {
                      const sanitizedValue = validateInput.sanitizeHtml(e.target.value);
                      field.onChange(sanitizedValue);
                    }}
                    autoComplete="name"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Email Address</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...field}
                    onChange={(e) => {
                      const sanitizedValue = validateInput.sanitizeHtml(e.target.value);
                      field.onChange(sanitizedValue);
                    }}
                    autoComplete="email"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Phone Number (Optional)</FormLabel>
              <div className="relative">
                <Phone className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="tel"
                    placeholder="Enter your phone number"
                    className="pl-10"
                    {...field}
                    onChange={(e) => {
                      const sanitizedValue = validateInput.sanitizeHtml(e.target.value);
                      field.onChange(sanitizedValue);
                    }}
                    autoComplete="tel"
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="country"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Country</FormLabel>
              <FormControl>
                <CountrySelector
                  value={field.value}
                  onChange={(countryCode, countryName) => {
                    field.onChange(countryCode);
                    form.setValue('countryName', countryName);
                  }}
                  placeholder="Select your country"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Location (Optional)</FormLabel>
              <FormControl>
                <LocationPicker
                  value={field.value || ''}
                  onChange={field.onChange}
                  placeholder="Enter your city or area"
                  countryCode={watchedCountry}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

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
                  disabled={isSubmitting}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal">
                  I agree to the{' '}
                  <a href="/terms" className="text-primary hover:underline" target="_blank">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="/privacy" className="text-primary hover:underline" target="_blank">
                    Privacy Policy
                  </a>
                </FormLabel>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Creating Account...' : 'Create Account'}
        </Button>
      </form>
    </Form>
  );
};
