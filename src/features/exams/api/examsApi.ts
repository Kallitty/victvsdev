import { httpClient, type RequestOptions } from '@/shared/api/httpClient';

import type { Candidate, Exam, ExamStatus } from '../model/types';
import { parseCandidateList, parseExam, parseExamList, tryParseExam } from './parsers';

export async function getExams(options: RequestOptions = {}): Promise<Exam[]> {
  const response = await httpClient.get<unknown>('/exams', options);
  return parseExamList(response.data);
}

export async function getExam(id: number, options: RequestOptions = {}): Promise<Exam> {
  const response = await httpClient.get<unknown>(`/exams/${id}`, options);
  return parseExam(response.data);
}

export async function getCandidates(options: RequestOptions = {}): Promise<Candidate[]> {
  const response = await httpClient.get<unknown>('/candidates', options);
  return parseCandidateList(response.data);
}

/** Returns the updated exam if the server sends one back, otherwise null. */
export async function updateExamStatus(id: number, status: ExamStatus): Promise<Exam | null> {
  const response = await httpClient.patch<unknown>(`/exams/${id}/status`, { status });
  return tryParseExam(response.data);
}
