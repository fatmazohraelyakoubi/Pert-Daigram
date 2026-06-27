import React, { useState } from 'react';

function calcTimes(savedTasks) {
  const T = {};
  savedTasks.forEach(t => { T[t.name] = { es: 0, ef: 0, ls: 0, lf: 0, rotar: 0 }; });
  savedTasks.forEach(t => {
    const dur = parseFloat(t.dueDate) || 0;
    if (!t.resources) { T[t.name].es = 0; T[t.name].ef = dur; }
    else { const p = T[t.resources] || {}; T[t.name].es = p.ef || 0; T[t.name].ef = (p.ef || 0) + dur; }
  });
  const PE = Math.max(...savedTasks.map(t => T[t.name]?.ef || 0), 0);
  [...savedTasks].reverse().forEach(t => {
    const deps = savedTasks.filter(d => d.resources === t.name);
    T[t.name].lf = deps.length ? Math.min(...deps.map(d => T[d.name]?.ls ?? PE)) : PE;
    T[t.name].ls = T[t.name].lf - (parseFloat(t.dueDate) || 0);
    T[t.name].rotar = T[t.name].ls - T[t.name].es;
  });
  return { T, PE };
}

const COLS = [
  { key: 'name', label: 'Task' },
  { key: 'dueDate', label: 'Duration' },
  { key: 'resources', label: 'Depends on' },
  { key: 'es', label: 'ES' },
  { key: 'ef', label: 'EF' },
  { key: 'ls', label: 'LS' },
  { key: 'lf', label: 'LF' },
  { key: 'rotar', label: 'Float' },
  { key: 'status', label: 'Status' },
];

export default function SavedTasksTable({ savedTasks }) {
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState({ key: 'name', dir: 1 });

  if (!savedTasks.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div style={{ fontSize: 40 }}>≡</div>
      <div style={{ fontSize: 14, color: '#5f5e70' }}>No tasks yet — add some to see the table</div>
    </div>
  );

  const { T, PE } = calcTimes(savedTasks);
  const critSet = new Set(savedTasks.filter(t => T[t.name]?.rotar === 0).map(t => t.name));

  const rows = savedTasks
    .filter(t => t.name.toLowerCase().includes(filter.toLowerCase()))
    .map(t => ({ ...t, ...T[t.name], status: critSet.has(t.name) ? 'critical' : 'normal' }))
    .sort((a, b) => {
      const va = a[sort.key] ?? '';
      const vb = b[sort.key] ?? '';
      return typeof va === 'number' ? (va - vb) * sort.dir : String(va).localeCompare(String(vb)) * sort.dir;
    });

  const handleSort = key => setSort(s => ({ key, dir: s.key === key ? -s.dir : 1 }));

  return (
    <div style={{ padding: '24px 28px', fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes rowIn { from { opacity:0; transform:translateX(-6px); } to { opacity:1; transform:none; } }
        .trow { animation: rowIn 0.2s ease both; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#f0eff4', letterSpacing: '-0.3px' }}>Task table</div>
          <div style={{ fontSize: 12, color: '#5f5e70', marginTop: 2 }}>{savedTasks.length} tasks · {critSet.size} critical</div>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#4a4a5a', fontSize: 14 }}>🔍</span>
          <input
            placeholder="Filter tasks…"
            value={filter}
            onChange={e => setFilter(e.target.value)}
            style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', color: '#f0eff4', borderRadius: 10, padding: '8px 12px 8px 32px', fontSize: 13, width: 180, outline: 'none', fontFamily: 'inherit' }}
          />
        </div>
      </div>

      {/* Table */}
      <div style={{ background: '#0f0f16', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#13131a' }}>
                {COLS.map(c => (
                  <th key={c.key}
                    onClick={() => handleSort(c.key)}
                    style={{ textAlign: 'left', padding: '12px 16px', color: sort.key === c.key ? '#00d9a0' : '#5f5e70', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap', transition: 'color 0.15s' }}
                  >
                    {c.label} {sort.key === c.key ? (sort.dir === 1 ? '↑' : '↓') : ''}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((t, i) => (
                <tr key={t.name} className="trow"
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', animationDelay: `${i * 0.04}s`, transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#13131a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 16px', color: '#f0eff4', fontWeight: 500 }}>{t.name}</td>
                  <td style={{ padding: '12px 16px', color: '#9998a8' }}>{t.dueDate}d</td>
                  <td style={{ padding: '12px 16px', color: '#9998a8' }}>{t.resources || '—'}</td>
                  <td style={{ padding: '12px 16px', color: '#9998a8' }}>{t.es}</td>
                  <td style={{ padding: '12px 16px', color: '#9998a8' }}>{t.ef}</td>
                  <td style={{ padding: '12px 16px', color: '#9998a8' }}>{t.ls}</td>
                  <td style={{ padding: '12px 16px', color: '#9998a8' }}>{t.lf}</td>
                  <td style={{ padding: '12px 16px', color: t.rotar === 0 ? '#ff5e7d' : '#ffb547', fontWeight: 500 }}>{t.rotar}</td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 500,
                      background: t.status === 'critical' ? 'rgba(255,94,125,0.12)' : 'rgba(0,217,160,0.1)',
                      color: t.status === 'critical' ? '#ff5e7d' : '#00d9a0',
                      border: `1px solid ${t.status === 'critical' ? 'rgba(255,94,125,0.25)' : 'rgba(0,217,160,0.2)'}`,
                    }}>
                      <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'currentColor' }} />
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12, marginTop: 16 }}>
        {[
          { label: 'Total tasks', value: savedTasks.length, color: '#60a5fa' },
          { label: 'Critical', value: critSet.size, color: '#ff5e7d' },
          { label: 'Normal', value: savedTasks.length - critSet.size, color: '#00d9a0' },
          { label: 'Project end', value: `Day ${Math.max(...savedTasks.map(t => T[t.name]?.ef || 0), 0)}`, color: '#a78bfa' },
        ].map(c => (
          <div key={c.label} style={{ background: '#0f0f16', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 12, padding: '14px 18px' }}>
            <div style={{ fontSize: 11, color: '#5f5e70', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{c.label}</div>
            <div style={{ fontSize: 22, fontWeight: 600, color: c.color, letterSpacing: '-0.5px' }}>{c.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
}