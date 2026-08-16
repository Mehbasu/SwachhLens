import React, { createContext, useContext, useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const ThemeContext = createContext({
  theme: 'system',
  colorScheme: 'light', // The actual resolved scheme (light/dark)
  setTheme: (theme) => {},
});

export const ThemeProvider = ({ children }) => {
  const [theme, setThemeState] = useState('system');
  const [colorScheme, setColorScheme] = useState(Appearance.getColorScheme() || 'light');

  useEffect(() => {
    // Load saved theme from storage
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('appTheme');
        if (savedTheme) {
          setThemeState(savedTheme);
        }
      } catch (e) {
        console.error('Failed to load theme from storage', e);
      }
    };
    loadTheme();
  }, []);

  useEffect(() => {
    // Determine the actual color scheme based on user preference
    if (theme === 'system') {
      setColorScheme(Appearance.getColorScheme() || 'light');
    } else {
      setColorScheme(theme);
    }
  }, [theme]);

  useEffect(() => {
    // Listen to OS theme changes if system theme is selected
    const subscription = Appearance.addChangeListener(({ colorScheme: newScheme }) => {
      if (theme === 'system') {
        setColorScheme(newScheme || 'light');
      }
    });
    return () => subscription.remove();
  }, [theme]);

  const setTheme = async (newTheme) => {
    setThemeState(newTheme);
    try {
      await AsyncStorage.setItem('appTheme', newTheme);
    } catch (e) {
      console.error('Failed to save theme to storage', e);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, colorScheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
