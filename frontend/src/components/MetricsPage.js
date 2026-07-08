import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchMetrics } from '../services/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function MetricsPage() {
  const [resource, setResource] = useState('app-service-prod');
  const { data: metrics = [], isLoading } = useQuery({
    queryKey: ['metrics', resource],
    queryFn: () => fetchMetrics(resource)
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>📊 Azure Metrics</h1>
      <select value={resource} onChange={e => setResource(e.target.value)}
        style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155', padding: '8px 16px', borderRadius: 8, marginBottom: 24 }}>
        <option value="app-service-prod">App Service - Production</option>
        <option value="app-service-staging">App Service - Staging</option>
        <option value="sql-db-prod">SQL Database - Production</option>
      </select>

      {isLoading ? <p>Loading metrics...</p> : (
        <div style={{ background: '#1e293b', borderRadius: 12, padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>CPU & Memory Usage (Last 24h)</h3>
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={metrics}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="time" stroke="#64748b" fontSize={12} />
              <YAxis stroke="#64748b" fontSize={12} unit="%" />
              <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155' }} />
              <Legend />
              <Line type="monotone" dataKey="cpu" stroke="#0ea5e9" strokeWidth={2} dot={false} name="CPU %" />
              <Line type="monotone" dataKey="memory" stroke="#8b5cf6" strokeWidth={2} dot={false} name="Memory %" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
