import React from 'react';

function getStatus(alerts, env) {
  const envAlerts = alerts.filter(a => a.environment === env);
  const critical = envAlerts.filter(a => a.severity === 'Critical').length;
  const warnings = envAlerts.filter(a => a.severity === 'Warning').length;
  if (critical > 0) return { label: 'Critical', color: '#ef4444', bg: '#450a0a' };
  if (warnings > 0) return { label: 'Degraded', color: '#f59e0b', bg: '#451a03' };
  return { label: 'Healthy', color: '#22c55e', bg: '#052e16' };
}

export default function EnvironmentCard({ environment, alerts, health }) {
  const status = getStatus(alerts, environment);
  const envAlerts = alerts.filter(a => a.environment === environment);

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, border: `1px solid ${status.color}33` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600 }}>{environment}</h2>
        <span style={{ background: status.bg, color: status.color, padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
          {status.label}
        </span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Stat label="Active Alerts" value={envAlerts.length} color="#f59e0b" />
        <Stat label="Critical" value={envAlerts.filter(a => a.severity === 'Critical').length} color="#ef4444" />
        <Stat label="Resources Healthy" value={health.filter(h => h.environment === environment && h.status === 'Available').length} color="#22c55e" />
        <Stat label="Warnings" value={envAlerts.filter(a => a.severity === 'Warning').length} color="#f59e0b" />
      </div>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: '#0f172a', borderRadius: 8, padding: 12 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    </div>
  );
}
