import { fireEvent, screen } from '@testing-library/react';

import { makeExam } from '@/test/fixtures';
import { renderWithProviders } from '@/test/renderWithProviders';

import { getExams } from '../api/examsApi';
import { ExamList } from './ExamList';

vi.mock('../api/examsApi', () => ({ getExams: vi.fn(), updateExamStatus: vi.fn() }));

const exams = [
  makeExam({ title: 'Medical Examinations 1', status: 'started', datetime: '2026-12-07 09:15:00' }),
  makeExam({
    title: 'Skydiving License 1',
    datetime: '2026-04-14 12:00:00',
    location: { id: 3, country: 'Italy', latitude: 45.47, longitude: 9.11 },
    candidates: [{ id: 5, name: 'Donelly' }],
  }),
  makeExam({
    title: 'VICTVS Annual Assessment',
    datetime: '2027-10-14 14:15:00',
    location: { id: 5, country: 'italy', latitude: 45.47, longitude: 9.11 },
    candidates: [{ id: 3, name: 'Jenner' }],
  }),
];

const titles = () =>
  screen.getAllByTestId('exam-row').map((row) => row.querySelector('[data-label="Title"]')?.textContent);
const url = () => screen.getByTestId('location').textContent;

async function renderList(route = '/sessions') {
  const view = renderWithProviders(<ExamList />, { route });
  await screen.findAllByTestId('exam-row');
  return view;
}

describe('filtering and sorting sessions', () => {
  beforeEach(() => {
    vi.mocked(getExams).mockResolvedValue(exams);
  });

  it('lists sessions soonest first by default', async () => {
    await renderList();
    expect(titles()).toEqual(['Skydiving License 1', 'Medical Examinations 1', 'VICTVS Annual Assessment']);
  });

  it('filters by country, writes it to the URL, and announces the count', async () => {
    const { user } = await renderList();

    await user.selectOptions(screen.getByLabelText('Filter by country'), 'Italy');

    expect(titles()).toEqual(['Skydiving License 1', 'VICTVS Annual Assessment']);
    expect(url()).toBe('/sessions?country=Italy');
    expect(screen.getByText('Showing 2 of 3 sessions')).toBeInTheDocument();
  });

  it('restores filters from a shared link', async () => {
    await renderList('/sessions?candidate=3');
    expect(titles()).toEqual(['VICTVS Annual Assessment']);
    expect(screen.getByLabelText('Filter by candidate')).toHaveValue('3');
  });

  it('filters by date range and flags a backwards range', async () => {
    await renderList();

    fireEvent.change(screen.getByLabelText('From date'), { target: { value: '2026-12-01' } });
    expect(titles()).toEqual(['Medical Examinations 1', 'VICTVS Annual Assessment']);

    fireEvent.change(screen.getByLabelText('To date'), { target: { value: '2026-01-01' } });
    expect(screen.getByRole('alert')).toHaveTextContent('The from date is after the to date.');
  });

  it('sorts by a column and reports it to assistive technology', async () => {
    const { user } = await renderList();

    await user.click(screen.getByRole('button', { name: 'Title' }));
    expect(titles()).toEqual(['Medical Examinations 1', 'Skydiving License 1', 'VICTVS Annual Assessment']);
    expect(screen.getByRole('columnheader', { name: 'Title' })).toHaveAttribute('aria-sort', 'ascending');

    await user.click(screen.getByRole('button', { name: 'Title' }));
    expect(screen.getByRole('columnheader', { name: 'Title' })).toHaveAttribute('aria-sort', 'descending');
  });

  it('clears every filter at once', async () => {
    const { user } = await renderList('/sessions?country=Italy&status=pending');

    await user.click(screen.getByRole('button', { name: 'Clear filters' }));

    expect(titles()).toHaveLength(3);
    expect(url()).toBe('/sessions');
  });
});
