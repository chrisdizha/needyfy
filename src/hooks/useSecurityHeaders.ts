import { useEffect } from 'react';

export const useSecurityHeaders = () => {
  useEffect(() => {
    // Set security headers via meta tags where possible
    const metaTags = [
      { name: 'referrer', content: 'strict-origin-when-cross-origin' },
      { 'http-equiv': 'X-Content-Type-Options', content: 'nosniff' },
      { 'http-equiv': 'X-Frame-Options', content: 'DENY' },
      { 'http-equiv': 'X-XSS-Protection', content: '1; mode=block' },
      { 
        'http-equiv': 'Content-Security-Policy', 
        content: "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.jsdelivr.net https://unpkg.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob:; connect-src 'self' https://*.supabase.co https://*.stripe.com; frame-src https://*.stripe.com;"
      }
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

    // Add Permissions Policy
    const permissionsPolicy = document.createElement('meta');
    permissionsPolicy.setAttribute('http-equiv', 'Permissions-Policy');
    permissionsPolicy.setAttribute('content', 'camera=(), microphone=(), geolocation=(), payment=()');
    document.head.appendChild(permissionsPolicy);

    return () => {
      // Cleanup is handled automatically for meta tags
    };
  }, []);
};