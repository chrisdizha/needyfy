
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
          
          // Try using the browser's built-in reverse geocoding if available
          // Otherwise fall back to coordinates
          try {
            // Use a CORS-friendly geocoding service or fall back to coordinates
            const response = await fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
              {
                headers: {
                  'User-Agent': 'Needyfy App'
                }
              }
            );
            
            if (response.ok) {
              const data = await response.json();
              if (data && data.display_name) {
                // Extract city and country from the address
                const addressParts = data.display_name.split(',');
                const city = addressParts[0]?.trim();
                const country = addressParts[addressParts.length - 1]?.trim();
                const address = city && country ? `${city}, ${country}` : data.display_name;
                setLocation(address);
                toast.success("Location detected successfully");
                return;
              }
            }
          } catch (geocodeError) {
            console.log("Geocoding failed, using coordinates");
          }
          
          // Fallback to coordinates
          const coordinatesAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          setLocation(coordinatesAddress);
          toast.success("GPS coordinates detected");
        } catch (error) {
          console.error("Error getting location:", error);
          toast.error("Could not get location");
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
    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
            List. Rent. Earn.
          </h1>
          <h2 className="text-2xl md:text-3xl text-primary font-semibold mb-4">
            Everything you need—just when you need it.
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Rent what you need, from tools and vehicles to party supplies. Earn extra income from what you own. It's a smarter, more sustainable way to live and work.
          </p>
          
          <form onSubmit={handleSearch} className="bg-card p-5 rounded-lg shadow-lg max-w-2xl mx-auto border">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  type="text" 
                  placeholder="What do you need? (tools, vehicles, electronics...)"
                  className="pl-10 w-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex gap-2 flex-1">
                  <div className="relative flex-1">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                    <Input 
                      type="text" 
                      placeholder="Your location"
                      className="pl-10 w-full" 
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
                <Button 
                  type="submit" 
                  className="whitespace-nowrap px-6"
                >
                  Search Now
                </Button>
              </div>
            </div>
          </form>
          
          <div className="mt-8">
            <p className="text-muted-foreground mb-3">Top categories:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Construction", "Vehicles", "Electronics", "Event Equipment", "Home & Garden", "Photography"].map((category) => (
                <Button 
                  key={category}
                  variant="outline" 
                  className="rounded-full hover:bg-primary hover:text-primary-foreground"
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
