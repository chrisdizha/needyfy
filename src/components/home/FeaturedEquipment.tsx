
import EquipmentCard from '../equipment/EquipmentCard';
import { Button } from '@/components/ui/button';

// Sample data for featured equipment
const featuredEquipment = [
  {
    id: '1',
    title: 'Ford F-150 Pickup Truck',
    category: 'Truck',
    price: 89,
    priceUnit: 'day',
    image: 'https://images.unsplash.com/photo-1605893477799-b99e3b8b93fe?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    location: 'Chicago, IL',
    rating: 4.8,
    totalRatings: 24,
    isVerified: true
  },
  {
    id: '2',
    title: 'Excavator CAT 320',
    category: 'Construction',
    price: 299,
    priceUnit: 'day',
    image: 'https://images.unsplash.com/photo-1579613832125-5d34a13ffe2a?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    location: 'Dallas, TX',
    rating: 4.7,
    totalRatings: 18,
    isVerified: true
  },
  {
    id: '3',
    title: 'Toyota Camry 2022',
    category: 'Car',
    price: 65,
    priceUnit: 'day',
    image: 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    location: 'New York, NY',
    rating: 4.9,
    totalRatings: 32,
    isVerified: false
  },
  {
    id: '4',
    title: 'Party Tent (40 x 60)',
    category: 'Event',
    price: 199,
    priceUnit: 'day',
    image: 'https://images.unsplash.com/photo-1696639700803-4e0c9ea07553?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
    location: 'Miami, FL',
    rating: 4.6,
    totalRatings: 15,
    isVerified: true
  }
];

const FeaturedEquipment = () => {
  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Equipment</h2>
          <Button variant="ghost" className="text-primary">
            View All
          </Button>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredEquipment.map((item) => (
            <EquipmentCard key={item.id} {...item} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedEquipment;
