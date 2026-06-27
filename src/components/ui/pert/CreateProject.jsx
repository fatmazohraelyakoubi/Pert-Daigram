import React, { useState } from 'react';

const CreateProject = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState([]);

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => { setOpenDialog(false); setProjectName(''); };
  const handleSaveProject = () => { setProjects([...projects, projectName]); handleCloseDialog(); };

  return (
    <div style={{ background: '#0f0f11', minHeight: '100vh', display: 'flex', flexDirection: 'column', fontFamily: 'system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ background: '#17171b', borderBottom: '1px solid rgba(255,255,255,0.08)', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 12, height: 52 }}>
        <div style={{ flex: 1, fontSize: 14, fontWeight: 500, color: '#f0eff4', letterSpacing: '-0.2px' }}>
          <span style={{ color: '#00d9a0' }}>PERT</span>flow
        </div>
        <div style={{ position: 'relative' }}>
          <span style={{ position: 'absolute', left: 9, top: '50%', transform: 'translateY(-50%)', color: '#5f5e70', fontSize: 14, pointerEvents: 'none' }}>⌕</span>
          <input
            type="text"
            placeholder="Search projects…"
            style={{ background: '#1e1e24', border: '1px solid rgba(255,255,255,0.08)', color: '#f0eff4', borderRadius: 8, padding: '6px 10px 6px 30px', fontSize: 12, width: 190, outline: 'none' }}
          />
        </div>
        <button
          onClick={handleOpenDialog}
          style={{ display: 'flex', alignItems: 'center', gap: 5, background: '#00d9a0', border: 'none', color: '#0a1a14', borderRadius: 8, padding: '6px 13px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
        >
          + Add project
        </button>
      </div>

      {/* Projects grid */}
      <div style={{ padding: 20, flex: 1 }}>
        <NewProject projects={projects} />
      </div>

      {/* Modal overlay */}
      {openDialog && (
        <div
          onClick={(e) => { if (e.target === e.currentTarget) handleCloseDialog(); }}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}
        >
          <div style={{ background: '#17171b', border: '1px solid rgba(255,255,255,0.14)', borderRadius: 14, padding: 22, width: 340 }}>
            <h3 style={{ fontSize: 15, fontWeight: 500, color: '#f0eff4', marginBottom: 18 }}>Add project</h3>
            <div style={{ marginBottom: 13 }}>
              <label style={{ display: 'block', fontSize: 11, color: '#5f5e70', marginBottom: 4 }}>Project name</label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="e.g. Website redesign"
                style={{ width: '100%', background: '#1e1e24', border: '1px solid rgba(255,255,255,0.14)', color: '#f0eff4', borderRadius: 8, padding: '8px 10px', fontSize: 12, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 18 }}>
              <button
                onClick={handleCloseDialog}
                style={{ background: '#26262e', border: '1px solid rgba(255,255,255,0.14)', color: '#9998a8', borderRadius: 8, padding: '7px 14px', fontSize: 12, cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProject}
                style={{ background: '#00d9a0', border: 'none', color: '#0a1a14', borderRadius: 8, padding: '7px 16px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
              >
                Save project
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreateProject;