
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Eye, EyeOff, Mail, Lock } from 'lucide-react';
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
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useFormRateLimit, validateInput } from '@/components/security/SecurityEnhancements';
import { useSecureAuth } from '@/hooks/useSecureAuth';
import { useI18n } from '@/hooks/useI18n';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(1, { message: 'Password is required' }),
});

type FormData = z.infer<typeof loginSchema>;

interface SecureLoginFormProps {
  onForgotPassword?: () => void;
}

export const SecureLoginForm = ({ onForgotPassword }: SecureLoginFormProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { checkRateLimit } = useFormRateLimit(5, 900000); // 5 attempts per 15 minutes
  const { logSecurityEvent } = useSecureAuth();
  const { t } = useI18n();
  
  const form = useForm<FormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      // Rate limiting check
      if (!checkRateLimit()) {
        return;
      }
      
      // Additional validation
      if (!validateInput.email(data.email)) {
        toast.error('Please enter a valid email address.');
        return;
      }
      
      // Sanitize email
      const sanitizedEmail = data.email.toLowerCase().trim();
      
      const { error } = await supabase.auth.signInWithPassword({
        email: sanitizedEmail,
        password: data.password,
      });

      if (error) {
        console.error('Login error:', error);
        
        // Log security event for failed login
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: `Login failed for email: ${sanitizedEmail} - ${error.message}`
        });
        
        // Handle specific error cases
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials and try again.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and click the verification link before signing in.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait before trying again.');
        } else {
          toast.error(`Login failed: ${error.message}`);
        }
      } else {
        // Log successful login
        await logSecurityEvent({
          type: 'login',
          timestamp: Date.now(),
          details: `Successful login for email: ${sanitizedEmail}`
        });
        
        toast.success("Login successful!");
        navigate('/');
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      
      // Log security event for unexpected errors
      await logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: Date.now(),
        details: `Unexpected login error: ${error}`
      });
      
      toast.error('An unexpected error occurred. Please try again.');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t('auth.email')}</FormLabel>
              <div className="relative">
                <Mail className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    type="email"
                    placeholder={t('auth.email')}
                    className="pl-10"
                    {...field}
                    onChange={(e) => {
                      // Sanitize input
                      const sanitizedValue = validateInput.sanitizeHtml(e.target.value);
                      field.onChange(sanitizedValue);
                    }}
                    autoComplete="email"
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>{t('auth.password')}</FormLabel>
              <div className="relative">
                <Lock className="absolute left-3 top-2.5 h-5 w-5 text-muted-foreground" />
                <FormControl>
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder={t('auth.password')}
                    className="pl-10 pr-10"
                    {...field}
                    autoComplete="current-password"
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
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <Button 
            variant="link" 
            type="button"
            className="p-0 h-auto text-sm text-primary" 
            onClick={onForgotPassword}
          >
            {t('auth.forgotPassword')}
          </Button>
        </div>

        <Button type="submit" className="w-full">
          {t('auth.signInBtn')}
        </Button>
      </form>
    </Form>
  );
};
