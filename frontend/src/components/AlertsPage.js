import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAlerts } from '../services/api';

const SEV_COLOR = { Critical: '#ef4444', Warning: '#f59e0b', Informational: '#38bdf8' };

export default function AlertsPage() {
  const [filter, setFilter] = useState('All');
  const { data: alerts = [], isLoading } = useQuery({ queryKey: ['alerts'], queryFn: fetchAlerts });

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
              borderLeft: `4px solid ${SEV_COLOR[alert.severity] || '#64748b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>{alert.name}</span>
                <span style={{ color: SEV_COLOR[alert.severity], fontSize: 13 }}>{alert.severity}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 13, marginTop: 4 }}>{alert.environment} • {alert.resource} • {alert.firedAt}</div>
              <div style={{ marginTop: 8, fontSize: 14 }}>{alert.description}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
