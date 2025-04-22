
import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star } from 'lucide-react';
import BookingModal from './BookingModal';

interface EquipmentCardProps {
  id: string;
  title: string;
  category: string;
  price: number;
  priceUnit: string;
  image: string;
  location: string;
  rating: number;
  totalRatings: number;
  isVerified?: boolean;
}

const EquipmentCard = ({
  id,
  title,
  category,
  price,
  priceUnit,
  image,
  location,
  rating,
  totalRatings,
  isVerified = false
}: EquipmentCardProps) => {
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  return (
    <>
      <Card className="equipment-card needyfy-shadow overflow-hidden">
        <div className="relative">
          <img 
            src={image} 
            alt={title} 
            className="w-full h-48 object-cover"
          />
          <Badge className="absolute top-2 left-2 bg-white text-needyfy-blue">
            {category}
          </Badge>
          {isVerified && (
            <Badge className="absolute top-2 right-2 bg-needyfy-green text-white">
              Verified
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-lg mb-1 truncate">{title}</h3>
          <p className="text-sm text-gray-500 mb-2">{location}</p>
          <div className="flex items-center mb-2">
            <div className="flex items-center">
              <Star className="h-4 w-4 text-yellow-400 fill-current" />
              <span className="ml-1 text-sm font-medium">{rating}</span>
            </div>
            <span className="mx-1 text-gray-400">•</span>
            <span className="text-sm text-gray-500">{totalRatings} ratings</span>
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex items-center justify-between">
          <div>
            <span className="text-lg font-bold">${price}</span>
            <span className="text-sm text-gray-500">/{priceUnit}</span>
          </div>
          <Button size="sm" onClick={() => setIsBookingModalOpen(true)}>
            Book Now
          </Button>
        </CardFooter>
      </Card>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        equipmentTitle={title}
        equipmentId={id}
        pricePerDay={price}
      />
    </>
  );
};

export default EquipmentCard;
