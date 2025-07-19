
import { useTranslation as useI18nTranslation } from 'react-i18next';

export const useI18n = () => {
  const { t, i18n } = useI18nTranslation();
  
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
