import React from 'react';

const COLORS = ['#00d9a0', '#a78bfa', '#60a5fa', '#f472b6', '#ffb547', '#34d399', '#fb923c'];

function calcTimes(savedTasks) {
  const T = {};
  savedTasks.forEach(t => { T[t.name] = { es: 0, ef: 0, ls: 0, lf: 0, rotar: 0 }; });
  savedTasks.forEach(t => {
    const dur = parseFloat(t.dueDate) || 0;
    if (!t.resources) { T[t.name].es = 0; T[t.name].ef = dur; }
    else {
      const p = T[t.resources] || {};
      T[t.name].es = p.ef || 0;
      T[t.name].ef = (p.ef || 0) + dur;
    }
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

export default function GanttChart({ savedTasks }) {
  if (!savedTasks.length) return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 12, color: '#3a3a4a' }}>
      <div style={{ fontSize: 40 }}>▤</div>
      <div style={{ fontSize: 14, color: '#5f5e70' }}>No tasks yet — add some to see the Gantt chart</div>
    </div>
  );

  const { T, PE } = calcTimes(savedTasks);
  const days = Math.ceil(PE) || 1;
  const critSet = new Set(savedTasks.filter(t => T[t.name]?.rotar === 0).map(t => t.name));
  const colW = 48;

  return (
    <div style={{ padding: '24px 28px', minWidth: 600, fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes barIn { from { transform: scaleX(0); opacity:0; } to { transform: scaleX(1); opacity:1; } }
        .gbar { transform-origin: left; animation: barIn 0.5s cubic-bezier(0.34,1.56,0.64,1) both; }
      `}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#f0eff4', letterSpacing: '-0.3px' }}>Gantt chart</div>
          <div style={{ fontSize: 12, color: '#5f5e70', marginTop: 2 }}>Project duration: <span style={{ color: '#00d9a0', fontWeight: 500 }}>{days} days</span></div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(255,94,125,0.1)', border: '1px solid rgba(255,94,125,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#ff5e7d' }}>
            ● Critical path
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, background: 'rgba(0,217,160,0.1)', border: '1px solid rgba(0,217,160,0.2)', borderRadius: 6, padding: '4px 10px', fontSize: 11, color: '#00d9a0' }}>
            ● Normal
          </span>
        </div>
      </div>

      {/* Grid */}
      <div style={{ background: '#0f0f16', borderRadius: 14, border: '1px solid rgba(255,255,255,0.06)', overflow: 'hidden' }}>
        {/* Day headers */}
        <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.06)', background: '#13131a' }}>
          <div style={{ width: 130, flexShrink: 0, padding: '10px 16px', fontSize: 11, color: '#5f5e70', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Task</div>
          <div style={{ flex: 1, display: 'flex', overflowX: 'auto' }}>
            {Array.from({ length: days }, (_, i) => (
              <div key={i} style={{ minWidth: colW, textAlign: 'center', padding: '10px 0', fontSize: 11, color: i % 5 === 0 ? '#9998a8' : '#3a3a4a', fontWeight: i % 5 === 0 ? 500 : 400, borderLeft: '1px solid rgba(255,255,255,0.04)' }}>
                {i + 1}
              </div>
            ))}
          </div>
        </div>

        {/* Rows */}
        {savedTasks.map((t, idx) => {
          const ti = T[t.name] || {};
          const isCrit = critSet.has(t.name);
          const color = isCrit ? '#ff5e7d' : COLORS[idx % COLORS.length];
          const leftPct = (ti.es / days) * 100;
          const widthPct = ((parseFloat(t.dueDate) || 0) / days) * 100;

          return (
            <div key={t.name}
              style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.04)', minHeight: 48, alignItems: 'center', transition: 'background 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.background = '#13131a'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Name */}
              <div style={{ width: 130, flexShrink: 0, padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, flexShrink: 0, boxShadow: isCrit ? `0 0 6px ${color}` : 'none' }} />
                <span style={{ fontSize: 13, color: '#f0eff4', fontWeight: 500 }}>{t.name}</span>
                {isCrit && <span style={{ fontSize: 9, background: 'rgba(255,94,125,0.15)', color: '#ff5e7d', border: '1px solid rgba(255,94,125,0.25)', borderRadius: 4, padding: '1px 5px', fontWeight: 500 }}>CRIT</span>}
              </div>

              {/* Bar area */}
              <div style={{ flex: 1, position: 'relative', height: 48, display: 'flex', alignItems: 'center' }}>
                {/* Grid lines */}
                {Array.from({ length: days }, (_, i) => (
                  <div key={i} style={{ position: 'absolute', left: `${(i / days) * 100}%`, top: 0, bottom: 0, width: 1, background: 'rgba(255,255,255,0.03)' }} />
                ))}
                {/* Bar */}
                <div
                  className="gbar"
                  style={{
                    position: 'absolute',
                    left: `${leftPct}%`,
                    width: `${widthPct}%`,
                    height: 28,
                    borderRadius: 7,
                    background: isCrit
                      ? `linear-gradient(90deg, #ff5e7d, #ff8fa3)`
                      : `linear-gradient(90deg, ${color}, ${color}bb)`,
                    display: 'flex',
                    alignItems: 'center',
                    paddingLeft: 10,
                    animationDelay: `${idx * 0.06}s`,
                    boxShadow: isCrit ? `0 0 12px rgba(255,94,125,0.3)` : `0 0 8px ${color}33`,
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 600, color: '#fff', whiteSpace: 'nowrap', textShadow: '0 1px 3px rgba(0,0,0,0.4)' }}>
                    {t.name} · {t.dueDate}d
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginTop: 16 }}>
        {[
          { label: 'Total tasks', value: savedTasks.length, color: '#60a5fa' },
          { label: 'Critical tasks', value: critSet.size, color: '#ff5e7d' },
          { label: 'Project duration', value: `${days}d`, color: '#00d9a0' },
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