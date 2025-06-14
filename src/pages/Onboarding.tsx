
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import OnboardingProfileInfo from '@/components/onboarding/ProfileInfo';
import OnboardingPreferences from '@/components/onboarding/Preferences';
import OnboardingVerification from '@/components/onboarding/Verification';
import OnboardingComplete from '@/components/onboarding/Complete';
import { toast } from 'sonner';
import { Check } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userData, setUserData] = useState<any>({});
  const [user, setUser] = useState<User | null>(null);

  const steps = [
    { title: "Profile Information", component: OnboardingProfileInfo },
    { title: "Preferences", component: OnboardingPreferences },
    { title: "Verification", component: OnboardingVerification },
    { title: "Complete", component: OnboardingComplete },
  ];

  useEffect(() => {
    const checkSessionAndFetchProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Please log in to continue");
        navigate('/login');
        return;
      }

      setUser(session.user);
      
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*, full_name')
        .eq('id', session.user.id)
        .single();
        
      if (profileError && profileError.code !== 'PGRST116') { // PGRST116: no rows returned
        toast.error('Failed to fetch profile: ' + profileError.message);
      }
      
      setUserData({
        ...(session.user.user_metadata || {}),
        ...(profile || {}),
        name: profile?.full_name || session.user.user_metadata.name, // Ensure 'name' is available for ProfileInfo form
        email: session.user.email,
      });
    };

    checkSessionAndFetchProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        toast.info("You have been logged out.");
        navigate('/login');
      } else {
        setUser(session.user);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const calculateProgress = (step: number): number => {
    return Math.min(100, Math.round((step / (steps.length - 1)) * 100));
  };

  const handleNext = async (stepData: any) => {
    const nextStep = currentStep + 1;
    const updatedUserData = { ...userData, ...stepData };
    setUserData(updatedUserData);
    
    if (user && currentStep === 0) { // Step 0 is Profile Information
      const { name, phone } = stepData;
      const { error } = await supabase
        .from('profiles')
        .update({ full_name: name, phone: phone, updated_at: new Date().toISOString() })
        .eq('id', user.id);

      if (error) {
        toast.error("Failed to update profile: " + error.message);
      }
    }
    
    setCurrentStep(nextStep);
    setProgress(calculateProgress(nextStep));
    
    if (nextStep >= steps.length) {
      toast.success("Onboarding complete!");
      navigate('/');
    }
  };

  const handleBack = () => {
    const prevStep = Math.max(0, currentStep - 1);
    setCurrentStep(prevStep);
    setProgress(calculateProgress(prevStep));
  };

  const handleSkip = () => {
    const skipToStep = steps.length - 1; // Skip to complete step
    setCurrentStep(skipToStep);
    setProgress(calculateProgress(skipToStep));
  };

  // Get current step component
  const CurrentStepComponent = steps[currentStep]?.component;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm py-4">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <span className="bg-needyfy-blue text-white font-bold p-2 rounded-md">N</span>
              <span className="font-bold text-xl text-needyfy-darkgray hidden sm:block">Needyfy</span>
            </div>
            <Button 
              variant="ghost" 
              onClick={handleSkip} 
              disabled={currentStep === steps.length - 1}
            >
              Skip
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-center mb-2">
              {steps[currentStep]?.title}
            </h1>
            <p className="text-muted-foreground text-center mb-4">
              Step {currentStep + 1} of {steps.length}
            </p>
            
            <div className="relative mb-1">
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="flex justify-between mt-2">
              {steps.map((step, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center"
                >
                  <div 
                    className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      index < currentStep 
                        ? 'bg-needyfy-blue text-white' 
                        : index === currentStep
                          ? 'bg-white border-2 border-needyfy-blue text-needyfy-blue'
                          : 'bg-gray-100 text-gray-400'
                    }`}
                  >
                    {index < currentStep ? (
                      <Check className="h-5 w-5" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <span className="text-xs mt-1 hidden sm:block">
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            {CurrentStepComponent && (
              <CurrentStepComponent 
                userData={userData} 
                onNext={handleNext}
                onBack={currentStep > 0 ? handleBack : undefined}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Onboarding;
