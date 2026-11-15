import { render, screen } from '@testing-library/react';

import { ErrorBoundary } from './ErrorBoundary';

function Broken(): never {
  throw new Error('boom');
}

it('shows a recovery message instead of a blank page', () => {
  const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

  render(
    <ErrorBoundary>
      <Broken />
    </ErrorBoundary>,
  );

  expect(screen.getByRole('alert')).toHaveTextContent('Something went wrong displaying this page.');
  expect(screen.getByRole('button', { name: 'Reload' })).toBeInTheDocument();
  consoleError.mockRestore();
});
