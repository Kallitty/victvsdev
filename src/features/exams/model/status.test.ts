import { isExamStatus, nextStatus } from './status';

describe('exam lifecycle', () => {
  it('only moves forwards: pending → started → finished', () => {
    expect(nextStatus('pending')).toBe('started');
    expect(nextStatus('started')).toBe('finished');
    expect(nextStatus('finished')).toBeNull();
  });

  it('recognises valid statuses only', () => {
    expect(isExamStatus('started')).toBe(true);
    expect(isExamStatus('cancelled')).toBe(false);
    expect(isExamStatus(undefined)).toBe(false);
  });
});
