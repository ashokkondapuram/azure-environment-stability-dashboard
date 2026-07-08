import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAlerts, fetchResourceHealth } from '../services/api';
import EnvironmentCard from './EnvironmentCard';
import StabilityScore from './StabilityScore';
import GrafanaWidget from './grafana/GrafanaWidget';

const ENVIRONMENTS = ['Production', 'Staging', 'Development'];

export default function Dashboard() {
  const { data: alerts = [] }  = useQuery({ queryKey: ['alerts'],  queryFn: fetchAlerts });
  const { data: health = [] }  = useQuery({ queryKey: ['health'],  queryFn: fetchResourceHealth });

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Environment Stability Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 28 }}>Real-time stability overview across all environments</p>

      {/* Environment cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16, marginBottom: 24 }}>
        {ENVIRONMENTS.map(env => (
          <EnvironmentCard key={env} environment={env} alerts={alerts} health={health} />
        ))}
      </div>

      {/* Stability score + Grafana widget */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 16, marginBottom: 24 }}>
        <StabilityScore alerts={alerts} />
        <GrafanaWidget />
      </div>
    </div>
  );
}
