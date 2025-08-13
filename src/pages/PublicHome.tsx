
import { Suspense } from 'react';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
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

// Component wrapper with error boundary
const SectionWrapper = ({ children, name }: { children: React.ReactNode; name: string }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    console.error(`Error in ${name} section:`, error);
    return null;
  }
};

const PublicHome = () => {
  console.log('🏠 PublicHome component rendering...');
  
  return (
    <div className="min-h-screen flex flex-col">
      <SectionWrapper name="Navbar">
        <Navbar />
      </SectionWrapper>
      
      <main className="flex-grow">
        <Suspense fallback={<div className="h-96 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>}>
          <SectionWrapper name="HeroSection">
            <HeroSection />
          </SectionWrapper>
          
          <SectionWrapper name="CategorySection">
            <CategorySection />
          </SectionWrapper>
          
          <SectionWrapper name="FeaturedEquipment">
            <FeaturedEquipment />
          </SectionWrapper>
          
          <SectionWrapper name="HowItWorks">
            <HowItWorks />
          </SectionWrapper>
          
          <SectionWrapper name="UserFeatures">
            <UserFeatures />
          </SectionWrapper>
          
          <SectionWrapper name="ProviderFeatures">
            <ProviderFeatures />
          </SectionWrapper>
          
          <SectionWrapper name="Testimonials">
            <Testimonials />
          </SectionWrapper>
          
          <SectionWrapper name="AppAnnouncementBanner">
            <AppAnnouncementBanner />
          </SectionWrapper>
          
          <SectionWrapper name="CallToAction">
            <CallToAction />
          </SectionWrapper>
          
          <SectionWrapper name="AddToHomePrompt">
            <AddToHomePrompt />
          </SectionWrapper>
        </Suspense>
      </main>
      
      <SectionWrapper name="Footer">
        <Footer />
      </SectionWrapper>
    </div>
  );
};

export default PublicHome;
