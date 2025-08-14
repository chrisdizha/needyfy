
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, CreditCard, MessageCircle, RotateCcw } from 'lucide-react';
import { useSEO } from '@/hooks/useSEO';

const BookingHelp = () => {
  useSEO({
    title: 'Booking Help & Support | Needyfy',
    description: 'Get help with booking equipment rentals on Needyfy. Learn about our booking process, payment options, and support resources.',
    keywords: ['booking help', 'rental support', 'equipment booking', 'needyfy help'],
    canonical: `${window.location.origin}/booking-help`
  });

  const helpTopics = [
    {
      icon: <Calendar className="h-8 w-8 text-blue-600" />,
      title: "Making a Booking",
      description: "Step-by-step guide to booking your first equipment rental",
      content: [
        "Browse available equipment in your area",
        "Select your rental dates and duration",
        "Review pricing and terms",
        "Complete secure payment",
        "Coordinate pickup with the owner"
      ]
    },
    {
      icon: <CreditCard className="h-8 w-8 text-green-600" />,
      title: "Payment & Pricing",
      description: "Understanding costs, deposits, and payment methods",
      content: [
        "All prices include applicable taxes",
        "Security deposits are held temporarily",
        "Multiple payment methods accepted",
        "Automatic refund of deposits",
        "Transparent pricing with no hidden fees"
      ]
    },
    {
      icon: <MessageCircle className="h-8 w-8 text-purple-600" />,
      title: "Communication",
      description: "How to effectively communicate with equipment owners",
      content: [
        "Use our secure messaging system",
        "Ask questions before booking",
        "Confirm pickup and return details",
        "Report any issues immediately",
        "Leave reviews after your rental"
      ]
    },
    {
      icon: <RotateCcw className="h-8 w-8 text-orange-600" />,
      title: "Cancellations & Changes",
      description: "Modifying or cancelling your booking",
      content: [
        "Review cancellation policies before booking",
        "Cancel through your booking dashboard",
        "Partial refunds based on timing",
        "Contact support for special circumstances",
        "Rescheduling options available"
      ]
    }
  ];

  return (
    <>
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Booking Help & Support</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Everything you need to know about booking equipment rentals on Needyfy.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {helpTopics.map((topic, index) => (
              <Card key={index} className="border-2 border-border/20 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-4 mb-4">
                    {topic.icon}
                    <div>
                      <CardTitle className="text-xl">{topic.title}</CardTitle>
                      <CardDescription className="text-base mt-1">
                        {topic.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {topic.content.map((item, itemIndex) => (
                      <li key={itemIndex} className="flex items-start gap-2 text-muted-foreground">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>
    </>
  );
};

export default BookingHelp;
