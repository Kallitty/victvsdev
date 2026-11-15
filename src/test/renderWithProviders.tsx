import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, type RenderOptions } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';
import { Toaster } from 'react-hot-toast';
import { MemoryRouter, useLocation } from 'react-router-dom';

import {
  AuthProvider,
  createDemoAuthService,
  SESSION_STORAGE_KEY,
  SESSION_TTL_MS,
  type Session,
} from '@/features/auth';
import { ThemeProvider } from '@/shared/theme';

import { MemoryStorage } from './memoryStorage';

export function createTestQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false }, mutations: { retry: false } } });
}

/** A valid session for tests. Candidates default to Wilmers (id 1). */
export function testSession(role: Session['role'], candidate = { id: 1, name: 'Wilmers' }): Session {
  const signedInAt = Date.now();
  const expiresAt = signedInAt + SESSION_TTL_MS;
  return role === 'admin'
    ? { role, signedInAt, expiresAt }
    : { role, candidateId: candidate.id, candidateName: candidate.name, signedInAt, expiresAt };
}

function LocationProbe() {
  const { pathname, search } = useLocation();
  return <output data-testid="location">{pathname + search}</output>;
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    session,
    ...options
  }: { route?: string; session?: Session } & Omit<RenderOptions, 'wrapper'> = {},
) {
  const queryClient = createTestQueryClient();
  const storage = new MemoryStorage();
  if (session) storage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  const authService = createDemoAuthService(storage);

  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider service={authService}>
            <MemoryRouter initialEntries={[route]}>
              {children}
              <LocationProbe />
              <Toaster />
            </MemoryRouter>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    );
  }

  return { user: userEvent.setup(), queryClient, storage, ...render(ui, { wrapper: Wrapper, ...options }) };
}
