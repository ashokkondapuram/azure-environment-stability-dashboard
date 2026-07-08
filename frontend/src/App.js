import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AlertsPage from './components/AlertsPage';
import MetricsPage from './components/MetricsPage';
import ActivityLogPage from './components/ActivityLogPage';
import LogsPage from './components/LogsPage';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <Navbar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/alerts" element={<AlertsPage />} />
            <Route path="/metrics" element={<MetricsPage />} />
            <Route path="/activity" element={<ActivityLogPage />} />
            <Route path="/logs" element={<LogsPage />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;
