/** Who is signed in and what they can see. UI-level access control only. */
export { AccountMenu } from './components/AccountMenu';
export { RequireRole } from './components/RequireRole';
export { SignInPage } from './containers/SignInPage';
export { AuthProvider } from './context/AuthProvider';
export { useAuth, useCandidateSession } from './context/useAuth';
export { homePathFor, SESSION_TTL_MS, type Role, type Session } from './model/session';
export { createDemoAuthService, SESSION_STORAGE_KEY } from './services/demoAuthService';
