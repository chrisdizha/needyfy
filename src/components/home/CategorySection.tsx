
import { Card, CardContent } from '@/components/ui/card';
import { Truck, Car, Package, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  className?: string;
}

const CategoryCard = ({ title, description, icon, className }: CategoryCardProps) => (
  <Card className={cn("equipment-card needyfy-shadow cursor-pointer overflow-hidden", className)}>
    <CardContent className="p-6 flex flex-col items-center text-center">
      <div className="mb-4 p-3 rounded-full bg-primary/10">
        {icon}
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      <p className="text-sm text-gray-500">{description}</p>
    </CardContent>
  </Card>
);

const CategorySection = () => {
  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-3">Popular Equipment Categories</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through the most popular categories or search for specific equipment
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <CategoryCard 
            title="Trucks & Trailers" 
            description="Moving trucks, flatbeds, and specialized trailers"
            icon={<Truck className="h-8 w-8 text-needyfy-blue" />}
          />
          <CategoryCard 
            title="Cars & Vehicles" 
            description="Cars, vans, and specialty vehicles for every need"
            icon={<Car className="h-8 w-8 text-needyfy-blue" />}
          />
          <CategoryCard 
            title="Construction Equipment" 
            description="Excavators, loaders, and construction tools"
            icon={<Package className="h-8 w-8 text-needyfy-blue" />}
          />
          <CategoryCard 
            title="Event & Party" 
            description="Everything for your next party or special event"
            icon={<Calendar className="h-8 w-8 text-needyfy-blue" />}
          />
        </div>
        
        <div className="text-center mt-10">
          <a href="/categories" className="text-primary hover:underline font-medium inline-flex items-center">
            Browse All Categories
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
