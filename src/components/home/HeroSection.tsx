
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useNavigate } from 'react-router-dom';
import { toast } from "sonner";
import { DateRange } from 'react-day-picker';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import LocationPicker from '@/components/location/LocationPicker';
import { useI18n } from '@/hooks/useI18n';

const HeroSection = () => {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState('');
  const [dateRange, setDateRange] = useState<DateRange | undefined>();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      toast.error(t('errors.searchRequired'));
      return;
    }

    const dateString = dateRange?.from && dateRange?.to 
      ? `${dateRange.from.toLocaleDateString()} - ${dateRange.to.toLocaleDateString()}`
      : dateRange?.from 
        ? dateRange.from.toLocaleDateString()
        : '';

    navigate(`/equipment?search=${encodeURIComponent(searchQuery)}${
      location ? `&location=${encodeURIComponent(location)}` : ''
    }${dateString ? `&dates=${encodeURIComponent(dateString)}` : ''}`);
  };

  const handleCategoryClick = (category: string) => {
    navigate(`/equipment?category=${encodeURIComponent(category.toLowerCase())}`);
  };

  return (
    <div className="relative bg-gradient-to-br from-primary/5 via-primary/10 to-accent/5 py-16 md:py-24 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-xl animate-pulse"></div>
        <div className="absolute bottom-0 right-1/4 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-xl animate-pulse delay-700"></div>
      </div>

      {/* Hero Image - People-focused */}
      <div className="absolute inset-0 opacity-10">
        <div 
          className="w-full h-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80')`
          }}
        />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-primary mb-6 leading-tight font-poppins">
            {t('hero.tagline')}
          </h1>
          <h2 className="text-2xl md:text-3xl lg:text-4xl text-foreground font-semibold mb-8 tracking-wide font-poppins">
            {t('hero.subtitle')}
          </h2>
          
          <form onSubmit={handleSearch} className="bg-card/95 backdrop-blur-sm p-6 rounded-2xl shadow-xl max-w-3xl mx-auto border border-border/20">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  type="text" 
                  placeholder={t('hero.searchPlaceholder')}
                  className="pl-10 w-full h-12 text-base border-2 border-border/20 focus:border-primary/50 rounded-lg" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <LocationPicker
                    value={location}
                    onChange={setLocation}
                    placeholder={t('hero.locationPlaceholder')}
                  />
                </div>
                <div className="flex-1">
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder={t('hero.datesPlaceholder')}
                    className="w-full h-12 border-2 border-border/20 focus:border-primary/50 rounded-lg"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="whitespace-nowrap px-8 h-12 text-base font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                >
                  {t('common.search')}
                </Button>
              </div>
            </div>
          </form>
          
          <div className="mt-10">
            <p className="text-muted-foreground mb-4 text-sm font-medium">{t('hero.topCategories')}</p>
            <div className="flex flex-wrap justify-center gap-3">
              {[
                { key: 'construction', label: t('categories.construction') },
                { key: 'vehicles', label: t('categories.vehicles') },
                { key: 'electronics', label: t('categories.electronics') },
                { key: 'eventEquipment', label: t('categories.eventEquipment') },
                { key: 'homeGarden', label: t('categories.homeGarden') },
                { key: 'photography', label: t('categories.photography') }
              ].map((category) => (
                <Button 
                  key={category.key}
                  variant="outline" 
                  className="rounded-full hover:bg-primary hover:text-primary-foreground transition-all duration-200 border-2 border-border/30 hover:border-primary/50 font-medium"
                  onClick={() => handleCategoryClick(category.key)}
                >
                  {category.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
