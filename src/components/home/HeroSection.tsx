
// Fixed Calendar reference error
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';

const HeroSection = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error("Please enter what you're looking for");
      return;
    }

    // Create date string from dateRange
    const dateString = dateRange?.from && dateRange?.to 
      ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
      : dateRange?.from 
        ? dateRange.from.toLocaleDateString()
        : '';

    // Navigate to categories page with search params
    navigate(`/categories?search=${encodeURIComponent(searchQuery)}${
      location ? `&location=${encodeURIComponent(location)}` : ''
    }${dateString ? `&dates=${encodeURIComponent(dateString)}` : ''}`);
  };

  return (
    <div className="bg-gradient-to-r from-blue-50 via-blue-100 to-blue-50 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-2">
            List. Rent. Earn.
          </h1>
          <h2 className="text-2xl md:text-3xl text-needyfy-blue font-semibold mb-4">
            Everything you need—just when you need it.
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Rent what you need, from tools and vehicles to party supplies. Earn extra income from what you own. It's a smarter, more sustainable way to live and work.
          </p>
          
          <form onSubmit={handleSearch} className="bg-white p-5 rounded-lg shadow-lg max-w-2xl mx-auto">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <Input 
                  type="text" 
                  placeholder="What do you need? (tools, vehicles, electronics...)"
                  className="pl-10 w-full bg-gray-50 border-gray-200" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                    <Input 
                      type="text" 
                      placeholder="Your location"
                      className="pl-10 w-full bg-gray-50 border-gray-200" 
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
                    className="px-3 bg-gray-50"
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
                <Button 
                  type="submit" 
                  className="whitespace-nowrap px-6 bg-needyfy-blue hover:bg-blue-600"
                >
                  Search Now
                </Button>
              </div>
            </div>
          </form>
          
          <div className="mt-8">
            <p className="text-gray-600 mb-3">Top categories:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Construction", "Vehicles", "Electronics", "Event Equipment", "Home & Garden", "Photography"].map((category) => (
                <Button 
                  key={category}
                  variant="outline" 
                  className="rounded-full bg-white hover:bg-needyfy-blue hover:text-white"
                  onClick={() => navigate(`/categories?category=${encodeURIComponent(category.toLowerCase())}`)}
                >
                  {category}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
