
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MapPin, Loader2, Globe } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

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
      const { data, error } = await supabase.functions.invoke('geocoding', {
        body: {
          type: 'search',
          query,
          countryCode
        }
      });

      if (error) {
        console.error('Location search error:', error);
        toast.error('Unable to search locations. Please try again.');
        return;
      }

      if (data.success) {
        setSuggestions(data.data);
        setShowSuggestions(true);
      } else {
        console.error('Geocoding error:', data.error);
        toast.error('Location search failed. Please try again.');
      }
    } catch (error) {
      console.error('Location search error:', error);
      toast.error('Unable to search locations. Please try again.');
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
          
          const { data, error } = await supabase.functions.invoke('geocoding', {
            body: {
              type: 'reverse',
              latitude,
              longitude,
              countryCode
            }
          });

          if (error) {
            console.error("Geocoding service error:", error);
            // Fallback to coordinates if service fails
            const coordinatesAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            onChange(coordinatesAddress);
            toast.success("GPS coordinates detected (address lookup unavailable)");
            return;
          }

          if (data.success) {
            onChange(data.address);
            if (data.fallback) {
              toast.success("GPS coordinates detected (address not found)");
            } else {
              toast.success("Location detected successfully");
            }
          } else {
            throw new Error(data.error || 'Unknown geocoding error');
          }
        } catch (error) {
          console.error("Error getting location:", error);
          // Final fallback: use coordinates
          const { latitude, longitude } = position.coords;
          const coordinatesAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          onChange(coordinatesAddress);
          toast.success("GPS coordinates detected (address lookup failed)");
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
