import { createContext, useContext, useState, useCallback } from 'react';
import { translations } from '../constants/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    // Verificar localStorage primero
    const saved = localStorage.getItem('language');
    if (saved && translations[saved]) {
      return saved;
    }
    // Si no hay preferencia guardada, usar idioma del navegador
    const browserLang = navigator.language.split('-')[0];
    return translations[browserLang] ? browserLang : 'es';
  });

  const changeLanguage = useCallback((lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  }, []);

  // Función para obtener traducción
  const t = useCallback((key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Retorna la key si no encuentra traducción
      }
    }
    
    return value || key;
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
