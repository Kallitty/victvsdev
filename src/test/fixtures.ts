import type { Exam } from '@/features/exams';

let nextId = 1;

/** A valid exam with sensible defaults; override only what a test cares about. */
export function makeExam(overrides: Partial<Exam> = {}): Exam {
  return {
    id: nextId++,
    title: 'Medical Examinations 1',
    status: 'pending',
    datetime: '2026-12-07 09:15:00',
    language: 'English',
    location: { id: 1, country: 'United Kingdom', latitude: 51.507351, longitude: -0.127758 },
    candidates: [{ id: 1, name: 'Wilmers' }],
    ...overrides,
  };
}
