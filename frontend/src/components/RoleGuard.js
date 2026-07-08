import React from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * Renders children only if user meets the minimum role.
 * Otherwise renders fallback (default: access denied banner).
 *
 * Usage:
 *   <RoleGuard role="editor">...</RoleGuard>
 *   <RoleGuard role="admin" fallback={null}>...</RoleGuard>
 */
export default function RoleGuard({ role, children, fallback }) {
  const { hasRole, loading } = useAuth();

  if (loading) return <div style={styles.loading}>Checking access...</div>;
  if (!hasRole(role)) {
    if (fallback !== undefined) return fallback;
    return (
      <div style={styles.denied}>
        <span style={styles.icon}>🔒</span>
        <div>
          <strong>Access Restricted</strong>
          <p style={{ color: '#94a3b8', marginTop: 4, fontSize: 13 }}>
            Your current role does not have permission to view this section.
            Contact your administrator to request access.
          </p>
        </div>
      </div>
    );
  }
  return children;
}

const styles = {
  denied: {
    display: 'flex', alignItems: 'center', gap: 16,
    background: '#1e1a2e', border: '1px solid #7c3aed44',
    borderRadius: 10, padding: '16px 20px', marginTop: 12,
  },
  icon: { fontSize: 28 },
  loading: { color: '#64748b', fontSize: 13, padding: 16 },
};
