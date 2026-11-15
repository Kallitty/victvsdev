import type { Exam } from '@/features/exams';
import { parseExamInstant } from '@/shared/lib/datetime';

const instant = (exam: Exam) => parseExamInstant(exam.datetime) ?? Infinity;

/**
 * One candidate's exams. The API returns every candidate's exams to anyone; in
 * production the server should only send the caller's own (e.g. GET /me/exams).
 */
export function selectCandidateExams(exams: readonly Exam[], candidateId: number) {
  const mine = exams.filter((exam) => exam.candidates.some((c) => c.id === candidateId));
  return {
    upcoming: mine.filter((e) => e.status !== 'finished').sort((a, b) => instant(a) - instant(b)),
    completed: mine.filter((e) => e.status === 'finished').sort((a, b) => instant(b) - instant(a)),
  };
}
