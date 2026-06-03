import React, { createContext, useContext, useState } from 'react';
import type { Lang } from './i18n.ts';

interface LangCtx {
  lang: Lang;
  setLang: (l: Lang) => void;
}

const LanguageContext = createContext<LangCtx>({ lang: 'fr', setLang: () => {} });

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [lang, setLangState] = useState<Lang>(() =>
    (localStorage.getItem('epv_lang') as Lang) ?? 'fr'
  );

  const setLang = (l: Lang) => {
    localStorage.setItem('epv_lang', l);
    setLangState(l);
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLang = () => useContext(LanguageContext);
