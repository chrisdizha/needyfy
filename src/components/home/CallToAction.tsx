
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { useI18n } from '@/hooks/useI18n';

const CallToAction = () => {
  const { t } = useI18n();

  return (
    <section className="relative py-20 bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground overflow-hidden">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-white animate-pulse"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-white animate-pulse delay-1000"></div>
      </div>
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 max-w-6xl mx-auto">
          {/* Rent Equipment */}
          <div className="text-center md:text-left bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 border border-white/20">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('cta.needEquipment')}</h3>
            <p className="mb-6 text-primary-foreground/90 text-lg leading-relaxed">
              {t('cta.needEquipmentDesc')}
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-white text-primary hover:bg-white/90 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold" 
              asChild
            >
              <Link to="/equipment">{t('cta.rentEquipment')}</Link>
            </Button>
          </div>
          
          {/* List Equipment */}
          <div className="text-center md:text-left bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/15 transition-all duration-300 border border-white/20">
            <h3 className="text-2xl md:text-3xl font-bold mb-4">{t('cta.ownEquipment')}</h3>
            <p className="mb-6 text-primary-foreground/90 text-lg leading-relaxed">
              {t('cta.ownEquipmentDesc')}
            </p>
            <Button 
              variant="secondary" 
              size="lg" 
              className="bg-accent text-accent-foreground hover:bg-accent/90 shadow-lg hover:shadow-xl transition-all duration-200 font-semibold" 
              asChild
            >
              <Link to="/equipment/new">{t('cta.listEquipment')}</Link>
            </Button>
          </div>
        </div>
        
        <div className="text-center mt-16 max-w-4xl mx-auto">
          <p className="text-xl md:text-2xl font-semibold mb-8">{t('cta.joinCommunity')}</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-3xl md:text-4xl font-bold mb-2">5,000+</p>
              <p className="text-primary-foreground/90 text-sm font-medium">{t('cta.equipmentItems')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-3xl md:text-4xl font-bold mb-2">2,500+</p>
              <p className="text-primary-foreground/90 text-sm font-medium">{t('cta.providers')}</p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
              <p className="text-3xl md:text-4xl font-bold mb-2">15,000+</p>
              <p className="text-primary-foreground/90 text-sm font-medium">{t('cta.customers')}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CallToAction;
