
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedEquipment from '@/components/home/FeaturedEquipment';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import UserFeatures from '@/components/home/UserFeatures';
import ProviderFeatures from '@/components/home/ProviderFeatures';
import AppAnnouncementBanner from '@/components/home/AppAnnouncementBanner';
import { useSEO, generateOrganizationStructuredData } from '@/hooks/useSEO';

const Index = () => {
  // SEO optimization for authenticated homepage
  useSEO({
    title: 'Dashboard - Needyfy | Your Equipment Rental Hub',
    description: 'Welcome to your Needyfy dashboard. Manage your rentals, bookings, and discover new equipment near you.',
    keywords: [
      'dashboard',
      'equipment rental',
      'my rentals',
      'bookings',
      'needyfy'
    ],
    ogTitle: 'Needyfy Dashboard',
    ogDescription: 'Your personal equipment rental hub',
    canonical: `${window.location.origin}/`,
    structuredData: generateOrganizationStructuredData()
  });

  return (
    <main className="flex-grow">
      <HeroSection />
      <CategorySection />
      <FeaturedEquipment />
      <HowItWorks />
      <UserFeatures />
      <ProviderFeatures />
      <Testimonials />
      <AppAnnouncementBanner />
      <CallToAction />
    </main>
  );
};

export default Index;
