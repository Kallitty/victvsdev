import { isAxiosError } from 'axios';

import { ApiDataError } from './validation';

function serverMessage(data: unknown): string | null {
  if (typeof data === 'object' && data !== null && 'message' in data) {
    const { message } = data;
    if (typeof message === 'string' && message.trim() !== '') return message.trim().slice(0, 200);
  }
  return null;
}

/**
 * Turns any error into a sentence a user can act on. Raw errors and stack traces are
 * never shown, and server text is length-limited and rendered as text only.
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof ApiDataError) return 'The exam service returned data in an unexpected format.';

  if (isAxiosError(error)) {
    if (!error.response) return "Couldn't reach the exam service. Check your connection and try again.";
    const { status } = error.response;
    const data: unknown = error.response.data;

    if (status === 404) return 'That exam could not be found. It may have been removed.';
    if (status === 400 || status === 409 || status === 422) {
      return serverMessage(data) ?? 'The exam service rejected that change.';
    }
    if (status === 429) return 'Too many requests. Please wait a moment and try again.';
    if (status >= 500) return 'The exam service is having problems. Please try again shortly.';
  }

  return 'Something went wrong. Please try again.';
}
