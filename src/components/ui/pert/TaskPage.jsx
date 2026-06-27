import React, { useState } from 'react';
import VerticalTabs from './VerticalTabs';

const TaskPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [savedTasks, setSavedTasks] = useState([]);
  const [form, setForm] = useState({ name: '', dueDate: '', resources: '' });
  const [search, setSearch] = useState('');

  const handleField = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleAddRow = () => {
    if (!form.name || !form.dueDate) return;
    setTasks(prev => [...prev, { ...form }]);
    setForm({ name: '', dueDate: '', resources: '' });
  };

  const handleSave = () => {
    const extra = form.name && form.dueDate ? [{ ...form }] : [];
    setSavedTasks(prev => [...prev, ...tasks, ...extra]);
    setTasks([]);
    setForm({ name: '', dueDate: '', resources: '' });
    setOpenDialog(false);
  };

  const handleClose = () => {
    setOpenDialog(false);
    setTasks([]);
    setForm({ name: '', dueDate: '', resources: '' });
  };

  return (
    <div style={{ background: '#0a0a0f', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: "'Inter', system-ui, sans-serif", color: '#f0eff4' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        input, select { font-family: inherit; }
        input::placeholder { color: #3a3a4a; }
        input:focus { border-color: rgba(0,217,160,0.5) !important; box-shadow: 0 0 0 3px rgba(0,217,160,0.08) !important; }
        button { font-family: inherit; transition: all 0.15s ease; }
        button:hover { opacity: 0.85; transform: translateY(-1px); }
        button:active { transform: scale(0.97); }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #2a2a35; border-radius: 10px; }
        @keyframes slideDown { from { opacity:0; transform:translateY(-10px) scale(0.98); } to { opacity:1; transform:none; } }
        @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
        @keyframes ripple { 0%{box-shadow:0 0 0 0 rgba(0,217,160,0.3)} 70%{box-shadow:0 0 0 8px transparent} 100%{box-shadow:0 0 0 0 transparent} }
        .modal-anim { animation: slideDown 0.25s cubic-bezier(0.34,1.56,0.64,1) both; }
        .overlay-anim { animation: fadeIn 0.2s ease both; }
      `}</style>

      {/* Header */}
      <div style={{ background: 'rgba(15,15,20,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', padding: '0 28px', display: 'flex', alignItems: 'center', gap: 16, height: 60, position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ flex: 1, fontSize: 16, fontWeight: 600, letterSpacing: '-0.5px' }}>
          <span style={{ color: '#00d9a0' }}>PERT</span>
          <span style={{ color: '#f0eff4' }}>flow</span>
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#4a4a5a', fontSize: 15 }}>🔍</span>
          <input
            placeholder="Search tasks…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.07)', color: '#f0eff4', borderRadius: 10, padding: '8px 14px 8px 36px', fontSize: 13, width: 220, outline: 'none', transition: 'all 0.2s' }}
          />
        </div>
        <button
          onClick={() => setOpenDialog(true)}
          style={{ display: 'flex', alignItems: 'center', gap: 7, background: '#00d9a0', border: 'none', color: '#021a12', borderRadius: 10, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', letterSpacing: '-0.2px' }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add task
        </button>
      </div>

      {/* Main content */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        <VerticalTabs tasks={tasks} savedTasks={savedTasks} />
      </div>

      {/* Modal */}
      {openDialog && (
        <div
          className="overlay-anim"
          onClick={e => { if (e.target === e.currentTarget) handleClose(); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }}
        >
          <div className="modal-anim" style={{ background: '#13131a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, padding: 32, width: 520, maxHeight: '88vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <div style={{ fontSize: 18, fontWeight: 600, color: '#f0eff4', letterSpacing: '-0.4px' }}>Add tasks</div>
                <div style={{ fontSize: 12, color: '#5f5e70', marginTop: 3 }}>Fill in the details and add to list</div>
              </div>
              <button onClick={handleClose} style={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.08)', color: '#9998a8', borderRadius: 8, width: 32, height: 32, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>

            {/* Form */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 14 }}>
              {[
                { key: 'name', label: 'Task name', placeholder: 'e.g. Design', type: 'text' },
                { key: 'dueDate', label: 'Duration (days)', placeholder: '5', type: 'number' },
                { key: 'resources', label: 'Depends on', placeholder: 'Task name', type: 'text' },
              ].map(f => (
                <div key={f.key}>
                  <label style={{ display: 'block', fontSize: 11, color: '#5f5e70', marginBottom: 6, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.6px' }}>{f.label}</label>
                  <input
                    type={f.type}
                    placeholder={f.placeholder}
                    value={form[f.key]}
                    min={f.type === 'number' ? 1 : undefined}
                    onChange={e => handleField(f.key, e.target.value)}
                    list={f.key === 'resources' ? 'task-names-list' : undefined}
                    style={{ width: '100%', background: '#0f0f16', border: '1px solid rgba(255,255,255,0.08)', color: '#f0eff4', borderRadius: 10, padding: '9px 12px', fontSize: 13, outline: 'none', transition: 'all 0.2s' }}
                  />
                </div>
              ))}
            </div>
            <datalist id="task-names-list">
              {[...tasks, ...savedTasks].map((t, i) => <option key={i} value={t.name} />)}
            </datalist>

            <button
              onClick={handleAddRow}
              style={{ width: '100%', background: 'rgba(0,217,160,0.08)', border: '1px dashed rgba(0,217,160,0.3)', color: '#00d9a0', borderRadius: 10, padding: 10, fontSize: 13, cursor: 'pointer', marginBottom: 16, fontWeight: 500 }}
            >
              + Add to list
            </button>

            {/* Preview table */}
            {tasks.length > 0 && (
              <div style={{ background: '#0f0f16', borderRadius: 12, overflow: 'hidden', border: '1px solid rgba(255,255,255,0.06)', marginBottom: 8 }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                  <thead>
                    <tr style={{ background: '#13131a' }}>
                      {['Task', 'Duration', 'Depends on', ''].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '10px 14px', color: '#5f5e70', fontWeight: 500, fontSize: 11, textTransform: 'uppercase', letterSpacing: '0.5px', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {tasks.map((t, i) => (
                      <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.1s' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#1a1a24'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '10px 14px', color: '#f0eff4', fontWeight: 500 }}>{t.name}</td>
                        <td style={{ padding: '10px 14px', color: '#9998a8' }}>{t.dueDate}d</td>
                        <td style={{ padding: '10px 14px', color: '#9998a8' }}>{t.resources || '—'}</td>
                        <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                          <button onClick={() => setTasks(prev => prev.filter((_, idx) => idx !== i))}
                            style={{ background: 'rgba(255,94,125,0.1)', border: '1px solid rgba(255,94,125,0.2)', color: '#ff5e7d', borderRadius: 6, width: 26, height: 26, cursor: 'pointer', fontSize: 14, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 20 }}>
              <button onClick={handleClose}
                style={{ background: '#1e1e28', border: '1px solid rgba(255,255,255,0.08)', color: '#9998a8', borderRadius: 10, padding: '9px 18px', fontSize: 13, cursor: 'pointer' }}>
                Cancel
              </button>
              <button onClick={handleSave}
                style={{ background: '#00d9a0', border: 'none', color: '#021a12', borderRadius: 10, padding: '9px 22px', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                Save tasks
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TaskPage;