import React, { useState } from 'react';
import PertChart from './PertChart';
import SavedTasksTable from './SavedTasksTable';
import GanttChart from './GanttChart';

const TABS = [
  { label: 'PERT diagram', icon: '◎' },
  { label: 'Gantt chart', icon: '▤' },
  { label: 'Task table', icon: '≡' },
];

export default function VerticalTabs({ tasks, savedTasks }) {
  const [active, setActive] = useState(0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: '#0a0a0f' }}>
      <style>{`
        @keyframes panelIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:none; } }
        .panel-in { animation: panelIn 0.2s ease both; }
      `}</style>

      {/* Tab bar */}
      <div style={{ background: '#0f0f16', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', padding: '0 24px', gap: 4, flexShrink: 0 }}>
        {TABS.map((t, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '0 16px', height: 44, fontSize: 13, fontWeight: active === i ? 500 : 400,
              color: active === i ? '#00d9a0' : '#5f5e70',
              background: 'none', border: 'none', borderBottom: `2px solid ${active === i ? '#00d9a0' : 'transparent'}`,
              cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit',
            }}
          >
            <span style={{ fontSize: 15 }}>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* Panels */}
      <div style={{ flex: 1, overflow: 'auto', position: 'relative' }}>
        <div key={active} className="panel-in" style={{ height: '100%' }}>
          {active === 0 && <PertChart savedTasks={savedTasks} />}
          {active === 1 && <GanttChart savedTasks={savedTasks} />}
          {active === 2 && <SavedTasksTable savedTasks={savedTasks} tasks={tasks} />}
        </div>
      </div>
    </div>
  );
}