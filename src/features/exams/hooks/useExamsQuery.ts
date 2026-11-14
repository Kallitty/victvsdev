import { queryOptions, useQuery } from '@tanstack/react-query';

import { getExams } from '../api/examsApi';
import { examKeys } from '../api/queryKeys';

export const examsQueryOptions = () =>
  queryOptions({
    queryKey: examKeys.lists(),
    // React Query passes an AbortSignal, so leaving the page cancels the request.
    queryFn: ({ signal }) => getExams({ signal }),
  });

export function useExamsQuery() {
  return useQuery(examsQueryOptions());
}
