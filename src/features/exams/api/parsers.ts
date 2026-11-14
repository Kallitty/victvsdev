import {
  ApiDataError,
  expectArray,
  expectObject,
  readCoordinate,
  readId,
  readString,
  unwrap,
} from '@/shared/api/validation';

import { isExamStatus } from '../model/status';
import type { Candidate, Exam, ExamLocation } from '../model/types';

export function parseCandidate(raw: unknown, path = 'candidate'): Candidate {
  const obj = expectObject(unwrap(raw), path);
  return { id: readId(obj, 'id', path), name: readString(obj, 'name', path).trim() };
}

export function parseLocation(raw: unknown, path = 'location'): ExamLocation {
  const obj = expectObject(unwrap(raw), path);
  return {
    id: readId(obj, 'id', path),
    country: readString(obj, 'country', path).trim(),
    latitude: readCoordinate(obj, 'latitude', path, 90),
    longitude: readCoordinate(obj, 'longitude', path, 180),
  };
}

export function parseExam(raw: unknown, path = 'exam'): Exam {
  const obj = expectObject(unwrap(raw), path);

  const status = obj.status;
  if (!isExamStatus(status)) {
    throw new ApiDataError(`${path}.status: unexpected value ${JSON.stringify(status)}`);
  }

  const rawCandidates = obj.candidates ?? [];
  if (!Array.isArray(rawCandidates)) throw new ApiDataError(`${path}.candidates: expected an array`);

  return {
    id: readId(obj, 'id', path),
    title: readString(obj, 'title', path).trim(),
    status,
    datetime: readString(obj, 'datetime', path),
    language: typeof obj.language === 'string' ? obj.language : '',
    location: obj.location == null ? null : parseLocation(obj.location, `${path}.location`),
    candidates: rawCandidates.map((c, i) => parseCandidate(c, `${path}.candidates[${i}]`)),
  };
}

export function parseExamList(payload: unknown): Exam[] {
  return expectArray(payload, 'exams').map((item, i) => parseExam(item, `exams[${i}]`));
}

export function parseCandidateList(payload: unknown): Candidate[] {
  return expectArray(payload, 'candidates').map((item, i) => parseCandidate(item, `candidates[${i}]`));
}

/** The PATCH response isn't documented: use it if it's an exam, otherwise null. */
export function tryParseExam(payload: unknown): Exam | null {
  try {
    return parseExam(payload);
  } catch {
    return null;
  }
}
