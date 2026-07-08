import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AlertsPage from './components/AlertsPage';
import MetricsPage from './components/MetricsPage';
import ActivityLogPage from './components/ActivityLogPage';
import LogsPage from './components/LogsPage';
import AdminPage from './components/admin/AdminPage';
import GrafanaPage from './components/grafana/GrafanaPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/"        element={<Dashboard />} />
              <Route path="/alerts"  element={<AlertsPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
              <Route path="/activity"element={<ActivityLogPage />} />
              <Route path="/grafana" element={<GrafanaPage />} />
              <Route path="/logs"    element={<LogsPage />} />
              <Route path="/admin"   element={<AdminPage />} />
              <Route path="*"        element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}
