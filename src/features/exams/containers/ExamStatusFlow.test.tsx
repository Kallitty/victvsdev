import { screen } from '@testing-library/react';

import { renderWithProviders } from '@/test/renderWithProviders';

import { getExams, updateExamStatus } from '../api/examsApi';
import type { Exam } from '../model/types';
import { ExamList } from './ExamList';

vi.mock('../api/examsApi', () => ({ getExams: vi.fn(), updateExamStatus: vi.fn() }));

const makeExam = (overrides: Partial<Exam> = {}): Exam => ({
  id: 1,
  title: 'Exam A',
  status: 'pending',
  datetime: '2026-03-15 09:00:00',
  language: 'English',
  location: null,
  candidates: [],
  ...overrides,
});

describe('changing an exam status', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('starts an exam immediately and keeps it once the server agrees', async () => {
    vi.mocked(getExams)
      .mockResolvedValueOnce([makeExam()])
      .mockResolvedValue([makeExam({ status: 'started' })]); // the refetch after saving
    vi.mocked(updateExamStatus).mockResolvedValue(null);
    const { user } = renderWithProviders(<ExamList />);

    await user.click(await screen.findByRole('button', { name: 'Start Exam A' }));

    expect(updateExamStatus).toHaveBeenCalledWith(1, 'started');
    expect(await screen.findByRole('button', { name: 'Finish Exam A' })).toBeInTheDocument();
  });

  it('rolls back and explains when the server rejects the change', async () => {
    vi.mocked(getExams).mockResolvedValue([makeExam()]);
    vi.mocked(updateExamStatus).mockRejectedValue(new Error('Network error'));
    const { user } = renderWithProviders(<ExamList />);

    await user.click(await screen.findByRole('button', { name: 'Start Exam A' }));

    expect(await screen.findByText(/Couldn't update Exam A/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Start Exam A' })).toBeInTheDocument();
  });

  it('locks the button while saving, so a double click cannot skip a stage', async () => {
    vi.mocked(getExams).mockResolvedValue([makeExam()]);
    vi.mocked(updateExamStatus).mockReturnValue(new Promise(() => {})); // never settles
    const { user } = renderWithProviders(<ExamList />);

    await user.click(await screen.findByRole('button', { name: 'Start Exam A' }));

    expect(screen.getByRole('button', { name: 'Saving Exam A' })).toBeDisabled();
    expect(updateExamStatus).toHaveBeenCalledTimes(1);
  });

  it('asks for confirmation before finishing, and Cancel does nothing', async () => {
    vi.mocked(getExams).mockResolvedValue([makeExam({ status: 'started' })]);
    vi.mocked(updateExamStatus).mockResolvedValue(null);
    const { user } = renderWithProviders(<ExamList />);

    await user.click(await screen.findByRole('button', { name: 'Finish Exam A' }));
    await user.click(screen.getByRole('button', { name: 'Cancel' }));
    expect(updateExamStatus).not.toHaveBeenCalled();

    await user.click(screen.getByRole('button', { name: 'Finish Exam A' }));
    await user.click(screen.getByRole('button', { name: 'Confirm finish' }));
    expect(updateExamStatus).toHaveBeenCalledWith(1, 'finished');
  });

  it('offers no action once an exam has finished', async () => {
    vi.mocked(getExams).mockResolvedValue([makeExam({ status: 'finished' })]);
    renderWithProviders(<ExamList />);

    expect(await screen.findByText('Complete')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Exam A/ })).not.toBeInTheDocument();
  });
});
