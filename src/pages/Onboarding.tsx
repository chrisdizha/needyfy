
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

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(0);
  const [userData, setUserData] = useState<any>({});

  const steps = [
    { title: "Profile Information", component: OnboardingProfileInfo },
    { title: "Preferences", component: OnboardingPreferences },
    { title: "Verification", component: OnboardingVerification },
    { title: "Complete", component: OnboardingComplete },
  ];

  useEffect(() => {
    // Check if user is authenticated
    const storedUser = localStorage.getItem('needyfy-user');
    if (!storedUser) {
      toast.error("Please log in to continue");
      navigate('/login');
      return;
    }

    const user = JSON.parse(storedUser);
    if (!user.isAuthenticated) {
      toast.error("Please log in to continue");
      navigate('/login');
      return;
    }

    // Set current onboarding step if it exists
    if (user.onboardingStep !== undefined) {
      setCurrentStep(user.onboardingStep);
      setProgress(calculateProgress(user.onboardingStep));
    }

    setUserData(user);
  }, [navigate]);

  const calculateProgress = (step: number): number => {
    return Math.min(100, Math.round((step / (steps.length - 1)) * 100));
  };

  const handleNext = (stepData: any) => {
    const nextStep = currentStep + 1;
    const updatedUserData = { ...userData, ...stepData };
    
    // Update user data in local storage
    localStorage.setItem('needyfy-user', JSON.stringify({
      ...updatedUserData,
      onboardingStep: nextStep,
      onboardingCompleted: nextStep >= steps.length - 1
    }));
    
    setUserData(updatedUserData);
    setCurrentStep(nextStep);
    setProgress(calculateProgress(nextStep));
    
    if (nextStep >= steps.length) {
      // Onboarding completed
      navigate('/');
    }
  };

  const handleBack = () => {
    const prevStep = Math.max(0, currentStep - 1);
    setCurrentStep(prevStep);
    setProgress(calculateProgress(prevStep));
    
    // Update user data in local storage
    localStorage.setItem('needyfy-user', JSON.stringify({
      ...userData,
      onboardingStep: prevStep
    }));
  };

  const handleSkip = () => {
    const skipToStep = steps.length - 1; // Skip to complete step
    setCurrentStep(skipToStep);
    setProgress(calculateProgress(skipToStep));
    
    // Update user data in local storage
    localStorage.setItem('needyfy-user', JSON.stringify({
      ...userData,
      onboardingStep: skipToStep,
      onboardingCompleted: true
    }));
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
