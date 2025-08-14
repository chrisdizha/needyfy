
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedEquipment from '@/components/home/FeaturedEquipment';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';
import UserFeatures from '@/components/home/UserFeatures';
import ProviderFeatures from '@/components/home/ProviderFeatures';
import AppAnnouncementBanner from '@/components/home/AppAnnouncementBanner';
import AddToHomePrompt from '@/components/pwa/AddToHomePrompt';

const AuthenticatedHome = () => {
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
      <AddToHomePrompt />
    </main>
  );
};

export default AuthenticatedHome;
