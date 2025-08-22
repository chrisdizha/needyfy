
import { useState, memo, useCallback } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, Heart, MapPin, Lock } from 'lucide-react';
import BookingModal from './BookingModal';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { Link } from 'react-router-dom';

interface EquipmentCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  priceUnit: string;
  image: string;
  location?: string; // Full location for authenticated users
  generalLocation?: string; // Limited location for anonymous users
  rating: number;
  totalRatings: number;
  isVerified?: boolean;
  ownerId?: string; // Only available for authenticated users
}

const OptimizedEquipmentCard = memo(({
  id,
  title,
  category,
  price,
  priceUnit,
  image,
  location,
  generalLocation,
  rating,
  totalRatings,
  isVerified = false,
  ownerId
}: EquipmentCardProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const { user } = useAuth();

  const toggleFavorite = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      // Redirect to login for anonymous users
      window.location.href = '/login';
      return;
    }
    setIsFavorited(prev => !prev);
  }, [user]);

  const openBookingModal = useCallback(() => {
    if (!user) {
      // Redirect to login for anonymous users
      window.location.href = '/login';
      return;
    }
    setIsBookingModalOpen(true);
  }, [user]);

  const closeBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
  }, []);

  const displayLocation = user ? location : generalLocation;
  const showFullDetails = !!user;

  return (
    <>
      <Card className="equipment-card needyfy-shadow overflow-hidden hover:shadow-lg transition-shadow">
        <div className="relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-48 object-cover"
            loading="lazy"
          />
          <Badge className="absolute top-2 left-2 bg-white text-needyfy-blue">
            {category}
          </Badge>
          {isVerified && (
            <Badge className="absolute top-2 right-2 bg-needyfy-green text-white">
              Verified
            </Badge>
          )}
          {!showFullDetails && (
            <div className="absolute top-2 right-2">
              <Badge variant="secondary" className="bg-black/70 text-white">
                <Lock className="h-3 w-3 mr-1" />
                Login to view
              </Badge>
            </div>
          )}
        </div>
        
        <CardContent className="p-4">
          <div className="flex justify-between items-start gap-2">
            <h3 className="font-semibold text-lg mb-1 truncate flex-grow">{title}</h3>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 flex-shrink-0 rounded-full"
              onClick={toggleFavorite}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFavorited ? 'text-red-500 fill-red-500' : 'text-gray-500 hover:text-red-500'
                }`}
              />
            </Button>
          </div>
          
          <div className="flex items-center mb-2 text-sm text-gray-500">
            <MapPin className="h-4 w-4 mr-1" />
            <span className="truncate">{displayLocation}</span>
            {!showFullDetails && (
              <Lock className="h-3 w-3 ml-1 text-gray-400" />
            )}
          </div>
          
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium">{rating}</span>
            </div>
            <span className="mx-1 text-gray-400">•</span>
            <span className="text-sm text-gray-500">{totalRatings} ratings</span>
          </div>

          {!showFullDetails && (
            <div className="mt-3 p-2 bg-blue-50 rounded-lg">
              <p className="text-xs text-blue-700 text-center">
                <Lock className="h-3 w-3 inline mr-1" />
                Sign up to view full details and contact owner
              </p>
            </div>
          )}
        </CardContent>
        
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold">${price}</span>
            <span className="text-sm text-gray-500">/{priceUnit}</span>
          </div>
          
          {showFullDetails ? (
            <Button size="sm" onClick={openBookingModal}>
              Book Now
            </Button>
          ) : (
            <Link to="/register">
              <Button size="sm" variant="outline">
                Sign Up to Book
              </Button>
            </Link>
          )}
        </CardFooter>
      </Card>

      {showFullDetails && isBookingModalOpen && (
        <BookingModal
          isOpen={isBookingModalOpen}
          onClose={closeBookingModal}
          equipment={{
            id,
            title,
            price,
            owner_id: ownerId || 'placeholder'
          }}
        />
      )}
    </>
  );
});

OptimizedEquipmentCard.displayName = 'OptimizedEquipmentCard';

export default OptimizedEquipmentCard;
