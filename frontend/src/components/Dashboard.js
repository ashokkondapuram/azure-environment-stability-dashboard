import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchAlerts } from '../services/api';
import { fetchResourceHealth } from '../services/api';
import EnvironmentCard from './EnvironmentCard';
import StabilityScore from './StabilityScore';

const ENVIRONMENTS = ['Production', 'Staging', 'Development'];

export default function Dashboard() {
  const { data: alerts = [] } = useQuery({ queryKey: ['alerts'], queryFn: fetchAlerts });
  const { data: health = [] } = useQuery({ queryKey: ['health'], queryFn: fetchResourceHealth });

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 8 }}>Environment Stability Dashboard</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>Real-time stability overview across all environments</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20, marginBottom: 32 }}>
        {ENVIRONMENTS.map(env => (
          <EnvironmentCard key={env} environment={env} alerts={alerts} health={health} />
        ))}
      </div>

      <StabilityScore alerts={alerts} />
    </div>
  );
}
