
import React from 'react';
import { resources } from './i18n';

// Type definitions for translation keys
export type TranslationKey = 
  | `common.${string}`
  | `hero.${string}`
  | `howItWorks.${string}`
  | `categories.${string}`
  | `dashboard.${string}`
  | `errors.${string}`
  | `auth.${string}`
  | `navigation.${string}`
  | `nav.${string}`;

// Development-only validation function
export const validateTranslationKey = (key: string, lng: string = 'en'): boolean => {
  if (process.env.NODE_ENV !== 'development') {
    return true;
  }

  const keyParts = key.split('.');
  let current: any = resources[lng as keyof typeof resources]?.translation;

  for (const part of keyParts) {
    if (!current || typeof current !== 'object' || !(part in current)) {
      console.warn(`🌐 Missing translation key: "${key}" for language: "${lng}"`);
      return false;
    }
    current = current[part];
  }

  return true;
};

// Get all missing translation keys across all languages
export const getMissingTranslationKeys = (): Record<string, string[]> => {
  if (process.env.NODE_ENV !== 'development') {
    return {};
  }

  const missing: Record<string, string[]> = {};
  const languages = Object.keys(resources);
  const baseLanguage = 'en';
  
  // Get all keys from base language
  const getAllKeys = (obj: any, prefix = ''): string[] => {
    const keys: string[] = [];
    for (const key in obj) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        keys.push(...getAllKeys(obj[key], fullKey));
      } else {
        keys.push(fullKey);
      }
    }
    return keys;
  };

  const baseKeys = getAllKeys(resources[baseLanguage].translation);

  // Check each language for missing keys
  languages.forEach(lang => {
    if (lang === baseLanguage) return;
    
    const missingInLang: string[] = [];
    baseKeys.forEach(key => {
      if (!validateTranslationKey(key, lang)) {
        missingInLang.push(key);
      }
    });
    
    if (missingInLang.length > 0) {
      missing[lang] = missingInLang;
    }
  });

  return missing;
};

// Development component to display missing translations
export const TranslationDebugger: React.FC = () => {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  const missing = getMissingTranslationKeys();
  const hasMissing = Object.keys(missing).length > 0;

  if (!hasMissing) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-red-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <h4 className="font-bold mb-2">Missing Translations</h4>
      {Object.entries(missing).map(([lang, keys]) => (
        <div key={lang} className="mb-2">
          <strong>{lang.toUpperCase()}:</strong>
          <ul className="text-xs mt-1">
            {keys.slice(0, 5).map(key => (
              <li key={key}>• {key}</li>
            ))}
            {keys.length > 5 && <li>... and {keys.length - 5} more</li>}
          </ul>
        </div>
      ))}
    </div>
  );
};
