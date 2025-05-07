
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { toast } from 'sonner';
import { Check, Phone } from 'lucide-react';

const verificationSchema = z.object({
  verificationCode: z.string().length(6, { message: 'Verification code must be 6 digits' }),
});

type VerificationData = z.infer<typeof verificationSchema>;

interface VerificationProps {
  userData: any;
  onNext: (data: VerificationData) => void;
  onBack?: () => void;
}

const OnboardingVerification = ({ userData, onNext, onBack }: VerificationProps) => {
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const phoneNumber = userData.phone || '+1234567890';

  const form = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: '',
    },
  });

  const handleSendCode = () => {
    toast.success('Verification code sent!');
    setCodeSent(true);
    setCountdown(30);

    // Simulate countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleSubmit = (data: VerificationData) => {
    if (data.verificationCode === '123456') {
      toast.success('Phone number verified successfully!');
      onNext({ ...data, phoneVerified: true });
    } else {
      // For demo purposes, any code will be accepted
      toast.success('Phone number verified successfully!');
      onNext({ ...data, phoneVerified: true });
    }
  };

  const handleSkip = () => {
    toast.info('Verification skipped. You can verify later.');
    onNext({ verificationCode: '', phoneVerified: false });
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Verify Your Phone Number</h2>
        <p className="text-muted-foreground">
          This helps secure your account and enables SMS notifications
        </p>
      </div>

      <div className="flex items-center justify-center mb-4">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
          <Phone className="h-8 w-8 text-needyfy-blue" />
        </div>
      </div>

      <div className="text-center mb-6">
        <p className="text-lg font-medium">
          {userData.phone || "Please verify your phone number"}
        </p>
        {!codeSent && (
          <p className="text-sm text-muted-foreground mt-2">
            We'll send a verification code to this number
          </p>
        )}
      </div>

      {!codeSent ? (
        <div className="space-y-6">
          <Button 
            onClick={handleSendCode} 
            className="w-full"
            disabled={!userData.phone}
          >
            Send Verification Code
          </Button>
          <div className="text-center">
            <Button 
              variant="link" 
              className="text-muted-foreground" 
              onClick={handleSkip}
            >
              Skip for now
            </Button>
          </div>
        </div>
      ) : (
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="verificationCode"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Verification Code</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter 6-digit code" 
                      maxLength={6} 
                      className="text-center text-lg tracking-widest"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="text-center">
              {countdown > 0 ? (
                <p className="text-sm text-muted-foreground">
                  Resend code in {countdown} seconds
                </p>
              ) : (
                <Button 
                  variant="link" 
                  type="button"
                  onClick={handleSendCode} 
                  className="p-0 h-auto text-needyfy-blue"
                >
                  Resend Code
                </Button>
              )}
            </div>

            <div className="pt-6 flex justify-between">
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
              <Button type="submit">
                Verify & Continue
              </Button>
            </div>
            
            <div className="text-center">
              <Button 
                variant="link" 
                type="button"
                className="text-muted-foreground" 
                onClick={handleSkip}
              >
                Skip for now
              </Button>
            </div>
          </form>
        </Form>
      )}
    </div>
  );
};

export default OnboardingVerification;
