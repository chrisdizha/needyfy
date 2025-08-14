
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield, CheckCircle, AlertTriangle, Users } from 'lucide-react';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { useSEO } from '@/hooks/useSEO';

const RenterSafety = () => {
  useSEO({
    title: 'Renter Safety Guidelines | Needyfy',
    description: 'Stay safe while renting equipment with Needyfy. Learn about our safety protocols, insurance coverage, and best practices for equipment rental.',
    keywords: ['renter safety', 'equipment rental safety', 'insurance', 'safety guidelines'],
    canonical: `${window.location.origin}/renter-safety`
  });

  const safetyTips = [
    {
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      title: "Inspect Before Use",
      description: "Always inspect equipment thoroughly before using it. Report any damage or concerns immediately."
    },
    {
      icon: <Shield className="h-6 w-6 text-blue-600" />,
      title: "Follow Instructions",
      description: "Read all provided manuals and follow the owner's instructions for safe operation."
    },
    {
      icon: <AlertTriangle className="h-6 w-6 text-yellow-600" />,
      title: "Report Issues",
      description: "Contact the owner immediately if you encounter any problems or safety concerns."
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Communicate",
      description: "Maintain open communication with equipment owners throughout the rental period."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Renter Safety Guidelines</h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Your safety is our priority. Follow these guidelines for a safe and successful rental experience.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              {safetyTips.map((tip, index) => (
                <Card key={index} className="border-2 border-border/20 hover:border-primary/20 transition-colors">
                  <CardHeader>
                    <div className="flex items-center gap-4 mb-2">
                      {tip.icon}
                      <CardTitle className="text-xl">{tip.title}</CardTitle>
                    </div>
                    <CardDescription className="text-base">
                      {tip.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>

            <Card className="mb-8">
              <CardHeader>
                <CardTitle className="text-2xl">Insurance & Protection</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  Needyfy provides comprehensive protection for both renters and equipment owners:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Liability coverage for accidental damage</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Theft protection during rental period</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>24/7 customer support for emergencies</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                    <span>Verified equipment owners and listings</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RenterSafety;
