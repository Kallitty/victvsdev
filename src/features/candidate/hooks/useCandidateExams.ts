import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { type Exam, examsQueryOptions } from '@/features/exams';

import { selectCandidateExams } from '../model/candidateExams';

/** One candidate's exams from the shared cache; polls so exam-day status changes appear. */
export function useCandidateExams(candidateId: number) {
  const select = useCallback((exams: Exam[]) => selectCandidateExams(exams, candidateId), [candidateId]);
  return useQuery({ ...examsQueryOptions(), select, refetchInterval: 60_000 });
}
