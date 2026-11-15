import { Link } from 'react-router-dom';

import { ThemeToggle } from '@/shared/theme';

import styles from './Header.module.css';
import { Navigation } from './Navigation';
import { AccountMenu } from '@/features/auth';

export function Header() {
  return (
    <header className={styles.header}>
      <Link to="/" className={styles.brand} aria-label="VICTVS Exam Scheduler home">
        <span className={styles.brandName}>VICTVS</span>
        <span className={styles.brandProduct}>Exam Scheduler</span>
      </Link>
      <div className={styles.actions}>
        <Navigation />
        <ThemeToggle />
        <AccountMenu />
      </div>
    </header>
  );
}
