import React, { useState } from 'react';
import GrafanaHealth from './GrafanaHealth';
import GrafanaDashboards from './GrafanaDashboards';
import GrafanaAlerts from './GrafanaAlerts';
import GrafanaDatasources from './GrafanaDatasources';
import GrafanaQueryRunner from './GrafanaQueryRunner';
import RoleGuard from '../RoleGuard';

const TABS = [
  { id: 'dashboards',  label: '📊 Dashboards',   minRole: 'viewer' },
  { id: 'alerts',      label: '🔔 Alert Rules',   minRole: 'viewer' },
  { id: 'datasources', label: '🔌 Data Sources',  minRole: 'editor' },
  { id: 'query',       label: '⚡ Query Runner',   minRole: 'editor' },
];

export default function GrafanaPage() {
  const [tab, setTab] = useState('dashboards');

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 4 }}>
            <img src="https://grafana.com/static/img/menu/grafana2.svg"
              alt="grafana" width={28} style={{ verticalAlign: 'middle', marginRight: 10 }} />
            Grafana
          </h1>
          <p style={{ color: '#64748b', fontSize: 13 }}>Metrics, logs, and operational dashboards via Azure Managed Grafana</p>
        </div>
        <GrafanaHealth />
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1px solid #334155', paddingBottom: 0 }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            style={{
              padding: '8px 18px', border: 'none', cursor: 'pointer',
              background: 'transparent', fontWeight: tab === t.id ? 700 : 400,
              color: tab === t.id ? '#f59e0b' : '#94a3b8', fontSize: 14,
              borderBottom: tab === t.id ? '2px solid #f59e0b' : '2px solid transparent',
              marginBottom: -1,
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'dashboards'  && <GrafanaDashboards />}
      {tab === 'alerts'      && <GrafanaAlerts />}
      {tab === 'datasources' && <RoleGuard role="editor"><GrafanaDatasources /></RoleGuard>}
      {tab === 'query'       && <RoleGuard role="editor"><GrafanaQueryRunner /></RoleGuard>}
    </div>
  );
}
