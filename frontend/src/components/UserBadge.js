import React from 'react';
import { useAuth, ROLES } from '../context/AuthContext';

const ROLE_STYLE = {
  admin:  { bg: '#4c1d95', color: '#c4b5fd', label: '👑 Admin' },
  editor: { bg: '#1e3a5f', color: '#7dd3fc', label: '✏️ Editor' },
  viewer: { bg: '#0f2e1a', color: '#6ee7b7', label: '👁 Viewer' },
};

export default function UserBadge() {
  const { user, loading } = useAuth();
  if (loading || !user) return null;

  const style = ROLE_STYLE[user.role] || ROLE_STYLE[ROLES.VIEWER];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ color: '#94a3b8', fontSize: 13 }}>{user.name}</span>
      <span style={{
        background: style.bg, color: style.color,
        padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 600,
      }}>
        {style.label}
      </span>
    </div>
  );
}
