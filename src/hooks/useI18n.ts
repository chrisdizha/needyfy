
import { useTranslation as useI18nTranslation } from 'react-i18next';
import { validateTranslationKey } from '@/lib/translationValidator';

export const useI18n = () => {
  const { t: originalT, i18n } = useI18nTranslation();
  
  // Enhanced translation function with validation
  const t = (key: string, options?: any): string => {
    // Validate key in development
    if (process.env.NODE_ENV === 'development') {
      validateTranslationKey(key, i18n.language);
    }

    const translation = originalT(key, options);
    
    // Return the key itself if translation is missing (fallback behavior)
    if (translation === key && process.env.NODE_ENV === 'development') {
      console.warn(`🌐 Translation missing: "${key}" - displaying key as fallback`);
    }
    
    return translation;
  };
  
  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
    localStorage.setItem('language', lng);
  };

  const currentLanguage = i18n.language;

  const languages = [
    { code: 'en', name: 'English', flag: '🇺🇸' },
    { code: 'es', name: 'Español', flag: '🇪🇸' },
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  ];

  return {
    t,
    changeLanguage,
    currentLanguage,
    languages,
    isRTL: ['ar', 'he'].includes(currentLanguage),
  };
};
