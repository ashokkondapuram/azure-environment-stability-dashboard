import React from 'react';
import { useGrafanaHealth } from '../../hooks/useGrafana';

export default function GrafanaHealth() {
  const { data, isLoading, isError } = useGrafanaHealth();

  const status = isLoading ? 'checking' : isError ? 'unreachable' : data?.database === 'ok' ? 'ok' : 'degraded';
  const CONFIG = {
    ok:          { label: 'Grafana Online',      color: '#22c55e', bg: '#052e16', dot: '#22c55e' },
    degraded:    { label: 'Grafana Degraded',    color: '#f59e0b', bg: '#451a03', dot: '#f59e0b' },
    unreachable: { label: 'Grafana Unreachable', color: '#ef4444', bg: '#450a0a', dot: '#ef4444' },
    checking:    { label: 'Checking...',         color: '#94a3b8', bg: '#1e293b', dot: '#94a3b8' },
  };
  const c = CONFIG[status];

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8,
      background: c.bg, padding: '6px 16px', borderRadius: 20, border: `1px solid ${c.color}44` }}>
      <span style={{ width: 8, height: 8, borderRadius: '50%', background: c.dot,
        boxShadow: status === 'ok' ? `0 0 6px ${c.dot}` : 'none', display: 'inline-block' }} />
      <span style={{ color: c.color, fontSize: 13, fontWeight: 600 }}>{c.label}</span>
      {data?.version && <span style={{ color: '#475569', fontSize: 11 }}>v{data.version}</span>}
    </div>
  );
}
