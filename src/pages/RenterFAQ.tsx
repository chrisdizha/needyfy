
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { HelpCircle } from 'lucide-react';
import Footer from '@/components/layout/Footer';
import { useSEO } from '@/hooks/useSEO';

const RenterFAQ = () => {
  useSEO({
    title: 'Renter FAQ - Frequently Asked Questions | Needyfy',
    description: 'Find answers to common questions about renting equipment on Needyfy. Get help with bookings, payments, insurance, and more.',
    keywords: ['renter FAQ', 'equipment rental questions', 'needyfy help', 'rental FAQ'],
    canonical: `${window.location.origin}/renter-faq`
  });

  const faqs = [
    {
      question: "How do I book equipment?",
      answer: "Simply browse our equipment listings, select your dates, and complete the secure booking process. You'll receive confirmation details and can coordinate pickup with the owner through our messaging system."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards, PayPal, and bank transfers. Payment is processed securely through our platform, and you'll receive a receipt for your transaction."
    },
    {
      question: "Is there insurance coverage?",
      answer: "Yes, all rentals include basic liability coverage. We also offer additional protection plans for high-value equipment. Check the specific terms for each rental."
    },
    {
      question: "Can I cancel my booking?",
      answer: "Cancellation policies vary by owner, but most allow free cancellation up to 24-48 hours before pickup. Check the specific cancellation policy when booking."
    },
    {
      question: "What if the equipment is damaged?",
      answer: "Report any damage immediately through our app. Minor wear and tear is expected, but significant damage may result in repair costs. Our insurance covers accidental damage in most cases."
    },
    {
      question: "How do I contact the equipment owner?",
      answer: "Use our secure messaging system available in your booking dashboard. This keeps all communication documented and secure for both parties."
    },
    {
      question: "What if I need to extend my rental?",
      answer: "Contact the owner through our messaging system to discuss extension options. Additional days will be charged at the daily rate, subject to availability."
    },
    {
      question: "How do security deposits work?",
      answer: "Security deposits are held temporarily on your payment method and released within 5-7 business days after successful equipment return, minus any applicable charges."
    },
    {
      question: "Can I leave reviews?",
      answer: "Yes, we encourage honest reviews after each rental. This helps maintain quality standards and assists other renters in making informed decisions."
    },
    {
      question: "What if I have issues during my rental?",
      answer: "Contact our 24/7 support team immediately for assistance. We're here to help resolve any issues and ensure a positive rental experience."
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow">
        <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center mb-4">
                <HelpCircle className="h-12 w-12 text-primary mr-4" />
                <h1 className="text-4xl md:text-5xl font-bold text-foreground">Renter FAQ</h1>
              </div>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Find answers to the most common questions about renting equipment on Needyfy.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-4xl">
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">Frequently Asked Questions</CardTitle>
                <CardDescription>
                  Can't find what you're looking for? Contact our support team for personalized assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default RenterFAQ;
