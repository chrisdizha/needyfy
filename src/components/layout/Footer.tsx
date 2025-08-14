
import { useState } from 'react';
import { SafeLink } from '@/components/navigation/SafeLink';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { List, FileText, Award, HelpCircle, Search, Shield, Calendar, Users } from 'lucide-react';
import { toast } from 'sonner';
import Logo from './Logo';

const Footer = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleWaitingListSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Simulate API call for now
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Successfully joined the waiting list! We\'ll notify you when the app launches.');
      setEmail('');
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
          {/* Brand info with logo */}
          <div className="col-span-1 md:col-span-1">
            <div className="mb-4">
              <Logo showText={true} size="md" className="text-white [&_span]:text-white [&_div]:text-gray-300" />
            </div>
            <p className="text-gray-400 mb-4">
              The all-in-one equipment rental marketplace. Rent anything, anytime, anywhere.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                </svg>
              </a>
            </div>
          </div>
          
          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><SafeLink to="/" className="text-gray-400 hover:text-white">Home</SafeLink></li>
              <li><SafeLink to="/categories" className="text-gray-400 hover:text-white">Categories</SafeLink></li>
              <li><SafeLink to="/how-it-works" className="text-gray-400 hover:text-white">How It Works</SafeLink></li>
              <li><SafeLink to="/pricing" className="text-gray-400 hover:text-white">Pricing</SafeLink></li>
              <li><SafeLink to="/contact" className="text-gray-400 hover:text-white">Contact Us</SafeLink></li>
            </ul>
          </div>

          {/* For Renters */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Renters</h3>
            <ul className="space-y-2">
              <li>
                <SafeLink to="/equipment" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <Search className="h-4 w-4" />
                  <span>Browse Equipment</span>
                </SafeLink>
              </li>
              <li>
                <SafeLink to="/how-it-works" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>How It Works</span>
                </SafeLink>
              </li>
              <li>
                <SafeLink to="/renter-safety" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>Safety Guidelines</span>
                </SafeLink>
              </li>
              <li>
                <SafeLink to="/booking-help" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  <span>Booking Help</span>
                </SafeLink>
              </li>
              <li>
                <SafeLink to="/renter-faq" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>Renter FAQ</span>
                </SafeLink>
              </li>
            </ul>
          </div>
          
          {/* For Providers */}
          <div>
            <h3 className="text-lg font-semibold mb-4">For Providers</h3>
            <ul className="space-y-2">
              <li>
                <SafeLink to="/list-equipment" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <List className="h-4 w-4" />
                  <span>List Equipment</span>
                </SafeLink>
              </li>
              <li>
                <SafeLink to="/provider-resources" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Resources</span>
                </SafeLink>
              </li>
              <li>
                <SafeLink to="/provider-guidelines" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span>Guidelines</span>
                </SafeLink>
              </li>
              <li>
                <SafeLink to="/success-stories" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <Award className="h-4 w-4" />
                  <span>Success Stories</span>
                </SafeLink>
              </li>
              <li>
                <SafeLink to="/provider-faq" className="text-gray-400 hover:text-white flex items-center gap-2">
                  <HelpCircle className="h-4 w-4" />
                  <span>FAQ</span>
                </SafeLink>
              </li>
            </ul>
          </div>
          
          {/* Newsletter */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Be First to Know</h3>
            <p className="text-gray-400 mb-4">
              Join the waiting list for exclusive early access to our mobile app and be among the first to experience the future of equipment rental.
            </p>
            <form onSubmit={handleWaitingListSignup} className="flex gap-2">
              <Input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email" 
                className="bg-gray-800 border-gray-700 text-white"
                disabled={isSubmitting}
              />
              <Button 
                type="submit"
                disabled={isSubmitting}
                className="bg-needyfy-blue hover:bg-blue-600 whitespace-nowrap"
              >
                {isSubmitting ? 'Joining...' : 'Join List'}
              </Button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2025 Needyfy. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <SafeLink to="/terms" className="text-gray-400 hover:text-white text-sm">
              Terms of Service
            </SafeLink>
            <SafeLink to="/privacy" className="text-gray-400 hover:text-white text-sm">
              Privacy Policy
            </SafeLink>
            <SafeLink to="/cookies" className="text-gray-400 hover:text-white text-sm">
              Cookie Policy
            </SafeLink>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
