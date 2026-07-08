import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer, Tooltip } from 'recharts';

export default function StabilityScore({ alerts }) {
  const critical = alerts.filter(a => a.severity === 'Critical').length;
  const warnings = alerts.filter(a => a.severity === 'Warning').length;
  const score = Math.max(0, 100 - (critical * 15) - (warnings * 5));

  const data = [{ name: 'Score', value: score, fill: score > 80 ? '#22c55e' : score > 50 ? '#f59e0b' : '#ef4444' }];

  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 24, display: 'flex', alignItems: 'center', gap: 32 }}>
      <div>
        <h3 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>Overall Stability Score</h3>
        <p style={{ color: '#64748b', fontSize: 14 }}>Calculated from active alerts, warnings, and resource health</p>
        <div style={{ fontSize: 48, fontWeight: 800, color: data[0].fill, marginTop: 16 }}>{score}<span style={{ fontSize: 20 }}>/100</span></div>
      </div>
      <ResponsiveContainer width={200} height={200}>
        <RadialBarChart cx={100} cy={100} innerRadius={60} outerRadius={90} data={data} startAngle={180} endAngle={0}>
          <RadialBar dataKey="value" cornerRadius={10} />
          <Tooltip />
        </RadialBarChart>
      </ResponsiveContainer>
    </div>
  );
}
