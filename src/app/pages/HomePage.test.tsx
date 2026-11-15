import { screen } from '@testing-library/react';

import { renderWithProviders, testSession } from '@/test/renderWithProviders';

import { HomePage } from './HomePage';

describe('HomePage', () => {
  it('summarises the system and links to the main pages', () => {
    renderWithProviders(<HomePage />, { session: testSession('admin') });

    expect(screen.getByRole('heading', { level: 2, name: 'Exam Schedule System' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'View sessions' })).toHaveAttribute('href', '/admin/sessions');
    expect(screen.getByRole('link', { name: 'Open the venue map' })).toHaveAttribute('href', '/admin/map');
    expect(screen.getByRole('heading', { name: 'Security and privacy' })).toBeInTheDocument();
  });
});
