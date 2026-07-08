import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { queryLogs } from '../services/api';

const SAMPLE_QUERIES = [
  { label: 'Errors last 1h', query: 'AppExceptions | where TimeGenerated > ago(1h) | summarize count() by type' },
  { label: 'Request failures', query: 'AppRequests | where Success == false | take 50' },
  { label: 'Slow requests', query: 'AppRequests | where DurationMs > 3000 | top 20 by DurationMs desc' },
];

export default function LogsPage() {
  const [kql, setKql] = useState(SAMPLE_QUERIES[0].query);
  const { mutate, data: results, isPending } = useMutation({ mutationFn: queryLogs });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>🔍 Monitor Logs (KQL)</h1>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {SAMPLE_QUERIES.map(q => (
          <button key={q.label} onClick={() => setKql(q.query)}
            style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid #334155',
              background: '#1e293b', color: '#94a3b8', cursor: 'pointer', fontSize: 13 }}>
            {q.label}
          </button>
        ))}
      </div>
      <textarea value={kql} onChange={e => setKql(e.target.value)}
        style={{ width: '100%', height: 100, background: '#0f172a', color: '#e2e8f0',
          border: '1px solid #334155', borderRadius: 8, padding: 12, fontFamily: 'monospace', fontSize: 13 }} />
      <button onClick={() => mutate(kql)}
        style={{ marginTop: 8, padding: '8px 24px', background: '#0ea5e9', color: '#fff',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
        {isPending ? 'Running...' : 'Run Query'}
      </button>
      {results && (
        <div style={{ marginTop: 20, background: '#1e293b', borderRadius: 10, padding: 16, overflowX: 'auto' }}>
          <pre style={{ fontSize: 13, color: '#94a3b8' }}>{JSON.stringify(results, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}
