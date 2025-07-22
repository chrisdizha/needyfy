
import { cn } from '@/lib/utils';
import { Car, CreditCard, Package, User, Shield, Clock, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import BackButton from '@/components/layout/BackButton';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isLast?: boolean;
}

const Step = ({ number, title, description, icon, isLast = false }: StepProps) => (
  <div className="flex flex-col items-center text-center md:text-left md:flex-row mb-12">
    <div className="flex-shrink-0 flex items-center justify-center w-20 h-20 bg-primary rounded-full text-primary-foreground mb-6 md:mb-0 shadow-lg">
      {icon}
    </div>
    <div className={cn(
      "md:ml-8 md:flex-1",
      !isLast && "pb-12 md:pb-0 md:pr-12 relative after:hidden md:after:block after:absolute after:top-32 md:after:top-0 after:bottom-0 md:after:bottom-auto after:left-1/2 md:after:left-auto after:-translate-x-1/2 md:after:translate-x-0 md:after:right-0 after:w-px after:h-full md:after:h-full after:bg-border"
    )}>
      <div className="flex items-center mb-4 justify-center md:justify-start">
        <span className="flex items-center justify-center w-10 h-10 bg-primary/10 rounded-full text-primary font-bold mr-3 text-lg">
          {number}
        </span>
        <h3 className="font-bold text-2xl text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground text-lg leading-relaxed">{description}</p>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="h-full border-border hover:shadow-lg transition-shadow">
    <CardContent className="p-6 text-center">
      <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full text-primary mb-4 mx-auto">
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <BackButton to="/" label="Back to Home" />
        
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-foreground mb-4">How Needyfy Works</h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Renting equipment has never been easier. Our streamlined process connects you with the equipment you need, exactly when you need it.
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto mb-20">
          <Step 
            number={1} 
            title="Create an Account" 
            description="Sign up on Needyfy in minutes to access thousands of equipment options from verified providers in your area. Complete your profile to get personalized recommendations."
            icon={<User className="w-8 h-8" />}
          />
          
          <Step 
            number={2} 
            title="Find & Book Equipment" 
            description="Browse our extensive categories, compare prices and ratings, check real-time availability, and book the perfect equipment for your project with just a few clicks."
            icon={<Car className="w-8 h-8" />}
          />
          
          <Step 
            number={3} 
            title="Pay Securely" 
            description="Complete your reservation using our secure payment system with multiple payment options. Your transaction is protected with industry-leading security measures."
            icon={<CreditCard className="w-8 h-8" />}
          />
          
          <Step 
            number={4} 
            title="Pick Up & Return" 
            description="Coordinate pickup details with the provider, collect your equipment at the agreed time and location, use it for your project, then return it in good condition when done."
            icon={<Package className="w-8 h-8" />}
            isLast={true}
          />
        </div>

        {/* Why Choose Needyfy Section - Fixed contrast */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-foreground mb-4">Why Choose Needyfy?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We make equipment rental simple, secure, and reliable for everyone.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <FeatureCard
              icon={<Shield className="w-8 h-8" />}
              title="Secure & Safe"
              description="All transactions are protected and equipment providers are verified for your safety."
            />
            
            <FeatureCard
              icon={<Clock className="w-8 h-8" />}
              title="Available 24/7"
              description="Browse and book equipment anytime, anywhere with our always-available platform."
            />
            
            <FeatureCard
              icon={<MapPin className="w-8 h-8" />}
              title="Local Providers"
              description="Find equipment from providers in your area for convenient pickup and return."
            />
            
            <FeatureCard
              icon={<Star className="w-8 h-8" />}
              title="Quality Guaranteed"
              description="All equipment is maintained to high standards with ratings and reviews from real users."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
