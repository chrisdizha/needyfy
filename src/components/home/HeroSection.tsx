
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2">
            List. Rent. Earn.
          </h1>
          <h2 className="text-2xl md:text-3xl text-needyfy-blue font-semibold mb-4">
            Hire or Rent Anything, Anytime, All on Your Phone
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of users renting and listing equipment - from tools and vehicles to party supplies. Start earning or find what you need today.
          </p>
          
          <div className="bg-white p-5 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  type="text" 
                  placeholder="What do you need? (tools, vehicles, electronics...)"
                  className="pl-10 w-full bg-gray-50 border-gray-200" 
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    type="text" 
                    placeholder="Your location"
                    className="pl-10 w-full bg-gray-50 border-gray-200" 
                  />
                </div>
                <div className="relative flex-1">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                  <Input 
                    type="text" 
                    placeholder="Rental dates"
                    className="pl-10 w-full bg-gray-50 border-gray-200" 
                  />
                </div>
                <Button className="whitespace-nowrap px-6 bg-needyfy-blue hover:bg-blue-600">
                  Search Now
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-gray-600 mb-3">Top categories:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="rounded-full bg-white hover:bg-needyfy-blue hover:text-white">
                Construction
              </Button>
              <Button variant="outline" className="rounded-full bg-white hover:bg-needyfy-blue hover:text-white">
                Vehicles
              </Button>
              <Button variant="outline" className="rounded-full bg-white hover:bg-needyfy-blue hover:text-white">
                Electronics
              </Button>
              <Button variant="outline" className="rounded-full bg-white hover:bg-needyfy-blue hover:text-white">
                Event Equipment
              </Button>
              <Button variant="outline" className="rounded-full bg-white hover:bg-needyfy-blue hover:text-white">
                Home & Garden
              </Button>
              <Button variant="outline" className="rounded-full bg-white hover:bg-needyfy-blue hover:text-white">
                Photography
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
