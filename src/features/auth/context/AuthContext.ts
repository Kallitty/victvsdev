import { createContext } from 'react';

import type { Session } from '../model/session';
import type { SignInRequest } from '../services/authService';

export interface AuthContextValue {
  session: Session | null;
  signIn: (request: SignInRequest) => Promise<Session>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
