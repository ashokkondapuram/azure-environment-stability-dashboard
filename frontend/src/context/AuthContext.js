import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * JWT-based multi-tenant auth.
 * Login rule: username = clientname, password = clientname.
 * The JWT payload includes: clientId, username, displayName, role, projectName, resourceGroups.
 */
const AuthContext = createContext(null);

export const ROLES = { ADMIN: 'admin', EDITOR: 'editor', VIEWER: 'viewer' };
const ROLE_LEVELS = { viewer: 1, editor: 2, admin: 3 };

function decodeToken(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch { return null; }
}

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [token,   setToken]   = useState(() => localStorage.getItem('auth_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        setUser(decoded);
      } else {
        localStorage.removeItem('auth_token');
        setToken(null);
      }
    }
    setLoading(false);
  }, [token]);

  async function login(username, password) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: username.trim(), password: password.trim() }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const { token: newToken } = await res.json();
    localStorage.setItem('auth_token', newToken);
    setToken(newToken);
    setUser(decodeToken(newToken));
  }

  function logout() {
    localStorage.removeItem('auth_token');
    setToken(null);
    setUser(null);
  }

  function hasRole(minRole) {
    if (!user) return false;
    return (ROLE_LEVELS[user.role] || 0) >= (ROLE_LEVELS[minRole] || 0);
  }

  const isAdmin  = () => hasRole('admin');
  const isEditor = () => hasRole('editor');
  const isViewer = () => !!user;
  const authHeader = () => token ? { Authorization: `Bearer ${token}` } : {};

  return (
    <AuthContext.Provider value={{ user, token, login, logout, hasRole, isAdmin, isEditor, isViewer, authHeader, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
