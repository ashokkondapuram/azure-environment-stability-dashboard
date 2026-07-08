import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import RoleGuard from '../RoleGuard';
import { fetchUsers, updateUserRole, fetchSystemConfig, updateSystemConfig } from '../../services/api';

export default function AdminPage() {
  return (
    <RoleGuard role="admin">
      <AdminContent />
    </RoleGuard>
  );
}

function AdminContent() {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>⚙️ Admin Panel</h1>
      <p style={{ color: '#64748b', marginBottom: 24 }}>Manage users, roles, and system configuration</p>

      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {['users', 'config', 'audit'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 20px', borderRadius: 8, border: 'none', cursor: 'pointer',
              background: activeTab === tab ? '#7c3aed' : '#1e293b',
              color: activeTab === tab ? '#fff' : '#94a3b8',
              textTransform: 'capitalize', fontWeight: 600,
            }}>
            {tab === 'users' ? '👥 Users' : tab === 'config' ? '🔧 Config' : '📜 Audit Log'}
          </button>
        ))}
      </div>

      {activeTab === 'users'  && <UserManagement />}
      {activeTab === 'config' && <SystemConfig />}
      {activeTab === 'audit'  && <AuditLog />}
    </div>
  );
}

function UserManagement() {
  const qc = useQueryClient();
  const { data: users = [], isLoading } = useQuery({ queryKey: ['users'], queryFn: fetchUsers });
  const { mutate: changeRole, isPending } = useMutation({
    mutationFn: ({ userId, role }) => updateUserRole(userId, role),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });

  const ROLE_OPTS = ['admin', 'editor', 'viewer'];
  const ROLE_COLORS = { admin: '#c4b5fd', editor: '#7dd3fc', viewer: '#6ee7b7' };

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>👥 User Role Management</h3>
        <p style={{ color: '#64748b', fontSize: 13, marginTop: 2 }}>Assign roles to control access to dashboard features</p>
      </div>
      {isLoading ? <p style={{ padding: 20, color: '#64748b' }}>Loading users...</p> : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#0f172a' }}>
              {['User', 'Email', 'Identity Provider', 'Role', 'Action'].map(h => (
                <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 12,
                  color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.map((u, i) => (
              <tr key={u.id} style={{ borderBottom: '1px solid #1e293b',
                background: i % 2 === 0 ? '#1e293b' : '#162032' }}>
                <td style={{ padding: '12px 16px', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '12px 16px', color: '#94a3b8', fontSize: 13 }}>{u.email}</td>
                <td style={{ padding: '12px 16px', color: '#64748b', fontSize: 13 }}>{u.identityProvider}</td>
                <td style={{ padding: '12px 16px' }}>
                  <span style={{ color: ROLE_COLORS[u.role], fontSize: 13, fontWeight: 600,
                    background: '#0f172a', padding: '2px 10px', borderRadius: 12 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 16px' }}>
                  <select
                    defaultValue={u.role}
                    onChange={e => changeRole({ userId: u.id, role: e.target.value })}
                    disabled={isPending}
                    style={{ background: '#0f172a', color: '#e2e8f0', border: '1px solid #334155',
                      padding: '4px 10px', borderRadius: 6, fontSize: 13, cursor: 'pointer' }}>
                    {ROLE_OPTS.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function SystemConfig() {
  const { data: config = {}, isLoading } = useQuery({ queryKey: ['config'], queryFn: fetchSystemConfig });
  const qc = useQueryClient();
  const { mutate: saveConfig, isPending } = useMutation({
    mutationFn: updateSystemConfig,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['config'] }),
  });
  const [form, setForm] = React.useState({});

  React.useEffect(() => { if (config) setForm(config); }, [config]);

  if (isLoading) return <p style={{ color: '#64748b', padding: 20 }}>Loading config...</p>;

  const fields = [
    { key: 'grafanaUrl',       label: 'Grafana URL',            type: 'url'  },
    { key: 'refreshInterval',  label: 'Refresh Interval (sec)', type: 'number' },
    { key: 'criticalThreshold',label: 'Critical Alert Threshold', type: 'number' },
    { key: 'warningThreshold', label: 'Warning Alert Threshold',  type: 'number' },
    { key: 'notifyEmail',      label: 'Notify Email',            type: 'email' },
  ];

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontWeight: 600, marginBottom: 20 }}>🔧 System Configuration</h3>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, maxWidth: 700 }}>
        {fields.map(f => (
          <div key={f.key}>
            <label style={{ fontSize: 12, color: '#94a3b8', display: 'block', marginBottom: 6 }}>{f.label}</label>
            <input
              type={f.type}
              value={form[f.key] || ''}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              style={{ width: '100%', background: '#0f172a', color: '#e2e8f0',
                border: '1px solid #334155', padding: '8px 12px', borderRadius: 8, fontSize: 14 }}
            />
          </div>
        ))}
      </div>
      <button onClick={() => saveConfig(form)} disabled={isPending}
        style={{ marginTop: 24, padding: '10px 28px', background: '#7c3aed', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 14 }}>
        {isPending ? 'Saving...' : 'Save Configuration'}
      </button>
    </div>
  );
}

function AuditLog() {
  const entries = [
    { action: 'Role changed: viewer → editor', user: 'john@contoso.com', time: '2026-07-07 21:10' },
    { action: 'Alert acknowledged: CPU spike', user: 'sarah@contoso.com', time: '2026-07-07 20:44' },
    { action: 'Config updated: refreshInterval', user: 'admin@contoso.com', time: '2026-07-07 19:30' },
    { action: 'KQL query executed', user: 'sarah@contoso.com', time: '2026-07-07 18:55' },
  ];
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, overflow: 'hidden' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155' }}>
        <h3 style={{ fontSize: 16, fontWeight: 600 }}>📜 Audit Log</h3>
      </div>
      {entries.map((e, i) => (
        <div key={i} style={{ padding: '12px 20px', borderBottom: '1px solid #0f172a',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: 14 }}>{e.action}</div>
            <div style={{ color: '#64748b', fontSize: 12, marginTop: 2 }}>by {e.user}</div>
          </div>
          <span style={{ color: '#475569', fontSize: 12 }}>{e.time}</span>
        </div>
      ))}
    </div>
  );
}
