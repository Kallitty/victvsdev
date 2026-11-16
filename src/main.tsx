import '@/styles/tokens.css';
import '@/styles/global.css';

import { QueryClientProvider } from '@tanstack/react-query';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import { createQueryClient } from '@/app/queryClient';
import { ThemeProvider } from '@/shared/theme';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '@/features/auth';

import App from './App';

const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Root element #root not found in index.html');

const queryClient = createQueryClient();

// The starter registered a service worker that bypassed the network layer and served stale data.
// It's removed; this unregisters it from browsers that already installed it.
if ('serviceWorker' in navigator) {
  void navigator.serviceWorker.getRegistrations().then((registrations) => {
    for (const registration of registrations) void registration.unregister();
  });
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
);
