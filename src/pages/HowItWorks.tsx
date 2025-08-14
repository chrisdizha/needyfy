
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserPlus, Search, CreditCard, RotateCcw } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSEO } from '@/hooks/useSEO';
import { useI18n } from '@/hooks/useI18n';

const HowItWorks = () => {
  const { t } = useI18n();
  
  useSEO({
    title: 'How It Works - Rent Equipment Easily | Needyfy',
    description: 'Learn how Needyfy works in 4 simple steps: Create account, find equipment, pay securely, and enjoy. Start renting equipment today!',
    keywords: ['how it works', 'rent equipment', 'equipment rental process', 'needyfy guide'],
    canonical: `${window.location.origin}/how-it-works`
  });

  const steps = [
    {
      icon: <UserPlus className="h-12 w-12 text-primary" />,
      title: t('howItWorks.step1Title'),
      description: t('howItWorks.step1Desc'),
      image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=600&q=80',
      step: '01'
    },
    {
      icon: <Search className="h-12 w-12 text-primary" />,
      title: t('howItWorks.step2Title'),
      description: t('howItWorks.step2Desc'),
      image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80',
      step: '02'
    },
    {
      icon: <CreditCard className="h-12 w-12 text-primary" />,
      title: t('howItWorks.step3Title'),
      description: t('howItWorks.step3Desc'),
      image: 'https://images.unsplash.com/photo-1556742502-ec7c0e9f34b1?auto=format&fit=crop&w=600&q=80',
      step: '03'
    },
    {
      icon: <RotateCcw className="h-12 w-12 text-primary" />,
      title: t('howItWorks.step4Title'),
      description: t('howItWorks.step4Desc'),
      image: 'https://images.unsplash.com/photo-1521791136064-7986c2920216?auto=format&fit=crop&w=600&q=80',
      step: '04'
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">{t('howItWorks.title')}</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {t('howItWorks.subtitle')}
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              {steps.map((step, index) => (
                <div key={index} className={`flex ${index % 2 === 1 ? 'lg:flex-row-reverse' : ''} gap-8 items-center`}>
                  <div className="flex-1">
                    <Card className="h-full border-2 border-border/20 hover:border-primary/20 transition-colors">
                      <CardHeader>
                        <div className="flex items-center gap-4 mb-4">
                          <Badge variant="secondary" className="text-lg font-bold px-3 py-1">
                            {step.step}
                          </Badge>
                          {step.icon}
                        </div>
                        <CardTitle className="text-2xl text-foreground">{step.title}</CardTitle>
                        <CardDescription className="text-lg text-muted-foreground">
                          {step.description}
                        </CardDescription>
                      </CardHeader>
                    </Card>
                  </div>
                  <div className="flex-1">
                    <div className="relative overflow-hidden rounded-2xl shadow-lg">
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="w-full h-64 object-cover transition-transform duration-300 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4 text-foreground">{t('common.getStarted')}</h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              {t('howItWorks.subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/register">{t('auth.createAccount')}</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/equipment">{t('nav.browseEquipment')}</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
