
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
import ContactInput from './ContactInput';
import PasswordInput from './PasswordInput';
import { supabase } from '@/integrations/supabase/client';

const RegisterForm = () => {
  const navigate = useNavigate();
  
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
      const { error } = await supabase.auth.signUp({
        email: data.email!,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          },
          emailRedirectTo: `${window.location.origin}/`,
        },
      });

      if (error) {
        console.error('Registration error:', error);
        
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          toast.error('An account with this email already exists. Please try logging in instead.');
        } else if (error.message.includes('Invalid email')) {
          toast.error('Please enter a valid email address.');
        } else if (error.message.includes('Password')) {
          toast.error('Password must be at least 6 characters long.');
        } else {
          toast.error(`Registration failed: ${error.message}`);
        }
      } else {
        toast.success("Registration successful! Please check your email to verify your account.");
        navigate('/');
      }
    } catch (error) {
      console.error('Unexpected registration error:', error);
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
                  />
                </FormControl>
                <FormMessage />
              </div>
            </FormItem>
          )}
        />

        <ContactInput />

        <PasswordInput />
        
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

export default RegisterForm;
