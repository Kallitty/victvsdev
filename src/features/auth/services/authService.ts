import type { Candidate } from '@/features/exams';

import type { Session } from '../model/session';

export type SignInRequest = { role: 'admin' } | { role: 'candidate'; candidate: Candidate };

/**
 * The seam between the UI and whatever proves who the user is. Today it's the demo
 * service; a production build would swap in one that calls the backend (e.g. Laravel
 * Sanctum) without any screen changing.
 */
export interface AuthService {
  restore: () => Session | null;
  signIn: (request: SignInRequest) => Promise<Session>;
  signOut: () => Promise<void>;
}
