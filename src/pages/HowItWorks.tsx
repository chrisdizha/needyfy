
import React from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { CheckCircle } from 'lucide-react';

const HowItWorks = () => {
  const steps = [
    {
      title: "Find Equipment",
      description: "Browse through our extensive catalog of equipment available for rent in your area.",
    },
    {
      title: "Book & Pay",
      description: "Select your rental dates and make a secure payment through our platform.",
    },
    {
      title: "Receive Equipment",
      description: "The equipment provider will deliver or you can pick up the equipment at the arranged time.",
    },
    {
      title: "Return When Done",
      description: "Once you've finished using the equipment, simply return it according to the agreed terms.",
    },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <h1 className="text-3xl font-bold mb-2">How It Works</h1>
          <p className="text-gray-600 mb-12 max-w-2xl">
            Needyfy makes equipment rental simple and hassle-free. Follow these easy steps to get the equipment you need.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md relative">
                <div className="bg-needyfy-blue text-white rounded-full w-10 h-10 flex items-center justify-center mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-3">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-16 bg-gray-50 p-8 rounded-lg">
            <h2 className="text-2xl font-bold mb-6">Why Choose Needyfy?</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[
                "Save money by renting instead of buying",
                "Access to high-quality, well-maintained equipment",
                "Flexible rental periods - rent for hours, days, or weeks",
                "Verified equipment providers for your safety",
                "Secure payment processing",
                "Customer support available 7 days a week"
              ].map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  <CheckCircle className="h-5 w-5 text-needyfy-blue mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
