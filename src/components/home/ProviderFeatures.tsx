
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, BarChart2, CreditCard, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProviderFeatures = () => {
  const features = [
    {
      title: "Easy Listing",
      description: "List your equipment in minutes with our simple listing process.",
      icon: <Package className="h-10 w-10 text-needyfy-green p-2 bg-green-100 rounded-full" />
    },
    {
      title: "Powerful Analytics",
      description: "Track views, bookings, and revenue with our comprehensive dashboard.",
      icon: <BarChart2 className="h-10 w-10 text-needyfy-green p-2 bg-green-100 rounded-full" />
    },
    {
      title: "Fast Payouts",
      description: "Receive payments quickly with our flexible payout options.",
      icon: <CreditCard className="h-10 w-10 text-needyfy-green p-2 bg-green-100 rounded-full" />
    },
    {
      title: "Protection Plans",
      description: "Your equipment is protected with optional security deposits and insurance.",
      icon: <Shield className="h-10 w-10 text-needyfy-green p-2 bg-green-100 rounded-full" />
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Monetize Your Idle Equipment</h2>
            <p className="text-xl text-gray-600 mb-6">
              Turn your underutilized equipment into a revenue stream. Earn 85% of each booking while we handle the platform, payments, and customer support.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-needyfy-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Complete control over pricing and availability</span>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-needyfy-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Set your own rental terms and conditions</span>
              </li>
              <li className="flex items-start">
                <div className="bg-green-100 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-needyfy-green" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-gray-700">Access to thousands of verified renters</span>
              </li>
            </ul>
            <Button size="lg" className="bg-needyfy-green hover:bg-green-600">Start Listing Your Equipment</Button>
          </div>
          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-col items-center pb-2">
                  {feature.icon}
                  <CardTitle className="mt-4 text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-gray-600">
                  <p>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProviderFeatures;
