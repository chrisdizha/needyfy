
import { Button } from '@/components/ui/button';
import { Search, MapPin, Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-4">
            Hire Anything, <span className="text-needyfy-blue">Anytime!</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            From tools and electronics to vehicles and party supplies - rent what you need, when you need it, from people and businesses in your community
          </p>
          
          <div className="bg-white p-5 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  type="text" 
                  placeholder="What do you need to rent? (tools, camera, truck...)"
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
                <Button className="whitespace-nowrap px-6">
                  Search
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-8">
            <p className="text-gray-600 mb-3">Popular categories:</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button variant="outline" className="rounded-full bg-white">
                Tools
              </Button>
              <Button variant="outline" className="rounded-full bg-white">
                Vehicles
              </Button>
              <Button variant="outline" className="rounded-full bg-white">
                Electronics
              </Button>
              <Button variant="outline" className="rounded-full bg-white">
                Party Supplies
              </Button>
              <Button variant="outline" className="rounded-full bg-white">
                Cameras
              </Button>
              <Button variant="outline" className="rounded-full bg-white">
                Sports Gear
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
