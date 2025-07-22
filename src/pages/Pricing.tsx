
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '@/components/layout/BackButton';

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-12">
        <BackButton to="/" label="Back to Home" />
        
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Simple, Transparent Pricing</h1>
          <p className="text-muted-foreground mb-12">
            No subscriptions, no hidden fees. Clear pricing for everyone.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Provider Fee Card */}
          <Card className="w-full shadow-lg border-border">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-primary/10 p-4 rounded-full">
                  <Percent className="h-10 w-10 text-primary" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-foreground">Equipment Provider Fee</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-bold mb-2 text-foreground">15%</p>
              <p className="text-muted-foreground mb-6">of the total booking amount</p>
              <ul className="text-left space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-foreground">Charged only on confirmed bookings</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-foreground">Includes payment processing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-foreground">Full platform features and support</span>
                </li>
              </ul>
            </CardContent>
          </Card>

          {/* Renter Fee Card */}
          <Card className="w-full shadow-lg border-border">
            <CardHeader>
              <div className="flex items-center justify-center mb-4">
                <div className="bg-green-500/10 p-4 rounded-full">
                  <Percent className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <CardTitle className="text-center text-2xl text-foreground">Renter Service Fee</CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-5xl font-bold mb-2 text-foreground">10%</p>
              <p className="text-muted-foreground mb-6">of the total booking amount</p>
              <ul className="text-left space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-foreground">Added to your booking total</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-foreground">Secure payment processing</span>
                </li>
                <li className="flex items-start">
                  <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                  <span className="text-foreground">Customer support and protection</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* How It Works Section - Fixed for better contrast */}
        <div className="mt-12 text-center max-w-2xl mx-auto">
          <div className="bg-muted/50 border border-border p-6 rounded-lg mb-8">
            <h3 className="text-lg font-semibold mb-3 text-foreground">How It Works</h3>
            <p className="text-sm text-muted-foreground">
              When you rent equipment, you pay the rental amount plus a 10% service fee. 
              The equipment provider receives the rental amount minus a 15% service fee. 
              All fees are clearly shown before you confirm your booking.
            </p>
          </div>
        </div>
        
        <div className="mt-16 text-center">
          <h2 className="text-2xl font-bold mb-4 text-foreground">Have high-volume needs?</h2>
          <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
            We may be able to offer custom rates for large businesses and organizations with significant rental volume.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/contact">Contact Sales</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
