
import { useAuth } from '@/contexts/OptimizedAuthContext';
import { useSearchParams } from 'react-router-dom';
import Footer from '@/components/layout/Footer';
import { useI18n } from '@/hooks/useI18n';
import { SafeLink } from '@/components/navigation/SafeLink';

const Equipment = () => {
  const { loading } = useAuth();
  const [searchParams] = useSearchParams();
  const { t } = useI18n();
  
  const category = searchParams.get('category');

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const getCategoryTitle = () => {
    if (!category) return t('equipment.allEquipment');
    
    const categoryMap: { [key: string]: string } = {
      'trucks-trailers': t('categories.trucksTrailers'),
      'cars-vehicles': t('categories.carsVehicles'),
      'construction': t('categories.construction'),
      'event-party': t('categories.eventParty'),
      'electronics': t('categories.electronics'),
      'home-garden': t('categories.homeGarden'),
      'photography': t('categories.photography'),
      'sports-outdoor': t('categories.sportsOutdoor'),
    };
    
    return categoryMap[category] || t('equipment.categoryEquipment', { category });
  };

  const getCategoryMessage = () => {
    if (!category) return t('equipment.allListingsMessage');
    
    const categoryMap: { [key: string]: string } = {
      'trucks-trailers': t('equipment.trucksTrailersMessage'),
      'cars-vehicles': t('equipment.carsVehiclesMessage'),
      'construction': t('equipment.constructionMessage'),
      'event-party': t('equipment.eventPartyMessage'),
      'electronics': t('equipment.electronicsMessage'),
      'home-garden': t('equipment.homeGardenMessage'),
      'photography': t('equipment.photographyMessage'),
      'sports-outdoor': t('equipment.sportsOutdoorMessage'),
    };
    
    return categoryMap[category] || t('equipment.categoryListingsMessage', { category: getCategoryTitle() });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6">
          <nav className="text-sm text-muted-foreground mb-4">
            <SafeLink to="/" className="hover:text-primary">{t('common.home')}</SafeLink>
            <span className="mx-2">&gt;</span>
            <SafeLink to="/categories" className="hover:text-primary">{t('nav.categories')}</SafeLink>
            {category && (
              <>
                <span className="mx-2">&gt;</span>
                <span className="text-foreground">{getCategoryTitle()}</span>
              </>
            )}
          </nav>
        </div>
        
        <h1 className="text-3xl font-bold mb-8 text-foreground">{getCategoryTitle()}</h1>
        
        <div className="text-center py-16">
          <div className="max-w-md mx-auto">
            <div className="mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                <svg className="w-8 h-8 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8l-2 2m0 0l-2-2m2 2v6" />
                </svg>
              </div>
              <p className="text-lg text-muted-foreground">{getCategoryMessage()}</p>
            </div>
            <p className="text-sm text-muted-foreground mb-6">
              {t('equipment.noListingsHelp')}
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Equipment;
