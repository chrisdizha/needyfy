
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
      toast.error("Please enter what you're looking for");
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
    <div className="bg-gradient-to-r from-primary/5 via-primary/10 to-accent/5 py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-2">
            {t('hero.title')}
          </h1>
          <h2 className="text-2xl md:text-3xl text-primary font-semibold mb-4">
            Everything you need—just when you need it.
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            {t('hero.subtitle')}
          </p>
          
          <form onSubmit={handleSearch} className="bg-card p-5 rounded-lg shadow-lg max-w-2xl mx-auto border">
            <div className="flex flex-col space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
                <Input 
                  type="text" 
                  placeholder={t('hero.searchPlaceholder')}
                  className="pl-10 w-full" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <LocationPicker
                    value={location}
                    onChange={setLocation}
                    placeholder="Your location"
                  />
                </div>
                <div className="flex-1">
                  <DateRangePicker
                    value={dateRange}
                    onChange={setDateRange}
                    placeholder="Select rental dates"
                    className="w-full"
                  />
                </div>
                <Button 
                  type="submit" 
                  className="whitespace-nowrap px-6"
                >
                  {t('common.search')}
                </Button>
              </div>
            </div>
          </form>
          
          <div className="mt-8">
            <p className="text-muted-foreground mb-3">Top categories:</p>
            <div className="flex flex-wrap justify-center gap-3">
              {["Construction", "Vehicles", "Electronics", "Event Equipment", "Home & Garden", "Photography"].map((category) => (
                <Button 
                  key={category}
                  variant="outline" 
                  className="rounded-full hover:bg-primary hover:text-primary-foreground"
                  onClick={() => handleCategoryClick(category)}
                >
                  {category}
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
