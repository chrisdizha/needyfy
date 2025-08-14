
import { useEffect, useState } from 'react';

interface CSRFToken {
  token: string;
  expiresAt: number;
}

export const useCSRFProtection = () => {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);

  const generateCSRFToken = (): CSRFToken => {
    const token = crypto.getRandomValues(new Uint8Array(32))
      .reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');
    
    const expiresAt = Date.now() + (60 * 60 * 1000); // 1 hour
    
    return { token, expiresAt };
  };

  const getOrCreateCSRFToken = (): string => {
    const stored = sessionStorage.getItem('csrf_token');
    
    if (stored) {
      try {
        const parsed: CSRFToken = JSON.parse(stored);
        if (parsed.expiresAt > Date.now()) {
          return parsed.token;
        }
      } catch {
        // Invalid stored token, generate new one
      }
    }
    
    const newToken = generateCSRFToken();
    sessionStorage.setItem('csrf_token', JSON.stringify(newToken));
    return newToken.token;
  };

  const validateCSRFToken = (token: string): boolean => {
    const stored = sessionStorage.getItem('csrf_token');
    if (!stored) return false;
    
    try {
      const parsed: CSRFToken = JSON.parse(stored);
      return parsed.token === token && parsed.expiresAt > Date.now();
    } catch {
      return false;
    }
  };

  useEffect(() => {
    const token = getOrCreateCSRFToken();
    setCSRFToken(token);
  }, []);

  return {
    csrfToken,
    getOrCreateCSRFToken,
    validateCSRFToken
  };
};

export const CSRFProtection = () => {
  const { csrfToken } = useCSRFProtection();

  if (!csrfToken) return null;

  return (
    <input 
      type="hidden" 
      name="csrf_token" 
      value={csrfToken}
      readOnly
    />
  );
};
