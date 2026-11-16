import { Link } from 'react-router-dom';

import styles from './HomePage.module.css';

/** Staff landing page: what the system does, how it's built and where to start. */
export function HomePage() {
  return (
    <main id="main" className={styles.page}>
      <header className={styles.hero}>
        <h2>Exam Schedule System</h2>
        <p className={styles.lead}>
          One place to see every VICTVS exam session, move it from pending to started to finished, and see
          where in the world each one takes place.
        </p>
        <div className={styles.actions}>
          <Link className={styles.primary} to="/admin/sessions">
            View sessions
          </Link>
          <Link className={styles.secondary} to="/admin/map">
            Open the venue map
          </Link>
        </div>
      </header>

      <section aria-labelledby="overview-heading" className={styles.section}>
        <h3 id="overview-heading">Overview</h3>
        <p>
          This frontend reads the live VICTVS exam API and turns it into a working schedule for exam-centre
          staff and candidates. Staff can manage every session; candidates see only their own exams. Every
          screen works on a phone, a tablet or a desktop, in light or dark mode, with a keyboard or a screen
          reader.
        </p>
      </section>

      <section aria-labelledby="features-heading" className={styles.section}>
        <h3 id="features-heading">What you can do</h3>
        <div className={styles.grid}>
          <article className={styles.card}>
            <h4>Manage the schedule</h4>
            <p>
              See every session with its candidates, venue, language and status. Start or finish a session
              with one click. Finishing asks for confirmation, and the change shows straight away. If the
              server rejects it, the change is undone and the reason is shown.
            </p>
          </article>
          <article className={styles.card}>
            <h4>Find sessions fast</h4>
            <p>
              Search by title or candidate, filter by status, country, candidate or date range, and sort by
              any column. Filters live in the address bar, so a filtered view can be bookmarked, shared or
              reloaded.
            </p>
          </article>
          <article className={styles.card}>
            <h4>See the venues</h4>
            <p>
              An OpenStreetMap map shows one marker per venue, with that venue's sessions in its popup. The
              same information is listed as text beside the map for anyone who can't use it.
            </p>
          </article>
          <article className={styles.card}>
            <h4>Candidate view</h4>
            <p>
              Candidates sign in to a page of their own exams, split into upcoming and completed. It refreshes
              itself, so a status change on exam day appears without a reload.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="times-heading" className={styles.section}>
        <h3 id="times-heading">Times and time zones</h3>
        <p>
          The API stores times in UTC. Each session is shown in its venue's local time with the zone, for
          example &ldquo;Wed 15 Apr 2026, 12:15 CEST&rdquo; for Berlin, which is what a candidate travelling
          there needs. Hover a time to see it in your own time zone. Date filters use the venue's calendar
          date.
        </p>
      </section>

      <section aria-labelledby="build-heading" className={styles.section}>
        <h3 id="build-heading">How it's built</h3>
        <ul className={styles.list}>
          <li>
            <strong>Vite and strict TypeScript</strong> replace Create React App, with zero-warning ESLint and
            Prettier.
          </li>
          <li>
            <strong>Feature-based folders</strong> (exams, map, auth, candidate) with absolute <code>@/</code>{' '}
            imports.
          </li>
          <li>
            <strong>TanStack Query</strong> manages server data: caching, retries, cancelled requests and
            optimistic status updates with rollback.
          </li>
          <li>
            <strong>Validated API responses:</strong> data is checked when it arrives, so a malformed record
            produces a clear error instead of a broken page.
          </li>
          <li>
            <strong>CSS Modules and design tokens:</strong> one set of colours, spacing and type drives both
            themes.
          </li>
          <li>
            <strong>Leaflet and OpenStreetMap:</strong> no API key, and the map code loads only when the map
            is opened.
          </li>
        </ul>
      </section>

      <section aria-labelledby="quality-heading" className={styles.section}>
        <h3 id="quality-heading">Quality checks</h3>
        <ul className={styles.list}>
          <li>
            <strong>Unit and integration tests</strong> with Vitest and Testing Library, including the
            original supplied test, now passing.
          </li>
          <li>
            <strong>End-to-end tests</strong> with Playwright run the production build on desktop and mobile,
            with automated accessibility checks. They use a fake API, so they never change the shared VICTVS
            data.
          </li>
          <li>
            <strong>GitHub Actions</strong> runs formatting, linting, type-checking, tests, the build and a
            dependency security audit on every pull request.
          </li>
        </ul>
      </section>

      <section aria-labelledby="security-heading" className={styles.section}>
        <h3 id="security-heading">Security and privacy</h3>
        <p>
          The exam API has no accounts, so sign-in is a clearly labelled demo role picker, not a fake password
          screen. Roles decide which screens are offered; real permissions must be enforced by the server.
          Sign-in sits behind one interface, so a real login can replace it without changing any screen.
          Sessions expire, signing out clears cached data, and candidates never see other candidates' names.
        </p>
      </section>
    </main>
  );
}
