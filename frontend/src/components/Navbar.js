import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import UserBadge from './UserBadge';

const ALL_NAV = [
  { path: '/',          label: '🏠 Dashboard',      minRole: 'viewer' },
  { path: '/alerts',    label: '🔔 Alerts',          minRole: 'viewer' },
  { path: '/metrics',   label: '📊 Metrics',         minRole: 'viewer' },
  { path: '/activity',  label: '📋 Activity Logs',   minRole: 'viewer' },
  { path: '/logs',      label: '🔍 Monitor Logs',    minRole: 'editor' },
  { path: '/admin',     label: '⚙️ Admin',           minRole: 'admin'  },
];

const styles = {
  nav: { background: '#1e293b', borderBottom: '1px solid #334155', padding: '0 24px' },
  inner: { display: 'flex', alignItems: 'center', gap: 0, maxWidth: 1400, margin: '0 auto', height: 60 },
  brand: { color: '#38bdf8', fontWeight: 700, fontSize: 18, textDecoration: 'none', marginRight: 24 },
  links: { display: 'flex', gap: 4, flex: 1 },
  link: { color: '#94a3b8', textDecoration: 'none', fontSize: 13, padding: '6px 12px', borderRadius: 6 },
  active: { color: '#f8fafc', background: '#0ea5e9' },
};

export default function Navbar() {
  const { pathname } = useLocation();
  const { hasRole } = useAuth();

  return (
    <nav style={styles.nav}>
      <div style={styles.inner}>
        <Link to="/" style={styles.brand}>⚡ AzureStability</Link>
        <div style={styles.links}>
          {ALL_NAV.filter(item => hasRole(item.minRole)).map(item => (
            <Link
              key={item.path}
              to={item.path}
              style={{ ...styles.link, ...(pathname === item.path ? styles.active : {}) }}
            >{item.label}</Link>
          ))}
        </div>
        <UserBadge />
      </div>
    </nav>
  );
}
