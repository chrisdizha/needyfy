import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Search, 
  MessageCircle, 
  BookOpen, 
  Phone, 
  Mail,
  ExternalLink,
  HelpCircle,
  Zap,
  Shield,
  CreditCard,
  Settings
} from 'lucide-react';

const faqs = [
  {
    category: 'Getting Started',
    icon: Zap,
    questions: [
      {
        question: 'How do I create an account?',
        answer: 'Click the "Sign Up" button and follow the onboarding process. You\'ll need to provide basic information and verify your email address.'
      },
      {
        question: 'How do I list my equipment?',
        answer: 'Go to "List Equipment" in your dashboard, fill out the equipment details, upload photos, and set your rental terms.'
      },
      {
        question: 'How do I rent equipment?',
        answer: 'Browse available equipment, select your dates, and click "Book Now". You\'ll be guided through the booking process.'
      }
    ]
  },
  {
    category: 'Account & Security',
    icon: Shield,
    questions: [
      {
        question: 'How do I verify my account?',
        answer: 'Complete the verification process during onboarding by providing a phone number and following the SMS verification steps.'
      },
      {
        question: 'How do I reset my password?',
        answer: 'Click "Forgot Password" on the login page and follow the email instructions to reset your password.'
      },
      {
        question: 'Is my personal information safe?',
        answer: 'Yes, we use industry-standard encryption and security measures. View our Privacy Policy for detailed information.'
      }
    ]
  },
  {
    category: 'Payments & Billing',
    icon: CreditCard,
    questions: [
      {
        question: 'What payment methods are accepted?',
        answer: 'We accept all major credit cards, debit cards, and digital wallets through our secure payment processor.'
      },
      {
        question: 'When am I charged for rentals?',
        answer: 'Payment is processed when your booking is confirmed by the equipment owner.'
      },
      {
        question: 'What are the service fees?',
        answer: 'Providers pay a 15% service fee and renters pay a 10% service fee on the rental amount. All fees are clearly displayed before you confirm your booking.'
      }
    ]
  },
  {
    category: 'Technical Support',
    icon: Settings,
    questions: [
      {
        question: 'The app is running slowly',
        answer: 'Try refreshing the page or clearing your browser cache. If issues persist, contact our support team.'
      },
      {
        question: 'I can\'t upload photos',
        answer: 'Ensure your images are under 5MB and in JPG, PNG, or WebP format. Check your internet connection.'
      },
      {
        question: 'How do I report a bug?',
        answer: 'Use the feedback form accessible from any page, or email us directly at support@needyfy.com.'
      }
    ]
  }
];

interface HelpCenterProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HelpCenter = ({ isOpen, onClose }: HelpCenterProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const filteredFaqs = faqs.filter(category => {
    if (selectedCategory && category.category !== selectedCategory) return false;
    if (!searchQuery) return true;
    
    return category.questions.some(q => 
      q.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Help Center
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search for help..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4" />
                  Live Chat
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Get instant help from our support team
                </p>
                <Badge variant="secondary" className="mt-2">
                  Available 9-5 EST
                </Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4" />
                  Email Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Send us a detailed message
                </p>
                <Badge variant="outline" className="mt-2">
                  support@needyfy.com
                </Badge>
              </CardContent>
            </Card>

            <Card className="cursor-pointer hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <BookOpen className="h-4 w-4" />
                  User Guide
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Comprehensive documentation
                </p>
                <div className="flex items-center gap-1 mt-2 text-xs text-primary">
                  <span>View Guide</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              All Categories
            </Button>
            {faqs.map((category) => (
              <Button
                key={category.category}
                variant={selectedCategory === category.category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.category)}
                className="flex items-center gap-1"
              >
                <category.icon className="h-3 w-3" />
                {category.category}
              </Button>
            ))}
          </div>

          {/* FAQs */}
          <div className="space-y-4">
            {filteredFaqs.map((category) => (
              <div key={category.category}>
                <h3 className="font-semibold text-lg mb-3 flex items-center gap-2">
                  <category.icon className="h-5 w-5" />
                  {category.category}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((faq, index) => {
                    const itemValue = `${category.category}-${index}`;
                    return (
                      <AccordionItem key={itemValue} value={itemValue}>
                        <AccordionTrigger className="text-left">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              </div>
            ))}
          </div>

          {filteredFaqs.length === 0 && (
            <div className="text-center py-8">
              <HelpCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="font-semibold mb-2">No results found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or contact our support team directly.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export const HelpTrigger = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-2"
      >
        <HelpCircle className="h-4 w-4" />
        Help
      </Button>
      <HelpCenter isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};