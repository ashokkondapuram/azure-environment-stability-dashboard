import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAlerts, acknowledgeAlert } from '../services/api';
import RoleGuard from './RoleGuard';
import { useAuth } from '../context/AuthContext';

const SEV_COLOR = { Critical: '#ef4444', Warning: '#f59e0b', Informational: '#38bdf8' };

export default function AlertsPage() {
  const [filter, setFilter] = useState('All');
  const { data: alerts = [], isLoading } = useQuery({ queryKey: ['alerts'], queryFn: fetchAlerts });
  const { isEditor } = useAuth();
  const qc = useQueryClient();
  const { mutate: ack } = useMutation({
    mutationFn: acknowledgeAlert,
    onSuccess: () => qc.invalidateQueries({ queryKey: ['alerts'] }),
  });

  const filtered = filter === 'All' ? alerts : alerts.filter(a => a.severity === filter);

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>🔔 Active Alerts</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['All', 'Critical', 'Warning', 'Informational'].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '6px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: filter === s ? '#0ea5e9' : '#1e293b', color: filter === s ? '#fff' : '#94a3b8' }}>
            {s}
          </button>
        ))}
      </div>
      {isLoading ? <p>Loading alerts...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filtered.map((alert, i) => (
            <div key={i} style={{ background: '#1e293b', borderRadius: 10, padding: 16,
              borderLeft: `4px solid ${SEV_COLOR[alert.severity] || '#64748b'}`,
              opacity: alert.acknowledged ? 0.5 : 1 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ fontWeight: 600 }}>{alert.name}</span>
                  {alert.acknowledged && (
                    <span style={{ marginLeft: 10, fontSize: 12, color: '#22c55e', background: '#052e16',
                      padding: '2px 8px', borderRadius: 10 }}>✓ Acknowledged</span>
                  )}
                </div>
                <span style={{ color: SEV_COLOR[alert.severity], fontSize: 13 }}>{alert.severity}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>
                {alert.environment} • {alert.resource} • {alert.firedAt}
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 8 }}>
                <div style={{ fontSize: 14 }}>{alert.description}</div>
                {/* Editor & Admin can acknowledge alerts */}
                <RoleGuard role="editor" fallback={null}>
                  {!alert.acknowledged && (
                    <button onClick={() => ack(alert.id)}
                      style={{ padding: '5px 14px', background: '#065f46', color: '#6ee7b7',
                        border: 'none', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                      Acknowledge
                    </button>
                  )}
                </RoleGuard>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
