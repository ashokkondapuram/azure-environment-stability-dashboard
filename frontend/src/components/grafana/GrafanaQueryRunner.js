import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useGrafanaDatasources } from '../../hooks/useGrafana';
import { postGrafanaQuery } from '../../services/grafanaApi';

const SAMPLE_QUERIES = [
  {
    label: 'CPU (Azure Monitor)',
    payload: {
      queries: [{
        refId: 'A',
        datasource: { type: 'grafana-azure-monitor-datasource' },
        queryType: 'Azure Monitor',
        azureMonitor: {
          metricNamespace: 'Microsoft.Web/sites',
          metricName: 'CpuTime',
          aggregation: 'Average',
          timeGrain: 'PT5M',
        },
      }],
      from: 'now-1h',
      to: 'now',
    },
  },
  {
    label: 'KQL — Failed requests',
    payload: {
      queries: [{
        refId: 'A',
        datasource: { type: 'grafana-azure-monitor-datasource' },
        queryType: 'Azure Log Analytics',
        azureLogAnalytics: {
          query: 'AppRequests | where Success == false | summarize count() by bin(TimeGenerated, 5m)',
          resultFormat: 'time_series',
        },
      }],
      from: 'now-1h',
      to: 'now',
    },
  },
];

export default function GrafanaQueryRunner() {
  const { data: sources = [] } = useGrafanaDatasources();
  const [selectedDsUid, setSelectedDsUid] = useState('');
  const [rawPayload, setRawPayload] = useState(JSON.stringify(SAMPLE_QUERIES[0].payload, null, 2));
  const { mutate, data: result, isPending, error } = useMutation({ mutationFn: postGrafanaQuery });

  const handleRun = () => {
    try {
      mutate(JSON.parse(rawPayload));
    } catch (e) {
      alert('Invalid JSON payload');
    }
  };

  return (
    <div>
      <h3 style={{ fontWeight: 600, marginBottom: 4 }}>⚡ Grafana Query Runner</h3>
      <p style={{ color: '#64748b', fontSize: 13, marginBottom: 16 }}>Send raw datasource queries via the Grafana API proxy</p>

      {/* Sample presets */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {SAMPLE_QUERIES.map(q => (
          <button key={q.label} onClick={() => setRawPayload(JSON.stringify(q.payload, null, 2))}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #334155',
              background: '#1e293b', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>
            {q.label}
          </button>
        ))}
      </div>

      {/* Payload editor */}
      <textarea
        value={rawPayload}
        onChange={e => setRawPayload(e.target.value)}
        style={{ width: '100%', height: 220, background: '#0f172a', color: '#e2e8f0',
          border: '1px solid #334155', borderRadius: 8, padding: 12,
          fontFamily: 'monospace', fontSize: 12, resize: 'vertical' }}
      />

      <button onClick={handleRun} disabled={isPending}
        style={{ marginTop: 8, padding: '9px 28px', background: '#f59e0b', color: '#0f172a',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14 }}>
        {isPending ? 'Running...' : '▶ Run Query'}
      </button>

      {/* Results */}
      {error && (
        <div style={{ marginTop: 16, background: '#450a0a', borderRadius: 8, padding: 14,
          color: '#fca5a5', fontSize: 13 }}>⚠️ {error.message}</div>
      )}
      {result && (
        <div style={{ marginTop: 16, background: '#1e293b', borderRadius: 10, padding: 16, overflowX: 'auto' }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8 }}>Response:</div>
          <pre style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>{JSON.stringify(result, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
