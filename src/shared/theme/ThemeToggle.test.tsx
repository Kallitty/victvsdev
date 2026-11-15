import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { THEME_STORAGE_KEY } from './theme';
import { ThemeProvider } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';

function renderToggle() {
  render(
    <ThemeProvider>
      <ThemeToggle />
    </ThemeProvider>,
  );
  return { user: userEvent.setup(), toggle: screen.getByRole('switch', { name: 'Dark mode' }) };
}

/** Pretend the operating system prefers this colour scheme. */
function mockSystemTheme(theme: 'light' | 'dark') {
  vi.spyOn(window, 'matchMedia').mockImplementation(
    (query: string) =>
      ({
        matches: query.includes('light') && theme === 'light',
        media: query,
        addEventListener: () => undefined,
        removeEventListener: () => undefined,
      }) as unknown as MediaQueryList,
  );
}

describe('ThemeToggle', () => {
  beforeEach(() => {
    window.localStorage.clear();
    delete document.documentElement.dataset.theme;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('defaults to the dark brand theme', () => {
    const { toggle } = renderToggle();
    expect(toggle).toBeChecked();
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
  });

  it("follows the OS's light setting on a first visit", () => {
    mockSystemTheme('light');
    const { toggle } = renderToggle();
    expect(toggle).not.toBeChecked();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('switches theme and remembers the choice', async () => {
    const { user, toggle } = renderToggle();

    await user.click(toggle);

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
    expect(window.localStorage.getItem(THEME_STORAGE_KEY)).toBe('light');
  });

  it('lets a saved choice win over the OS setting', () => {
    mockSystemTheme('dark');
    window.localStorage.setItem(THEME_STORAGE_KEY, 'light');
    renderToggle();
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('still works when storage is blocked', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });
    const { user, toggle } = renderToggle();

    await user.click(toggle);

    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });

  it('picks up a change made in another tab', () => {
    renderToggle();
    act(() => {
      window.dispatchEvent(new StorageEvent('storage', { key: THEME_STORAGE_KEY, newValue: 'light' }));
    });
    expect(document.documentElement).toHaveAttribute('data-theme', 'light');
  });
});
