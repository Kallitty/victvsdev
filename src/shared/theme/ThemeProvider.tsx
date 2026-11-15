import { type ReactNode, useCallback, useEffect, useLayoutEffect, useMemo, useState } from 'react';

import {
  applyTheme,
  isTheme,
  LIGHT_QUERY,
  readStoredTheme,
  storeTheme,
  systemTheme,
  type Theme,
  THEME_STORAGE_KEY,
} from './theme';
import { ThemeContext } from './ThemeContext';

/**
 * The theme is the one piece of UI state every page needs, so it lives in context.
 * Everything else stays local, and server data lives in React Query.
 */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => readStoredTheme() ?? systemTheme());
  const [userChose, setUserChose] = useState(() => readStoredTheme() !== null);

  // Before paint, so switching never flickers.
  useLayoutEffect(() => {
    applyTheme(theme);
  }, [theme]);

  // Until the user picks, follow the OS if it changes (e.g. automatic dark mode at sunset).
  useEffect(() => {
    if (userChose) return;
    const query = window.matchMedia(LIGHT_QUERY);
    const onChange = (event: MediaQueryListEvent) => setTheme(event.matches ? 'light' : 'dark');
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, [userChose]);

  // Keep every open tab in step.
  useEffect(() => {
    const onStorage = (event: StorageEvent) => {
      if (event.key === THEME_STORAGE_KEY && isTheme(event.newValue)) {
        setTheme(event.newValue);
        setUserChose(true);
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme((current) => {
      const next = current === 'dark' ? 'light' : 'dark';
      storeTheme(next);
      return next;
    });
    setUserChose(true);
  }, []);

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme]);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}
