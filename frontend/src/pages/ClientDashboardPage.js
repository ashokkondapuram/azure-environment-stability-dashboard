import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useClientDashboard } from '../hooks/useClientDashboard';

// ── helpers ──────────────────────────────────────────────────────────────────
function timeAgo(d) {
  const m = Math.max(1, Math.floor((Date.now() - new Date(d)) / 60000));
  return m < 60 ? `${m}m ago` : m < 1440 ? `${Math.floor(m / 60)}h ago` : `${Math.floor(m / 1440)}d ago`;
}
function daysUntil(d) { return Math.ceil((new Date(d) - Date.now()) / 86400000); }

// ── design tokens ─────────────────────────────────────────────────────────────
const S = {
  page:      { padding: '1.5rem', maxWidth: 1440, margin: '0 auto' },
  grid4:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: '1rem', marginBottom: '1.25rem' },
  grid2:     { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' },
  panel:     { background: '#111827', border: '1px solid rgba(148,163,184,.15)', borderRadius: '1rem', padding: '1.25rem', marginBottom: '1.25rem' },
  h2:        { fontSize: '1.05rem', fontWeight: 700, marginBottom: '.65rem', letterSpacing: '-.02em' },
  kpiVal:    { fontSize: '2.4rem', fontWeight: 800, letterSpacing: '-.05em', fontVariantNumeric: 'tabular-nums' },
  kpiLbl:    { color: '#64748b', fontSize: '.75rem', textTransform: 'uppercase', letterSpacing: '.07em', marginTop: '.2rem' },
  badge:     (bg, color) => ({ display: 'inline-flex', alignItems: 'center', padding: '.22rem .7rem', borderRadius: 999, fontSize: '.72rem', fontWeight: 700, background: bg, color }),
  th:        { padding: '.45rem .75rem', fontWeight: 600, fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', borderBottom: '1px solid rgba(148,163,184,.1)', textAlign: 'left', color: '#475569' },
  td:        { padding: '.55rem .75rem', borderBottom: '1px solid rgba(148,163,184,.06)' },
  tabs:      { display: 'flex', gap: 4, marginBottom: '1.25rem', borderBottom: '1px solid rgba(148,163,184,.1)', flexWrap: 'wrap' },
  tab:       (active) => ({ padding: '.55rem 1rem', border: 'none', cursor: 'pointer', background: 'transparent', fontWeight: active ? 700 : 400, color: active ? '#38bdf8' : '#64748b', borderBottom: active ? '2px solid #38bdf8' : '2px solid transparent', fontSize: '.88rem', fontFamily: 'inherit', marginBottom: -1 }),
};

const SEV = {
  Critical: { bg: 'rgba(239,68,68,.12)',  color: '#fca5a5', border: 'rgba(239,68,68,.3)' },
  Warning:  { bg: 'rgba(245,158,11,.12)', color: '#fcd34d', border: 'rgba(245,158,11,.3)' },
  Info:     { bg: 'rgba(100,116,139,.14)',color: '#cbd5e1', border: 'rgba(100,116,139,.2)' },
};

// ── sub-components ────────────────────────────────────────────────────────────
function KpiCard({ label, value, color, sub }) {
  return (
    <div style={S.panel}>
      <div style={{ ...S.kpiVal, color }}>{value}</div>
      <div style={S.kpiLbl}>{label}</div>
      {sub && <div style={{ color: '#475569', fontSize: '.73rem', marginTop: '.15rem' }}>{sub}</div>}
    </div>
  );
}

function SectionHeader({ title, count }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '.75rem' }}>
      <div style={S.h2}>{title}</div>
      {count !== undefined && <span style={{ background: 'rgba(56,189,248,.1)', color: '#7dd3fc', padding: '.2rem .7rem', borderRadius: 999, fontSize: '.72rem', fontWeight: 700 }}>{count}</span>}
    </div>
  );
}

function BarCell({ value }) {
  const pct = Math.min(value, 100);
  const c = pct > 85 ? '#ef4444' : pct > 70 ? '#f59e0b' : '#22c55e';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 6, background: 'rgba(148,163,184,.1)', borderRadius: 999 }}>
        <div style={{ width: `${pct}%`, height: '100%', background: c, borderRadius: 999, transition: 'width .4s' }} />
      </div>
      <span style={{ fontSize: '.8rem', fontVariantNumeric: 'tabular-nums', minWidth: 38, color: pct > 85 ? '#fca5a5' : pct > 70 ? '#fcd34d' : '#94a3b8' }}>{value.toFixed ? value.toFixed(1) : value}%</span>
    </div>
  );
}

function StatusDot({ ok }) {
  const c = ok ? '#22c55e' : '#ef4444';
  return <span style={{ width: 8, height: 8, borderRadius: '50%', background: c, display: 'inline-block', boxShadow: `0 0 5px ${c}`, marginRight: 6 }} />;
}

function Table({ headers, children }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '.85rem' }}>
        <thead><tr>{headers.map(h => <th key={h} style={S.th}>{h}</th>)}</tr></thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

// ── Widgets ───────────────────────────────────────────────────────────────────
function SnapshotWidget({ snapshots = [] }) {
  const rgs = [...new Set(snapshots.map(s => s.resourceGroup))];
  return (
    <div style={S.panel}>
      <SectionHeader title="📸 Snapshots" count={snapshots.length} />
      {rgs.length > 0 && (
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginBottom: '.85rem' }}>
          {rgs.map(rg => (
            <span key={rg} style={{ fontSize: '.78rem', color: '#64748b' }}>
              <strong style={{ color: '#94a3b8' }}>{rg}</strong> — {snapshots.filter(s => s.resourceGroup === rg).length} snaps
            </span>
          ))}
        </div>
      )}
      <Table headers={['Snapshot', 'Resource Group', 'Source VM', 'Type', 'Size GB', 'Created', 'Expires', 'State']}>
        {snapshots.length === 0 && (
          <tr><td colSpan={8} style={{ padding: '1.5rem', textAlign: 'center', color: '#475569' }}>No snapshots found</td></tr>
        )}
        {snapshots.map(s => (
          <tr key={s.id}>
            <td style={{ ...S.td, fontWeight: 500 }}>{s.snapshotName}</td>
            <td style={{ ...S.td, color: '#64748b' }}>{s.resourceGroup}</td>
            <td style={{ ...S.td, color: '#94a3b8' }}>{s.sourceVm}</td>
            <td style={S.td}><span style={S.badge(s.type === 'Incremental' ? 'rgba(56,189,248,.1)' : 'rgba(139,92,246,.1)', s.type === 'Incremental' ? '#7dd3fc' : '#c4b5fd')}>{s.type}</span></td>
            <td style={{ ...S.td, fontVariantNumeric: 'tabular-nums' }}>{s.sizeGB}</td>
            <td style={{ ...S.td, color: '#64748b', fontSize: '.78rem' }}>{s.createdAt ? timeAgo(s.createdAt) : '—'}</td>
            <td style={S.td}>
              {s.expiryDate ? (
                <span style={S.badge(s.ageWarning ? 'rgba(239,68,68,.12)' : 'rgba(34,197,94,.1)', s.ageWarning ? '#fca5a5' : '#86efac')}>
                  {s.ageWarning ? `⚠ ${daysUntil(s.expiryDate)}d left` : `${daysUntil(s.expiryDate)}d`}
                </span>
              ) : '—'}
            </td>
            <td style={S.td}><span style={S.badge(s.state === 'Succeeded' ? 'rgba(34,197,94,.1)' : 'rgba(239,68,68,.1)', s.state === 'Succeeded' ? '#86efac' : '#fca5a5')}>{s.state}</span></td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function CpuMemoryWidget({ data = [] }) {
  return (
    <div style={S.panel}>
      <SectionHeader title="⚡ CPU & Memory" count={data.length} />
      <Table headers={['Resource', 'Resource Group', 'CPU %', 'Memory %', 'Updated']}>
        {data.map(m => (
          <tr key={m.id} style={{ background: m.cpuAlert || m.memAlert ? 'rgba(239,68,68,.04)' : 'transparent' }}>
            <td style={{ ...S.td, fontWeight: 500 }}>{m.resource}{(m.cpuAlert || m.memAlert) && <span style={{ marginLeft: 6, fontSize: '.7rem', color: '#ef4444' }}>⚠</span>}</td>
            <td style={{ ...S.td, color: '#64748b' }}>{m.resourceGroup}</td>
            <td style={{ ...S.td, minWidth: 140 }}><BarCell value={m.cpu} /></td>
            <td style={{ ...S.td, minWidth: 140 }}><BarCell value={m.memory} /></td>
            <td style={{ ...S.td, color: '#475569', fontSize: '.78rem' }}>{m.timestamp ? timeAgo(m.timestamp) : '—'}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function HttpErrorsWidget({ data = [] }) {
  const sorted = [...data].sort((a, b) => (b.count || 0) - (a.count || 0));
  return (
    <div style={S.panel}>
      <SectionHeader title="🌐 HTTP Errors from Logs" count={data.length} />
      <Table headers={['URL', 'Method', 'Status', 'Count', 'Last Seen', 'Message']}>
        {sorted.map(e => {
          const is5xx = e.statusCode >= 500;
          const is4xx = e.statusCode >= 400 && e.statusCode < 500;
          const sc = is5xx ? SEV.Critical : is4xx ? SEV.Warning : SEV.Info;
          return (
            <tr key={e.id}>
              <td style={{ ...S.td, fontFamily: 'monospace', fontSize: '.78rem', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.url}</td>
              <td style={S.td}><span style={S.badge('rgba(56,189,248,.1)', '#7dd3fc')}>{e.method}</span></td>
              <td style={S.td}><span style={S.badge(sc.bg, sc.color)}>{e.statusCode}</span></td>
              <td style={{ ...S.td, fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: e.count > 20 ? '#ef4444' : '#e2e8f0' }}>{e.count}</td>
              <td style={{ ...S.td, color: '#64748b', fontSize: '.78rem' }}>{e.lastSeen ? timeAgo(e.lastSeen) : '—'}</td>
              <td style={{ ...S.td, color: '#64748b' }}>{e.message}</td>
            </tr>
          );
        })}
      </Table>
    </div>
  );
}

function SiteWidget({ data = [] }) {
  return (
    <div style={S.panel}>
      <SectionHeader title="🌐 Site Status" count={data.length} />
      <div style={{ display: 'grid', gap: '.75rem' }}>
        {data.map(site => (
          <div key={site.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '.75rem 1rem', background: 'rgba(11,18,32,.45)', borderRadius: '.75rem', border: `1px solid ${site.status === 'Down' ? 'rgba(239,68,68,.25)' : 'rgba(34,197,94,.12)'}` }}>
            <div>
              <div style={{ fontWeight: 600 }}>{site.siteName}</div>
              <div style={{ color: '#475569', fontSize: '.78rem', fontFamily: 'monospace' }}>{site.url}</div>
              {site.status === 'Down' && site.downtimeSince && <div style={{ color: '#ef4444', fontSize: '.75rem', marginTop: 2 }}>Down since {timeAgo(site.downtimeSince)}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span style={S.badge(site.status === 'Up' ? 'rgba(34,197,94,.12)' : 'rgba(239,68,68,.12)', site.status === 'Up' ? '#86efac' : '#fca5a5')}>
                <StatusDot ok={site.status === 'Up'} />{site.status}
              </span>
              {site.responseMs && <span style={{ color: '#475569', fontSize: '.73rem' }}>{site.responseMs}ms</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DisksWidget({ data = [] }) {
  const totalCost = data.reduce((s, d) => s + (d.costPerMonth || 0), 0);
  return (
    <div style={S.panel}>
      <SectionHeader title="💽 Unattached Disks" count={data.length} />
      {data.length > 0 && (
        <div style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.2)', borderRadius: '.625rem', padding: '.65rem 1rem', marginBottom: '.85rem', color: '#fcd34d', fontSize: '.85rem' }}>
          ⚠ Estimated wasted cost: <strong>${totalCost.toFixed(2)}/month</strong>
        </div>
      )}
      <Table headers={['Disk Name', 'Resource Group', 'Size GB', 'SKU', 'Region', 'Created', 'Cost/mo']}>
        {data.map(d => (
          <tr key={d.id}>
            <td style={{ ...S.td, fontWeight: 500 }}>{d.diskName}</td>
            <td style={{ ...S.td, color: '#64748b' }}>{d.resourceGroup}</td>
            <td style={{ ...S.td, fontVariantNumeric: 'tabular-nums' }}>{d.sizeGB}</td>
            <td style={S.td}><span style={S.badge('rgba(139,92,246,.1)', '#c4b5fd')}>{d.sku}</span></td>
            <td style={{ ...S.td, color: '#94a3b8' }}>{d.region}</td>
            <td style={{ ...S.td, color: '#64748b', fontSize: '.78rem' }}>{d.createdAt ? timeAgo(d.createdAt) : '—'}</td>
            <td style={{ ...S.td, color: '#f59e0b', fontWeight: 600 }}>${(d.costPerMonth || 0).toFixed(2)}</td>
          </tr>
        ))}
      </Table>
    </div>
  );
}

function AlertsWidget({ data = [] }) {
  return (
    <div style={S.panel}>
      <SectionHeader title="🔔 Alerts" count={data.length} />
      <div style={{ display: 'grid', gap: '.6rem' }}>
        {data.map(a => {
          const c = SEV[a.severity] || SEV.Info;
          return (
            <div key={a.id} style={{ padding: '.75rem 1rem', borderRadius: '.75rem', background: c.bg, borderLeft: `3px solid ${c.border}` }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                <div style={{ fontWeight: 600 }}>{a.name}</div>
                <span style={S.badge(c.bg, c.color)}>{a.severity}</span>
              </div>
              <div style={{ color: '#64748b', fontSize: '.77rem', marginTop: 4, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <span>📦 {a.resource}</span>
                <span>📁 {a.resourceGroup}</span>
                <span>🕒 {a.firedAt ? timeAgo(a.firedAt) : '—'}</span>
                <span style={{ color: a.status === 'Active' ? '#f59e0b' : '#22c55e' }}>{a.status}</span>
              </div>
              {a.description && <div style={{ color: '#475569', fontSize: '.77rem', marginTop: 4 }}>{a.description}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ActivityWidget({ data = [] }) {
  return (
    <div style={S.panel}>
      <SectionHeader title="📋 Activity Log" count={data.length} />
      <div style={{ display: 'grid', gap: '.5rem' }}>
        {data.map(a => (
          <div key={a.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '.65rem .85rem', background: 'rgba(11,18,32,.4)', borderRadius: '.625rem', gap: 12 }}>
            <div>
              <div style={{ fontWeight: 500, fontSize: '.84rem', fontFamily: 'monospace' }}>{a.operation}</div>
              <div style={{ color: '#475569', fontSize: '.73rem', marginTop: 3 }}>by {a.caller} · {a.resourceGroup}</div>
              {a.description && <div style={{ color: '#475569', fontSize: '.73rem' }}>{a.description}</div>}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
              <span style={S.badge(a.status === 'Succeeded' ? 'rgba(34,197,94,.1)' : a.status === 'Failed' ? 'rgba(239,68,68,.1)' : 'rgba(100,116,139,.14)', a.status === 'Succeeded' ? '#86efac' : a.status === 'Failed' ? '#fca5a5' : '#cbd5e1')}>{a.status}</span>
              <span style={{ color: '#475569', fontSize: '.72rem' }}>{a.timestamp ? timeAgo(a.timestamp) : '—'}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
const TABS = ['Overview', 'Snapshots', 'CPU & Memory', 'HTTP Errors', 'Sites', 'Disks', 'Alerts', 'Activity'];

export default function ClientDashboardPage() {
  const { user, logout } = useAuth();
  const { data, isLoading, isError, refetch } = useClientDashboard();
  const [tab, setTab] = useState('Overview');

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b1220', color: '#64748b', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>Loading your dashboard…</div>
    </div>
  );

  if (isError) return (
    <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: '#0b1220', color: '#fca5a5', fontFamily: "'Inter',system-ui,sans-serif" }}>
      <div style={{ textAlign: 'center' }}><div style={{ fontSize: '2rem' }}>⚠</div>Failed to load. <button onClick={refetch} style={{ color: '#38bdf8', background: 'none', border: 'none', cursor: 'pointer' }}>Retry</button></div>
    </div>
  );

  const d = data || {};
  const s = d.summary || {};

  return (
    <div style={{ minHeight: '100vh', background: '#0b1220', color: '#e2e8f0', fontFamily: "'Inter',system-ui,sans-serif", fontSize: 15 }}>
      {/* Top bar */}
      <header style={{ background: 'rgba(17,24,39,.92)', borderBottom: '1px solid rgba(148,163,184,.12)', padding: '.85rem 1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <rect width="28" height="28" rx="8" fill="rgba(56,189,248,.15)" stroke="rgba(56,189,248,.3)" strokeWidth="1"/>
            <path d="M5 20L11 14L16 18L23 10" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div>
            <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{d.projectName || user?.projectName || 'Client Dashboard'}</div>
            <div style={{ color: '#475569', fontSize: '.73rem' }}>Client: {d.clientId || user?.clientId} · Fetched from Azure Tables</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ color: '#64748b', fontSize: '.8rem' }}>{user?.displayName} · <span style={{ color: '#38bdf8' }}>{user?.role}</span></div>
          <button onClick={() => refetch()} style={{ background: 'rgba(56,189,248,.1)', color: '#7dd3fc', border: '1px solid rgba(56,189,248,.2)', padding: '.4rem .9rem', borderRadius: '.6rem', cursor: 'pointer', fontSize: '.8rem', fontFamily: 'inherit' }}>↻ Refresh</button>
          <button onClick={logout} style={{ background: 'rgba(239,68,68,.1)', color: '#fca5a5', border: '1px solid rgba(239,68,68,.2)', padding: '.4rem .9rem', borderRadius: '.6rem', cursor: 'pointer', fontSize: '.8rem', fontFamily: 'inherit' }}>Sign Out</button>
        </div>
      </header>

      <div style={S.page}>
        {/* KPI row */}
        <div style={S.grid4}>
          <KpiCard label="Active Alerts"      value={s.totalAlerts      || 0} color={s.criticalAlerts > 0 ? '#ef4444' : '#38bdf8'} sub={`${s.criticalAlerts || 0} critical`} />
          <KpiCard label="Sites Down"         value={s.sitesDown         || 0} color={s.sitesDown > 0 ? '#ef4444' : '#22c55e'} sub="Live availability" />
          <KpiCard label="5xx HTTP Errors"    value={s.httpErrors5xx     || 0} color={s.httpErrors5xx > 0 ? '#ef4444' : '#22c55e'} sub="From app logs" />
          <KpiCard label="Unattached Disks"   value={s.unattachedDisks   || 0} color={s.unattachedDisks > 0 ? '#f59e0b' : '#22c55e'} sub="Wasted spend" />
          <KpiCard label="Snapshots Expiring" value={s.snapshotsExpiring || 0} color={s.snapshotsExpiring > 0 ? '#f59e0b' : '#22c55e'} sub="Within 7 days" />
        </div>

        {/* Tabs */}
        <div style={S.tabs}>
          {TABS.map(t => <button key={t} style={S.tab(tab === t)} onClick={() => setTab(t)}>{t}</button>)}
        </div>

        {/* Content */}
        {tab === 'Overview' && (
          <>
            <div style={S.grid2}>
              <SiteWidget   data={d.siteDown} />
              <AlertsWidget data={(d.alerts || []).filter(a => a.severity === 'Critical').slice(0, 5)} />
            </div>
            <SnapshotWidget  data={(d.snapshots || []).filter(s => s.ageWarning)} />
            <CpuMemoryWidget data={(d.cpuMemory || []).filter(m => m.cpuAlert || m.memAlert)} />
          </>
        )}
        {tab === 'Snapshots'    && <SnapshotWidget    data={d.snapshots} />}
        {tab === 'CPU & Memory' && <CpuMemoryWidget   data={d.cpuMemory} />}
        {tab === 'HTTP Errors'  && <HttpErrorsWidget  data={d.httpErrors} />}
        {tab === 'Sites'        && <SiteWidget        data={d.siteDown} />}
        {tab === 'Disks'        && <DisksWidget       data={d.disksUnattached} />}
        {tab === 'Alerts'       && <AlertsWidget      data={d.alerts} />}
        {tab === 'Activity'     && <ActivityWidget    data={d.activityLog} />}

        <div style={{ color: '#1e293b', fontSize: '.73rem', textAlign: 'center', padding: '1rem 0 .5rem' }}>
          Data scoped to client: {d.clientId} · Source: Azure Table Storage
        </div>
      </div>
    </div>
  );
}
