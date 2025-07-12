
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
          
          // Use reverse geocoding to get address
          const response = await fetch(
            `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=demo&limit=1`
          );
          
          if (response.ok) {
            const data = await response.json();
            if (data.results && data.results.length > 0) {
              const address = data.results[0].formatted;
              const syntheticEvent = {
                target: { name: "location", value: address }
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent);
              toast.success("Location detected successfully");
            } else {
              const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
              const syntheticEvent = {
                target: { name: "location", value: fallbackAddress }
              } as React.ChangeEvent<HTMLInputElement>;
              onChange(syntheticEvent);
              toast.success("GPS coordinates detected");
            }
          } else {
            const fallbackAddress = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            const syntheticEvent = {
              target: { name: "location", value: fallbackAddress }
            } as React.ChangeEvent<HTMLInputElement>;
            onChange(syntheticEvent);
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
