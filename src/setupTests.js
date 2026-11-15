import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';

// Unmount everything after each test, so no test sees another test's page.
// React Testing Library usually does this automatically, but the automatic hook
// doesn't fire with every Vitest set-up, so it's explicit here.
afterEach(() => {
  cleanup();
});

// jsdom doesn't implement matchMedia. react-hot-toast and the theme switch use it.
if (!window.matchMedia) {
  window.matchMedia = (query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  });
}
