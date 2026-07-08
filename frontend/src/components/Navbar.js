import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: '🏠 Dashboard' },
  { path: '/alerts', label: '🔔 Alerts' },
  { path: '/metrics', label: '📊 Metrics' },
  { path: '/activity', label: '📋 Activity Logs' },
  { path: '/logs', label: '🔍 Monitor Logs' },
];

const styles = {
  nav: { background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 24px' },
  inner: { display: 'flex', alignItems: 'center', gap: 32, maxWidth: 1400, margin: '0 auto', height: 60 },
  brand: { color: '#38bdf8', fontWeight: 700, fontSize: 18, textDecoration: 'none' },
  link: { color: '#94a3b8', textDecoration: 'none', fontSize: 14, padding: '6px 12px', borderRadius: 6 },
  active: { color: '#f8fafc', background: '#0ea5e9' },
};

export default function Navbar() {
  const { pathname } = useLocation();
  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>⚡ AzureStability</Link>
        {navItems.map(item => (
          <Link
            key={item.path}
            to={item.path}
            style={{ ...styles.link, ...(pathname === item.path ? styles.active : {}) }}
          >{item.label}</Link>
        ))}
      </div>
    </nav>
  );
}
