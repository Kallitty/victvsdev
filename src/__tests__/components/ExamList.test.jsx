import { render, screen } from '@testing-library/react';
import ExamList from '../../components/ExamList';

// jest.mock('../../../utils/api', () => ({
//   getExams: jest.fn(),
// }))

// const mockedGetExams = getExams

const mockExams = [
  {
    id: 1,
    title: 'Exam A',
    status: 'pending',
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
    status: 'started',
    datetime: '2026-03-20T14:00:00',
    language: 'French',
    locationId: 2,
    location: { id: 2, country: 'Germany', latitude: 52.5, longitude: 13.4 },
    candidates: [{ id: 3, name: 'Charlie' }],
  },
];

describe('ExamList', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('loading state', () => {
    it('shows a loading message while fetching exams', () => {
      // mockedGetExams.mockReturnValue(new Promise(() => {})) // never resolves
      render(<ExamList />);
      expect(screen.getByText('Loading sessions...')).toBeInTheDocument();
    });
  });

  describe('after a successful fetch', () => {
    // beforeEach(() => {
    //   // mockedGetExams.mockResolvedValue(mockExams)
    // })

    it('renders the page heading', async () => {
      render(<ExamList />);

      expect(await screen.findByText('Upcoming Sessions')).toBeInTheDocument();
    });

    it('renders a row for each exam session', async () => {
      render(<ExamList />);

      expect(await screen.findByText('exam-row')).toHaveLength(2);
    });

    it('renders each exam title', async () => {
      render(<ExamList />);

      expect(await screen.findByText('Exam A')).toBeInTheDocument();
      expect(screen.getByText('Exam B')).toBeInTheDocument();
    });

    it('renders the table column headers', async () => {
      render(<ExamList />);

      expect(await screen.findByText('Title')).toBeInTheDocument();

      expect(screen.getByText('Candidates')).toBeInTheDocument();
      expect(screen.getByText('Status')).toBeInTheDocument();
      expect(screen.getByText('Date')).toBeInTheDocument();
      expect(screen.getByText('Country')).toBeInTheDocument();
    });
  });

  describe('when the fetch returns no exams', () => {
    it('shows an empty state message', async () => {
      // mockedGetExams.mockResolvedValue([])
      render(<ExamList />);
      expect(await screen.findByText('No sessions to display...')).toBeInTheDocument();
    });
  });

  describe('when the fetch fails', () => {
    it('shows the empty state message', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      // mockedGetExams.mockRejectedValue(new Error('Network error'))
      render(<ExamList />);
      expect(await screen.findByText('No sessions to display...')).toBeInTheDocument();
      consoleErrorSpy.mockRestore();
    });
  });
});
