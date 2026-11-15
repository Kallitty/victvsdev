import { lazy, Suspense } from 'react';
import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Header } from '@/app/layout/Header';
import Footer from '@/components/Footer';
import Home from '@/components/Home';
import { ExamList } from '@/features/exams';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

import './App.css';

// Leaflet is the largest dependency, so the map is downloaded only when someone opens it.
const ExamMapPage = lazy(() => import('@/features/map').then((m) => ({ default: m.ExamMapPage })));

function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="App">
        <Header />
        <ErrorBoundary>
          <Suspense fallback={<p role="status">Loading…</p>}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/sessions" element={<ExamList />} />
              <Route path="/exam-map" element={<ExamMapPage />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>
        <Footer />
      </div>
      {/* Bottom-centre, so messages never cover the header controls. */}
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}

export default App;
