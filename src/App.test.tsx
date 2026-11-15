import { screen, within } from '@testing-library/react';

import { getCandidates, getExams } from '@/features/exams/api/examsApi';
import { makeExam } from '@/test/fixtures';
import { renderWithProviders, testSession } from '@/test/renderWithProviders';

import App from './App';

vi.mock('@/features/exams/api/examsApi', () => ({
  getExams: vi.fn(),
  getCandidates: vi.fn(),
  updateExamStatus: vi.fn(),
}));

beforeEach(() => {
  vi.mocked(getExams).mockResolvedValue([
    makeExam({ title: 'Woodworking', candidates: [{ id: 1, name: 'Wilmers' }] }),
    makeExam({ title: 'Skydiving', candidates: [{ id: 5, name: 'Donelly' }] }),
  ]);
  vi.mocked(getCandidates).mockResolvedValue([
    { id: 1, name: 'Wilmers' },
    { id: 5, name: 'Donelly' },
  ]);
});

describe('App routing and roles', () => {
  it('sends signed-out visitors to sign in, remembering where they were going', () => {
    renderWithProviders(<App />, { route: '/admin/sessions?country=Italy' });
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(screen.getByTestId('location')).toHaveTextContent(
      '/sign-in?next=%2Fadmin%2Fsessions%3Fcountry%3DItaly',
    );
  });

  it('signs in as admin and returns to the page that was asked for', async () => {
    const { user } = renderWithProviders(<App />, { route: '/sign-in?next=%2Fadmin%2Fsessions' });
    await user.click(screen.getByRole('button', { name: 'Continue as admin' }));
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/sessions');
    expect(await screen.findAllByTestId('exam-row')).toHaveLength(2);
  });

  it('keeps old links working', () => {
    renderWithProviders(<App />, { route: '/sessions?country=Italy', session: testSession('admin') });
    expect(screen.getByTestId('location')).toHaveTextContent('/admin/sessions?country=Italy');
  });

  it('shows a candidate only their own exams, with candidate navigation', async () => {
    renderWithProviders(<App />, { route: '/', session: testSession('candidate') });
    expect(await screen.findByRole('heading', { name: 'Your exams, Wilmers' })).toBeInTheDocument();
    expect(await screen.findAllByTestId('candidate-exam')).toHaveLength(1);
    expect(screen.queryByText('Skydiving')).not.toBeInTheDocument();
    const nav = screen.getByRole('navigation', { name: 'Main' });
    expect(
      within(nav)
        .getAllByRole('link')
        .map((l) => l.textContent),
    ).toEqual(['My exams']);
  });

  it('blocks candidates from admin pages', () => {
    renderWithProviders(<App />, { route: '/admin/sessions', session: testSession('candidate') });
    expect(screen.getByRole('heading', { name: "You don't have access to this page" })).toBeInTheDocument();
  });

  it('signs out and clears the session', async () => {
    const { user, storage } = renderWithProviders(<App />, {
      route: '/admin',
      session: testSession('admin'),
    });
    await user.click(screen.getByRole('button', { name: 'Sign out' }));
    expect(screen.getByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(storage.length).toBe(0);
  });
});
