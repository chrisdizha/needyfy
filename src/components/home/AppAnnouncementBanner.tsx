import { Button } from '@/components/ui/button';
import { Smartphone, Download, Bell } from 'lucide-react';

const AppAnnouncementBanner = () => {
  return (
    <section className="bg-gradient-to-r from-primary via-primary/90 to-primary text-white py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          {/* Icon and Badge */}
          <div className="flex justify-center items-center mb-6">
            <div className="bg-white/20 backdrop-blur-sm rounded-full p-4 mr-4">
              <Smartphone className="h-8 w-8 text-white" />
            </div>
            <div className="bg-accent text-white px-4 py-2 rounded-full text-sm font-semibold">
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
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="text-sm opacity-80">Available on</div>
                <div className="font-semibold">Google Play Store</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="text-sm opacity-80">Download on the</div>
                <div className="font-semibold">Apple App Store</div>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-6 py-3">
              <Download className="h-5 w-5" />
              <div className="text-left">
                <div className="text-sm opacity-80">Get it on</div>
                <div className="font-semibold">Play Gallery</div>
              </div>
            </div>
          </div>

          {/* Call to Action */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 font-semibold"
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
                <Download className="h-6 w-6" />
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