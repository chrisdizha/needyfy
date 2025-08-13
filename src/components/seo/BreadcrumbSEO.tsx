
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useEffect } from 'react';

interface BreadcrumbItem {
  label: string;
  href: string;
}

interface BreadcrumbSEOProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbSEO = ({ items, className = '' }: BreadcrumbSEOProps) => {
  const location = useLocation();

  // Generate breadcrumbs from URL if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    if (items) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Home', href: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
      breadcrumbs.push({ label, href: currentPath });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs();

  // Add structured data for breadcrumbs
  useEffect(() => {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((item, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": item.label,
        "item": `${window.location.origin}${item.href}`
      }))
    };

    // Remove existing breadcrumb structured data
    const existingScript = document.querySelector('script[data-breadcrumb="true"]');
    if (existingScript) {
      existingScript.remove();
    }

    // Add new breadcrumb structured data
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.setAttribute('data-breadcrumb', 'true');
    script.textContent = JSON.stringify(structuredData);
    document.head.appendChild(script);

    return () => {
      const script = document.querySelector('script[data-breadcrumb="true"]');
      if (script) {
        script.remove();
      }
    };
  }, [breadcrumbs]);

  if (breadcrumbs.length <= 1) return null;

  return (
    <nav 
      className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}
      aria-label="Breadcrumb"
    >
      {breadcrumbs.map((item, index) => (
        <div key={item.href} className="flex items-center">
          {index > 0 && <ChevronRight className="h-4 w-4 mx-1" />}
          {index === breadcrumbs.length - 1 ? (
            <span className="text-foreground font-medium" aria-current="page">
              {item.label}
            </span>
          ) : (
            <Link 
              to={item.href} 
              className="hover:text-foreground transition-colors"
              aria-label={`Go to ${item.label}`}
            >
              {index === 0 ? (
                <Home className="h-4 w-4" aria-hidden="true" />
              ) : (
                item.label
              )}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );
};

export default BreadcrumbSEO;
