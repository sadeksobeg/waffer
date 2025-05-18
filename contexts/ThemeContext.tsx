import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { lightTheme, darkTheme, Theme } from '@/constants/theme';

// Define theme context types
type ThemeContextType = {
  theme: Theme;
  isDark: boolean;
  toggleTheme: () => void;
  setTheme: (scheme: 'light' | 'dark') => void;
};

// Create the context
const ThemeContext = createContext<ThemeContextType>({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
  setTheme: () => {},
});

// Theme storage key
const THEME_KEY = 'user-theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [isDark, setIsDark] = useState<boolean>(systemColorScheme === 'dark');
  const [theme, setThemeState] = useState<Theme>(isDark ? darkTheme : lightTheme);

  // Initialize theme on mount
  useEffect(() => {
    const initTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_KEY);
        if (savedTheme) {
          const parsedTheme = savedTheme === 'dark';
          setIsDark(parsedTheme);
          setThemeState(parsedTheme ? darkTheme : lightTheme);
        } else {
          // Use system theme if no saved preference
          setIsDark(systemColorScheme === 'dark');
          setThemeState(systemColorScheme === 'dark' ? darkTheme : lightTheme);
        }
      } catch (error) {
        console.error('Failed to initialize theme:', error);
      }
    };

    initTheme();
  }, [systemColorScheme]);

  // Toggle theme function
  const toggleTheme = async () => {
    try {
      const newIsDark = !isDark;
      setIsDark(newIsDark);
      setThemeState(newIsDark ? darkTheme : lightTheme);
      await AsyncStorage.setItem(THEME_KEY, newIsDark ? 'dark' : 'light');
    } catch (error) {
      console.error('Failed to toggle theme:', error);
    }
  };

  // Set specific theme
  const setTheme = async (scheme: 'light' | 'dark') => {
    try {
      const newIsDark = scheme === 'dark';
      setIsDark(newIsDark);
      setThemeState(newIsDark ? darkTheme : lightTheme);
      await AsyncStorage.setItem(THEME_KEY, scheme);
    } catch (error) {
      console.error('Failed to set theme:', error);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use the theme context
export const useTheme = () => useContext(ThemeContext);