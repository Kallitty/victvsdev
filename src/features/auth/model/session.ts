/**
 * Who is using the app and what they may see. The VICTVS API has no authentication,
 * so this only decides which screens the UI offers. It is NOT a security boundary:
 * anyone can call the API directly. Real authorisation must be enforced by the server.
 */
export type Role = 'admin' | 'candidate';

interface SessionBase {
  signedInAt: number; // epoch milliseconds
  expiresAt: number;
}

export type Session =
  | (SessionBase & { role: 'admin' })
  | (SessionBase & { role: 'candidate'; candidateId: number; candidateName: string });

/** One working day on exam day; after that, sign in again. */
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;

export const homePathFor = (session: Session) => (session.role === 'admin' ? '/admin' : '/me');

export const displayName = (session: Session) => (session.role === 'admin' ? 'Admin' : session.candidateName);

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const isFiniteNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value);

/** Storage can be edited by the user, so anything malformed is discarded, never trusted. */
export function parseStoredSession(raw: string | null): Session | null {
  if (!raw) return null;
  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    return null;
  }
  if (!isRecord(value) || !isFiniteNumber(value.signedInAt) || !isFiniteNumber(value.expiresAt)) return null;

  const { signedInAt, expiresAt } = value;
  if (value.role === 'admin') return { role: 'admin', signedInAt, expiresAt };
  if (
    value.role === 'candidate' &&
    typeof value.candidateId === 'number' &&
    Number.isInteger(value.candidateId) &&
    typeof value.candidateName === 'string' &&
    value.candidateName.trim() !== ''
  ) {
    return {
      role: 'candidate',
      candidateId: value.candidateId,
      candidateName: value.candidateName,
      signedInAt,
      expiresAt,
    };
  }
  return null;
}

/**
 * Where to go after signing in. `next` comes from the URL, so it's untrusted: only
 * same-site paths inside the user's own area are allowed. That blocks open redirects
 * (?next=//evil.example) and stops a candidate being bounced into admin pages.
 */
export function safeNextPath(next: string | null, session: Session): string {
  const home = homePathFor(session);
  if (!next) return home;
  const sameSite = next.startsWith('/') && !next.startsWith('//') && !next.includes('\\');
  const ownArea = next === home || next.startsWith(`${home}/`) || next.startsWith(`${home}?`);
  return sameSite && ownArea ? next : home;
}
