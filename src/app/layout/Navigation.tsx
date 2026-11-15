import { NavLink } from 'react-router-dom';

import styles from './Navigation.module.css';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/sessions', label: 'Sessions', end: false },
  { to: '/exam-map', label: 'Map', end: false },
];

export function Navigation() {
  return (
    <nav aria-label="Main">
      <ul className={styles.links}>
        {LINKS.map((link) => (
          <li key={link.to}>
            {/* NavLink adds aria-current="page" to the active link; the CSS styles that. */}
            <NavLink className={styles.link} to={link.to} end={link.end}>
              {link.label}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
