import { useContext } from 'react';

import { AuthContext, type AuthContextValue } from './AuthContext';

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside <AuthProvider>.');
  return context;
}

/** For pages that only render behind <RequireRole role="candidate">. */
export function useCandidateSession() {
  const { session } = useAuth();
  if (session?.role !== 'candidate') throw new Error('useCandidateSession needs a signed-in candidate.');
  return session;
}
