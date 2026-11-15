/**
 * First visit: follow the operating system's light/dark setting (dark, the VICTVS
 * brand, is the fallback). Once the user picks, their choice is saved and wins.
 * public/theme-init.js mirrors this so the right theme is painted before React loads.
 */
export type Theme = 'light' | 'dark';

export const THEME_STORAGE_KEY = 'victvs-theme';
export const LIGHT_QUERY = '(prefers-color-scheme: light)';

export const isTheme = (value: unknown): value is Theme => value === 'light' || value === 'dark';

/** Storage can throw (private browsing, blocked cookies): treat that as "no choice saved". */
export function readStoredTheme(): Theme | null {
  try {
    const value = window.localStorage.getItem(THEME_STORAGE_KEY);
    return isTheme(value) ? value : null;
  } catch {
    return null;
  }
}

export function storeTheme(theme: Theme): void {
  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // The theme still changes for this visit; it just won't be remembered.
  }
}

export const systemTheme = (): Theme => (window.matchMedia(LIGHT_QUERY).matches ? 'light' : 'dark');

export function applyTheme(theme: Theme): void {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
}
