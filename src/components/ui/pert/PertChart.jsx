import React, { useState, useEffect, useRef } from 'react';

const PertChart = ({ savedTasks }) => {
  const [positions, setPositions] = useState({});
  const [taskTimes, setTaskTimes] = useState({});
  const [criticalPathTasks, setCriticalPathTasks] = useState([]);
  const [projectTime, setProjectTime] = useState(0);
  const dragRef = useRef(null);
  const canvasRef = useRef(null);

  const NODE_R = 56;
  const COL_W = 220;
  const ROW_H = 190;
  const PAD_X = 100;
  const PAD_Y = 80;

  // ── Layout ──
  useEffect(() => {
    const newPos = {};

    if (!savedTasks.length) {
      newPos['__start'] = { x: PAD_X, y: 280 };
      newPos['__end']   = { x: PAD_X + COL_W * 2, y: 280 };
      setPositions(newPos);
      return;
    }

    // Depth per task
    const depth = {};
    const getDepth = (name, seen = new Set()) => {
      if (depth[name] !== undefined) return depth[name];
      if (seen.has(name)) return 0;
      seen.add(name);
      const task = savedTasks.find(t => t.name === name);
      if (!task || !task.resources) { depth[name] = 1; return 1; }
      depth[name] = getDepth(task.resources, seen) + 1;
      return depth[name];
    };
    savedTasks.forEach(t => getDepth(t.name));

    // Group by depth column
    const cols = {};
    savedTasks.forEach(t => {
      const d = depth[t.name] ?? 1;
      if (!cols[d]) cols[d] = [];
      cols[d].push(t.name);
    });

    const maxDepth = Math.max(...Object.keys(cols).map(Number));
    const totalRows = Math.max(...Object.values(cols).map(arr => arr.length));
    const centerY = PAD_Y + (totalRows * ROW_H) / 2;

    // Place tasks
    Object.keys(cols).forEach(col => {
      const arr = cols[col];
      const colTotalH = arr.length * ROW_H;
      const startY = centerY - colTotalH / 2;
      arr.forEach((name, i) => {
        newPos[name] = {
          x: PAD_X + Number(col) * COL_W,
          y: startY + i * ROW_H,
        };
      });
    });

    // Start: left of col 1, vertically centered
    newPos['__start'] = { x: PAD_X - COL_W + 20, y: centerY - NODE_R };
    // End: right of last col, vertically centered
    newPos['__end']   = { x: PAD_X + (maxDepth + 1) * COL_W, y: centerY - NODE_R };

    setPositions(newPos);
  }, [savedTasks]);

  // ── PERT Calc ──
  useEffect(() => {
    if (!savedTasks.length) {
      setTaskTimes({}); setCriticalPathTasks([]); setProjectTime(0); return;
    }

    const T = {};
    savedTasks.forEach(t => { T[t.name] = { es: 0, ef: 0, ls: 0, lf: 0, rotar: 0 }; });

    // Forward
    const fVisited = new Set();
    const forward = name => {
      if (fVisited.has(name)) return;
      fVisited.add(name);
      const task = savedTasks.find(t => t.name === name);
      if (!task) return;
      if (task.resources) forward(task.resources);
      const dur = parseFloat(task.dueDate) || 0;
      const depEF = task.resources ? (T[task.resources]?.ef ?? 0) : 0;
      T[name].es = depEF;
      T[name].ef = depEF + dur;
    };
    savedTasks.forEach(t => forward(t.name));

    const PE = Math.max(...Object.values(T).map(t => t.ef), 0);

    // Backward
    const bVisited = new Set();
    const backward = name => {
      if (bVisited.has(name)) return;
      bVisited.add(name);
      const dependents = savedTasks.filter(d => d.resources === name);
      dependents.forEach(d => backward(d.name));
      const dur = parseFloat(savedTasks.find(t => t.name === name)?.dueDate) || 0;
      T[name].lf = dependents.length
        ? Math.min(...dependents.map(d => T[d.name].ls))
        : PE;
      T[name].ls = T[name].lf - dur;
      T[name].rotar = +(T[name].ls - T[name].es).toFixed(4);
    };
    savedTasks.forEach(t => backward(t.name));

    setTaskTimes(T);
    setCriticalPathTasks(savedTasks.filter(t => T[t.name]?.rotar === 0));
    setProjectTime(PE);
  }, [savedTasks]);

  // ── Drag ──
  const startDrag = (e, id) => {
    const er = e.currentTarget.getBoundingClientRect();
    dragRef.current = { id, ox: e.clientX - er.left, oy: e.clientY - er.top };
    e.preventDefault();
  };
  useEffect(() => {
    const onMove = e => {
      if (!dragRef.current || !canvasRef.current) return;
      const { id, ox, oy } = dragRef.current;
      const r = canvasRef.current.getBoundingClientRect();
      setPositions(prev => ({
        ...prev,
        [id]: { ...prev[id], x: Math.max(0, e.clientX - r.left - ox), y: Math.max(0, e.clientY - r.top - oy) },
      }));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const critSet = new Set(criticalPathTasks.map(t => t.name));

  let maxX = 0, maxY = 0;
  Object.values(positions).forEach(p => {
    maxX = Math.max(maxX, p.x + NODE_R * 2 + 80);
    maxY = Math.max(maxY, p.y + NODE_R * 2 + 80);
  });

  const nC = id => {
    const p = positions[id];
    return p ? { x: p.x + NODE_R, y: p.y + NODE_R } : null;
  };

  // ── Arrow ──
  const renderArrow = (key, a, b, isCrit, label) => {
    if (!a || !b) return null;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    if (len < 2) return null;
    const r = NODE_R + 3;
    const sx = a.x + (dx / len) * r, sy = a.y + (dy / len) * r;
    const ex = b.x - (dx / len) * r, ey = b.y - (dy / len) * r;
    const mx = (sx + ex) / 2, my = (sy + ey) / 2;
    const color = isCrit ? '#ff4d6d' : '#00d9a0';
    const mid = `m-${key}`;
    return (
      <g key={key}>
        <defs>
          <marker id={mid} viewBox="0 0 10 10" refX="9" refY="5"
            markerWidth="6" markerHeight="6" orient="auto">
            <path d="M0,0 L10,5 L0,10 z" fill={color} />
          </marker>
        </defs>
        <line x1={sx} y1={sy} x2={ex} y2={ey}
          stroke={color} strokeWidth={isCrit ? 2.5 : 1.8}
          markerEnd={`url(#${mid})`}
          filter={isCrit ? 'url(#fr)' : 'url(#fg)'}
        />
        {label && (
          <g>
            <rect x={mx - 36} y={my - 11} width={72} height={22} rx={6}
              fill="rgba(8,8,16,0.92)" stroke={color} strokeWidth={0.8} />
            <text x={mx} y={my + 5} textAnchor="middle"
              fontSize={10} fontWeight={600} fill={color}
              fontFamily="Inter,system-ui,sans-serif">
              {label}
            </text>
          </g>
        )}
      </g>
    );
  };

  // ── Node ──
  const renderNode = (id, label, isSE, isCrit) => {
    const p = positions[id];
    if (!p) return null;
    const ti = taskTimes[label] || {};
    const gc = isCrit ? '#ff4d6d' : '#00d9a0';
    const size = NODE_R * 2;

    return (
      <div key={id}
        style={{ position: 'absolute', left: p.x, top: p.y, width: size, height: size, cursor: 'grab', userSelect: 'none' }}
        onMouseDown={e => startDrag(e, id)}
      >
        {/* ES / EF top */}
        {!isSE && (
          <div style={{ position: 'absolute', top: -26, left: 0, right: 0, display: 'flex', justifyContent: 'space-between', padding: '0 4px' }}>
            <span style={{ fontSize: 12, color: '#9998a8', fontFamily: 'Inter,system-ui' }}>{ti.es ?? 0}</span>
            <span style={{ fontSize: 12, color: '#9998a8', fontFamily: 'Inter,system-ui' }}>{ti.ef ?? 0}</span>
          </div>
        )}

        {/* Outer pulse ring */}
        <div style={{
          position: 'absolute', inset: -10, borderRadius: '50%',
          animation: isCrit ? 'pulseRed 2s ease-in-out infinite' : 'pulseGreen 3s ease-in-out infinite',
          pointerEvents: 'none',
        }} />

        {/* Circle */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: '50%',
          background: isCrit
            ? 'radial-gradient(circle at 38% 32%, #2d0a10, #110306)'
            : 'radial-gradient(circle at 38% 32%, #082d1c, #031209)',
          border: `2px solid ${gc}`,
          boxShadow: `0 0 22px ${gc}55, inset 0 0 18px ${gc}0d`,
          overflow: 'hidden',
        }}>
          {/* Cross lines */}
          <div style={{ position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: `${gc}40` }} />
          <div style={{ position: 'absolute', top: 0, bottom: 0, left: '50%', width: 1, background: `${gc}40` }} />

          {isSE ? (
            <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'Inter,system-ui', textShadow: `0 0 14px ${gc}` }}>
              {label}
            </div>
          ) : (
            <>
              {/* Name top half */}
              <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, color: '#fff', textShadow: `0 0 14px ${gc}`, fontFamily: 'Inter,system-ui' }}>
                {label}
              </div>
              {/* LS bottom-left */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, width: '50%', height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: gc, fontFamily: 'Inter,system-ui' }}>
                {ti.ls ?? 0}
              </div>
              {/* LF bottom-right */}
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: '50%', height: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15, fontWeight: 600, color: gc, fontFamily: 'Inter,system-ui' }}>
                {ti.lf ?? 0}
              </div>
            </>
          )}
        </div>
      </div>
    );
  };

const noDepTasks = savedTasks.filter(t => 
  !t.resources || 
  t.resources === '' || 
  !savedTasks.some(s => s.name === t.resources)
);
  const terminalTasks = savedTasks.filter(t => !savedTasks.some(d => d.resources === t.name));
  const critPath = criticalPathTasks.map(t => t.name).join(' → ');

  return (
    <div style={{ background: '#080810', minHeight: '100%', position: 'relative', fontFamily: 'Inter,system-ui,sans-serif' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
        @keyframes pulseRed {
          0%,100% { box-shadow: 0 0 16px 4px rgba(255,77,109,0.3); }
          50%      { box-shadow: 0 0 34px 12px rgba(255,77,109,0.65); }
        }
        @keyframes pulseGreen {
          0%,100% { box-shadow: 0 0 14px 4px rgba(0,217,160,0.2); }
          50%      { box-shadow: 0 0 26px 8px rgba(0,217,160,0.5); }
        }
      `}</style>

      <div ref={canvasRef} style={{ position: 'relative', minWidth: maxX + 60, minHeight: Math.max(maxY + 120, 520), padding: '60px 20px 100px' }}>

        <svg style={{ position: 'absolute', inset: 0, pointerEvents: 'none', overflow: 'visible' }}
          width={maxX + 60} height={maxY + 120}>
          <defs>
            <filter id="fr" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="4" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <filter id="fg" x="-80%" y="-80%" width="260%" height="260%">
              <feGaussianBlur stdDeviation="2.5" result="b" />
              <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
          </defs>

          {/* Start → tasks with no dependency */}
          {noDepTasks.map(t =>
            renderArrow(`s-${t.name}`, nC('__start'), nC(t.name), critSet.has(t.name), t.name)
          )}

          {/* Task → its dependent */}
          {savedTasks.map(t =>
            t.resources && t.resources !== ''
              ? renderArrow(`${t.resources}-${t.name}`, nC(t.resources), nC(t.name), critSet.has(t.name), t.name)
              : null
          )}

          {/* Terminal tasks → End */}
          {terminalTasks.map(t =>
            renderArrow(`${t.name}-e`, nC(t.name), nC('__end'), critSet.has(t.name), 'finish')
          )}
        </svg>

        {/* Start node */}
        {renderNode('__start', 'Start', true, false)}

        {/* Task nodes */}
        {savedTasks.map(t => renderNode(t.name, t.name, false, critSet.has(t.name)))}

        {/* End node */}
        {renderNode('__end', 'End', true, false)}
      </div>

      {/* Footer */}
      <div style={{ position: 'sticky', bottom: 0, display: 'flex', justifyContent: 'center', gap: 12, padding: '12px 20px', background: 'rgba(8,8,16,0.96)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(255,255,255,0.05)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,77,109,0.1)', border: '1px solid rgba(255,77,109,0.3)', borderRadius: 24, padding: '7px 20px', fontSize: 13 }}>
          <span style={{ color: '#ff4d6d', fontWeight: 500 }}>Critical Path:</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{critPath || '—'}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(0,217,160,0.08)', border: '1px solid rgba(0,217,160,0.25)', borderRadius: 24, padding: '7px 20px', fontSize: 13 }}>
          <span style={{ color: '#00d9a0', fontWeight: 500 }}>Duration:</span>
          <span style={{ color: '#fff', fontWeight: 700 }}>{projectTime} days</span>
        </div>
      </div>
    </div>
  );
};

export default PertChart;