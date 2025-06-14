
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { preferencesSchema, PreferencesData } from '@/lib/schemas/preferencesSchema';
import { InterestsSelector } from './preferences/InterestsSelector';
import { NotificationPreferences } from './preferences/NotificationPreferences';
import { RoleSelector } from './preferences/RoleSelector';

interface PreferencesProps {
  userData: any;
  onNext: (data: PreferencesData) => void;
  onBack?: () => void;
}

const OnboardingPreferences = ({ userData, onNext, onBack }: PreferencesProps) => {
  const form = useForm<PreferencesData>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      interests: userData.interests || [],
      notifications: {
        email: userData.notifications?.email !== false,
        sms: userData.notifications?.sms || false,
        push: userData.notifications?.push !== false,
      },
      role: userData.role || 'both',
    },
  });

  return (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-semibold">Your Preferences</h2>
        <p className="text-muted-foreground">
          Customize your experience by telling us what you're interested in
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
          <InterestsSelector />
          <NotificationPreferences />
          <RoleSelector />

          <div className="pt-6 flex justify-between">
            {onBack && (
              <Button type="button" variant="outline" onClick={onBack}>
                Back
              </Button>
            )}
            <Button type="submit" className={!onBack ? 'ml-auto' : ''}>
              Next Step
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default OnboardingPreferences;
