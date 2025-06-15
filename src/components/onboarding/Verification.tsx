
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
import { Check, Phone, Clock, Timer } from 'lucide-react';

const verificationSchema = z.object({
  verificationCode: z.string().length(6, { message: 'Verification code must be 6 digits' }),
  phoneVerified: z.boolean().optional(),
  urgency: z.enum(['normal', 'urgent']),
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
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');
  const phoneNumber = userData.phone || '+1234567890';

  const form = useForm<VerificationData>({
    resolver: zodResolver(verificationSchema),
    defaultValues: {
      verificationCode: '',
      phoneVerified: false,
      urgency: 'normal',
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
    onNext({ verificationCode: '', phoneVerified: false, urgency });
  };

  // UI segment for choosing urgency
  const UrgencySelector = () => (
    <div className="mb-6">
      <FormLabel className="block text-base mb-2">How urgently do you need your verification?</FormLabel>
      <div className="flex gap-4">
        <button
          type="button"
          className={`flex items-center border rounded-md px-4 py-2 gap-2
            ${urgency === 'normal'
              ? 'bg-blue-50 border-blue-400 text-needyfy-blue'
              : 'bg-white border-gray-300 text-gray-700'
            } hover:border-blue-400 transition`}
          onClick={() => { setUrgency('normal'); form.setValue('urgency', 'normal'); }}
        >
          <Clock className="w-5 h-5" />
          Normal
        </button>
        <button
          type="button"
          className={`flex items-center border rounded-md px-4 py-2 gap-2
            ${urgency === 'urgent'
              ? 'bg-red-50 border-red-400 text-red-600'
              : 'bg-white border-gray-300 text-gray-700'
            } hover:border-red-400 transition`}
          onClick={() => { setUrgency('urgent'); form.setValue('urgency', 'urgent'); }}
        >
          <Timer className="w-5 h-5" />
          Urgent
        </button>
      </div>
      {/* Info about turnaround time */}
      <div className="mt-2 text-sm">
        {urgency === 'normal' ? (
          <span className="text-blue-600 flex items-center gap-1">
            <Clock className="w-4 h-4 inline" /> Verification will be completed within <b>24 hours</b>.
          </span>
        ) : (
          <span className="text-red-600 flex items-center gap-1">
            <Timer className="w-4 h-4 inline" /> Urgent verification will be completed within <b>4 hours</b>.
          </span>
        )}
      </div>
    </div>
  );

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

      {/* Urgency selection before sending code */}
      {!codeSent && <UrgencySelector />}

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
            {/* Still show the urgency selector above the code field, in case user wants to change */}
            <UrgencySelector />
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

