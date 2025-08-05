import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface CSRFToken {
  token: string;
  expiresAt: number;
}

export const useCSRFProtection = () => {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Generate a secure random token
  const generateToken = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Get or generate CSRF token
  const getCSRFToken = async (): Promise<string> => {
    try {
      // Check if we have a valid token in session storage
      const storedTokenData = sessionStorage.getItem('csrf_token');
      if (storedTokenData) {
        const tokenData: CSRFToken = JSON.parse(storedTokenData);
        if (tokenData.expiresAt > Date.now()) {
          return tokenData.token;
        }
      }

      // Generate new token
      const newToken = generateToken();
      const expiresAt = Date.now() + (30 * 60 * 1000); // 30 minutes

      // Store in session storage
      sessionStorage.setItem('csrf_token', JSON.stringify({
        token: newToken,
        expiresAt
      }));

      return newToken;
    } catch (error) {
      console.error('Error generating CSRF token:', error);
      // Fallback to basic token
      return generateToken();
    }
  };

  // Validate CSRF token for requests
  const validateCSRFToken = (token: string): boolean => {
    try {
      const storedTokenData = sessionStorage.getItem('csrf_token');
      if (!storedTokenData) return false;

      const tokenData: CSRFToken = JSON.parse(storedTokenData);
      return tokenData.token === token && tokenData.expiresAt > Date.now();
    } catch {
      return false;
    }
  };

  // Add CSRF token to headers
  const addCSRFToHeaders = (headers: Record<string, string> = {}): Record<string, string> => {
    if (csrfToken) {
      return {
        ...headers,
        'X-CSRF-Token': csrfToken
      };
    }
    return headers;
  };

  // Initialize token on mount
  useEffect(() => {
    const initializeToken = async () => {
      try {
        const token = await getCSRFToken();
        setCSRFToken(token);
      } catch (error) {
        console.error('Failed to initialize CSRF token:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeToken();
  }, []);

  // Refresh token periodically
  useEffect(() => {
    const refreshInterval = setInterval(async () => {
      try {
        const token = await getCSRFToken();
        setCSRFToken(token);
      } catch (error) {
        console.error('Failed to refresh CSRF token:', error);
      }
    }, 25 * 60 * 1000); // Refresh every 25 minutes

    return () => clearInterval(refreshInterval);
  }, []);

  return {
    csrfToken,
    isLoading,
    getCSRFToken,
    validateCSRFToken,
    addCSRFToHeaders
  };
};