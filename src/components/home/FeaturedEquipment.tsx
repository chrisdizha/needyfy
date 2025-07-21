
import { useQuery } from '@tanstack/react-query';
import EquipmentCard from '../equipment/EquipmentCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const FeaturedEquipment = () => {
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['featured-equipment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_listings')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false })
        .limit(4);

      if (error) throw error;
      return data || [];
    },
  });

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Equipment</h2>
          <Button variant="ghost" className="text-primary">
            View All
          </Button>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
                <div className="h-48 bg-gray-300 rounded mb-4"></div>
                <div className="h-4 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        ) : equipment && equipment.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipment.map((item) => (
              <EquipmentCard 
                key={item.id} 
                id={item.id}
                title={item.title}
                category={item.category}
                price={item.price}
                priceUnit={item.price_unit}
                image={item.photos?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
                location={item.location}
                rating={item.rating || 0}
                totalRatings={item.total_ratings || 0}
                isVerified={item.is_verified || false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Equipment Available Yet</h3>
            <p className="text-gray-500 mb-4">Be the first to list your equipment and start earning!</p>
            <Button variant="default">List Your Equipment</Button>
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedEquipment;
