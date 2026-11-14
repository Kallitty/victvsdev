import axios from 'axios';

/** Base URL, timeout and headers are decided once, here. */
export const httpClient = axios.create({
  // `||` on purpose: an empty env value should fall back too.
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10_000,
  headers: { Accept: 'application/json' },
});

export interface RequestOptions {
  /** Lets a caller cancel a request it no longer needs (e.g. the user left the page). */
  signal?: AbortSignal;
}
