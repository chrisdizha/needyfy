
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface LocationPickerProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  countryCode?: string;
}

interface LocationSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    country?: string;
  };
}

const LocationPicker = ({ value, onChange, placeholder = "Enter your location", countryCode }: LocationPickerProps) => {
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<LocationSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);

  const formatAddress = (suggestion: LocationSuggestion) => {
    const { address } = suggestion;
    const city = address.city || address.town || address.village;
    const parts = [city, address.state, address.country].filter(Boolean);
    return parts.join(', ');
  };

  const searchLocations = async (query: string) => {
    if (query.length < 3) {
      setSuggestions([]);
      return;
    }

    try {
      const countryFilter = countryCode ? `&countrycodes=${countryCode}` : '';
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&addressdetails=1${countryFilter}`,
        {
          headers: {
            'User-Agent': 'Needyfy App'
          }
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setSuggestions(data);
        setShowSuggestions(true);
      }
    } catch (error) {
      console.error('Location search error:', error);
    }
  };

  const handleInputChange = (inputValue: string) => {
    onChange(inputValue);
    
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    const timeout = setTimeout(() => {
      searchLocations(inputValue);
    }, 300);
    
    setSearchTimeout(timeout);
  };

  const selectSuggestion = (suggestion: LocationSuggestion) => {
    const formattedAddress = formatAddress(suggestion);
    onChange(formattedAddress);
    setSuggestions([]);
    setShowSuggestions(false);
  };

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
          
          const countryFilter = countryCode ? `&countrycodes=${countryCode}` : '';
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1${countryFilter}`,
            {
              headers: {
                'User-Agent': 'Needyfy App'
              }
            }
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data && data.address) {
              const { address } = data;
              const city = address.city || address.town || address.village || address.suburb;
              const state = address.state || address.region;
              const country = address.country;
              
              const formattedAddress = [city, state, country].filter(Boolean).join(', ');
              onChange(formattedAddress);
              toast.success("Location detected successfully");
            } else {
              const coordinatesAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              onChange(coordinatesAddress);
              toast.success("GPS coordinates detected");
            }
          } else {
            throw new Error('Geocoding service unavailable');
          }
        } catch (error) {
          console.error("Error getting location:", error);
          toast.error("Could not get location details");
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
    <div className="relative">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder={placeholder}
            className="pl-10"
            value={value}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowSuggestions(suggestions.length > 0)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
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
            <Globe className="h-4 w-4" />
          )}
        </Button>
      </div>
      
      {showSuggestions && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-background border rounded-md shadow-lg max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, index) => (
            <div
              key={index}
              className="p-3 hover:bg-muted cursor-pointer border-b last:border-b-0"
              onClick={() => selectSuggestion(suggestion)}
            >
              <div className="font-medium">{formatAddress(suggestion)}</div>
              <div className="text-sm text-muted-foreground truncate">
                {suggestion.display_name}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LocationPicker;
