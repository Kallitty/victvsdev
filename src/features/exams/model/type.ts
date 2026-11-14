/**
 * Domain types used throughout the UI. These are the cleaned-up shapes produced by
 * ../api/parsers.ts, not the raw API JSON (which has string coordinates and extra
 * Laravel fields such as created_at and pivot).
 */

/** The exam lifecycle, in order. An exam only ever moves forwards. */
export const EXAM_STATUSES = ['pending', 'started', 'finished'] as const;

export type ExamStatus = (typeof EXAM_STATUSES)[number];

export interface Candidate {
  id: number;
  name: string;
}

export interface ExamLocation {
  id: number;
  country: string;
  latitude: number;
  longitude: number;
}

export interface Exam {
  id: number;
  title: string;
  status: ExamStatus;
  /** UTC, as the API sends it without a zone suffix, e.g. "2026-12-07 09:15:00". */
  datetime: string;
  language: string;
  location: ExamLocation | null;
  candidates: Candidate[];
}
