
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Gift, Star, Trophy, Coins } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSEO } from '@/hooks/useSEO';
import { useI18n } from '@/hooks/useI18n';

const Rewards = () => {
  const { t } = useI18n();
  
  useSEO({
    title: 'Rewards Program - Earn Points & Get Benefits | Needyfy',
    description: 'Join Needyfy rewards program and earn points for every rental. Get exclusive discounts, early access to new equipment, and special benefits.',
    keywords: ['rewards program', 'loyalty points', 'rental discounts', 'member benefits'],
    canonical: `${window.location.origin}/rewards`
  });

  const rewardTiers = [
    {
      name: 'Bronze',
      points: '0-999',
      color: 'bg-orange-500',
      benefits: ['5% cashback on rentals', 'Basic customer support', 'Monthly newsletter']
    },
    {
      name: 'Silver',
      points: '1000-4999',
      color: 'bg-gray-400',
      benefits: ['10% cashback on rentals', 'Priority customer support', 'Early access to new equipment', 'Free equipment insurance']
    },
    {
      name: 'Gold',
      points: '5000-9999',
      color: 'bg-yellow-500',
      benefits: ['15% cashback on rentals', 'Dedicated account manager', 'VIP early access', 'Free delivery on orders over $100', 'Exclusive member events']
    },
    {
      name: 'Platinum',
      points: '10000+',
      color: 'bg-purple-500',
      benefits: ['20% cashback on rentals', '24/7 premium support', 'First access to limited equipment', 'Free delivery on all orders', 'Annual rewards bonus', 'Personal equipment concierge']
    }
  ];

  const howToEarn = [
    {
      icon: <Gift className="h-8 w-8 text-primary" />,
      title: 'Complete Rentals',
      description: 'Earn 1 point for every $1 spent on equipment rentals',
      points: '1 point per $1'
    },
    {
      icon: <Star className="h-8 w-8 text-primary" />,
      title: 'Leave Reviews',
      description: 'Get bonus points for leaving detailed reviews after rentals',
      points: '50 points'
    },
    {
      icon: <Trophy className="h-8 w-8 text-primary" />,
      title: 'Refer Friends',
      description: 'Earn points when friends sign up and complete their first rental',
      points: '500 points'
    },
    {
      icon: <Coins className="h-8 w-8 text-primary" />,
      title: 'List Equipment',
      description: 'Get points for listing your own equipment on the platform',
      points: '100 points'
    }
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">Needyfy Rewards</h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Earn points with every rental and unlock exclusive benefits. The more you rent, the more you save!
            </p>
          </div>
        </div>
      </section>

      {/* How to Earn Points */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">How to Earn Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howToEarn.map((item, index) => (
              <Card key={index} className="text-center border-2 border-border/20 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex justify-center mb-4">{item.icon}</div>
                  <CardTitle className="text-xl text-foreground">{item.title}</CardTitle>
                  <CardDescription className="text-muted-foreground">{item.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Badge variant="secondary" className="text-lg font-bold">
                    {item.points}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Reward Tiers */}
      <section className="py-16 bg-muted/30">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Reward Tiers</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {rewardTiers.map((tier, index) => (
              <Card key={index} className="border-2 border-border/20 hover:border-primary/20 transition-colors">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-4 h-4 rounded-full ${tier.color}`}></div>
                    <CardTitle className="text-xl text-foreground">{tier.name}</CardTitle>
                  </div>
                  <CardDescription className="text-muted-foreground font-medium">
                    {tier.points} points
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {tier.benefits.map((benefit, benefitIndex) => (
                      <li key={benefitIndex} className="text-sm text-muted-foreground flex items-start">
                        <span className="text-primary mr-2">•</span>
                        {benefit}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4 text-foreground">Start Earning Rewards Today</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of members who are already saving money and getting exclusive benefits.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link to="/register">Join Rewards Program</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/equipment">Start Renting</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
};

export default Rewards;
