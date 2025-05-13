import React, { createContext, useContext, useState } from 'react';
import { setStaticLanguage } from './staticLanguage';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState('es');

  const setLanguage = (lang) => {
    setLanguageState(lang);
    setStaticLanguage(lang); // Sincroniza con el idioma global
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
