
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const Categories = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');

  const categories = [
    'Construction', 
    'Gardening', 
    'Vehicles', 
    'Electronics', 
    'Painting', 
    'Cleaning', 
    'Moving', 
    'Event Equipment',
    'Home & Garden',
    'Photography'
  ];

  // Filter categories based on search if needed
  const filteredCategories = selectedCategory 
    ? categories.filter(cat => cat.toLowerCase() === selectedCategory.toLowerCase())
    : categories;

  useEffect(() => {
    // Set the selected category from URL if present
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      setSelectedCategory(categoryParam);
    }
    
    // Set search query from URL if present
    const searchParam = searchParams.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
    
    // Set location from URL if present
    const locationParam = searchParams.get('location');
    if (locationParam) {
      setLocation(locationParam);
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <div className="bg-gray-50 py-6">
          <div className="container mx-auto px-4">
            <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-end">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  type="text" 
                  placeholder="What do you need? (tools, vehicles, electronics...)"
                  className="pl-10 w-full border-gray-200" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  type="text" 
                  placeholder="Your location"
                  className="pl-10 w-full border-gray-200" 
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
              
              <div className="flex-1">
                <DateRangePicker
                  value={dateRange}
                  onChange={setDateRange}
                  placeholder="Select rental dates"
                  className="w-full"
                />
              </div>
              
              <Button className="whitespace-nowrap px-6 bg-needyfy-blue hover:bg-blue-600">
                Search Now
              </Button>
            </div>
          </div>
        </div>
        
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Equipment Categories</h1>
          {selectedCategory && (
            <div className="mb-4">
              <p className="text-lg">
                Showing results for <span className="font-semibold text-needyfy-blue">{selectedCategory}</span>
                {searchQuery && <> matching "<span className="font-semibold">{searchQuery}</span>"</>}
                {location && <> in <span className="font-semibold">{location}</span></>}
                {dateRange?.from && <> for <span className="font-semibold">{dateRange.from.toLocaleDateString()}{dateRange.to ? ` - ${dateRange.to.toLocaleDateString()}` : ''}</span></>}
              </p>
              <Button 
                variant="link" 
                className="text-needyfy-blue p-0" 
                onClick={() => setSelectedCategory('')}
              >
                View all categories
              </Button>
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
            {filteredCategories.map((category) => (
              <div 
                key={category} 
                className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6 cursor-pointer"
                onClick={() => setSelectedCategory(category.toLowerCase())}
              >
                <h3 className="text-xl font-semibold mb-2">{category}</h3>
                <p className="text-gray-600 mb-4">Find high-quality {category.toLowerCase()} equipment for rent.</p>
                <span className="text-needyfy-blue hover:underline">Browse {category} →</span>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Categories;
