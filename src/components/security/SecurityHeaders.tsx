
import { useEffect } from 'react';

export const SecurityHeaders = () => {
  useEffect(() => {
    // Add security headers via meta tags where possible
    const addSecurityMeta = () => {
      // Content Security Policy
      const csp = document.createElement('meta');
      csp.httpEquiv = 'Content-Security-Policy';
      csp.content = `
        default-src 'self';
        script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://maps.googleapis.com;
        style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
        img-src 'self' data: https: blob:;
        font-src 'self' https://fonts.gstatic.com;
        connect-src 'self' https://*.supabase.co https://api.stripe.com wss://*.supabase.co;
        frame-src 'self' https://js.stripe.com;
        object-src 'none';
        base-uri 'self';
        form-action 'self';
      `.replace(/\s+/g, ' ').trim();
      
      // Remove existing CSP meta tag if present
      const existingCSP = document.querySelector('meta[http-equiv="Content-Security-Policy"]');
      if (existingCSP) {
        existingCSP.remove();
      }
      
      document.head.appendChild(csp);

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

    // Add security event listeners
    const handleSecurityViolation = (event: SecurityPolicyViolationEvent) => {
      console.warn('CSP Violation:', {
        violatedDirective: event.violatedDirective,
        blockedURI: event.blockedURI,
        documentURI: event.documentURI,
        lineNumber: event.lineNumber,
        sourceFile: event.sourceFile
      });
      
      // Log to security monitoring (if available)
      if (typeof window !== 'undefined' && 'navigator' in window) {
        fetch('/api/security/csp-violation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            violatedDirective: event.violatedDirective,
            blockedURI: event.blockedURI,
            timestamp: Date.now()
          })
        }).catch(() => {
          // Silently fail if endpoint doesn't exist
        });
      }
    };

    document.addEventListener('securitypolicyviolation', handleSecurityViolation);

    return () => {
      document.removeEventListener('securitypolicyviolation', handleSecurityViolation);
    };
  }, []);

  return null; // This component doesn't render anything
};
