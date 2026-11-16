# VICTVS Exam Schedule System

A React and TypeScript frontend for the VICTVS exam API. Staff can see every exam session, move a session from
**pending → started → finished**, filter and sort the schedule, and see each venue on a map. Candidates sign in
to a page of their own exams, with a countdown and an "Add to calendar" download.

**Stack:** Vite, React 18, strict TypeScript, TanStack Query, React Router, CSS Modules with design tokens,
Leaflet and OpenStreetMap, Vitest with Testing Library, Playwright with axe, GitHub Actions.

---

## Quick start

Requires **Node.js 24 LTS** or newer (`.nvmrc` pins the version CI uses).

```bash
npm ci
cp .env.example .env     # Windows PowerShell: Copy-Item .env.example .env
npm run dev              # http://localhost:3000
```

| Script                | What it does                                                    |
| --------------------- | --------------------------------------------------------------- |
| `npm run dev`         | Development server with hot reload                              |
| `npm run build`       | Type-check and build for production into `dist/`                |
| `npm run preview`     | Serve the production build locally                              |
| `npm run typecheck`   | TypeScript in strict mode, no output                            |
| `npm run lint`        | ESLint (strict, type-aware, accessibility rules), zero warnings |
| `npm run format`      | Prettier: format every file                                     |
| `npm test`            | Unit and integration tests (Vitest)                             |
| `npm run test:e2e`    | End-to-end tests (Playwright) against the production build      |
| `npm run test:e2e:ui` | The same, in Playwright's interactive viewer                    |

**Trying it out:** the sign-in page offers **Continue as admin**, or pick a candidate's name (for example
_Wilmers_) to see the candidate view. There are no passwords; see [Access control](#access-control).

---

## Features

### The brief

- **Exam schedule:** every session with its title, candidates, status, date and time, venue and language.
- **Status progression:** _Start_ and _Finish_ buttons move a session along `pending → started → finished`
  through `PATCH /exams/{id}/status`. VICTVS confirmed the lifecycle is one-way, so the UI only offers the next
  step. Finishing asks for confirmation. The change shows immediately and is undone, with the server's reason,
  if the request fails.
- **The supplied tests pass,** with only their plumbing fixed (see [What I found in the starter](#what-i-found-in-the-starter)).
- **Map of venues** using a third-party API (Leaflet with OpenStreetMap).
- **Filter and sort** by date, candidate and location, plus status and free-text search.
- **Responsive design** from phone to desktop, with dark and light themes.
- **Own tests** at unit, integration and end-to-end level.

### Beyond the brief

- **Filters live in the URL,** e.g. `/admin/sessions?country=Italy&status=pending`, so a filtered view can be
  bookmarked, shared or reloaded. URL values are validated, and anything unknown falls back to the default.
- **Venue-local times:** each session is shown in its venue's time zone with the abbreviation
  (`Wed 15 Apr 2026, 12:15 CEST`). Hovering a time shows it in the viewer's own zone.
- **One shared, cached data source:** every page reads the same TanStack Query cache, so moving between pages
  is instant and an update made on one page appears on the others.
- **Dark/light switch:** follows the operating system on a first visit, then remembers the choice and keeps
  open tabs in sync. A small script applies the theme before the page paints, so there is no flash.
- **Admin and candidate views** with route guards and role-based navigation (see below).
- **Candidate exam pages:** a countdown ("Tomorrow", "In 3 weeks"), a clear notice when a pending exam's date has
  passed, and an **Add to calendar** button that builds a standards-compliant `.ics` file in the browser.
- **Live on exam day:** candidate pages refresh every minute, so an invigilator's status change appears without
  a reload.
- **Loading, empty, error and no-results states,** each with a way forward, and an error boundary so a crash in
  one page never takes down the header and navigation.

### Routes

| Path                | Who       | Page                                                   |
| ------------------- | --------- | ------------------------------------------------------ |
| `/sign-in`          | Everyone  | Demo sign-in: continue as admin, or choose a candidate |
| `/admin`            | Admin     | Overview of the system                                 |
| `/admin/sessions`   | Admin     | All sessions: filter, sort, start and finish           |
| `/admin/map`        | Admin     | Venue map, with the same information as text           |
| `/me`               | Candidate | My exams: upcoming and in progress, then completed     |
| `/me/exams/:examId` | Candidate | One of my exams: status, countdown, add to calendar    |
| `/`                 | Everyone  | Goes to your home page, or to sign-in                  |

Old links such as `/sessions?country=Italy` and `/exam-map` redirect to their `/admin` equivalents, keeping the
query string. Opening a protected page while signed out goes to sign-in and returns there afterwards.

---

## Architecture

```
src/
  app/                  App shell: query client, header, navigation, home page
  features/
    exams/              Schedule: API, parsers, filters, sorting, table, status control
    map/                Venue map and its text equivalent (lazy-loaded)
    auth/               Session model, demo auth service, provider, route guard, sign-in
    candidate/          My exams, exam detail page, countdown, calendar export
  shared/
    api/                HTTP client, response validation, user-facing error messages
    lib/                Date and time-zone helpers
    theme/              Theme provider, toggle and persistence
    ui/                 Error boundary
  styles/               Design tokens and global styles
  test/                 Test helpers and fixtures
e2e/                    Playwright tests and the fake API they run against
```

- **Feature folders:** each feature owns its API calls, model, hooks and components, and exposes a small public
  API through `index.ts`. Other code imports `@/features/exams`, never its internals.
- **Containers and components:** containers fetch and coordinate; components only render what they are given,
  which keeps them easy to test.
- **Model code is plain TypeScript:** filtering, sorting, time zones, countdowns and calendar files are pure
  functions with their own unit tests, separate from React.
- **Absolute imports** through the `@/` alias, configured once for TypeScript, Vite and Vitest.

### State

| Kind of state                   | Where it lives                                                   |
| ------------------------------- | ---------------------------------------------------------------- |
| Server data (exams, candidates) | TanStack Query cache                                             |
| Filters and sort order          | The URL query string                                             |
| Theme                           | React context, persisted in `localStorage`                       |
| Signed-in session               | React context, persisted in `sessionStorage` (ends with the tab) |
| Form inputs, dialogs            | Component state                                                  |

### Styling

CSS Modules with design tokens. Colours, spacing, radii and fonts are CSS custom properties in
`src/styles/tokens.css`. The light theme overrides the same tokens, so components never contain colour values
and switching theme is a single attribute on `<html>`. Status styling hangs off a `data-status` attribute.
CSS Modules keep styles scoped to their component with no runtime cost; styled-components, the other common
choice, has been in maintenance mode since 2025.

---

## Decisions and trade-offs

| Decision                                            | Why                                                                                                                                                                                                                                                                                                                         | Trade-off                                                                                                                                                     |
| --------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Vite + TypeScript instead of Create React App**   | CRA is deprecated and pulls in a long tail of audit warnings. Vite is the current standard, and strict TypeScript catches contract mistakes before they reach a browser.                                                                                                                                                    | A migration step up front. The supplied Jest test moved to Vitest, whose API is almost identical.                                                             |
| **TanStack Query for server data**                  | Several pages need the same data. A shared cache removes duplicate requests and handles cancellation, background refresh and optimistic updates in a well-understood way.                                                                                                                                                   | One dependency and a provider.                                                                                                                                |
| **Optimistic status updates, rolled back per exam** | Invigilators get instant feedback. A failed change only rolls back that exam, and only if it still shows the optimistic value, so it can never overwrite newer data. A ref guards against double clicks.                                                                                                                    | More logic than "send, then refetch". It is covered by integration and end-to-end tests.                                                                      |
| **Validate API responses at runtime**               | TypeScript types vanish at runtime. Checking at the boundary turns an API change into one clear error instead of `undefined` deep in a component. It also converts the API's string coordinates to numbers and unwraps Laravel's `{ data }` envelope.                                                                       | A small amount of hand-written validation. With more endpoints I would use Zod.                                                                               |
| **Times: stored in UTC, shown at the venue**        | VICTVS confirmed the API's times (`2026-12-07 09:15:00`) are UTC. They are parsed explicitly (`new Date()` would read them as local time) and shown in the venue's time zone, because that is when the candidate must be there. Date filters use the venue's calendar date, and calendar files carry the exact UTC instant. | Venue zones come from the country, which is right for the UK, Germany and Italy. A time zone per venue from the API would cover countries with several zones. |
| **Filtering in the browser**                        | The API returns the whole schedule and accepts no query parameters.                                                                                                                                                                                                                                                         | At scale, filtering and pagination belong on the server. The URL parameters map straight onto query parameters when that happens.                             |
| **Leaflet + OpenStreetMap instead of Google Maps**  | No API key or billing, so reviewers and CI can open the map. The map code is lazy-loaded, so it stays out of the main bundle.                                                                                                                                                                                               | OpenStreetMap tiles have a fair-use policy; production traffic would use a commercial tile provider.                                                          |
| **End-to-end tests use a fake API**                 | The VICTVS API is shared and status changes can't be undone. A stateful fake makes tests repeatable and guarantees they never change real data.                                                                                                                                                                             | The fake has to follow the real API's shape. It is built from real API records, string coordinates included.                                                  |

---

## Testing

| Level             | Tools                    | What it covers                                                                                                                                                                                                                                          |
| ----------------- | ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Unit**          | Vitest                   | Parsers, filters, sorting, URL parameters, time zones, countdowns, calendar files, session parsing, the open-redirect guard                                                                                                                             |
| **Integration**   | Vitest + Testing Library | Whole pages with the API module mocked: the supplied tests, the status flow with rollback, filters, the map's text summary, theme toggle, error boundary, sign-in, route guards and role-based pages                                                    |
| **End-to-end**    | Playwright               | The production build in Chrome at desktop and phone sizes: listing, starting and finishing sessions, a rejected change rolling back, filters surviving a reload, the real Leaflet map, theme persistence, sign-in for both roles, the calendar download |
| **Accessibility** | axe (in Playwright)      | WCAG 2 A and AA rules on the main pages; the build fails on serious or critical violations                                                                                                                                                              |

Tests query the page the way a user or a screen reader would: by role, label and visible text. Test isolation
and cleanup are set explicitly in the Vitest config, so no test depends on another test's leftovers.

---

## CI

GitHub Actions (`.github/workflows/ci.yml`) runs on every push to `main` and every pull request:

1. **Quality:** Prettier check, ESLint, TypeScript, unit and integration tests, production build. Cheapest
   checks first, so a formatting slip fails in seconds.
2. **End-to-end:** Playwright against the production build. If it fails, the report is uploaded so the failure
   can be replayed step by step.
3. **Dependency audit:** fails on high-severity vulnerabilities in production dependencies.

`npm ci` installs exactly what `package-lock.json` records, the workflow has read-only permissions, and `main`
is protected so a pull request can only be merged when all three jobs pass.

---

## What I found in the starter

1. **The API helper didn't provide a usable client,** and the schedule and map components never loaded data, so
   nothing reached the screen. The helper is replaced by `shared/api/httpClient.ts` and typed API functions.
2. **The supplied test file couldn't pass as written:**
   - the mock path pointed one directory too deep
   - `getExams` was used but never imported
   - `findByText('exam-row')` with `.toHaveLength(2)` can't succeed (it returns one element, and `exam-row` isn't
     visible text), so it became `findAllByTestId('exam-row')`
   - the tests expect a table with Title, Candidates, Status, Date and Country columns, but the starter rendered
     cards with different field names

   The assertions themselves are unchanged.

3. **Filter bugs:** each submit replaced all filters instead of combining them, _Reset_ cleared the list but not
   the filter state, `type="datetime"` isn't a valid input type, label `for` attributes didn't match the input
   ids, and name matching was exact and case-sensitive.
4. **Map:** it needed a billed Google Maps key, and marker keys weren't unique per marker.
5. **Tooling:** Create React App is deprecated, and the `.gitignore` had leading spaces, so `node_modules/` was
   never actually ignored.

## Notes on the API data

- **Inconsistent country names:** `"italy"` (location 5) and `"Italy"` (location 3) share coordinates. Countries
  are normalised for display, filtering and the map, and both records share one marker.
- **Coordinates are strings,** so they are validated and converted to numbers.
- **Times are UTC without a `Z`,** confirmed by VICTVS (see the dates decision above).
- **Location ids skip a number** (1, 2, 3, 5). Nothing assumes they are sequential.
- **Statuses and dates disagree in places:** exam 1 is `started` but scheduled for December 2026, and several
  `pending` exams are dated in the past. The UI doesn't block status changes by date; that is a business rule to
  agree with operations rather than guess in the frontend. Candidates see a clear notice on an overdue exam.
- **The status endpoint is unauthenticated:** anyone who can reach `PATCH /exams/{id}/status` can change an exam.
  Fine for a test API; production needs authentication, role checks and an audit log.

---

## Access control

The VICTVS API has **no authentication**: anyone can change a status, and `GET /exams` returns every
candidate's data. So:

- **What the app does:** role-based views. An `AuthProvider` holds a typed session (admin, or a candidate with an
  id). `RequireRole` guards each area, and navigation follows the role. Candidates never see status controls,
  other candidates' names or other people's exams: an exam that isn't theirs gets the same "not found" as one that
  doesn't exist, so nothing about it is revealed.
- **What it deliberately doesn't do:** pretend to authenticate. There are no passwords, because there is nothing
  to check them against and anything in a frontend bundle is public. The sign-in page says "Demo mode" plainly.
- **Untrusted input stays untrusted:** the stored session is validated on every load and discarded if tampered
  with or expired (sessions last 8 hours and end when the tab closes). The `?next=` return path only allows
  same-site paths inside the user's own area, which blocks open redirects such as `?next=//evil.example`.
  Signing out also clears cached data, which matters on shared exam-centre computers.
- **What production needs, on the server:** real sign-in (for example Laravel Sanctum, or SSO for staff), a role
  check on every request, candidate endpoints scoped to the caller (`GET /me/exams`), and an audit log of status
  changes. The UI is ready: replace the demo service behind the `AuthService` interface, and no screen changes.

## Security

- **No secrets:** the API needs no key, and `.env` files are git-ignored apart from `.env.example`.
- **XSS:** React escapes all rendered text, and there is no `dangerouslySetInnerHTML`. Server messages shown to
  users are rendered as text and length-limited. Exam titles are escaped for the `.ics` format too.
- **Untrusted input:** API responses are validated before use, and URL parameters are checked against
  allow-lists. Users see plain sentences, never stack traces or raw payloads.
- **Supply chain:** `package-lock.json` pins exact versions, CI audits production dependencies on every pull
  request, and the workflow runs with least privilege.

## Accessibility

- A semantic table, with `aria-sort` on sortable headers.
- Every control has a label; the filters are a labelled `search` landmark.
- Result counts and status changes are announced through live regions.
- Visible focus styles and a skip link.
- Action buttons have unique accessible names, e.g. "Start Skydiving License 1" rather than ten identical "Start"
  buttons.
- The map has a text equivalent, "Sessions by venue".
- The theme switch is a proper `role="switch"`.
- `eslint-plugin-jsx-a11y` runs on every commit, and axe runs in the end-to-end suite.

---

## What I'd do next

1. **Server-side authentication and authorisation** behind the existing `AuthService` interface, with an audit
   trail of who changed what and when.
2. **Server-side status rules,** so the API itself refuses `finished → pending`, not just the UI.
3. **A time zone per venue** in the API (an IANA name such as `Europe/Berlin`), and ISO 8601 datetimes with a
   `Z`, so no client has to know the convention.
4. **Server-side filtering and pagination** once the schedule grows; the URL parameters already map onto query
   parameters.
5. **Error monitoring** (for example Sentry) connected to the existing error boundary.
6. **An admin detail page** per session, with the full candidate list and history.

The brand fonts and images come from the starter supplied by VICTVS.
