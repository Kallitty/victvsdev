/** The one place cache keys are defined, so refetching can target them precisely. */
export const examKeys = {
  all: ['exams'] as const,
  lists: () => [...examKeys.all, 'list'] as const,
  advanceStatus: () => [...examKeys.all, 'advance-status'] as const,
};
