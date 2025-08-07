import React, { memo, useState, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Heart, MapPin, Star } from 'lucide-react';
import BookingModal from '@/components/equipment/BookingModal';
import { usePerformanceMonitor } from '@/hooks/usePerformanceMonitor';

interface OptimizedEquipmentCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  priceUnit: string;
  image?: string;
  location: string;
  rating?: number;
  totalRatings?: number;
  isVerified?: boolean;
}

// Memoized internal components
const EquipmentImage = memo(({ image, title }: { image?: string; title: string }) => (
  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
    <img
      src={image || '/placeholder.svg'}
      alt={title}
      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
      loading="lazy"
      decoding="async"
    />
  </div>
));

const EquipmentDetails = memo(({ 
  category, 
  isVerified, 
  title, 
  location, 
  rating, 
  totalRatings 
}: {
  category: string;
  isVerified?: boolean;
  title: string;
  location: string;
  rating?: number;
  totalRatings?: number;
}) => (
  <>
    <div className="flex items-center justify-between">
      <Badge variant="secondary" className="text-xs">
        {category}
      </Badge>
      {isVerified && (
        <Badge variant="default" className="text-xs">
          Verified
        </Badge>
      )}
    </div>
    
    <h3 className="font-semibold text-lg line-clamp-2">{title}</h3>
    
    <div className="flex items-center text-sm text-muted-foreground">
      <MapPin className="h-3 w-3 mr-1" />
      <span className="truncate">{location}</span>
    </div>
    
    {rating && totalRatings && (
      <div className="flex items-center">
        <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
        <span className="ml-1 text-sm">
          {rating.toFixed(1)} ({totalRatings})
        </span>
      </div>
    )}
  </>
));

const EquipmentActions = memo(({ 
  price, 
  priceUnit, 
  onBook, 
  onToggleFavorite, 
  isFavorited 
}: {
  price: number;
  priceUnit: string;
  onBook: () => void;
  onToggleFavorite: () => void;
  isFavorited: boolean;
}) => (
  <div className="flex items-center justify-between">
    <div className="flex flex-col">
      <span className="text-2xl font-bold">${price}</span>
      <span className="text-sm text-muted-foreground">per {priceUnit}</span>
    </div>
    
    <div className="flex space-x-2">
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleFavorite}
        className="h-9 w-9 p-0"
      >
        <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
      </Button>
      <Button onClick={onBook} size="sm">
        Book Now
      </Button>
    </div>
  </div>
));

const OptimizedEquipmentCard = memo(({
  id,
  title,
  category,
  price,
  priceUnit,
  image,
  location,
  rating,
  totalRatings,
  isVerified = false,
}: OptimizedEquipmentCardProps) => {
  usePerformanceMonitor('OptimizedEquipmentCard');
  
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);

  const toggleFavorite = useCallback(() => {
    setIsFavorited(prev => !prev);
  }, []);

  const openBookingModal = useCallback(() => {
    setIsBookingModalOpen(true);
  }, []);

  const closeBookingModal = useCallback(() => {
    setIsBookingModalOpen(false);
  }, []);

  return (
    <>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
        <EquipmentImage image={image} title={title} />
        
        <CardContent className="p-4 space-y-3">
          <EquipmentDetails
            category={category}
            isVerified={isVerified}
            title={title}
            location={location}
            rating={rating}
            totalRatings={totalRatings}
          />
          
          <EquipmentActions
            price={price}
            priceUnit={priceUnit}
            onBook={openBookingModal}
            onToggleFavorite={toggleFavorite}
            isFavorited={isFavorited}
          />
        </CardContent>
      </Card>

      {isBookingModalOpen && (
        <BookingModal
          equipmentId={id}
          equipmentTitle={title}
          pricePerDay={price}
          isOpen={isBookingModalOpen}
          onClose={closeBookingModal}
        />
      )}
    </>
  );
});

OptimizedEquipmentCard.displayName = 'OptimizedEquipmentCard';
EquipmentImage.displayName = 'EquipmentImage';
EquipmentDetails.displayName = 'EquipmentDetails';
EquipmentActions.displayName = 'EquipmentActions';

export default OptimizedEquipmentCard;