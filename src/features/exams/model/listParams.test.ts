import { DEFAULT_SORT, EMPTY_FILTERS } from './filters';
import { parseListParams, toListParams } from './listParams';

describe('list params in the URL', () => {
  it('round-trips filters and sort', () => {
    const state = {
      filters: { ...EMPTY_FILTERS, country: 'Italy', status: 'pending' as const, dateFrom: '2026-04-01' },
      sort: { key: 'title' as const, direction: 'desc' as const },
    };
    expect(parseListParams(toListParams(state))).toEqual(state);
  });

  it('keeps the default view URL clean', () => {
    expect(toListParams({ filters: EMPTY_FILTERS, sort: DEFAULT_SORT }).toString()).toBe('');
  });

  it('ignores invalid or hostile values instead of breaking', () => {
    const parsed = parseListParams(
      new URLSearchParams('status=deleted&from=yesterday&candidate=-1&sort=evil'),
    );
    expect(parsed).toEqual({ filters: EMPTY_FILTERS, sort: DEFAULT_SORT });
  });
});
