import { NavLink } from 'react-router-dom';

import { type Role, useAuth } from '@/features/auth';

import styles from './Navigation.module.css';

const LINKS: Record<Role, { to: string; label: string; end: boolean }[]> = {
  admin: [
    { to: '/admin', label: 'Home', end: true },
    { to: '/admin/sessions', label: 'Sessions', end: false },
    { to: '/admin/map', label: 'Map', end: false },
  ],
  candidate: [{ to: '/me', label: 'My exams', end: false }],
};

export function Navigation() {
  const { session } = useAuth();
  if (!session) return null;

  return (
    <nav aria-label="Main">
      <ul className={styles.links}>
        {LINKS[session.role].map((link) => (
          <li key={link.to}>
            <NavLink className={styles.link} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
