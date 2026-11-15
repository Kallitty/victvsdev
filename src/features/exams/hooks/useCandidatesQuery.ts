import { queryOptions, useQuery } from '@tanstack/react-query';

import { getCandidates } from '../api/examsApi';
import { candidateKeys } from '../api/queryKeys';

export function useCandidatesQuery() {
  return useQuery(
    queryOptions({
      queryKey: candidateKeys.lists(),
      queryFn: ({ signal }) => getCandidates({ signal }),
      staleTime: 5 * 60 * 1000, // the candidate list rarely changes
      select: (candidates) => [...candidates].sort((a, b) => a.name.localeCompare(b.name, 'en-GB')),
    }),
  );
}
