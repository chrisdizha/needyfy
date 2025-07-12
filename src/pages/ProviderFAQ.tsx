import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HelpCircle, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

const ProviderFAQ = () => {
  const [activeCategory, setActiveCategory] = useState('general');
  
  const faqCategories = [
    { id: 'general', name: 'General' },
    { id: 'listings', name: 'Listings' },
    { id: 'pricing', name: 'Pricing & Payments' },
    { id: 'bookings', name: 'Bookings' },
    { id: 'safety', name: 'Safety & Insurance' }
  ];
  
  const faqItems = {
    general: [
      {
        question: "What is Needyfy?",
        answer: "Needyfy is an online marketplace that connects people who need equipment with those who have equipment to rent. We make it easy to list, discover, and rent equipment of all types."
      },
      {
        question: "How do I become a provider on Needyfy?",
        answer: "Simply create an account, verify your identity, and list your first piece of equipment. Once approved, you'll be able to receive booking requests and start earning."
      },
      {
        question: "What kinds of equipment can I list on Needyfy?",
        answer: "We accept a wide variety of equipment including construction tools, photography gear, audio/visual equipment, party supplies, sports equipment, camping gear, and more. All equipment must be in good working condition and meet our quality standards."
      },
      {
        question: "Is there a fee to list my equipment?",
        answer: "Listing your equipment on Needyfy is completely free. We only charge a small commission when you successfully rent out your equipment."
      }
    ],
    listings: [
      {
        question: "How do I create an effective equipment listing?",
        answer: "Take clear, well-lit photos from multiple angles, write detailed descriptions including specifications and condition, set competitive prices, and be responsive to inquiries. Check our Resources section for more detailed guides."
      },
      {
        question: "How many photos can I include in my listing?",
        answer: "You can upload up to 10 photos per listing. We recommend including photos from multiple angles, close-ups of important features, and images showing the equipment in use if possible."
      },
      {
        question: "Can I edit my listing after publishing it?",
        answer: "Yes, you can edit your listing at any time, including updating photos, description, availability, and pricing. However, any confirmed bookings will honor the terms at the time of booking."
      },
      {
        question: "How do I set my equipment's availability?",
        answer: "In your listing settings, you can access the availability calendar where you can block out dates when your equipment isn't available for rent. Keep this updated to avoid booking conflicts."
      }
    ],
    pricing: [
      {
        question: "How should I price my equipment?",
        answer: "Research similar equipment on Needyfy and other rental platforms. Consider factors like the original cost, age, condition, and local demand. We recommend starting with competitive pricing to build up reviews, then adjusting based on demand."
      },
      {
        question: "When and how do I get paid?",
        answer: "Payment is released to you 24 hours after the rental period begins, assuming there are no reported issues. Funds are transferred to your preferred payment method, which you can set up in your account settings."
      },
      {
        question: "Can I require a security deposit?",
        answer: "Yes, you can set a security deposit amount for your equipment. This will be collected from the renter at booking and automatically released back to them 3 days after the rental ends if no damages are reported."
      },
      {
        question: "What fees does Needyfy charge?",
        answer: "Needyfy charges a 15% commission on the rental amount (excluding security deposits). This fee covers payment processing, platform maintenance, marketing, and our protection policies."
      }
    ],
    bookings: [
      {
        question: "How do bookings work?",
        answer: "When someone wants to rent your equipment, they'll make a booking request. You'll have 24 hours to accept or decline. Once accepted, you'll coordinate pickup or delivery details with the renter through our messaging system."
      },
      {
        question: "Can I decline booking requests?",
        answer: "Yes, you can decline requests if necessary. However, maintaining a high acceptance rate improves your listing visibility. If you know certain dates are unavailable, block them on your calendar to avoid requests you'd need to decline."
      },
      {
        question: "What happens if a renter cancels their booking?",
        answer: "The outcome depends on your chosen cancellation policy. You can set this to flexible, moderate, or strict. Each policy has different timeframes and refund percentages, which are clearly communicated to renters before booking."
      },
      {
        question: "How do I hand over my equipment to renters?",
        answer: "You can arrange in-person handover at a safe, public location, or offer delivery for an additional fee. We recommend documenting the condition with photos at handover and having the renter sign our condition verification form in the app."
      }
    ],
    safety: [
      {
        question: "Is my equipment protected against damage?",
        answer: "Needyfy offers the Provider Protection Plan, which covers up to $10,000 in damage to your equipment caused by renters during the rental period, subject to terms and conditions. You can review full coverage details in your account settings."
      },
      {
        question: "How does Needyfy verify renters?",
        answer: "All renters must verify their identity through our ID verification system. We also have a review system that allows you to see ratings from other providers. Additionally, secured payment and deposits help ensure responsible behavior."
      },
      {
        question: "What happens if my equipment is returned damaged?",
        answer: "Report any damage within 48 hours of return through our app, including photos. Our team will review the claim and may use the security deposit to cover repairs. If costs exceed the deposit, our Provider Protection Plan covers up to USD$2,000 (increasing to USD$10,000 with time)."
      },
      {
        question: "Should I have my own insurance?",
        answer: "While we offer basic protection, we recommend having your own insurance for high-value equipment. Our protection plan has limitations and exclusions, so personal insurance provides an extra layer of security."
      }
    ]
  };
  
  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex items-center justify-between mb-4">
        <div />
        <Link to="/" className="mb-2">
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </Link>
      </div>
      <div className="text-center mb-12">
        <HelpCircle className="h-12 w-12 text-needyfy-blue mx-auto mb-4" />
        <h1 className="text-3xl font-bold">Provider FAQ</h1>
        <p className="text-gray-500 mt-2">Find answers to common questions about providing equipment on Needyfy</p>
      </div>
      
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {faqCategories.map((category) => (
          <button
            key={category.id}
            onClick={() => setActiveCategory(category.id)}
            className={`px-4 py-2 rounded-full transition-colors ${
              activeCategory === category.id
                ? 'bg-needyfy-blue text-white'
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            {category.name}
          </button>
        ))}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>
            {faqCategories.find(cat => cat.id === activeCategory)?.name} Questions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="w-full">
            {faqItems[activeCategory as keyof typeof faqItems].map((item, index) => (
              <AccordionItem key={index} value={`item-${index}`}>
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent>
                  <p className="text-gray-700">{item.answer}</p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProviderFAQ;
