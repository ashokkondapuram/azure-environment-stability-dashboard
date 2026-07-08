import React from 'react';
import { useGrafanaDatasources } from '../../hooks/useGrafana';

const TYPE_ICON = {
  'grafana-azure-monitor-datasource': '☁️',
  'prometheus':   '🔥',
  'loki':         '📜',
  'elasticsearch':'🔍',
  'mssql':        '🗄️',
  'default':      '🔌',
};

export default function GrafanaDatasources() {
  const { data: sources = [], isLoading, isError } = useGrafanaDatasources();

  if (isLoading) return <p style={{ color: '#64748b' }}>Loading data sources...</p>;
  if (isError)   return <p style={{ color: '#ef4444' }}>⚠️ Could not load data sources.</p>;

  return (
    <div>
      <h3 style={{ fontWeight: 600, marginBottom: 16 }}>Configured Data Sources ({sources.length})</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {sources.map(ds => {
          const icon = TYPE_ICON[ds.type] || TYPE_ICON.default;
          return (
            <div key={ds.id} style={{ background: '#1e293b', borderRadius: 10, padding: 16,
              border: `1px solid ${ds.isDefault ? '#f59e0b55' : '#334155'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                <span style={{ fontSize: 22 }}>{icon}</span>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{ds.name}</div>
                  <div style={{ color: '#64748b', fontSize: 12 }}>{ds.type}</div>
                </div>
                {ds.isDefault && (
                  <span style={{ marginLeft: 'auto', fontSize: 11, color: '#f59e0b',
                    background: '#451a03', padding: '2px 8px', borderRadius: 10 }}>Default</span>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', display: 'inline-block',
                  background: '#22c55e' }} />
                <span style={{ color: '#64748b', fontSize: 12 }}>Connected</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
