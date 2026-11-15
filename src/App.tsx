import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Header } from '@/app/layout/Header';
import ExamMap from '@/components/ExamMap';
import Footer from '@/components/Footer';
import Home from '@/components/Home';
import { ExamList } from '@/features/exams';
import { ErrorBoundary } from '@/shared/ui/ErrorBoundary';

import './App.css';

function App() {
  return (
    <BrowserRouter>
      <a className="skip-link" href="#main">
        Skip to content
      </a>
      <div className="App">
        <Header />
        <ErrorBoundary>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/sessions" element={<ExamList />} />
            <Route path="/exam-map" element={<ExamMap />} />
          </Routes>
        </ErrorBoundary>
        <Footer />
      </div>
      {/* Bottom-centre, so messages never cover the header controls. */}
      <Toaster position="bottom-center" />
    </BrowserRouter>
  );
}

export default App;
