import { Toaster } from 'react-hot-toast';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Home from '@/components/Home';
import ExamList from '@/components/ExamList';
import ExamMap from '@/components/ExamMap';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sessions" element={<ExamList />} />
          <Route path="/exam-map" element={<ExamMap />} />
        </Routes>
        <Footer />
      </div>
      <Toaster position="top-center" reverseOrder />
    </BrowserRouter>
  );
}

export default App;
