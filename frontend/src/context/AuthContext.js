import React, { createContext, useContext, useState, useEffect } from 'react';

/**
 * Roles:
 *  admin  - full access: view all, edit config, manage users, run queries
 *  editor - view all + acknowledge alerts + run KQL queries, no user management
 *  viewer - read-only: dashboard, alerts, metrics, activity logs (no KQL, no config)
 */

const AuthContext = createContext(null);

export const ROLES = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer',
};

// Role hierarchy: higher index = more permissions
const ROLE_LEVEL = { viewer: 1, editor: 2, admin: 3 };

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch user info from Azure Static Web Apps /.auth/me
    fetch('/.auth/me')
      .then(r => r.json())
      .then(data => {
        const clientPrincipal = data?.clientPrincipal;
        if (clientPrincipal) {
          // Azure SWA returns userRoles array from staticwebapp.config.json role assignments
          const roles = clientPrincipal.userRoles || [];
          const role = roles.includes(ROLES.ADMIN)
            ? ROLES.ADMIN
            : roles.includes(ROLES.EDITOR)
            ? ROLES.EDITOR
            : ROLES.VIEWER;
          setUser({
            id: clientPrincipal.userId,
            name: clientPrincipal.userDetails,
            identityProvider: clientPrincipal.identityProvider,
            role,
            rawRoles: roles,
          });
        } else {
          setUser(null);
        }
      })
      .catch(() => setUser(null))
      .finally(() => setLoading(false));
  }, []);

  const hasRole = (requiredRole) => {
    if (!user) return false;
    return ROLE_LEVEL[user.role] >= ROLE_LEVEL[requiredRole];
  };

  const isAdmin = () => hasRole(ROLES.ADMIN);
  const isEditor = () => hasRole(ROLES.EDITOR);
  const isViewer = () => hasRole(ROLES.VIEWER);

  return (
    <AuthContext.Provider value={{ user, loading, hasRole, isAdmin, isEditor, isViewer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
