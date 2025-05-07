
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompleteProps {
  userData: any;
  onNext: (data: any) => void;
  onBack?: () => void;
}

const OnboardingComplete = ({ userData, onNext, onBack }: CompleteProps) => {
  const navigate = useNavigate();
  
  const handleFinish = () => {
    // Mark onboarding as complete
    const updatedUser = {
      ...userData,
      onboardingCompleted: true
    };
    
    localStorage.setItem('needyfy-user', JSON.stringify(updatedUser));
    onNext(updatedUser);
    navigate('/');
  };

  const role = userData.role || 'both';
  
  return (
    <div className="space-y-6 text-center">
      <div className="flex justify-center mb-6">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center">
          <CheckCircle className="h-12 w-12 text-green-600" />
        </div>
      </div>
      
      <h2 className="text-2xl font-semibold">All Set!</h2>
      
      <p className="text-lg">
        Thank you for completing your profile, {userData.name || 'User'}
      </p>
      
      <div className="py-4">
        <h3 className="font-medium text-lg mb-3">Here's what you can do next:</h3>
        
        <div className="space-y-3">
          {(role === 'renter' || role === 'both') && (
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-medium">Find Equipment to Rent</h4>
              <p className="text-sm text-muted-foreground">
                Browse our categories and find the perfect equipment for your needs.
              </p>
            </div>
          )}
          
          {(role === 'provider' || role === 'both') && (
            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <h4 className="font-medium">List Your Equipment</h4>
              <p className="text-sm text-muted-foreground">
                Start earning by listing your equipment for others to rent.
              </p>
            </div>
          )}
          
          <div className="bg-blue-50 p-4 rounded-lg text-left">
            <h4 className="font-medium">Complete Your Profile</h4>
            <p className="text-sm text-muted-foreground">
              Add more details to your profile to increase trust with other users.
            </p>
          </div>
        </div>
      </div>
      
      <div className="pt-8 flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button onClick={handleFinish} className="px-8">
          Get Started
        </Button>
      </div>
    </div>
  );
};

export default OnboardingComplete;
