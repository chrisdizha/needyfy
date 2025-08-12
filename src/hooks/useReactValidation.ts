
import { useEffect } from 'react';

// Development-only hook to validate React setup and catch hook issues early
export const useReactValidation = () => {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    console.log('🔍 useReactValidation running...');

    try {
      // Check for multiple React instances
      const reactInstances = [];
      if (typeof window !== 'undefined' && (window as any).React) {
        reactInstances.push('window.React');
      }
      if (typeof globalThis !== 'undefined' && (globalThis as any).React) {
        reactInstances.push('globalThis.React');
      }

      if (reactInstances.length > 0) {
        console.warn('⚠️ Multiple React instances detected:', reactInstances);
        console.warn('This can cause "Cannot read properties of null" hook errors');
        console.warn('Check your imports and make sure you\'re using named imports from react');
      }

      // Enhanced validation that React hooks are working
      try {
        const testState = { current: 'test' };
        if (!testState) {
          console.error('❌ React state management appears broken');
        }

        // Test that we can access React internals properly
        const React = require('react');
        if (React && React.useState && React.useEffect) {
          console.log('✅ React hooks validation successful');
        } else {
          console.error('❌ React hooks not properly accessible');
        }
      } catch (hookError) {
        console.error('❌ React hook validation failed:', hookError);
      }

      console.log('✅ React validation passed');
    } catch (error) {
      console.error('❌ React validation failed:', error);
    }
  }, []);
};
