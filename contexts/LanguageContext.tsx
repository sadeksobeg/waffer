import React, { createContext, useContext, useState, useEffect } from 'react';
import { I18nManager } from 'react-native';
import * as Localization from 'expo-localization';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import en from '@/i18n/en';
import ar from '@/i18n/ar';

// Define the languages
const translations = { en, ar };

// Create the i18n instance
const i18n = new I18n(translations);

// Set the default locale
i18n.defaultLocale = 'en';

// Define language context types
type LanguageContextType = {
  locale: string;
  t: (key: string, options?: object) => string;
  changeLanguage: (language: string) => Promise<void>;
  isRTL: boolean;
};

// Create the context
const LanguageContext = createContext<LanguageContextType>({
  locale: 'en',
  t: (key: string) => key,
  changeLanguage: async () => {},
  isRTL: false,
});

// Language storage key
const LANGUAGE_KEY = 'user-language';

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<string>('en');

  // Initialize language on mount
  useEffect(() => {
    const initLanguage = async () => {
      try {
        // Try to get saved language
        const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
        
        if (savedLanguage) {
          await changeLanguage(savedLanguage);
        } else {
          // Use device language if available and supported, otherwise use English
          const deviceLanguage = Localization.locale.split('-')[0];
          if (Object.keys(translations).includes(deviceLanguage)) {
            await changeLanguage(deviceLanguage);
          } else {
            await changeLanguage('en');
          }
        }
      } catch (error) {
        console.error('Failed to initialize language:', error);
        // Default to English on error
        await changeLanguage('en');
      }
    };

    initLanguage();
  }, []);

  // Change language function
  const changeLanguage = async (language: string) => {
    try {
      // Set the locale
      setLocale(language);
      i18n.locale = language;
      
      // Set RTL for Arabic
      const isRTL = language === 'ar';
      
      // Handle RTL layout changes
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      
      // Save to storage
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Failed to change language:', error);
    }
  };

  // Translation function
  const t = (key: string, options?: object) => {
    return i18n.t(key, options);
  };

  return (
    <LanguageContext.Provider 
      value={{ 
        locale, 
        t, 
        changeLanguage,
        isRTL: I18nManager.isRTL 
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook to use the language context
export const useLanguage = () => useContext(LanguageContext);