
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Car, Package, Calendar } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18n';
import { useNavigate } from 'react-router-dom';

interface CategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  backgroundImage?: string;
  className?: string;
  onClick?: () => void;
}

const CategoryCard = ({ title, description, icon, backgroundImage, className, onClick }: CategoryCardProps) => (
  <Card 
    className={cn(
      "equipment-card needyfy-shadow cursor-pointer overflow-hidden group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-border/20 hover:border-primary/20", 
      className
    )}
    onClick={onClick}
  >
    <div className="relative h-48 overflow-hidden">
      {backgroundImage && (
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-300 group-hover:scale-105"
          style={{ backgroundImage: `url(${backgroundImage})` }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      <div className="absolute bottom-4 left-4 right-4 text-white">
        <div className="flex items-center gap-2 mb-2">
          <div className="p-2 rounded-full bg-white/20 backdrop-blur-sm">
            {icon}
          </div>
          <h3 className="text-lg font-semibold">{title}</h3>
        </div>
        <p className="text-sm text-white/90 line-clamp-2">{description}</p>
      </div>
    </div>
  </Card>
);

const CategorySection = () => {
  const { t } = useI18n();
  const navigate = useNavigate();

  const handleCategoryClick = (category: string) => {
    navigate(`/equipment?category=${encodeURIComponent(category.toLowerCase())}`);
  };

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{t('categories.popularCategories')}</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {t('categories.browseCategoriesDesc')}
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <CategoryCard 
            title={t('categories.trucksTrailers')} 
            description={t('categories.trucksTrailersDesc')}
            icon={<Truck className="h-6 w-6 text-white" />}
            backgroundImage="https://images.unsplash.com/photo-1605810230434-7631ac76ec81?auto=format&fit=crop&w=400&q=80"
            onClick={() => handleCategoryClick('trucks-trailers')}
          />
          <CategoryCard 
            title={t('categories.carsVehicles')} 
            description={t('categories.carsVehiclesDesc')}
            icon={<Car className="h-6 w-6 text-white" />}
            backgroundImage="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=400&q=80"
            onClick={() => handleCategoryClick('cars-vehicles')}
          />
          <CategoryCard 
            title={t('categories.constructionEquipment')} 
            description={t('categories.constructionEquipmentDesc')}
            icon={<Package className="h-6 w-6 text-white" />}
            backgroundImage="https://images.unsplash.com/photo-1581090464777-f3220bbe1b8b?auto=format&fit=crop&w=400&q=80"
            onClick={() => handleCategoryClick('construction')}
          />
          <CategoryCard 
            title={t('categories.eventParty')} 
            description={t('categories.eventPartyDesc')}
            icon={<Calendar className="h-6 w-6 text-white" />}
            backgroundImage="https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?auto=format&fit=crop&w=400&q=80"
            onClick={() => handleCategoryClick('event-party')}
          />
        </div>
        
        <div className="text-center mt-12">
          <Button 
            variant="outline" 
            size="lg"
            className="font-medium hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-2 border-border/30 hover:border-primary/50"
            onClick={() => navigate('/categories')}
          >
            {t('nav.browseAll')}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Button>
        </div>
      </div>
    </section>
  );
};

export default CategorySection;
