
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SEOData {
  title: string;
  description: string;
  keywords?: string[];
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  canonical?: string;
  noindex?: boolean;
  structuredData?: any;
}

export const useSEO = (seoData: SEOData) => {
  const location = useLocation();

  useEffect(() => {
    // Set page title
    document.title = seoData.title;

    // Set or update meta description
    updateMetaTag('name', 'description', seoData.description);

    // Set keywords if provided
    if (seoData.keywords?.length) {
      updateMetaTag('name', 'keywords', seoData.keywords.join(', '));
    }

    // Open Graph meta tags
    updateMetaTag('property', 'og:title', seoData.ogTitle || seoData.title);
    updateMetaTag('property', 'og:description', seoData.ogDescription || seoData.description);
    updateMetaTag('property', 'og:type', seoData.ogType || 'website');
    updateMetaTag('property', 'og:url', window.location.href);
    
    if (seoData.ogImage) {
      updateMetaTag('property', 'og:image', seoData.ogImage);
      updateMetaTag('property', 'og:image:alt', seoData.ogTitle || seoData.title);
    }

    // Twitter Card meta tags
    updateMetaTag('name', 'twitter:card', seoData.twitterCard || 'summary_large_image');
    updateMetaTag('name', 'twitter:title', seoData.twitterTitle || seoData.title);
    updateMetaTag('name', 'twitter:description', seoData.twitterDescription || seoData.description);
    
    if (seoData.twitterImage) {
      updateMetaTag('name', 'twitter:image', seoData.twitterImage);
    }

    // Canonical URL
    updateCanonicalTag(seoData.canonical || window.location.href);

    // Robots meta tag
    if (seoData.noindex) {
      updateMetaTag('name', 'robots', 'noindex, nofollow');
    } else {
      updateMetaTag('name', 'robots', 'index, follow');
    }

    // Structured data
    if (seoData.structuredData) {
      updateStructuredData(seoData.structuredData);
    }

    // Additional SEO meta tags
    updateMetaTag('name', 'author', 'Needyfy');
    updateMetaTag('property', 'og:site_name', 'Needyfy');
    updateMetaTag('name', 'application-name', 'Needyfy');

  }, [seoData, location.pathname]);

  const updateMetaTag = (attribute: string, name: string, content: string) => {
    let element = document.querySelector(`meta[${attribute}="${name}"]`);
    
    if (!element) {
      element = document.createElement('meta');
      element.setAttribute(attribute, name);
      document.head.appendChild(element);
    }
    
    element.setAttribute('content', content);
  };

  const updateCanonicalTag = (href: string) => {
    let canonical = document.querySelector('link[rel="canonical"]');
    
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    
    canonical.setAttribute('href', href);
  };

  const updateStructuredData = (data: any) => {
    // Remove existing structured data
    const existingScript = document.querySelector('script[type="application/ld+json"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(data);
    document.head.appendChild(script);
  };
};

export const generateOrganizationStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Needyfy",
  "description": "The ultimate platform for hiring and renting equipment, tools, and services",
  "url": window.location.origin,
  "logo": `${window.location.origin}/lovable-uploads/c8a8c731-f261-4752-9811-ed5a532dd2bf.png`,
  "sameAs": [
    "https://twitter.com/needyfy",
    "https://facebook.com/needyfy"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+1-555-0123",
    "contactType": "customer service",
    "email": "support@needyfy.com"
  }
});

export const generateWebsiteStructuredData = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Needyfy",
  "url": window.location.origin,
  "description": "The ultimate platform for hiring and renting equipment, tools, and services",
  "potentialAction": {
    "@type": "SearchAction",
    "target": {
      "@type": "EntryPoint",
      "urlTemplate": `${window.location.origin}/equipment?search={search_term_string}`
    },
    "query-input": "required name=search_term_string"
  }
});
