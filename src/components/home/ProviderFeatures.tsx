
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart2, FileText, DollarSign, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProviderFeatures = () => {
  const features = [
    {
      title: "Easy Equipment Management",
      description: "List and manage your equipment inventory with our intuitive dashboard.",
      icon: <FileText className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />
    },
    {
      title: "Performance Analytics",
      description: "Track earnings, bookings, and equipment performance metrics.",
      icon: <BarChart2 className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />
    },
    {
      title: "Secure Payments",
      description: "Get paid quickly and securely for every rental transaction.",
      icon: <DollarSign className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />
    },
    {
      title: "Insurance Coverage",
      description: "Comprehensive protection for your equipment during rentals.",
      icon: <Shield className="h-10 w-10 text-primary p-2 bg-primary/10 rounded-full" />
    }
  ];

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row gap-12 items-center">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4">Start Earning With Your Equipment</h2>
            <p className="text-xl text-muted-foreground mb-6">
              Turn your idle equipment into a revenue stream. Join our platform and start earning from your underutilized assets.
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Set your own rental rates and availability</span>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Access a growing network of verified renters</span>
              </li>
              <li className="flex items-start">
                <div className="bg-primary/10 p-1 rounded-full mr-3 mt-1">
                  <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span>Manage bookings with our intuitive dashboard</span>
              </li>
            </ul>
            <Button size="lg" className="w-full sm:w-auto">
              List Your Equipment
            </Button>
          </div>
          <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="border-none shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-col items-center pb-2">
                  {feature.icon}
                  <CardTitle className="mt-4 text-lg text-center">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
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
