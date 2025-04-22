
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import HeroSection from '@/components/home/HeroSection';
import CategorySection from '@/components/home/CategorySection';
import FeaturedEquipment from '@/components/home/FeaturedEquipment';
import HowItWorks from '@/components/home/HowItWorks';
import Testimonials from '@/components/home/Testimonials';
import CallToAction from '@/components/home/CallToAction';

const Index = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <CategorySection />
        <FeaturedEquipment />
        <HowItWorks />
        <CallToAction />
        <Testimonials />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
