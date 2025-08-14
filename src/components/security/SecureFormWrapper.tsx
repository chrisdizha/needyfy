
import React, { ReactNode } from 'react';
import { CSRFProtection, useCSRFProtection } from './CSRFProtection';
import { useSecureAuthSafe } from '@/hooks/useSecureAuthSafe';
import { toast } from 'sonner';

interface SecureFormWrapperProps {
  children: ReactNode;
  onSubmit: (formData: FormData, csrfToken: string) => Promise<void> | void;
  requiresAuth?: boolean;
}

export const SecureFormWrapper = ({ 
  children, 
  onSubmit, 
  requiresAuth = true 
}: SecureFormWrapperProps) => {
  const { validateCSRFToken } = useCSRFProtection();
  const { validateSession, logSecurityEvent } = useSecureAuthSafe();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    
    try {
      const formData = new FormData(event.currentTarget);
      const csrfToken = formData.get('csrf_token') as string;

      // Validate CSRF token
      if (!validateCSRFToken(csrfToken)) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: 'Invalid or missing CSRF token'
        });
        toast.error('Security validation failed. Please refresh and try again.');
        return;
      }

      // Validate session if required
      if (requiresAuth) {
        const sessionValid = await validateSession();
        if (!sessionValid) {
          toast.error('Session expired. Please sign in again.');
          return;
        }
      }

      // Rate limiting check
      const lastSubmit = localStorage.getItem('last_form_submit');
      if (lastSubmit && Date.now() - parseInt(lastSubmit) < 1000) {
        await logSecurityEvent({
          type: 'suspicious_activity',
          timestamp: Date.now(),
          details: 'Rapid form submission detected'
        });
        toast.error('Please wait before submitting again.');
        return;
      }
      localStorage.setItem('last_form_submit', Date.now().toString());

      await onSubmit(formData, csrfToken);
      
    } catch (error) {
      console.error('Secure form submission error:', error);
      await logSecurityEvent({
        type: 'suspicious_activity',
        timestamp: Date.now(),
        details: `Form submission error: ${error}`
      });
      toast.error('An error occurred. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CSRFProtection />
      {children}
    </form>
  );
};
