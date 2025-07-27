
import { cn } from '@/lib/utils';
import { Car, CreditCard, Package, User } from 'lucide-react';
import { useI18n } from '@/hooks/useI18n';

interface StepProps {
  number: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  image?: string;
  isLast?: boolean;
}

const Step = ({ number, title, description, icon, image, isLast = false }: StepProps) => (
  <div className="flex flex-col items-center text-center md:text-left md:flex-row group">
    <div className="flex-shrink-0 relative">
      {image && (
        <div className="w-24 h-24 md:w-32 md:h-32 rounded-full overflow-hidden mb-4 md:mb-0 shadow-lg">
          <img 
            src={image} 
            alt={title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
      )}
      <div className="absolute -bottom-2 -right-2 md:bottom-0 md:right-0 flex items-center justify-center w-12 h-12 bg-primary rounded-full text-primary-foreground shadow-lg">
        {icon}
      </div>
    </div>
    
    <div className={cn(
      "md:ml-8 md:flex-1",
      !isLast && "pb-16 md:pb-0 md:pr-12 relative after:hidden md:after:block after:absolute after:top-32 md:after:top-16 after:bottom-0 md:after:bottom-auto after:left-1/2 md:after:left-auto after:-translate-x-1/2 md:after:translate-x-0 md:after:right-0 after:w-px after:h-full md:after:h-px md:after:w-full after:bg-border after:opacity-30"
    )}>
      <div className="flex items-center mb-3 justify-center md:justify-start">
        <span className="flex items-center justify-center w-8 h-8 bg-primary/10 rounded-full text-primary font-bold mr-3 text-sm">
          {number}
        </span>
        <h3 className="font-bold text-xl md:text-2xl text-foreground">{title}</h3>
      </div>
      <p className="text-muted-foreground text-lg leading-relaxed max-w-md mx-auto md:mx-0">{description}</p>
    </div>
  </div>
);

const HowItWorks = () => {
  const { t } = useI18n();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('howItWorks.title')}</h2>
          <p className="text-muted-foreground max-w-3xl mx-auto text-lg leading-relaxed">
            {t('howItWorks.subtitle')}
          </p>
        </div>
        
        <div className="space-y-16 md:space-y-20 max-w-5xl mx-auto">
          <Step 
            number={1} 
            title={t('howItWorks.step1Title')} 
            description={t('howItWorks.step1Desc')}
            icon={<User className="w-5 h-5" />}
            image="https://images.unsplash.com/photo-1649972904349-6e44c42644a7?auto=format&fit=crop&w=200&q=80"
          />
          
          <Step 
            number={2} 
            title={t('howItWorks.step2Title')} 
            description={t('howItWorks.step2Desc')}
            icon={<Car className="w-5 h-5" />}
            image="https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?auto=format&fit=crop&w=200&q=80"
          />
          
          <Step 
            number={3} 
            title={t('howItWorks.step3Title')} 
            description={t('howItWorks.step3Desc')}
            icon={<CreditCard className="w-5 h-5" />}
            image="https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=200&q=80"
          />
          
          <Step 
            number={4} 
            title={t('howItWorks.step4Title')} 
            description={t('howItWorks.step4Desc')}
            icon={<Package className="w-5 h-5" />}
            image="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=200&q=80"
            isLast={true}
          />
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
