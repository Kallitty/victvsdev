import { useQueryClient } from '@tanstack/react-query';
import { type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import type { Session } from '../model/session';
import type { AuthService, SignInRequest } from '../services/authService';
import { createDemoAuthService } from '../services/demoAuthService';
import { AuthContext } from './AuthContext';

export function AuthProvider({
  children,
  service: injected,
}: {
  children: ReactNode;
  service?: AuthService;
}) {
  const [service] = useState(() => injected ?? createDemoAuthService());
  const [session, setSession] = useState<Session | null>(() => service.restore());
  const queryClient = useQueryClient();

  const signIn = useCallback(
    async (request: SignInRequest) => {
      const next = await service.signIn(request);
      setSession(next);
      return next;
    },
    [service],
  );

  const signOut = useCallback(async () => {
    await service.signOut();
    setSession(null);
    queryClient.clear(); // don't leave the previous user's data in memory on a shared PC
  }, [service, queryClient]);

  // End the session when it expires, even if the page stays open all day.
  useEffect(() => {
    if (!session) return;
    const timer = window.setTimeout(
      () => void signOut().then(() => toast('Your session has expired. Please sign in again.')),
      Math.max(0, session.expiresAt - Date.now()),
    );
    return () => window.clearTimeout(timer);
  }, [session, signOut]);

  const value = useMemo(() => ({ session, signIn, signOut }), [session, signIn, signOut]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
