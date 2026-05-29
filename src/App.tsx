/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { Suspense, lazy, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { LoadingScreen } from './components/LoadingScreen';
import { Navbar } from './components/Navbar';
import { Contact } from './components/Contact';
import { ScrollToTop } from './components/ScrollToTop';
import Home from './pages/Home';
import Work from './pages/Work';
import Resume from './pages/Resume';
import { PortfolioDataProvider } from './contexts/PortfolioDataContext';
import { BackgroundMusicProvider } from './contexts/BackgroundMusicContext';

// Detail pages and the Back Office are only hit from secondary navigation,
// so we lazy-load them to keep the initial bundle (Home/Work/Resume) small.
const ProjectDetail = lazy(() => import('./pages/ProjectDetail'));
const JournalDetail = lazy(() => import('./pages/JournalDetail'));
const ActivityDetail = lazy(() => import('./pages/ActivityDetail'));
const ExperienceDetail = lazy(() => import('./pages/ExperienceDetail'));
const AcademicDetail = lazy(() => import('./pages/AcademicDetail'));
const BackOffice = lazy(() => import('./pages/BackOffice/index'));

function PortfolioApp() {
  const [isLoading, setIsLoading] = useState(true);

  return (
    <div className="bg-bg min-h-screen selection:bg-accent selection:text-bg">
      {isLoading && <LoadingScreen onComplete={() => setIsLoading(false)} />}

      {!isLoading && <Navbar />}

      <main className={`transition-opacity duration-1000 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        <Suspense fallback={null}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/work" element={<Work />} />
            <Route path="/resume" element={<Resume />} />
            <Route path="/project/:id" element={<ProjectDetail />} />
            <Route path="/journal/:id" element={<JournalDetail />} />
            <Route path="/activity/:id" element={<ActivityDetail />} />
            <Route path="/experience/:id" element={<ExperienceDetail />} />
            <Route path="/academic/:id" element={<AcademicDetail />} />
            {/* Catch-all: redirect unknown URLs to home */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </main>

      {!isLoading && <Contact />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <ScrollToTop />
      <Analytics />
      <SpeedInsights />
      <Routes>
        {/* Back Office — standalone, no portfolio wrapper */}
        <Route path="/bts-porto/*" element={
          <Suspense fallback={null}>
            <BackOffice />
          </Suspense>
        } />
        {/* Portfolio — wrapped in data provider */}
        <Route path="/*" element={
          <PortfolioDataProvider>
            <BackgroundMusicProvider>
              <PortfolioApp />
            </BackgroundMusicProvider>
          </PortfolioDataProvider>
        } />
      </Routes>
    </Router>
  );
}
