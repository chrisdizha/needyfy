
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DateRange } from 'react-day-picker';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { toast } from 'sonner';

const Categories = () => {
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get('search') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by this browser");
      return;
    }

    setIsGettingLocation(true);
    
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo&limit=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted;
              setLocation(address);
              toast.success("Location detected successfully");
            } else {
              const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              setLocation(fallbackAddress);
              toast.success("GPS coordinates detected");
            }
          } else {
            const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            setLocation(fallbackAddress);
            toast.success("GPS coordinates detected");
          }
        } catch (error) {
          console.error("Error getting address:", error);
          toast.error("Could not get address from location");
        } finally {
          setIsGettingLocation(false);
        }
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            toast.error("Location access denied. Please enable location permissions.");
            break;
          case error.POSITION_UNAVAILABLE:
            toast.error("Location information is unavailable.");
            break;
          case error.TIMEOUT:
            toast.error("Location request timed out.");
            break;
          default:
            toast.error("An unknown error occurred while getting location.");
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 60000
      }
    );
  };

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
              
              <div className="flex gap-2 flex-1">
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
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={getCurrentLocation}
                  disabled={isGettingLocation}
                  className="px-3"
                >
                  {isGettingLocation ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <MapPin className="h-4 w-4" />
                  )}
                </Button>
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
