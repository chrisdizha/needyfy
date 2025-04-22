
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 py-12 md:py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Rent Any Equipment <span className="text-needyfy-blue">On Demand</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            From trucks and vehicles to tools and party supplies - rent what you need, when you need it
          </p>
          
          <div className="bg-white p-4 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Input 
                  type="text" 
                  placeholder="What do you need to rent?"
                  className="pl-10 w-full" 
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              </div>
              <div className="relative flex-1">
                <Input 
                  type="text" 
                  placeholder="Location"
                  className="w-full" 
                />
              </div>
              <Button className="whitespace-nowrap">
                Find Equipment
              </Button>
            </div>
          </div>
          
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Button variant="outline" className="rounded-full">
              Trucks
            </Button>
            <Button variant="outline" className="rounded-full">
              Cars
            </Button>
            <Button variant="outline" className="rounded-full">
              Construction
            </Button>
            <Button variant="outline" className="rounded-full">
              Party Supplies
            </Button>
            <Button variant="outline" className="rounded-full">
              Electronics
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
