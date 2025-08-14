
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Clock, Shield, Star, Truck, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { useSEO } from '@/hooks/useSEO';

const HowItWorks = () => {
  useSEO({
    title: 'How It Works - Easy Equipment Rental Process | Needyfy',
    description: 'Learn how to rent equipment easily with Needyfy. Simple 4-step process: Browse, Book, Use, Return. Safe, verified equipment rentals.',
    keywords: ['how it works', 'equipment rental process', 'rent equipment', 'booking process', 'equipment sharing'],
    canonical: `${window.location.origin}/how-it-works`
  });

  const steps = [
    {
      number: 1,
      title: "Browse & Discover",
      description: "Search through thousands of verified equipment listings in your area. Filter by category, price, and availability.",
      icon: <Users className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=300&q=80"
    },
    {
      number: 2,
      title: "Book & Pay Securely",
      description: "Select your dates, review the terms, and make a secure payment. All transactions are protected by our guarantee.",
      icon: <Shield className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1563013544-824ae1b704d3?auto=format&fit=crop&w=300&q=80"
    },
    {
      number: 3,
      title: "Pick Up & Use",
      description: "Coordinate with the owner for pickup or delivery. Get a brief orientation and start using the equipment safely.",
      icon: <Truck className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1586947122744-a62a777efed9?auto=format&fit=crop&w=300&q=80"
    },
    {
      number: 4,
      title: "Return & Review",
      description: "Return the equipment in good condition and leave a review. Build your reputation in the community.",
      icon: <Star className="h-6 w-6" />,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=300&q=80"
    }
  ];

  const benefits = [
    {
      title: "Save Money",
      description: "Rent only when you need it instead of buying expensive equipment that sits unused.",
      icon: <CheckCircle className="h-8 w-8 text-green-500" />
    },
    {
      title: "Verified Equipment",
      description: "All equipment goes through our verification process to ensure quality and safety.",
      icon: <Shield className="h-8 w-8 text-blue-500" />
    },
    {
      title: "Local Community",
      description: "Connect with equipment owners in your area and build lasting relationships.",
      icon: <Users className="h-8 w-8 text-purple-500" />
    },
    {
      title: "Flexible Rentals",
      description: "From hourly to monthly rentals, choose the duration that works for your project.",
      icon: <Clock className="h-8 w-8 text-orange-500" />
    }
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        {/* Hero Section */}
        <section className="py-20 bg-gradient-to-br from-primary/5 to-secondary/5">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-foreground">
              How <span className="text-primary">Needyfy</span> Works
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
              Renting equipment has never been easier. Follow our simple 4-step process to get the tools you need, when you need them.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <Link to="/equipment">Start Browsing</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/list-equipment">List Your Equipment</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Simple 4-Step Process</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                From discovery to return, we've made equipment rental straightforward and secure.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <Card key={step.number} className="text-center hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="relative mx-auto mb-4">
                      <img 
                        src={step.image} 
                        alt={step.title}
                        className="w-20 h-20 rounded-full object-cover mx-auto"
                      />
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-bold">
                        {step.icon}
                      </div>
                    </div>
                    <Badge variant="secondary" className="w-8 h-8 rounded-full p-0 flex items-center justify-center mx-auto mb-2">
                      {step.number}
                    </Badge>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">{step.description}</CardDescription>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">Why Choose Needyfy?</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                We're more than just a rental platform - we're building a community of makers, builders, and creators.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map((benefit, index) => (
                <Card key={index} className="text-center p-6 hover:shadow-lg transition-shadow">
                  <div className="flex justify-center mb-4">
                    {benefit.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-foreground">{benefit.title}</h3>
                  <p className="text-muted-foreground">{benefit.description}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Safety Section */}
        <section className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-foreground">Safety & Trust First</h2>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Identity Verification</h3>
                      <p className="text-muted-foreground">All users go through identity verification to ensure a safe community.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Equipment Inspection</h3>
                      <p className="text-muted-foreground">Owners provide detailed condition reports and safety information.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">Secure Payments</h3>
                      <p className="text-muted-foreground">All payments are processed securely with fraud protection.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-foreground">24/7 Support</h3>
                      <p className="text-muted-foreground">Our support team is available around the clock to help resolve any issues.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="relative">
                <img 
                  src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?auto=format&fit=crop&w=600&q=80" 
                  alt="Safe equipment rental"
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-lg"></div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-primary text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Get Started?</h2>
            <p className="text-xl mb-8 text-primary-foreground/90 max-w-2xl mx-auto">
              Join thousands of users who are already saving money and building projects with Needyfy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link to="/register">Create Account</Link>
              </Button>
              <Button size="lg" variant="outline" className="border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link to="/equipment">Browse Equipment</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
