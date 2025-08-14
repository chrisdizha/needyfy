
import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Add minimal security headers that don't break functionality
    const addSecurityMeta = () => {
      // Referrer Policy
      const referrer = document.createElement('meta');
      referrer.name = 'referrer';
      referrer.content = 'strict-origin-when-cross-origin';
      document.head.appendChild(referrer);

      // X-Content-Type-Options
      const contentType = document.createElement('meta');
      contentType.httpEquiv = 'X-Content-Type-Options';
      contentType.content = 'nosniff';
      document.head.appendChild(contentType);
    };

    addSecurityMeta();

    return () => {
      // Cleanup is handled automatically for meta tags
    };
  }, []);

  return null; // This component doesn't render anything
};
