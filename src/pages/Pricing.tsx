
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

const Pricing = () => {
  const pricingPlans = [
    {
      name: "Basic",
      price: "Free",
      description: "For individual renters looking for equipment",
      features: [
        "Browse equipment listings",
        "Message equipment owners",
        "Up to 2 rentals per month",
        "Basic customer support"
      ],
      notIncluded: [
        "Equipment insurance",
        "Priority support",
        "Extended rental periods",
      ]
    },
    {
      name: "Premium",
      price: "$9.99/month",
      description: "For frequent renters with more extensive needs",
      features: [
        "Everything in Basic plan",
        "Unlimited rentals per month",
        "Equipment insurance",
        "Priority customer support",
        "Exclusive discounts",
        "Extended rental periods"
      ],
      notIncluded: []
    },
    {
      name: "Business",
      price: "$29.99/month",
      description: "For businesses that need equipment regularly",
      features: [
        "Everything in Premium plan",
        "Dedicated account manager",
        "Business invoicing",
        "Team accounts",
        "API access",
        "Custom rental agreements",
        "Bulk rental discounts"
      ],
      notIncluded: []
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold text-center mb-2">Simple, Transparent Pricing</h1>
          <p className="text-gray-600 text-center mb-12 max-w-2xl mx-auto">
            Choose the plan that best fits your equipment rental needs. All plans come with access to our marketplace of quality equipment.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index} 
                className={`bg-white rounded-lg shadow-md p-6 border ${
                  plan.name === "Premium" ? "border-needyfy-blue relative" : "border-gray-200"
                }`}
              >
                {plan.name === "Premium" && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-needyfy-blue text-white py-1 px-3 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                <div className="text-3xl font-bold mb-2">{plan.price}</div>
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="space-y-3 mb-6">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  
                  {plan.notIncluded.map((feature, i) => (
                    <div key={i} className="flex items-start gap-3 text-gray-400">
                      <X className="h-5 w-5 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                
                <Button 
                  className={plan.name === "Premium" ? "w-full bg-needyfy-blue hover:bg-blue-600" : "w-full"}
                  variant={plan.name === "Premium" ? "default" : "outline"}
                >
                  {plan.name === "Basic" ? "Get Started" : "Subscribe Now"}
                </Button>
              </div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
            <h2 className="text-2xl font-bold mb-4">Need a custom solution?</h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              We offer tailored plans for large businesses and organizations with specific equipment rental needs.
            </p>
            <Button className="bg-needyfy-blue hover:bg-blue-600">
              Contact Sales
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Pricing;
