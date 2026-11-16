import React, { createContext, useContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'light',
  toggle: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try {
      const stored = localStorage.getItem('jk_theme');
      if (stored === 'light' || stored === 'dark') {
        return stored;
      }
    } catch (e) {
      // ignore storage errors
    }
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    try {
      localStorage.setItem('jk_theme', theme);
    } catch (e) {
      // ignore storage errors
    }
  }, [theme]);

  const toggle = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
