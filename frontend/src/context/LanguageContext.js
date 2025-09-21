import React, { createContext, useContext, useState, useEffect } from "react";
import { useTranslation } from "react-i18next";

// Create context
const LanguageContext = createContext();

// Language provider component
export const LanguageProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState("en");

  // Load saved language from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem("nabha_language") || "en";
    setCurrentLanguage(savedLanguage);
    i18n.changeLanguage(savedLanguage);
  }, [i18n]);

  // Change language function
  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    i18n.changeLanguage(language);
    localStorage.setItem("nabha_language", language);

    // Update document direction for RTL languages
    document.dir = language === "ur" ? "rtl" : "ltr";

    // Update document language
    document.documentElement.lang = language;
  };

  // Get language display name
  const getLanguageDisplayName = (lang) => {
    const languages = {
      en: "English",
      hi: "हिन्दी",
      pa: "ਪੰਜਾਬੀ",
    };
    return languages[lang] || lang;
  };

  // Get available languages
  const availableLanguages = [
    { code: "en", name: "English", native: "English" },
    { code: "hi", name: "Hindi", native: "हिन्दी" },
    { code: "pa", name: "Punjabi", native: "ਪੰਜਾਬੀ" },
  ];

  const value = {
    currentLanguage,
    changeLanguage,
    getLanguageDisplayName,
    availableLanguages,
    isRTL: currentLanguage === "ur",
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use language context
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export default LanguageContext;
