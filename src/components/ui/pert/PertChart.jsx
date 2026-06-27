import React, { useState, useEffect, useRef } from 'react';

const STYLE = {
  app: { background: '#0f0f11', fontFamily: 'system-ui, sans-serif', position: 'relative' },
  canvas: { position: 'relative', minWidth: 860, minHeight: 460 },
  svg: { position: 'absolute', inset: 0, pointerEvents: 'none' },
  node: { position: 'absolute', width: 108, height: 108, cursor: 'grab' },
  inner: (isCrit, isSE) => ({
    width: '100%', height: '100%', borderRadius: '50%',
    background: isSE ? '#1e1e24' : '#17171b',
    border: `1.5px solid ${isCrit ? '#ff5e7d' : isSE ? 'rgba(0,217,160,0.25)' : 'rgba(255,255,255,0.14)'}`,
    position: 'relative',
    boxShadow: isCrit ? '0 0 0 3px rgba(255,94,125,0.1)' : 'none',
    animation: isCrit ? 'pertRipple 2.2s infinite' : 'none',
  }),
  hline: { position: 'absolute', left: 0, right: 0, top: '50%', height: 1, background: 'rgba(255,255,255,0.08)' },
  vline: { position: 'absolute', top: '25%', bottom: 0, left: '50%', width: 1, background: 'rgba(255,255,255,0.08)' },
  label: { position: 'absolute', top: '11%', width: '100%', textAlign: 'center', fontSize: 12, fontWeight: 500, color: '#f0eff4' },
  tl: { position: 'absolute', top: '55%', left: 4, fontSize: 10, color: '#9998a8' },
  tr: (isCrit) => ({ position: 'absolute', top: '55%', right: 4, fontSize: 10, color: isCrit ? '#ff5e7d' : '#9998a8' }),
  bl: { position: 'absolute', bottom: '9%', left: 4, fontSize: 10, color: '#ff5e7d' },
  br: { position: 'absolute', bottom: '9%', right: 4, fontSize: 10, color: '#ff5e7d' },
  footer: { position: 'absolute', bottom: 12, left: 16, display: 'flex', gap: 10, flexWrap: 'wrap' },
  badge: { display: 'flex', alignItems: 'center', gap: 6, background: '#17171b', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 7, padding: '5px 10px', fontSize: 11, color: '#9998a8' },
};

const PertChart = ({ savedTasks, onTaskUpdate }) => {
  const [positions, setPositions] = useState({});
  const [taskTimes, setTaskTimes] = useState({});
  const [criticalPathTasks, setCriticalPathTasks] = useState([]);
  const [projectTime, setProjectTime] = useState(0);
  const dragRef = useRef(null);
  const canvasRef = useRef(null);

  // Auto-layout
  useEffect(() => {
    const slotMap = {};
    const newPos = {};
    function place(name) {
      if (newPos[name]) return;
      const task = savedTasks.find(t => t.name === name);
      if (!task) return;
      if (task.resources && !newPos[task.resources]) place(task.resources);
      const col = task.resources ? (newPos[task.resources]?.col || 0) + 1 : 0;
      if (!slotMap[col]) slotMap[col] = 0;
      const row = slotMap[col]++;
      newPos[name] = { x: 55 + col * 170, y: 55 + row * 145, col };
    }
    savedTasks.forEach(t => place(t.name));
    const cols = Object.keys(slotMap).length;
    newPos['__start'] = { x: 10, y: 170 };
    newPos['__end'] = { x: 55 + cols * 170, y: 170 };
    setPositions(newPos);
  }, [savedTasks]);

  // PERT calculation
  useEffect(() => {
    const times = {};
    const crit = [];
    savedTasks.forEach(t => {
      if (t.name) times[t.name] = { start: 0, end: parseFloat(t.dueDate) || 0 };
    });
    savedTasks.forEach(t => {
      if (t.name && t.resources) {
        const dep = savedTasks.find(d => d.name === t.resources);
        if (dep && times[dep.name]) {
          times[t.name].start = times[dep.name].end;
          times[t.name].end = times[dep.name].end + (parseFloat(t.dueDate) || 0);
        }
      }
    });
    const PE = Math.max(...Object.values(times).map(t => t.end || 0), 0);
    [...savedTasks].reverse().forEach(t => {
      if (!t.name) return;
      const deps = savedTasks.filter(d => d.resources === t.name);
      times[t.name].lateFinish = deps.length ? Math.min(...deps.map(d => times[d.name]?.start || Infinity)) : PE;
      times[t.name].lateStart = times[t.name].lateFinish - (parseFloat(t.dueDate) || 0);
      times[t.name].rotar = times[t.name].lateStart - times[t.name].start;
      if (times[t.name].start === times[t.name].lateStart) crit.push(t);
    });
    setTaskTimes(times);
    setCriticalPathTasks(crit);
    setProjectTime(PE);
  }, [savedTasks]);

  // Drag
  const startDrag = (e, id) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const cr = canvas.getBoundingClientRect();
    const er = e.currentTarget.getBoundingClientRect();
    dragRef.current = { id, ox: e.clientX - er.left, oy: e.clientY - er.top };
    e.preventDefault();
  };

  useEffect(() => {
    const onMove = e => {
      if (!dragRef.current || !canvasRef.current) return;
      const { id, ox, oy } = dragRef.current;
      const r = canvasRef.current.getBoundingClientRect();
      setPositions(prev => ({ ...prev, [id]: { ...prev[id], x: Math.max(0, e.clientX - r.left - ox), y: Math.max(0, e.clientY - r.top - oy) } }));
    };
    const onUp = () => { dragRef.current = null; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  const critSet = new Set(criticalPathTasks.map(t => t.name));

  // Compute canvas size
  let maxX = 0, maxY = 0;
  Object.values(positions).forEach(p => { maxX = Math.max(maxX, p.x + 130); maxY = Math.max(maxY, p.y + 130); });

  const nC = id => { const p = positions[id]; return p ? { x: p.x + 54, y: p.y + 54 } : null; };

  const renderArrow = (key, a, b, isCrit) => {
    if (!a || !b) return null;
    const dx = b.x - a.x, dy = b.y - a.y, len = Math.hypot(dx, dy);
    if (len < 2) return null;
    const r = 54;
    return (
      <line key={key}
        x1={a.x + (dx / len) * r} y1={a.y + (dy / len) * r}
        x2={b.x - (dx / len) * r} y2={b.y - (dy / len) * r}
        stroke={isCrit ? '#ff5e7d' : 'rgba(255,255,255,0.1)'}
        strokeWidth="1.5" markerEnd="url(#arr)"
      />
    );
  };

  const renderNode = (id, label, tl, tr, bl, br, isSE, isCrit) => {
    const p = positions[id];
    if (!p) return null;
    return (
      <div key={id} style={{ ...STYLE.node, left: p.x, top: p.y }} onMouseDown={e => startDrag(e, id)}>
        <div style={STYLE.inner(isCrit, isSE)}>
          <div style={STYLE.hline} />
          <div style={STYLE.vline} />
          <div style={STYLE.label}>{label}</div>
          <span style={STYLE.tl}>{tl}</span>
          <span style={STYLE.tr(isCrit)}>{tr}</span>
          <span style={STYLE.bl}>{bl}</span>
          <span style={STYLE.br}>{br}</span>
        </div>
      </div>
    );
  };

  const terminals = savedTasks.filter(t => !savedTasks.some(d => d.resources === t.name));
  const critPath = criticalPathTasks.map(t => t.name).join(' → ');

  return (
    <div style={STYLE.app}>
      <style>{`@keyframes pertRipple{0%{box-shadow:0 0 0 0 rgba(255,94,125,0.2)}70%{box-shadow:0 0 0 8px transparent}100%{box-shadow:0 0 0 0 transparent}}`}</style>
      <div ref={canvasRef} style={{ ...STYLE.canvas, minWidth: maxX + 50, minHeight: maxY + 80 }}>
        <svg style={STYLE.svg} width={maxX + 50} height={maxY + 80}>
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
              <path d="M2 1L8 5L2 9" fill="none" stroke="context-stroke" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
          </defs>
          {savedTasks.filter(t => !t.resources).map(t => renderArrow(`s-${t.name}`, nC('__start'), nC(t.name), critSet.has(t.name)))}
          {savedTasks.map(t => t.resources && renderArrow(`${t.resources}-${t.name}`, nC(t.resources), nC(t.name), critSet.has(t.name)))}
          {terminals.map(t => renderArrow(`${t.name}-e`, nC(t.name), nC('__end'), critSet.has(t.name)))}
        </svg>

        {renderNode('__start', 'Start', '0', '0', '0', '0', true, false)}
        {savedTasks.map(t => {
          const ti = taskTimes[t.name] || {};
          return renderNode(t.name, t.name, ti.start ?? '', ti.end ?? '', ti.lateStart ?? '', ti.lateFinish ?? '', false, critSet.has(t.name));
        })}
        {renderNode('__end', 'End', projectTime, projectTime, projectTime, projectTime, true, false)}

        <div style={STYLE.footer}>
          <div style={STYLE.badge}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5e7d', display: 'inline-block' }} />
            Critical: {critPath || '—'}
          </div>
          <div style={STYLE.badge}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#00d9a0', display: 'inline-block' }} />
            Duration: <b style={{ color: '#00d9a0', marginLeft: 3 }}>{projectTime}</b> days
          </div>
        </div>
      </div>
    </div>
  );
};

export default PertChart;