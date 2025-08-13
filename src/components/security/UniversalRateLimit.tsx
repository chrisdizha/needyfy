
import { createContext, useContext, ReactNode } from 'react';
import { useEnhancedRateLimit } from '@/hooks/useEnhancedRateLimit';

interface RateLimitContextType {
  checkAuthRateLimit: () => Promise<boolean>;
  checkPaymentRateLimit: () => Promise<boolean>;
  checkBookingRateLimit: () => Promise<boolean>;
  checkGeneralRateLimit: () => Promise<boolean>;
}

const RateLimitContext = createContext<RateLimitContextType | null>(null);

export const useUniversalRateLimit = () => {
  const context = useContext(RateLimitContext);
  if (!context) {
    throw new Error('useUniversalRateLimit must be used within RateLimitProvider');
  }
  return context;
};

interface RateLimitProviderProps {
  children: ReactNode;
}

export const RateLimitProvider = ({ children }: RateLimitProviderProps) => {
  const { checkRateLimit } = useEnhancedRateLimit();

  const checkAuthRateLimit = async (): Promise<boolean> => {
    const result = await checkRateLimit({
      maxRequests: 5,
      windowSeconds: 900, // 15 minutes
      identifier: `auth_${Date.now()}`,
      progressiveDelay: true
    });
    return result.allowed;
  };

  const checkPaymentRateLimit = async (): Promise<boolean> => {
    const result = await checkRateLimit({
      maxRequests: 3,
      windowSeconds: 300, // 5 minutes
      identifier: `payment_${Date.now()}`,
      progressiveDelay: true
    });
    return result.allowed;
  };

  const checkBookingRateLimit = async (): Promise<boolean> => {
    const result = await checkRateLimit({
      maxRequests: 10,
      windowSeconds: 600, // 10 minutes
      identifier: `booking_${Date.now()}`,
      progressiveDelay: true
    });
    return result.allowed;
  };

  const checkGeneralRateLimit = async (): Promise<boolean> => {
    const result = await checkRateLimit({
      maxRequests: 20,
      windowSeconds: 60, // 1 minute
      identifier: `general_${Date.now()}`,
      progressiveDelay: false
    });
    return result.allowed;
  };

  return (
    <RateLimitContext.Provider value={{
      checkAuthRateLimit,
      checkPaymentRateLimit,
      checkBookingRateLimit,
      checkGeneralRateLimit
    }}>
      {children}
    </RateLimitContext.Provider>
  );
};
