
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Car, Package, Calendar, Smartphone, Hammer, Camera, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18n } from '@/hooks/useI18n';
import { useNavigate } from 'react-router-dom';

// Import category images
import electronicsImage from '@/assets/electronics-category.jpg';
import homeGardenImage from '@/assets/home-garden-category.jpg';
import photographyImage from '@/assets/photography-category.jpg';
import sportsOutdoorImage from '@/assets/sports-outdoor-category.jpg';

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
            backgroundImage="/lovable-uploads/e541a522-5621-43ff-b544-3e118a24a424.png"
            onClick={() => handleCategoryClick('trucks-trailers')}
          />
          <CategoryCard 
            title={t('categories.carsVehicles')} 
            description={t('categories.carsVehiclesDesc')}
            icon={<Car className="h-6 w-6 text-white" />}
            backgroundImage="/lovable-uploads/4bda1892-294b-4f88-b51a-cc6d5cad44c6.png"
            onClick={() => handleCategoryClick('cars-vehicles')}
          />
          <CategoryCard 
            title={t('categories.constructionEquipment')} 
            description={t('categories.constructionEquipmentDesc')}
            icon={<Package className="h-6 w-6 text-white" />}
            backgroundImage="/lovable-uploads/fa6c0da4-be4d-4f57-9de8-cb1b0214f84f.png"
            onClick={() => handleCategoryClick('construction')}
          />
          <CategoryCard 
            title={t('categories.eventParty')} 
            description={t('categories.eventPartyDesc')}
            icon={<Calendar className="h-6 w-6 text-white" />}
            backgroundImage="/lovable-uploads/2e78ef83-a8b0-44af-a9b3-f691e46d14a1.png"
            onClick={() => handleCategoryClick('event-party')}
          />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-6">
          <CategoryCard 
            title={t('categories.electronics')} 
            description={t('categories.electronicsDesc')}
            icon={<Smartphone className="h-6 w-6 text-white" />}
            backgroundImage={electronicsImage}
            onClick={() => handleCategoryClick('electronics')}
          />
          <CategoryCard 
            title={t('categories.homeGarden')} 
            description={t('categories.homeGardenDesc')}
            icon={<Hammer className="h-6 w-6 text-white" />}
            backgroundImage={homeGardenImage}
            onClick={() => handleCategoryClick('home-garden')}
          />
          <CategoryCard 
            title={t('categories.photography')} 
            description={t('categories.photographyDesc')}
            icon={<Camera className="h-6 w-6 text-white" />}
            backgroundImage={photographyImage}
            onClick={() => handleCategoryClick('photography')}
          />
          <CategoryCard 
            title={t('categories.sportsOutdoor')} 
            description={t('categories.sportsOutdoorDesc')}
            icon={<Bike className="h-6 w-6 text-white" />}
            backgroundImage={sportsOutdoorImage}
            onClick={() => handleCategoryClick('sports-outdoor')}
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
