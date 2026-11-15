import { screen } from '@testing-library/react';

import { getExams } from '@/features/exams/api/examsApi';
import { makeExam } from '@/test/fixtures';
import { renderWithProviders } from '@/test/renderWithProviders';

import type { LocationGroup } from '../model/locations';
import { ExamMapPage } from './ExamMapPage';

vi.mock('@/features/exams/api/examsApi', () => ({ getExams: vi.fn(), updateExamStatus: vi.fn() }));

// Leaflet needs a real layout engine that jsdom doesn't have, so the map is stubbed here.
// The real map is checked in a real browser by the end-to-end tests (Step 8).
vi.mock('../components/ExamMapView', () => ({
  ExamMapView: ({ groups }: { groups: readonly LocationGroup[] }) => (
    <div data-testid="map">{groups.length} markers</div>
  ),
}));

const italy = { id: 3, country: 'Italy', latitude: 45.478482, longitude: 9.116238 };

describe('ExamMapPage', () => {
  it('shows one marker per venue and the same information as text', async () => {
    vi.mocked(getExams).mockResolvedValue([
      makeExam({ status: 'pending', location: italy }),
      makeExam({ status: 'finished', location: { ...italy, id: 5, country: 'italy' } }),
      makeExam({ status: 'started' }), // United Kingdom by default
    ]);

    renderWithProviders(<ExamMapPage />);

    expect(await screen.findByTestId('map')).toHaveTextContent('2 markers');
    const list = screen.getByRole('region', { name: 'Sessions by venue' });
    expect(list).toHaveTextContent('Italy: 2 sessions (1 pending, 1 finished)');
    expect(list).toHaveTextContent('United Kingdom: 1 sessions (1 started)');
  });

  it('explains a failure and offers a retry', async () => {
    vi.mocked(getExams).mockRejectedValue(new Error('Network error'));

    renderWithProviders(<ExamMapPage />);

    expect(await screen.findByRole('alert')).toHaveTextContent("Couldn't load exam locations.");
    expect(screen.getByRole('button', { name: 'Try again' })).toBeInTheDocument();
  });
});
