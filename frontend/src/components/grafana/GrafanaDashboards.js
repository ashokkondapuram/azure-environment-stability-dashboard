import React, { useState } from 'react';
import { useGrafanaDashboards } from '../../hooks/useGrafana';

const TAG_COLORS = ['#0ea5e9', '#8b5cf6', '#f59e0b', '#22c55e', '#ef4444', '#ec4899'];

function tagColor(tag) {
  let hash = 0;
  for (const c of tag) hash = c.charCodeAt(0) + hash * 31;
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
}

export default function GrafanaDashboards() {
  const { data: dashboards = [], isLoading, isError } = useGrafanaDashboards();
  const [search, setSearch] = useState('');
  const [folderFilter, setFolderFilter] = useState('All');

  const folders = ['All', ...new Set(dashboards.map(d => d.folder))];
  const filtered = dashboards.filter(d => {
    const matchSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchFolder = folderFilter === 'All' || d.folder === folderFilter;
    return matchSearch && matchFolder;
  });

  if (isLoading) return <LoadingGrid />;
  if (isError)   return <ErrorBanner msg="Could not load Grafana dashboards. Check GRAFANA_URL and GRAFANA_TOKEN configuration." />;

  return (
    <div>
      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
        <input
          placeholder="Search dashboards..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
            padding: '8px 14px', borderRadius: 8, fontSize: 14, flex: 1, minWidth: 200 }}
        />
        <select value={folderFilter} onChange={e => setFolderFilter(e.target.value)}
          style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid #334155',
            padding: '8px 14px', borderRadius: 8, fontSize: 13 }}>
          {folders.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      {/* Stats bar */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 20 }}>
        <Stat label="Total Dashboards" value={dashboards.length} color="#0ea5e9" />
        <Stat label="Folders" value={folders.length - 1} color="#8b5cf6" />
        <Stat label="Showing" value={filtered.length} color="#22c55e" />
      </div>

      {/* Dashboard cards */}
      {filtered.length === 0
        ? <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No dashboards match your filter.</p>
        : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
            {filtered.map(d => (
              <DashboardCard key={d.uid} dashboard={d} />
            ))}
          </div>
        )
      }
    </div>
  );
}

function DashboardCard({ dashboard: d }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 12, padding: 20,
      border: '1px solid #334155', display: 'flex', flexDirection: 'column', gap: 10,
      transition: 'border-color 0.2s',
      ':hover': { borderColor: '#f59e0b' } }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 20 }}>📊</span>
        <span style={{ fontSize: 11, color: '#475569', background: '#0f172a',
          padding: '2px 8px', borderRadius: 10 }}>{d.folder}</span>
      </div>
      <div style={{ fontWeight: 600, fontSize: 15 }}>{d.title}</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
        {d.tags.map(tag => (
          <span key={tag} style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10,
            background: `${tagColor(tag)}22`, color: tagColor(tag), border: `1px solid ${tagColor(tag)}44` }}>
            {tag}
          </span>
        ))}
      </div>
      <a href={d.url} target="_blank" rel="noopener noreferrer"
        style={{ display: 'block', textAlign: 'center', padding: '8px 0',
          background: '#f59e0b22', color: '#f59e0b', borderRadius: 8, fontSize: 13,
          fontWeight: 600, textDecoration: 'none', border: '1px solid #f59e0b44',
          marginTop: 'auto' }}>
        Open in Grafana ↗
      </a>
    </div>
  );
}

function Stat({ label, value, color }) {
  return (
    <div style={{ background: '#1e293b', borderRadius: 8, padding: '10px 16px', minWidth: 100 }}>
      <div style={{ fontSize: 22, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
    </div>
  );
}

function LoadingGrid() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
      {[...Array(6)].map((_, i) => (
        <div key={i} style={{ background: '#1e293b', borderRadius: 12, height: 160,
          animation: 'pulse 1.5s ease-in-out infinite', opacity: 0.6 }} />
      ))}
    </div>
  );
}

function ErrorBanner({ msg }) {
  return (
    <div style={{ background: '#450a0a', border: '1px solid #ef444444', borderRadius: 10,
      padding: 20, color: '#fca5a5' }}>
      ⚠️ {msg}
    </div>
  );
}
