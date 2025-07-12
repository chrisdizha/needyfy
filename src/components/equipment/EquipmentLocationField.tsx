
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface EquipmentLocationFieldProps {
  location: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const EquipmentLocationField = ({ location, onChange }: EquipmentLocationFieldProps) => {
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
                const syntheticEvent = {
                  target: { name: "location", value: address }
                } as React.ChangeEvent<HTMLInputElement>;
                onChange(syntheticEvent);
                toast.success("Location detected successfully");
                return;
              }
            }
          } catch (geocodeError) {
            console.log("Geocoding failed, using coordinates");
          }
          
          // Fallback to coordinates
          const coordinatesAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
          const syntheticEvent = {
            target: { name: "location", value: coordinatesAddress }
          } as React.ChangeEvent<HTMLInputElement>;
          onChange(syntheticEvent);
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

  return (
    <div>
      <label htmlFor="location" className="block text-sm font-medium mb-1">
        Location <span className="text-destructive">*</span>
      </label>
      <div className="flex gap-2">
        <Input
          id="location"
          name="location"
          placeholder="Enter city, state or zip code"
          value={location}
          onChange={onChange}
          required
          className="flex-1"
        />
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
    </div>
  );
};

export default EquipmentLocationField;
