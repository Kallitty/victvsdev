import { useMutation, useMutationState, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useRef } from 'react';
import { toast } from 'react-hot-toast';

import { getErrorMessage } from '@/shared/api/errors';

import { updateExamStatus } from '../api/examsApi';
import { examKeys } from '../api/queryKeys';
import { nextStatus, STATUS_LABELS } from '../model/status';
import type { Exam, ExamStatus } from '../model/types';

interface AdvanceVariables {
  /** The exam as the user saw it when they clicked: its status is the "from" state. */
  exam: Exam;
  target: ExamStatus;
}

/**
 * Sets one exam's status in the cached list. With `onlyIf`, it changes only if the
 * exam still has that status, so a rollback never overwrites newer data.
 */
function setCachedStatus(exams: Exam[] | undefined, examId: number, status: ExamStatus, onlyIf?: ExamStatus) {
  return exams?.map((exam) =>
    exam.id === examId && (onlyIf === undefined || exam.status === onlyIf) ? { ...exam, status } : exam,
  );
}

/**
 * Optimistic status changes:
 *  1. the row changes immediately (the cache is updated before the request)
 *  2. if it fails, only that exam rolls back and the user is told why
 *  3. once the last change settles, the list is refetched to match the server
 * A second click while a change is in flight is ignored, so a double click can never
 * skip a stage (pending -> finished).
 */
export function useAdvanceExamStatus() {
  const queryClient = useQueryClient();
  const inFlight = useRef(new Set<number>());
  const listKey = examKeys.lists();

  const { mutate } = useMutation({
    mutationKey: examKeys.advanceStatus(),
    mutationFn: ({ exam, target }: AdvanceVariables) => updateExamStatus(exam.id, target),

    onMutate: async ({ exam, target }) => {
      // Stop a refetch already in flight from overwriting the optimistic change.
      await queryClient.cancelQueries({ queryKey: listKey });
      queryClient.setQueryData<Exam[]>(listKey, (old) => setCachedStatus(old, exam.id, target));
    },

    onSuccess: (updated, { exam, target }) => {
      const confirmed = updated?.status ?? target; // trust the server's answer if it sends one
      if (confirmed !== target) {
        queryClient.setQueryData<Exam[]>(listKey, (old) => setCachedStatus(old, exam.id, confirmed));
      }
      toast.success(`${exam.title} is now ${STATUS_LABELS[confirmed].toLowerCase()}.`, {
        id: `exam-${exam.id}`,
      });
    },

    onError: (error, { exam, target }) => {
      queryClient.setQueryData<Exam[]>(listKey, (old) => setCachedStatus(old, exam.id, exam.status, target));
      toast.error(`Couldn't update ${exam.title}. ${getErrorMessage(error)}`, { id: `exam-${exam.id}` });
    },

    onSettled: async (_data, _error, { exam }) => {
      inFlight.current.delete(exam.id);
      // Refetch only when this is the last change in flight; earlier could undo another row's update.
      if (queryClient.isMutating({ mutationKey: examKeys.advanceStatus() }) === 1) {
        await queryClient.invalidateQueries({ queryKey: listKey });
      }
    },
  });

  const advance = useCallback(
    (exam: Exam) => {
      const target = nextStatus(exam.status);
      if (!target || inFlight.current.has(exam.id)) return;
      inFlight.current.add(exam.id);
      mutate({ exam, target });
    },
    [mutate],
  );

  const pendingList = useMutationState({
    filters: { mutationKey: examKeys.advanceStatus(), status: 'pending' },
    select: (mutation) => (mutation.state.variables as AdvanceVariables | undefined)?.exam.id,
  });
  const pendingIds = useMemo(
    () => new Set(pendingList.filter((id): id is number => id !== undefined)),
    [pendingList],
  );

  return { advance, pendingIds };
}
