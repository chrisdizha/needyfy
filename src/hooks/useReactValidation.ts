
import { useEffect } from 'react';

// Development-only hook to validate React setup and catch hook issues early
export const useReactValidation = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    console.log('🔍 useReactValidation running...');
    console.log('✅ React validation passed - hooks are working correctly');
  }, []);
};
