import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = '@app_theme';

// ── Tokens mirroring front-end/src/App.css exactly ───────────────────────
//
// Light  → :root in App.css
//   --background:       hsl(0 0% 100%)          = #ffffff
//   --foreground:       hsl(222.2 84% 4.9%)      = #0f172a
//   --muted:            hsl(210 40% 96.1%)        = #f1f5f9
//   --muted-foreground: hsl(215.4 16.3% 46.9%)   = #64748b
//   --border / --input: hsl(214.3 31.8% 91.4%)   = #e2e8f0
//   --accent-alt:       rgb(183,134,11)           = #b7860b  (web highlight)
//
// Dark   → .dark in App.css
//   --background:       hsl(222,47%,11%)          = #0d1b2e
//   --foreground:       hsl(210 40% 98%)           = #f1f5f9
//   --muted:            hsl(217.2 32.6% 17.5%)    = #1e293b
//   --muted-foreground: hsl(215 20.2% 65.1%)      = #94a3b8
//   --border / --input: hsl(217.2 32.6% 17.5%)   = #1e293b
//   --accent-alt:       rgb(183,134,11)           = #b7860b  (same)

export const lightTheme = {
  isDark:      false,
  bg:          '#ffffff',        // --background  light
  bgSecondary: '#f1f5f9',        // --muted       light
  card:        '#ffffff',        // --card        light
  cardAlt:     '#f1f5f9',        // --muted       light
  border:      '#e2e8f0',        // --border      light
  text:        '#0f172a',        // --foreground  light
  textSub:     '#64748b',        // --muted-foreground light
  textMuted:   '#94a3b8',
  input:       '#ffffff',        // --input bg    light
  inputBorder: '#e2e8f0',        // --input       light
  accent:      '#facc15',        // yellow badge/button (kept from design)
  accentFg:    '#0f172a',
  tabBar:      '#ffffff',
  tabBorder:   '#e2e8f0',
  modalBg:     '#ffffff',
  shadow:      'rgba(0,0,0,0.08)',
};

export const darkTheme = {
  isDark:      true,
  bg:          '#0b1625ff',        // --background  dark  hsl(222,47%,11%)
  bgSecondary: '#0d1b2e',        // --muted       dark
  card:        '#0d1b2e',        // --card        dark
  cardAlt:     '#1e293b',        // --muted       dark
  border:      '#1e293b',        // --border      dark  hsl(217.2 32.6% 17.5%)
  text:        '#f1f5f9',        // --foreground  dark  hsl(210 40% 98%)
  textSub:     '#94a3b8',        // --muted-foreground dark
  textMuted:   '#475569',
  input:       '#1e293b',        // --input       dark
  inputBorder: '#334155',
  accent:      '#facc15',
  accentFg:    '#0d1b2e',
  tabBar:      '#0f172a',
  tabBorder:   '#1e293b',
  modalBg:     '#0f172a',
  shadow:      'rgba(0,0,0,0.4)',
};

const ThemeContext = createContext({
  theme: lightTheme,
  isDark: false,
  toggleTheme: () => {},
});

export function ThemeContextProvider({ children }) {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val !== null) setIsDark(val === 'dark');
    });
  }, []);

  const toggleTheme = () => {
    setIsDark((prev) => {
      const next = !prev;
      AsyncStorage.setItem(STORAGE_KEY, next ? 'dark' : 'light');
      return next;
    });
  };

  const theme = isDark ? darkTheme : lightTheme;

  return (
    <ThemeContext.Provider value={{ theme, isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
