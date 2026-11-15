import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { Navigate, Route, Routes, useLocation } from 'react-router-dom';

import { Header } from '@/app/layout/Header';
import Footer from '@/components/Footer';
import { HomePage } from '@/app/pages/HomePage';
import { homePathFor, RequireRole, SignInPage, useAuth } from '@/features/auth';
import { MyExamsPage } from '@/features/candidate';
import { ExamList } from '@/features/exams';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

import './App.css';

const ExamMapPage = lazy(() => import('@/features/map').then((m) => ({ default: m.ExamMapPage })));

/** "/" sends each user to their own home page, or to sign in. */
function RootRedirect() {
  const { session } = useAuth();
  return <Navigate to={session ? homePathFor(session) : '/sign-in'} replace />;
}

/** Keeps old links such as /sessions?country=Italy working after the move to /admin. */
function LegacyRedirect({ to }: { to: string }) {
  const { search } = useLocation();
  return <Navigate to={to + search} replace />;
}

function App() {
  return (
    <>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="App">
        <Header />
        <ErrorBoundary>
          <Suspense fallback={<p role="status">Loading…</p>}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/sign-in" element={<SignInPage />} />

              <Route element={<RequireRole role="admin" />}>
                <Route path="/admin" element={<HomePage />} />
                <Route path="/admin/sessions" element={<ExamList />} />
                <Route path="/admin/map" element={<ExamMapPage />} />
              </Route>

              <Route element={<RequireRole role="candidate" />}>
                <Route path="/me" element={<MyExamsPage />} />
              </Route>

              <Route path="/sessions" element={<LegacyRedirect to="/admin/sessions" />} />
              <Route path="/exam-map" element={<LegacyRedirect to="/admin/map" />} />
              <Route path="*" element={<p style={{ padding: '2rem' }}>Page not found.</p>} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
      <Toaster position="bottom-center" />
    </>
  );
}

export default App;
