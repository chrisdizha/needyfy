import { Button } from '@/components/ui/button';
import { Smartphone, Bell, Apple } from 'lucide-react';

const AppAnnouncementBanner = () => {
  const scrollToSignup = () => {
    const footer = document.querySelector('footer');
    if (footer) {
      footer.scrollIntoView({ behavior: 'smooth' });
    }
  };
  return (
    <section className="bg-gradient-to-r from-primary via-primary/90 to-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon and Badge */}
          <div className="flex justify-center items-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mr-4">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div className="bg-needyfy-orange text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
              Coming Soon
            </div>
          </div>

          {/* Main Announcement */}
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            The Needyfy Mobile App is Almost Here!
          </h2>
          <p className="text-xl md:text-2xl text-white/90 mb-6">
            Rent equipment on-the-go with our upcoming mobile app
          </p>
          <p className="text-lg text-white/80 mb-8 max-w-2xl mx-auto">
            Soon you'll be able to browse, book, and manage your rentals directly from your smartphone. 
            Get instant notifications, quick bookings, and seamless payment processing—all in your pocket.
          </p>

          {/* App Store Badges */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8">
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-all">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none">
                <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.61 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" fill="#34A853"/>
                <path d="M6.05,2.66L14.54,11.15L16.81,8.88L6.05,2.66Z" fill="#EA4335"/>
                <path d="M16.81,15.12L14.54,12.85L6.05,21.34L16.81,15.12Z" fill="#FBBC04"/>
                <path d="M20.16,10.81L17.89,9.5L15.39,12L17.89,14.5L20.18,13.18C20.53,12.9 20.75,12.5 20.75,12C20.75,11.5 20.5,11.08 20.16,10.81Z" fill="#EA4335"/>
              </svg>
              <div className="text-left">
                <div className="text-sm opacity-80">Available on</div>
                <div className="font-semibold">Google Play Store</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-all">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              <div className="text-left">
                <div className="text-sm opacity-80">Download on the</div>
                <div className="font-semibold">Apple App Store</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/15 backdrop-blur-sm rounded-lg px-6 py-3 hover:bg-white/20 transition-all">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
              <div className="text-left">
                <div className="text-sm opacity-80">Get it on</div>
                <div className="font-semibold">Galaxy Store</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-semibold"
              onClick={scrollToSignup}
            >
              <Bell className="h-5 w-5 mr-2" />
              Notify Me When Available
            </Button>
            <div className="text-white/80">
              <span className="font-medium">Stay tuned</span> for the official launch announcement!
            </div>
          </div>

          {/* Features Preview */}
          <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-4">
                <Smartphone className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Quick Browsing</h3>
              <p className="text-white/80 text-sm">Browse thousands of equipment options with advanced filtering</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-4">
                <Bell className="h-6 w-6" />
              </div>
              <h3 className="font-semibold mb-2">Push Notifications</h3>
              <p className="text-white/80 text-sm">Get instant updates on bookings, payments, and availability</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
              <div className="bg-white/20 rounded-full p-3 w-fit mx-auto mb-4">
                <svg className="h-6 w-6" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z"/>
                </svg>
              </div>
              <h3 className="font-semibold mb-2">Offline Access</h3>
              <p className="text-white/80 text-sm">View your bookings and equipment details even when offline</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppAnnouncementBanner;