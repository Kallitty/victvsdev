import { toast } from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '../context/useAuth';
import { displayName } from '../model/session';
import styles from './AccountMenu.module.css';

export function AccountMenu() {
  const { session, signOut } = useAuth();
  const navigate = useNavigate();
  if (!session) return null;

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out.');
    void navigate('/sign-in', { replace: true });
  };

  return (
    <div className={styles.menu}>
      <span className={styles.name}>
        {displayName(session)}
        <span className={styles.role}>{session.role === 'admin' ? 'Staff' : 'Candidate'}</span>
      </span>
      <button type="button" className={styles.signOut} onClick={() => void handleSignOut()}>
        Sign out
      </button>
    </div>
  );
}
