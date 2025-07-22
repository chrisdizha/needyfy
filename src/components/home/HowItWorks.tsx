
import { cn } from '@/lib/utils';
import { Car, CreditCard, Package, User } from 'lucide-react';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  isLast?: boolean;
}

const Step = ({ number, title, description, icon, isLast = false }: StepProps) => (
  <div className="flex flex-col items-center text-center md:text-left md:flex-row">
    <div className="flex-shrink-0 flex items-center justify-center w-16 h-16 bg-primary rounded-full text-primary-foreground mb-4 md:mb-0">
      {icon}
    </div>
    <div className={cn(
      "md:ml-6 md:flex-1",
      !isLast && "pb-12 md:pb-0 md:pr-12 relative after:hidden md:after:block after:absolute after:top-24 md:after:top-0 after:bottom-0 md:after:bottom-auto after:left-1/2 md:after:left-auto after:-translate-x-1/2 md:after:translate-x-0 md:after:right-0 after:w-px after:h-full md:after:h-full after:bg-border"
    )}>
      <div className="flex items-center mb-2 justify-center md:justify-start">
        <span className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-semibold mr-2">
          {number}
        </span>
        <h3 className="font-semibold text-xl text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground">{description}</p>
    </div>
  </div>
);

const HowItWorks = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-foreground mb-3">How Needyfy Works</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Renting equipment has never been easier. Our simple 4-step process gets you what you need, when you need it.
          </p>
        </div>
        
        <div className="space-y-10 md:space-y-12">
          <Step 
            number={1} 
            title="Create an Account" 
            description="Sign up on Needyfy to access thousands of equipment options from providers near you."
            icon={<User className="w-6 h-6" />}
          />
          
          <Step 
            number={2} 
            title="Find & Book Equipment" 
            description="Browse categories, compare options, check availability, and book what you need."
            icon={<Car className="w-6 h-6" />}
          />
          
          <Step 
            number={3} 
            title="Pay Securely" 
            description="Use our secure payment system to complete your reservation with confidence."
            icon={<CreditCard className="w-6 h-6" />}
          />
          
          <Step 
            number={4} 
            title="Pick Up & Return" 
            description="Pick up your equipment at the arranged time, use it, and return it when you're done."
            icon={<Package className="w-6 h-6" />}
            isLast={true}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
