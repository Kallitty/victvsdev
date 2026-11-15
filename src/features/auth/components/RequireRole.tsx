import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';

import { useAuth } from '../context/useAuth';
import { homePathFor, type Role } from '../model/session';

/**
 * Wraps a group of routes. Signed-out users go to sign in (and come back afterwards);
 * signed-in users with the wrong role see a 403 page. UI only: the API must enforce
 * the same rules.
 */
export function RequireRole({ role }: { role: Role }) {
  const { session } = useAuth();
  const location = useLocation();

  if (!session) {
    const next = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/sign-in?next=${next}`} replace />;
  }

  if (session.role !== role) {
    return (
      <main id="main" style={{ padding: '2rem 1rem' }}>
        <h2>You don&apos;t have access to this page</h2>
        <p>This area is for a different type of account.</p>
        <Link to={homePathFor(session)}>Go to your home page</Link>
      </main>
    );
  }

  return <Outlet />;
}
