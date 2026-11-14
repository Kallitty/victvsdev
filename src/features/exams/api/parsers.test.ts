import { ApiDataError } from '@/shared/api/validation';

import { parseExam, parseExamList } from './parsers';

const rawExam = {
  id: 3,
  title: 'Certification for Woodworking',
  status: 'pending',
  datetime: '2026-04-15 10:15:00',
  language: 'German',
  location_id: 2,
  created_at: '2026-02-12T16:44:58.000000Z',
  candidates: [{ id: 1, name: 'Wilmers', pivot: { exam_id: 3, candidate_id: 1 } }],
  location: { id: 2, country: 'Germany', latitude: '52.520008', longitude: '13.404954' },
};

describe('parseExam', () => {
  it('converts the API record into the domain type', () => {
    expect(parseExam(rawExam)).toEqual({
      id: 3,
      title: 'Certification for Woodworking',
      status: 'pending',
      datetime: '2026-04-15 10:15:00',
      language: 'German',
      location: { id: 2, country: 'Germany', latitude: 52.520008, longitude: 13.404954 },
      candidates: [{ id: 1, name: 'Wilmers' }],
    });
  });

  it('fails loudly, with the path, when the contract breaks', () => {
    expect(() => parseExam({ ...rawExam, status: 'cancelled' })).toThrow(ApiDataError);
    expect(() =>
      parseExamList([rawExam, { ...rawExam, location: { ...rawExam.location, latitude: 'north' } }]),
    ).toThrow('exams[1].location.latitude');
  });

  it('accepts a Laravel { data: [...] } wrapper', () => {
    expect(parseExamList({ data: [rawExam] })).toHaveLength(1);
  });
});
