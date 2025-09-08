
import { Suspense } from 'react';
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
import SitemapGenerator from '@/components/seo/SitemapGenerator';
import { useSEO, generateOrganizationStructuredData, generateWebsiteStructuredData } from '@/hooks/useSEO';

// Simple error boundary component
const ErrorFallback = ({ error, name }: { error: Error; name: string }) => {
  console.error(`Error in ${name} section:`, error);
  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
      <p className="text-red-800">Error loading {name} section. Please refresh the page.</p>
    </div>
  );
};

// Component wrapper with simple error boundary
const SectionWrapper = ({ children, name }: { children: React.ReactNode; name: string }) => {
  try {
    return <>{children}</>;
  } catch (error) {
    return <ErrorFallback error={error as Error} name={name} />;
  }
};

const PublicHome = () => {
  console.log('🏠 PublicHome component rendering...');
  
  // SEO optimization for homepage
  useSEO({
    title: 'Needyfy - Rent Equipment, Tools & Services | Hire Anything Locally',
    description: 'Discover thousands of items for rent near you. From power tools to party supplies, cameras to construction equipment. Rent what you need, when you need it on Needyfy.',
    keywords: [
      'equipment rental',
      'tool rental',
      'rent equipment',
      'hire tools',
      'local rental',
      'peer to peer rental',
      'construction equipment',
      'photography equipment',
      'party supplies',
      'power tools'
    ],
    ogTitle: 'Needyfy - The Ultimate Equipment Rental Platform',
    ogDescription: 'Rent anything from your neighbors. Thousands of items available for rent including tools, equipment, and services.',
    ogImage: '/lovable-uploads/49fb9ab1-3945-4c06-8d58-a45f786e28fd.png',
    ogType: 'website',
    twitterCard: 'summary_large_image',
    twitterTitle: 'Needyfy - Rent Equipment & Tools Locally',
    twitterDescription: 'Access thousands of items for rent from your community. Safe, secure, and affordable.',
    twitterImage: '/lovable-uploads/49fb9ab1-3945-4c06-8d58-a45f786e28fd.png',
    canonical: window.location.origin,
    structuredData: [
      generateOrganizationStructuredData(),
      generateWebsiteStructuredData(),
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": "Needyfy - Equipment Rental Platform",
        "description": "Rent equipment, tools, and services from your local community",
        "url": window.location.href,
        "mainEntity": {
          "@type": "Service",
          "name": "Equipment Rental Service",
          "provider": {
            "@type": "Organization",
            "name": "Needyfy"
          },
          "serviceType": "Equipment Rental",
          "areaServed": "Worldwide"
        }
      }
    ]
  });
  
  const LoadingSkeleton = () => (
    <div className="h-96 flex items-center justify-center bg-background">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>
  );
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <SitemapGenerator />
      
      <main className="flex-1">
        <SectionWrapper name="HeroSection">
          <HeroSection />
        </SectionWrapper>
        
        <SectionWrapper name="CategorySection">
          <CategorySection />
        </SectionWrapper>
        
        <Suspense fallback={<LoadingSkeleton />}>
          <SectionWrapper name="FeaturedEquipment">
            <FeaturedEquipment />
          </SectionWrapper>
        </Suspense>
        
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
      </main>
      
      <Footer />
    </div>
  );
};

export default PublicHome;
