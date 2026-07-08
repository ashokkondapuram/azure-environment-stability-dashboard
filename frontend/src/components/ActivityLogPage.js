import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchActivityLogs } from '../services/api';

const OP_COLOR = { Write: '#8b5cf6', Delete: '#ef4444', Action: '#f59e0b' };

export default function ActivityLogPage() {
  const { data: logs = [], isLoading } = useQuery({ queryKey: ['activityLogs'], queryFn: fetchActivityLogs });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📋 Azure Activity Logs</h1>
      <p style={{ color: '#64748b', marginBottom: 20 }}>Recent resource changes and operations across your subscription</p>
      {isLoading ? <p>Loading...</p> : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {logs.map((log, i) => (
            <div key={i} style={{ background: '#1e293b', borderRadius: 10, padding: 16,
              borderLeft: `4px solid ${OP_COLOR[log.operationType] || '#64748b'}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{log.operationName}</span>
                <span style={{ color: OP_COLOR[log.operationType], fontSize: 12 }}>{log.operationType}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: 13 }}>{log.resourceGroup} • {log.caller} • {log.timestamp}</div>
              <div style={{ color: log.status === 'Succeeded' ? '#22c55e' : '#ef4444', fontSize: 13, marginTop: 4 }}>{log.status}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
