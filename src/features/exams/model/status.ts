import { EXAM_STATUSES, type ExamStatus } from './types';

const NEXT_STATUS: Record<ExamStatus, ExamStatus | null> = {
  pending: 'started',
  started: 'finished',
  finished: null,
};

export const STATUS_LABELS: Record<ExamStatus, string> = {
  pending: 'Pending',
  started: 'Started',
  finished: 'Finished',
};

export function isExamStatus(value: unknown): value is ExamStatus {
  return typeof value === 'string' && (EXAM_STATUSES as readonly string[]).includes(value);
}

/** The only status an exam may move to next, or null once it has finished. */
export function nextStatus(status: ExamStatus): ExamStatus | null {
  return NEXT_STATUS[status];
}
