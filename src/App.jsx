import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Puzzle from './pages/Puzzle';
import Solver from './pages/Solver';
import Result from './pages/Result';
import HowItWorks from './pages/HowItWorks';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/puzzle" element={<Puzzle />} />
      <Route path="/solver" element={<Solver />} />
      <Route path="/result" element={<Result />} />
      <Route path="/how-it-works" element={<HowItWorks />} />
      {/* Fallback route */}
      <Route path="*" element={<Home />} />
    </Routes>
  );
}
