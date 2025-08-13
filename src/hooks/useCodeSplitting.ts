
import { lazy, ComponentType } from 'react';
import { useAdvancedCaching } from './useAdvancedCaching';

interface CodeSplitOptions {
  retries?: number;
  retryDelay?: number;
  preload?: boolean;
}

export const useCodeSplitting = () => {
  const { getOrSet } = useAdvancedCaching<ComponentType<any>>();

  const createLazyComponent = (
    importFunction: () => Promise<{ default: ComponentType<any> }>,
    componentName: string,
    options: CodeSplitOptions = {}
  ) => {
    const { retries = 3, retryDelay = 1000, preload = false } = options;

    const retryImport = async (attempt = 1): Promise<{ default: ComponentType<any> }> => {
      try {
        return await importFunction();
      } catch (error) {
        if (attempt < retries) {
          console.warn(`Failed to load ${componentName}, retrying (${attempt}/${retries})...`);
          await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
          return retryImport(attempt + 1);
        }
        throw new Error(`Failed to load ${componentName} after ${retries} attempts`);
      }
    };

    const LazyComponent = lazy(() => retryImport());

    // Preload if requested
    if (preload) {
      // Cache the component for faster subsequent loads
      getOrSet(componentName, retryImport);
    }

    return LazyComponent;
  };

  const preloadComponent = async (
    importFunction: () => Promise<{ default: ComponentType<any> }>,
    componentName: string
  ) => {
    try {
      await getOrSet(componentName, importFunction);
      console.log(`Successfully preloaded ${componentName}`);
    } catch (error) {
      console.error(`Failed to preload ${componentName}:`, error);
    }
  };

  return {
    createLazyComponent,
    preloadComponent
  };
};
