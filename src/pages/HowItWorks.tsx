
import { cn } from '@/lib/utils';
import { Car, CreditCard, Package, User, Shield, Clock, MapPin, Star } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import BackButton from '@/components/layout/BackButton';
import { useSEO } from '@/hooks/useSEO';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  isLast?: boolean;
}

const Step = ({ number, title, description, icon, image, isLast = false }: StepProps) => (
  <div className="flex flex-col items-center text-center md:text-left md:flex-row group mb-16">
    <div className="flex-shrink-0 relative">
      {image && (
        <div className="w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden mb-6 md:mb-0 shadow-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="absolute -bottom-2 -right-2 md:bottom-2 md:right-2 flex items-center justify-center w-16 h-16 bg-primary rounded-full text-primary-foreground shadow-lg border-4 border-background">
        {icon}
      </div>
    </div>
    
    <div className={cn(
      "md:ml-12 md:flex-1",
      !isLast && "pb-16 md:pb-0 md:pr-12 relative after:hidden md:after:block after:absolute after:top-40 md:after:top-20 after:bottom-0 md:after:bottom-auto after:left-1/2 md:after:left-auto after:-translate-x-1/2 md:after:translate-x-0 md:after:right-0 after:w-px after:h-full md:after:h-px md:after:w-full after:bg-gradient-to-r md:after:bg-gradient-to-r after:from-border after:via-primary/20 after:to-border after:opacity-40"
    )}>
      <div className="flex items-center mb-4 justify-center md:justify-start">
        <span className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full text-primary font-bold mr-4 text-lg border-2 border-primary/20">
          {number}
        </span>
        <h3 className="font-bold text-2xl md:text-3xl text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-2xl mx-auto md:mx-0">{description}</p>
    </div>
  </div>
);

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <Card className="h-full border-border hover:shadow-xl transition-all duration-300 hover:scale-105 bg-gradient-to-br from-card to-card/80">
    <CardContent className="p-8 text-center">
      <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary/10 to-primary/20 rounded-full text-primary mb-6 mx-auto shadow-lg border border-primary/10">
        {icon}
      </div>
      <h3 className="font-semibold text-xl mb-3 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{description}</p>
    </CardContent>
  </Card>
);

const HowItWorks = () => {
  // Enhanced SEO for How It Works page
  useSEO({
    title: 'How Needyfy Works - Simple Equipment Rental Process',
    description: 'Learn how easy it is to rent equipment on Needyfy. From creating an account to returning equipment, our 4-step process makes equipment rental simple and secure.',
    keywords: [
      'how it works',
      'equipment rental process',
      'rent equipment steps',
      'needyfy tutorial',
      'equipment booking guide'
    ],
    canonical: `${window.location.origin}/how-it-works`,
    structuredData: {
      "@context": "https://schema.org",
      "@type": "HowTo",
      "name": "How to Rent Equipment on Needyfy",
      "description": "Step-by-step guide to renting equipment on Needyfy",
      "step": [
        {
          "@type": "HowToStep",
          "name": "Create an Account",
          "text": "Sign up on Needyfy to access thousands of equipment options from verified providers"
        },
        {
          "@type": "HowToStep",
          "name": "Find & Book Equipment",
          "text": "Browse categories, compare prices and ratings, check availability, and book equipment"
        },
        {
          "@type": "HowToStep",
          "name": "Pay Securely",
          "text": "Complete your reservation using our secure payment system"
        },
        {
          "@type": "HowToStep",
          "name": "Pick Up & Return",
          "text": "Coordinate pickup details, use equipment, and return when done"
        }
      ]
    }
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <div className="container mx-auto px-4 py-12">
        <BackButton to="/" label="Back to Home" />
        
        <div className="text-center mb-20">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6 bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
            How Needyfy Works
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground max-w-4xl mx-auto leading-relaxed">
            Renting equipment has never been easier. Our streamlined process connects you with the equipment you need, exactly when you need it.
          </p>
        </div>
        
        <div className="max-w-6xl mx-auto mb-24">
          <Step 
            number={1} 
            title="Create an Account" 
            description="Sign up on Needyfy in minutes to access thousands of equipment options from verified providers in your area. Complete your profile to get personalized recommendations and unlock exclusive deals."
            icon={<User className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1586281380349-632531db7ed4?auto=format&fit=crop&w=400&q=80"
          />
          
          <Step 
            number={2} 
            title="Find & Book Equipment" 
            description="Browse our extensive categories, compare prices and ratings, check real-time availability, and book the perfect equipment for your project with just a few clicks. Use our smart filters to find exactly what you need."
            icon={<Car className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&q=80"
          />
          
          <Step 
            number={3} 
            title="Pay Securely" 
            description="Complete your reservation using our secure payment system with multiple payment options including credit cards, PayPal, and digital wallets. Your transaction is protected with industry-leading security measures and fraud protection."
            icon={<CreditCard className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=400&q=80"
          />
          
          <Step 
            number={4} 
            title="Pick Up & Return" 
            description="Coordinate pickup details with the provider, collect your equipment at the agreed time and location, use it for your project, then return it in good condition when done. Rate your experience to help the community."
            icon={<Package className="w-8 h-8" />}
            image="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=400&q=80"
            isLast={true}
          />
        </div>

        {/* Enhanced Why Choose Needyfy Section */}
        <div className="mb-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-6">Why Choose Needyfy?</h2>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              We make equipment rental simple, secure, and reliable for everyone in the community.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <FeatureCard
              icon={<Shield className="w-10 h-10" />}
              title="Secure & Safe"
              description="All transactions are protected with bank-level security and equipment providers are thoroughly verified for your peace of mind."
            />
            
            <FeatureCard
              icon={<Clock className="w-10 h-10" />}
              title="Available 24/7"
              description="Browse and book equipment anytime, anywhere with our always-available platform and instant booking confirmations."
            />
            
            <FeatureCard
              icon={<MapPin className="w-10 h-10" />}
              title="Local Providers"
              description="Find equipment from verified providers in your area for convenient pickup, delivery options, and reduced transportation costs."
            />
            
            <FeatureCard
              icon={<Star className="w-10 h-10" />}
              title="Quality Guaranteed"
              description="All equipment is maintained to high standards with comprehensive ratings, reviews, and quality assurance from real users."
            />
          </div>
        </div>

        {/* Additional Trust Signals */}
        <div className="text-center bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5 rounded-2xl p-12">
          <h3 className="text-2xl font-bold text-foreground mb-4">Join Thousands of Happy Users</h3>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Over 50,000 successful rentals completed with 98% customer satisfaction rate
          </p>
          <div className="flex justify-center items-center space-x-8 text-sm text-muted-foreground">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">50K+</div>
              <div>Rentals Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">98%</div>
              <div>Satisfaction Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">24/7</div>
              <div>Support Available</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorks;
