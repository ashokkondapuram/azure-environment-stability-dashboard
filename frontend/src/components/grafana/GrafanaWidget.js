import React from 'react';
import { useGrafanaHealth, useGrafanaAlerts, useGrafanaDashboards } from '../../hooks/useGrafana';
import { Link } from 'react-router-dom';

/**
 * Compact Grafana summary widget embedded in the main Dashboard page.
 * Shows health status, firing alerts, and quick links to dashboards.
 */
export default function GrafanaWidget() {
  const { data: health }      = useGrafanaHealth();
  const { data: alerts = [] } = useGrafanaAlerts();
  const { data: dashboards = [] } = useGrafanaDashboards();

  const isOnline = health?.database === 'ok';
  const firing   = alerts.filter(a => a.state === 'firing').length;

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20,
      border: '1px solid #334155', gridColumn: 'span 2' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h3 style={{ fontWeight: 600, fontSize: 16 }}>📊 Grafana Overview</h3>
        <Link to="/grafana" style={{ color: '#f59e0b', fontSize: 13, textDecoration: 'none' }}>View all →</Link>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
        <MiniStat label="Status"      value={isOnline ? '🟢 Online' : '🔴 Offline'} color={isOnline ? '#22c55e' : '#ef4444'} />
        <MiniStat label="Firing Alerts" value={firing}       color={firing > 0 ? '#ef4444' : '#22c55e'} />
        <MiniStat label="Dashboards"  value={dashboards.length} color="#0ea5e9" />
      </div>

      {/* Quick links to top dashboards */}
      {dashboards.slice(0, 3).map(d => (
        <a key={d.uid} href={d.url} target="_blank" rel="noopener noreferrer"
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '8px 0', borderBottom: '1px solid #0f172a', textDecoration: 'none',
            color: '#94a3b8', fontSize: 13 }}>
          <span>📊 {d.title}</span>
          <span style={{ color: '#475569' }}>↗</span>
        </a>
      ))}
    </div>
  );
}

function MiniStat({ label, value, color }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 8, padding: 10, textAlign: 'center' }}>
      <div style={{ fontSize: 18, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{label}</div>
    </div>
  );
}
