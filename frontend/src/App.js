import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import RoleGuard from './components/RoleGuard';
import Navbar from './components/Navbar';
import Dashboard from './components/Dashboard';
import AlertsPage from './components/AlertsPage';
import MetricsPage from './components/MetricsPage';
import ActivityLogPage from './components/ActivityLogPage';
import LogsPage from './components/LogsPage';
import AdminPage from './components/admin/AdminPage';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              {/* viewer+ routes */}
              <Route path="/" element={<Dashboard />} />
              <Route path="/alerts" element={<AlertsPage />} />
              <Route path="/metrics" element={<MetricsPage />} />
              <Route path="/activity" element={<ActivityLogPage />} />

              {/* editor+ routes — RoleGuard inside LogsPage */}
              <Route path="/logs" element={<LogsPage />} />

              {/* admin-only route — RoleGuard inside AdminPage */}
              <Route path="/admin" element={<AdminPage />} />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
