/**
 * The test suite supplied with the starter, made to run. VICTVS's assertions are kept
 * as written; only the plumbing changed:
 *  1. jest.* -> vi.* (the project runs on Vitest).
 *  2. The API mock was commented out and pointed at a path that didn't exist; it now
 *     mocks the exams API module, and getExams is imported.
 *  3. findByText('exam-row') + toHaveLength(2) can never pass: findByText returns one
 *     element and 'exam-row' isn't visible text. Rows have data-testid="exam-row", so
 *     the intent is findAllByTestId('exam-row').
 *  4. Renamed from ExamList.jest.jsx to ExamList.test.tsx, next to the component.
 *  5. `as const` on the mock statuses so TypeScript accepts them as ExamStatus.
 *  6. render() -> renderWithProviders(): ExamList reads from React Query.
 */
import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';

import { getExams } from '../api/examsApi';
import { ExamList } from './ExamList';

vi.mock('../api/examsApi', () => ({
  getExams: vi.fn(),
  updateExamStatus: vi.fn(), // used by the status hook; not by these tests
}));

const mockedGetExams = vi.mocked(getExams);

const mockExams = [
  {
    id: 1,
    title: 'Exam A',
    status: 'pending' as const,
    datetime: '2026-03-15T09:00:00',
    language: 'English',
    locationId: 1,
    location: { id: 1, country: 'France', latitude: 48.8, longitude: 2.3 },
    candidates: [
      { id: 1, name: 'Alice' },
      { id: 2, name: 'Bob' },
    ],
  },
  {
    id: 2,
    title: 'Exam B',
    status: 'started' as const,
    datetime: '2026-03-20T14:00:00',
    language: 'French',
    locationId: 2,
    location: { id: 2, country: 'Germany', latitude: 52.5, longitude: 13.4 },
    candidates: [{ id: 3, name: 'Charlie' }],
  },
];

describe('ExamList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows a loading message while fetching exams', () => {
      mockedGetExams.mockReturnValue(new Promise(() => {})); // never resolves
      renderWithProviders(<ExamList />);
      expect(screen.getByText('Loading sessions...')).toBeInTheDocument();
    });
  });

  describe('after a successful fetch', () => {
    beforeEach(() => {
      mockedGetExams.mockResolvedValue(mockExams);
    });

    it('renders the page heading', async () => {
      renderWithProviders(<ExamList />);
      expect(await screen.findByText('Upcoming Sessions')).toBeInTheDocument();
    });

    it('renders a row for each exam session', async () => {
      renderWithProviders(<ExamList />);
      expect(await screen.findAllByTestId('exam-row')).toHaveLength(2);
    });

    it('renders each exam title', async () => {
      renderWithProviders(<ExamList />);
      expect(await screen.findByText('Exam A')).toBeInTheDocument();
      expect(screen.getByText('Exam B')).toBeInTheDocument();
    });

    it('renders the table column headers', async () => {
      renderWithProviders(<ExamList />);
      expect(await screen.findByText('Title')).toBeInTheDocument();
      expect(screen.getByText('Candidates')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
    });
  });

  describe('when the fetch returns no exams', () => {
    it('shows an empty state message', async () => {
      mockedGetExams.mockResolvedValue([]);
      renderWithProviders(<ExamList />);
      expect(await screen.findByText('No sessions to display...')).toBeInTheDocument();
    });
  });

  describe('when the fetch fails', () => {
    it('shows the empty state message', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockedGetExams.mockRejectedValue(new Error('Network error'));
      renderWithProviders(<ExamList />);
      expect(await screen.findByText('No sessions to display...')).toBeInTheDocument();
      consoleErrorSpy.mockRestore();
    });
  });
});
