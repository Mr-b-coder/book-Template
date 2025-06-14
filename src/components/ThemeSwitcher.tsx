import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import Button from './Button'; 
import MoonIcon from './MoonIcon'; 
import SunIcon from './SunIcon';   
import SystemThemeIcon from './SystemThemeIcon';

type Theme = 'light' | 'dark';
type ThemePreference = Theme | 'system';

interface ThemeContextType {
  themePreference: ThemePreference;
  setThemePreference: (preference: ThemePreference) => void;
  effectiveTheme: Theme; 
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>(() => {
    if (typeof window !== 'undefined') {
      const savedThemePreference = localStorage.getItem('themePreference') as ThemePreference | null;
      return savedThemePreference || 'system';
    }
    return 'system';
  });

  const [effectiveTheme, setEffectiveTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'light'; // Default for non-browser env
    
    let initialPref: ThemePreference = 'system';
    if (typeof window !== 'undefined') {
        initialPref = (localStorage.getItem('themePreference') || 'system') as ThemePreference;
    }

    if (initialPref === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return initialPref as Theme;
  });

  useEffect(() => {
    const applyEffectiveTheme = (currentPreference: ThemePreference) => {
      let newActualTheme: Theme;
      if (currentPreference === 'system') {
        newActualTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      } else {
        newActualTheme = currentPreference;
      }

      setEffectiveTheme(newActualTheme);

      if (newActualTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    };

    applyEffectiveTheme(themePreference);
    
    if (typeof window !== 'undefined') {
        localStorage.setItem('themePreference', themePreference);
    }

    let mediaQuery: MediaQueryList | undefined;
    const handleChange = () => applyEffectiveTheme('system'); 

    if (themePreference === 'system' && typeof window !== 'undefined') {
      mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', handleChange);
    }
    
    return () => {
        if (mediaQuery) {
            mediaQuery.removeEventListener('change', handleChange);
        }
    };
  }, [themePreference]);

  const setThemePreference = useCallback((preference: ThemePreference) => {
    setThemePreferenceState(preference);
  }, []);

  return (
    <ThemeContext.Provider value={{ themePreference, setThemePreference, effectiveTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider.');
  }
  return context;
};

export const ThemeToggleButton: React.FC = () => {
  const { themePreference, setThemePreference } = useTheme();

  const isActive = (buttonPreference: ThemePreference) => themePreference === buttonPreference;

  return (
    <div className="flex items-center space-x-1 p-0.5 bg-slate-200 dark:bg-slate-700 rounded-lg">
        <Button
            variant={isActive('light') ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setThemePreference('light')}
            aria-pressed={isActive('light')}
            className={`min-w-[5.5rem] ${!isActive('light') ? 'text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600' : 'dark:!text-[#0F172A]'}`}
            title="Light Theme"
        >
            <SunIcon className="w-4 h-4 mr-1.5" /> Light
        </Button>
        <Button
            variant={isActive('dark') ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setThemePreference('dark')}
            aria-pressed={isActive('dark')}
            className={`min-w-[5.5rem] ${!isActive('dark') ? 'text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600' : 'dark:!text-[#0F172A]'}`}
            title="Dark Theme"
        >
            <MoonIcon className="w-4 h-4 mr-1.5" /> Dark
        </Button>
        <Button
            variant={isActive('system') ? 'secondary' : 'outline'}
            size="sm"
            onClick={() => setThemePreference('system')}
            aria-pressed={isActive('system')}
            className={`min-w-[5.5rem] ${!isActive('system') ? 'text-slate-700 dark:text-slate-200 border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600' : 'dark:!text-[#0F172A]'}`}
            title="System Theme"
        >
            <SystemThemeIcon className="w-4 h-4 mr-1.5" /> System
        </Button>
    </div>
  );
};