
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Check } from 'lucide-react';
import { Link } from 'react-router-dom';

const Pricing = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h1>
        <p className="text-gray-600 mb-12">
          No subscriptions, no hidden fees. Clear pricing for everyone.
        </p>
      </div>
      
      <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {/* Provider Fee Card */}
        <Card className="w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Percent className="h-10 w-10 text-needyfy-blue" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Equipment Provider Fee</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-5xl font-bold mb-2">15%</p>
            <p className="text-muted-foreground mb-6">of the total booking amount</p>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Charged only on confirmed bookings</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Includes payment processing</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Full platform features and support</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Renter Fee Card */}
        <Card className="w-full shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-green-100 p-4 rounded-full">
                <Percent className="h-10 w-10 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Renter Service Fee</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-5xl font-bold mb-2">10%</p>
            <p className="text-muted-foreground mb-6">of the total booking amount</p>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Added to your booking total</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Secure payment processing</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Customer support and protection</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-12 text-center max-w-2xl mx-auto">
        <div className="bg-gray-50 p-6 rounded-lg mb-8">
          <h3 className="text-lg font-semibold mb-3">How It Works</h3>
          <p className="text-sm text-gray-600">
            When you rent equipment, you pay the rental amount plus a 10% service fee. 
            The equipment provider receives the rental amount minus a 15% service fee. 
            All fees are clearly shown before you confirm your booking.
          </p>
        </div>
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Have high-volume needs?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          We may be able to offer custom rates for large businesses and organizations with significant rental volume.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button asChild className="bg-needyfy-blue hover:bg-blue-600">
            <Link to="/contact">Contact Sales</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/">Back to Home</Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
