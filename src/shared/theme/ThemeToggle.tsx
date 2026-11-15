import styles from './ThemeToggle.module.css';
import { useTheme } from './useTheme';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button type="button" role="switch" aria-checked={isDark} className={styles.toggle} onClick={toggleTheme}>
      <span className={styles.track} aria-hidden="true">
        <span className={styles.thumb}>{isDark ? '☾' : '☀'}</span>
      </span>
      <span>Dark mode</span>
    </button>
  );
}
