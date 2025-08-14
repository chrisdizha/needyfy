
import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Add basic security headers via meta tags where possible
    const metaTags = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' }
    ];

    metaTags.forEach(tag => {
      const existingTag = document.querySelector(`meta[name="${tag.name}"], meta[http-equiv="${tag['http-equiv']}"]`);
      if (!existingTag) {
        const meta = document.createElement('meta');
        if (tag.name) meta.setAttribute('name', tag.name);
        if (tag['http-equiv']) meta.setAttribute('http-equiv', tag['http-equiv']);
        meta.setAttribute('content', tag.content);
        document.head.appendChild(meta);
      }
    });

    return () => {
      // Cleanup is handled automatically for meta tags
    };
  }, []);
};
