import { memo, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import OptimizedEquipmentCard from '../equipment/OptimizedEquipmentCard';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { Link } from 'react-router-dom';
import type { EquipmentListing, PublicEquipmentPreview } from '@/hooks/useEquipmentListings';

const OptimizedFeaturedEquipment = memo(() => {
  const { user } = useAuth();
  
  const { data: equipment, isLoading } = useQuery({
    queryKey: ['featured-equipment', user ? 'authenticated' : 'public'],
    queryFn: async () => {
      if (user) {
        // Authenticated users get full equipment details
        const { data, error } = await supabase
          .from('equipment_listings')
          .select('*')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        return data as EquipmentListing[];
      } else {
        // Anonymous users get limited preview data
        const { data, error } = await supabase
          .from('equipment_listings')
          .select('id, title, category, price, price_unit, photos, rating, total_ratings, is_verified, location, created_at')
          .eq('status', 'active')
          .order('created_at', { ascending: false })
          .limit(4);

        if (error) throw error;
        
        // Transform the data to match PublicEquipmentPreview format
        return data?.map(item => ({
          id: item.id,
          title: item.title,
          category: item.category,
          price: item.price,
          price_unit: item.price_unit,
          photos: item.photos ? [item.photos[0]] : [],
          rating: item.rating || 0,
          total_ratings: item.total_ratings || 0,
          is_verified: item.is_verified || false,
          general_location: item.location ? 
            item.location.split(',')[0] + ', ' + item.location.split(',').slice(-1)[0] : 
            'Location not specified',
          created_at: item.created_at
        })) as PublicEquipmentPreview[];
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  const loadingSkeletons = useMemo(() => 
    [1, 2, 3, 4].map((i) => (
      <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
        <div className="h-48 bg-gray-300 rounded mb-4"></div>
        <div className="h-4 bg-gray-300 rounded mb-2"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      </div>
    )),
    []
  );

  const equipmentCards = useMemo(() => {
    if (!equipment || equipment.length === 0) return null;
    
    return equipment.map((item) => {
      // Type-safe access to properties based on user authentication
      if (user) {
        const fullItem = item as EquipmentListing;
        return (
          <OptimizedEquipmentCard 
            key={fullItem.id} 
            id={fullItem.id}
            title={fullItem.title}
            category={fullItem.category}
            price={fullItem.price}
            priceUnit={fullItem.price_unit}
            image={fullItem.photos?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
            location={fullItem.location}
            rating={fullItem.rating || 0}
            totalRatings={fullItem.total_ratings || 0}
            isVerified={fullItem.is_verified || false}
            ownerId={fullItem.owner_id}
          />
        );
      } else {
        const previewItem = item as PublicEquipmentPreview;
        return (
          <OptimizedEquipmentCard 
            key={previewItem.id} 
            id={previewItem.id}
            title={previewItem.title}
            category={previewItem.category}
            price={previewItem.price}
            priceUnit={previewItem.price_unit}
            image={previewItem.photos?.[0] || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80'}
            generalLocation={previewItem.general_location}
            rating={previewItem.rating || 0}
            totalRatings={previewItem.total_ratings || 0}
            isVerified={previewItem.is_verified || false}
          />
        );
      }
    });
  }, [equipment, user]);

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-800">Featured Equipment</h2>
          <Button variant="ghost" className="text-primary">
            View All
          </Button>
        </div>
        
        {!user && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-blue-900">See full details and book equipment</h3>
                <p className="text-sm text-blue-700">Sign up to view exact locations, contact owners, and make bookings</p>
              </div>
              <div className="flex gap-2">
                <Link to="/login">
                  <Button variant="outline" size="sm">Login</Button>
                </Link>
                <Link to="/register">
                  <Button size="sm">Sign Up</Button>
                </Link>
              </div>
            </div>
          </div>
        )}
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {loadingSkeletons}
          </div>
        ) : equipmentCards ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {equipmentCards}
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
            <Link to="/list-equipment">
              <Button variant="default">List Your Equipment</Button>
            </Link>
          </div>
        )}
      </div>
    </section>
  );
});

OptimizedFeaturedEquipment.displayName = 'OptimizedFeaturedEquipment';

export default OptimizedFeaturedEquipment;
