
import { useSEO } from '@/hooks/useSEO';

interface Equipment {
  id: string;
  title: string;
  description: string;
  price: number;
  category: string;
  location: string;
  images?: string[];
  provider_name?: string;
  rating?: number;
  reviews_count?: number;
}

interface EquipmentSEOProps {
  equipment: Equipment;
}

export const EquipmentSEO = ({ equipment }: EquipmentSEOProps) => {
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": equipment.title,
    "description": equipment.description,
    "category": equipment.category,
    "image": equipment.images?.[0] || '/placeholder.svg',
    "offers": {
      "@type": "Offer",
      "price": equipment.price,
      "priceCurrency": "USD",
      "availability": "https://schema.org/InStock",
      "priceValidUntil": new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    },
    "brand": {
      "@type": "Brand",
      "name": "Needyfy"
    },
    "aggregateRating": equipment.rating && equipment.reviews_count ? {
      "@type": "AggregateRating",
      "ratingValue": equipment.rating,
      "reviewCount": equipment.reviews_count,
      "bestRating": 5,
      "worstRating": 1
    } : undefined,
    "seller": {
      "@type": "Organization",
      "name": equipment.provider_name || "Needyfy Provider"
    }
  };

  useSEO({
    title: `${equipment.title} for Rent | ${equipment.category} | Needyfy`,
    description: `Rent ${equipment.title} in ${equipment.location}. ${equipment.description.substring(0, 120)}... Starting from $${equipment.price}/day on Needyfy.`,
    keywords: [
      equipment.title.toLowerCase(),
      equipment.category.toLowerCase(),
      'rent',
      'hire',
      'equipment',
      equipment.location.toLowerCase(),
      'needyfy'
    ],
    ogTitle: `Rent ${equipment.title} | Needyfy`,
    ogDescription: `${equipment.description.substring(0, 150)}...`,
    ogImage: equipment.images?.[0],
    ogType: 'product',
    twitterCard: 'summary_large_image',
    canonical: `${window.location.origin}/equipment/${equipment.id}`,
    structuredData
  });

  return null;
};

export default EquipmentSEO;
