import { parseStoredSession, type Session, SESSION_TTL_MS } from '../model/session';
import type { AuthService, SignInRequest } from './authService';

export const SESSION_STORAGE_KEY = 'victvs-session';

/**
 * Demo sign-in: the user picks a role. No passwords, because the API has nothing to
 * check them against. sessionStorage is per tab and cleared when the tab closes,
 * which suits shared exam-centre computers.
 */
export function createDemoAuthService(storage: Storage = window.sessionStorage, now = Date.now): AuthService {
  const clear = () => {
    try {
      storage.removeItem(SESSION_STORAGE_KEY);
    } catch {
      // Storage unavailable: nothing was saved.
    }
  };

  return {
    restore() {
      let raw: string | null = null;
      try {
        raw = storage.getItem(SESSION_STORAGE_KEY);
      } catch {
        return null;
      }
      const session = parseStoredSession(raw);
      if (!session || now() >= session.expiresAt) {
        if (raw !== null) clear();
        return null;
      }
      return session;
    },

    signIn(request: SignInRequest) {
      const signedInAt = now();
      const expiresAt = signedInAt + SESSION_TTL_MS;
      const session: Session =
        request.role === 'admin'
          ? { role: 'admin', signedInAt, expiresAt }
          : {
              role: 'candidate',
              candidateId: request.candidate.id,
              candidateName: request.candidate.name,
              signedInAt,
              expiresAt,
            };
      try {
        storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
      } catch {
        // Still signed in for this page view.
      }
      return Promise.resolve(session);
    },

    signOut() {
      clear();
      return Promise.resolve();
    },
  };
}
