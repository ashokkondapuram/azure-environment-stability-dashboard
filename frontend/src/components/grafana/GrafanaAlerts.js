import React, { useState } from 'react';
import { useGrafanaAlerts } from '../../hooks/useGrafana';

const STATE_CONFIG = {
  firing:   { color: '#ef4444', bg: '#450a0a',  label: '🔴 Firing'   },
  pending:  { color: '#f59e0b', bg: '#451a03',  label: '🟡 Pending'  },
  inactive: { color: '#22c55e', bg: '#052e16',  label: '🟢 Inactive' },
  unknown:  { color: '#94a3b8', bg: '#1e293b',  label: '⚪ Unknown'  },
};

export default function GrafanaAlerts() {
  const { data: alerts = [], isLoading, isError } = useGrafanaAlerts();
  const [filter, setFilter] = useState('All');

  const states  = ['All', 'firing', 'pending', 'inactive'];
  const filtered = filter === 'All' ? alerts : alerts.filter(a => a.state === filter);

  const counts = { firing: 0, pending: 0, inactive: 0, unknown: 0 };
  alerts.forEach(a => { counts[a.state] = (counts[a.state] || 0) + 1; });

  if (isLoading) return <p style={{ color: '#64748b' }}>Loading Grafana alert rules...</p>;
  if (isError)   return <p style={{ color: '#ef4444' }}>⚠️ Could not load Grafana alert rules.</p>;

  return (
    <div>
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
        {Object.entries(counts).map(([state, count]) => {
          const cfg = STATE_CONFIG[state] || STATE_CONFIG.unknown;
          return (
            <div key={state} style={{ background: cfg.bg, border: `1px solid ${cfg.color}44`,
              borderRadius: 10, padding: '12px 16px' }}>
              <div style={{ fontSize: 26, fontWeight: 700, color: cfg.color }}>{count}</div>
              <div style={{ fontSize: 12, color: cfg.color, textTransform: 'capitalize' }}>{state}</div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {states.map(s => (
          <button key={s} onClick={() => setFilter(s)}
            style={{ padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer',
              background: filter === s ? '#0ea5e9' : '#1e293b',
              color: filter === s ? '#fff' : '#94a3b8', fontSize: 13 }}>
            {s === 'All' ? 'All' : STATE_CONFIG[s]?.label || s}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {filtered.length === 0
          ? <p style={{ color: '#64748b', padding: 20 }}>No alert rules match the current filter.</p>
          : filtered.map(a => {
              const cfg = STATE_CONFIG[a.state] || STATE_CONFIG.unknown;
              return (
                <div key={a.uid} style={{ background: '#1e293b', borderRadius: 10, padding: 16,
                  borderLeft: `4px solid ${cfg.color}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>{a.title}</span>
                    <span style={{ color: cfg.color, fontSize: 12, background: cfg.bg,
                      padding: '2px 10px', borderRadius: 12, fontWeight: 600 }}>{cfg.label}</span>
                  </div>
                  <div style={{ color: '#64748b', fontSize: 13, marginTop: 6, display: 'flex', gap: 16 }}>
                    {a.environment && <span>🌍 {a.environment}</span>}
                    {a.severity    && <span>⚡ {a.severity}</span>}
                    {a.folder      && <span>📁 {a.folder}</span>}
                    {a.updatedAt   && <span>🕐 {new Date(a.updatedAt).toLocaleString()}</span>}
                  </div>
                </div>
              );
            })
        }
      </div>
    </div>
  );
}
