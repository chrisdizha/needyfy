
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

  const onSubmit = (data: RegisterFormData) => {
    console.log('Form submitted:', data);
    toast.success("Registration successful! Let's set up your profile.");
    // Store user data in localStorage to simulate authentication
    localStorage.setItem('needyfy-user', JSON.stringify({
      ...data,
      onboardingStep: 0, // Starting the onboarding process
      isAuthenticated: true,
    }));
    navigate('/onboarding');
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
