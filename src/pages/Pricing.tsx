
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Percent, Check } from 'lucide-react';

const Pricing = () => {
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="max-w-3xl mx-auto text-center">
        <h1 className="text-3xl font-bold mb-2">Simple, Transparent Pricing</h1>
        <p className="text-gray-600 mb-12">
          No subscriptions, no hidden fees. Only pay when you earn.
        </p>
      </div>
      
      <div className="flex justify-center">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-center mb-4">
              <div className="bg-blue-100 p-4 rounded-full">
                <Percent className="h-10 w-10 text-needyfy-blue" />
              </div>
            </div>
            <CardTitle className="text-center text-2xl">Provider Service Fee</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-5xl font-bold mb-2">15%</p>
            <p className="text-muted-foreground mb-6">of the total booking amount.</p>
            <ul className="text-left space-y-3 mb-6">
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Charged only on confirmed bookings.</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Includes payment processing fees.</span>
              </li>
              <li className="flex items-start">
                <Check className="h-5 w-5 text-green-500 mr-2 mt-1 flex-shrink-0" />
                <span>Access to our full platform features and support.</span>
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              This fee helps us operate our platform and ensure a secure experience for everyone.
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="mt-16 text-center">
        <h2 className="text-2xl font-bold mb-4">Have high-volume needs?</h2>
        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
          We may be able to offer custom rates for large businesses and organizations with significant rental volume.
        </p>
        <Button className="bg-needyfy-blue hover:bg-blue-600">
          Contact Sales
        </Button>
      </div>
    </div>
  );
};

export default Pricing;
