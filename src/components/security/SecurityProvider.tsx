
import React, { createContext, useContext, useEffect } from 'react';
import { useCSRFProtection } from '@/hooks/useCSRFProtection';
import { useSecurityHeaders } from '@/hooks/useSecurityHeaders';
import { useEnhancedAuth } from '@/hooks/useEnhancedAuth';

interface SecurityContextType {
  csrfToken: string | null;
  isSecurityLoading: boolean;
  enhancedSignOut: () => Promise<void>;
}

const SecurityContext = createContext<SecurityContextType | undefined>(undefined);

export const useSecurityContext = () => {
  const context = useContext(SecurityContext);
  if (!context) {
    throw new Error('useSecurityContext must be used within SecurityProvider');
  }
  return context;
};

interface SecurityProviderProps {
  children: React.ReactNode;
}

export const SecurityProvider = ({ children }: SecurityProviderProps) => {
  const { csrfToken, isLoading: csrfLoading } = useCSRFProtection();
  const { enhancedSignOut } = useEnhancedAuth();
  
  // Apply security headers
  useSecurityHeaders();

  // Device fingerprinting for session security
  useEffect(() => {
    const generateDeviceFingerprint = () => {
      const fingerprint = [
        navigator.userAgent,
        navigator.language,
        screen.width,
        screen.height,
        new Date().getTimezoneOffset(),
        navigator.platform
      ].join('|');
      
      const hash = btoa(fingerprint).slice(0, 32);
      localStorage.setItem('device_fingerprint', hash);
    };

    if (!localStorage.getItem('device_fingerprint')) {
      generateDeviceFingerprint();
    }
  }, []);

  const value = {
    csrfToken,
    isSecurityLoading: csrfLoading,
    enhancedSignOut
  };

  return (
    <SecurityContext.Provider value={value}>
      {children}
    </SecurityContext.Provider>
  );
};
