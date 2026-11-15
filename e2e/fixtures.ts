import { readFileSync } from 'node:fs';

import { expect, type Page, test as base } from '@playwright/test';

interface RawExam {
  id: number;
  title: string;
  status: string;
  [key: string]: unknown;
}

const NEXT_STATUS: Partial<Record<string, string>> = { pending: 'started', started: 'finished' };

// A 1x1 transparent PNG: map tiles are faked, so tests don't depend on OpenStreetMap being up.
const BLANK_TILE = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

/**
 * A stateful fake of the VICTVS API on the page's network layer. It remembers status
 * changes (so a reload shows them) and enforces the one-way lifecycle the real
 * server should enforce.
 */
export class MockApi {
  exams = JSON.parse(readFileSync(new URL('./data/exams.json', import.meta.url), 'utf8')) as RawExam[];
  /** Reject the next status change with a 422, as a server-side rule would. */
  rejectNextStatusChange = false;

  async install(page: Page): Promise<void> {
    // Registered first, so it only catches requests nothing else handles: no test can reach the real API.
    await page.route('**/api/**', (route) => route.fulfill({ status: 501, json: { message: 'Not mocked' } }));

    await page.route('**/api/candidates', (route) => {
      const all = this.exams.flatMap((e) => (e.candidates ?? []) as { id: number; name: string }[]);
      return route.fulfill({ json: [...new Map(all.map((c) => [c.id, c])).values()] });
    });

    await page.route('**/api/exams', (route) => route.fulfill({ json: this.exams }));

    await page.route('**/api/exams/*/status', async (route) => {
      const id = Number(/\/exams\/(\d+)\/status/.exec(route.request().url())?.[1]);
      const { status } = route.request().postDataJSON() as { status: string };
      const exam = this.exams.find((e) => e.id === id);

      if (this.rejectNextStatusChange || !exam || NEXT_STATUS[exam.status] !== status) {
        this.rejectNextStatusChange = false;
        await route.fulfill({ status: 422, json: { message: 'Invalid status transition.' } });
        return;
      }
      exam.status = status;
      await route.fulfill({ json: exam });
    });

    await page.route('https://tile.openstreetmap.org/**', (route) =>
      route.fulfill({ contentType: 'image/png', body: BLANK_TILE }),
    );
  }
}

/** Every test gets a fresh fake API automatically (`auto: true`). */
export type SignedInAs = 'admin' | { candidateId: number; candidateName: string } | null;

export const test = base.extend<{ api: MockApi; signedInAs: SignedInAs; session: undefined }>({
  api: [
    async ({ page }, use) => {
      const api = new MockApi();
      await api.install(page);
      await use(api);
    },
    { auto: true },
  ],

  /** Who each test starts as. Override with test.use({ signedInAs: null }). */
  signedInAs: ['admin', { option: true }],

  // Seeds the demo session before the page loads, so tests start where they need to be.
  session: [
    async ({ page, signedInAs }, use) => {
      if (signedInAs !== null) {
        const now = Date.now();
        const base = { signedInAt: now, expiresAt: now + 8 * 60 * 60 * 1000 };
        const session =
          signedInAs === 'admin' ? { role: 'admin', ...base } : { role: 'candidate', ...signedInAs, ...base };
        await page.addInitScript(
          ([key, value]) => {
            if (window.sessionStorage.getItem(key) === null) window.sessionStorage.setItem(key, value);
          },
          ['victvs-session', JSON.stringify(session)] as const,
        );
      }
      await use(undefined);
    },
    { auto: true },
  ],
});
export { expect };
