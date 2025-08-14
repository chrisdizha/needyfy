
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Mail, Phone, MapPin, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import BackButton from '@/components/layout/BackButton';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSEO } from '@/hooks/useSEO';

const Contact = () => {
  useSEO({
    title: 'Contact Sales - Custom Enterprise Solutions | Needyfy',
    description: 'Get in touch with our sales team for custom enterprise equipment rental solutions, bulk pricing, and dedicated support.',
    keywords: ['contact sales', 'enterprise solutions', 'bulk pricing', 'custom rates', 'business rental'],
    canonical: `${window.location.origin}/contact`
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log('Contact form submitted');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-12">
          <BackButton to="/pricing" label="Back to Pricing" />
          
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold mb-4 text-foreground">Contact Our Sales Team</h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                Ready to discuss custom rates for your business? We'd love to help you find the perfect equipment rental solution.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Contact Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="h-5 w-5" />
                    Send Us a Message
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-1">
                          First Name
                        </label>
                        <Input id="firstName" type="text" required />
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium mb-1">
                          Last Name
                        </label>
                        <Input id="lastName" type="text" required />
                      </div>
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium mb-1">
                        Business Email
                      </label>
                      <Input id="email" type="email" required />
                    </div>
                    
                    <div>
                      <label htmlFor="company" className="block text-sm font-medium mb-1">
                        Company Name
                      </label>
                      <Input id="company" type="text" required />
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium mb-1">
                        Phone Number
                      </label>
                      <Input id="phone" type="tel" />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium mb-1">
                        Tell us about your needs
                      </label>
                      <Textarea 
                        id="message" 
                        rows={4} 
                        placeholder="What type of equipment do you need? How many rentals per month? Any specific requirements?"
                        required 
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Send Message
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {/* Contact Information */}
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Get In Touch</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Email</p>
                        <p className="text-muted-foreground">sales@needyfy.com</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Phone</p>
                        <p className="text-muted-foreground">Call/WhatsApp +267-73343501 for urgent support</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-primary" />
                      <div>
                        <p className="font-medium">Address</p>
                        <p className="text-muted-foreground">
                          Plot 163/164, Unit 15<br />
                          Gaborone International Commerce Park, GICP<br />
                          Gaborone, Botswana<br />
                          Africa Union (AU) Member State
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>What We Can Help With</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span>Custom volume pricing for 50+ rentals/month</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span>Dedicated account management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span>Priority customer support</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span>Integration with your existing systems</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                        <span>Custom reporting and analytics</span>
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                <div className="text-center">
                  <p className="text-sm text-muted-foreground mb-4">
                    Not ready to talk? Check out our resources first.
                  </p>
                  <div className="flex flex-col gap-2">
                    <Button asChild variant="outline">
                      <Link to="/how-it-works">How It Works</Link>
                    </Button>
                    <Button asChild variant="outline">
                      <Link to="/blog">Blog & Resources</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
