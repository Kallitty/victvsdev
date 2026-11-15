import { parseStoredSession, safeNextPath, type Session } from './session';

const admin: Session = { role: 'admin', signedInAt: 1, expiresAt: 2 };
const candidate: Session = {
  role: 'candidate',
  candidateId: 1,
  candidateName: 'Wilmers',
  signedInAt: 1,
  expiresAt: 2,
};

describe('parseStoredSession', () => {
  it('restores valid sessions', () => {
    expect(parseStoredSession(JSON.stringify(admin))).toEqual(admin);
    expect(parseStoredSession(JSON.stringify(candidate))).toEqual(candidate);
  });

  it.each([
    ['invalid JSON', '{nope'],
    ['an unknown role', JSON.stringify({ ...admin, role: 'superadmin' })],
    ['a candidate with no id', JSON.stringify({ ...candidate, candidateId: undefined })],
  ])('rejects %s', (_label, raw) => {
    expect(parseStoredSession(raw)).toBeNull();
  });
});

describe('safeNextPath', () => {
  it('returns to a page in the user\u2019s own area', () => {
    expect(safeNextPath('/admin/sessions?country=Italy', admin)).toBe('/admin/sessions?country=Italy');
  });

  it.each([['//evil.example'], ['https://evil.example'], ['/administrator']])('ignores %s', (next) => {
    expect(safeNextPath(next, admin)).toBe('/admin');
  });

  it('never sends a candidate into the admin area', () => {
    expect(safeNextPath('/admin/sessions', candidate)).toBe('/me');
  });
});
