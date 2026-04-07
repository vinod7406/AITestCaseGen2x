import React, { useState, useEffect, useRef } from 'react';
import { Play, Plus, Trash2, CheckCircle2, XCircle, Clock, Camera, Download, Upload, RotateCcw, Save, FolderOpen } from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

// ─────────────────────────────────────────────────────
// Action definitions: which fields are needed
// ─────────────────────────────────────────────────────
const ACTIONS = [
  // Navigation
  { group: 'Navigation', value: 'GOTO',          label: 'GOTO – Navigate to URL',        needsLocator: false, needsValue: true,  valuePlaceholder: 'https://example.com' },
  { group: 'Navigation', value: 'BACK',           label: 'BACK – Go Back',                needsLocator: false, needsValue: false },
  { group: 'Navigation', value: 'FORWARD',        label: 'FORWARD – Go Forward',          needsLocator: false, needsValue: false },
  { group: 'Navigation', value: 'REFRESH',        label: 'REFRESH – Reload Page',         needsLocator: false, needsValue: false },
  // Mouse
  { group: 'Mouse',      value: 'CLICK',          label: 'CLICK – Single Click',          needsLocator: true,  needsValue: false },
  { group: 'Mouse',      value: 'DOUBLE_CLICK',   label: 'DOUBLE_CLICK',                  needsLocator: true,  needsValue: false },
  { group: 'Mouse',      value: 'RIGHT_CLICK',    label: 'RIGHT_CLICK – Context Menu',    needsLocator: true,  needsValue: false },
  { group: 'Mouse',      value: 'HOVER',          label: 'HOVER – Mouse Over',            needsLocator: true,  needsValue: false },
  // Input
  { group: 'Input',      value: 'TYPE',           label: 'TYPE – Fill Field',             needsLocator: true,  needsValue: true,  valuePlaceholder: 'Text to type' },
  { group: 'Input',      value: 'CLEAR',          label: 'CLEAR – Clear Field',           needsLocator: true,  needsValue: false },
  { group: 'Input',      value: 'PRESS_KEY',      label: 'PRESS_KEY – Keyboard Press',    needsLocator: false, needsValue: true,  valuePlaceholder: 'Enter, Tab, Escape, ArrowDown...' },
  { group: 'Input',      value: 'SELECT',         label: 'SELECT – Dropdown Option',      needsLocator: true,  needsValue: true,  valuePlaceholder: 'option value or label' },
  { group: 'Input',      value: 'CHECK',          label: 'CHECK – Checkbox On',           needsLocator: true,  needsValue: false },
  { group: 'Input',      value: 'UNCHECK',        label: 'UNCHECK – Checkbox Off',        needsLocator: true,  needsValue: false },
  // Scroll
  { group: 'Scroll',     value: 'SCROLL_TO',      label: 'SCROLL_TO – Scroll to Element', needsLocator: true,  needsValue: false },
  { group: 'Scroll',     value: 'SCROLL_PAGE',    label: 'SCROLL_PAGE – Scroll Page',     needsLocator: false, needsValue: true,  valuePlaceholder: 'up or down' },
  // Wait
  { group: 'Wait',       value: 'WAIT',           label: 'WAIT – Sleep (ms)',              needsLocator: false, needsValue: true,  valuePlaceholder: '1000' },
  { group: 'Wait',       value: 'WAIT_FOR_ELEMENT',label:'WAIT_FOR_ELEMENT – Visible',    needsLocator: true,  needsValue: false },
  { group: 'Wait',       value: 'WAIT_FOR_URL',   label: 'WAIT_FOR_URL – URL matches',    needsLocator: false, needsValue: true,  valuePlaceholder: '**/dashboard**' },
  // Assertions
  { group: 'Assert',     value: 'ASSERT_TEXT',    label: 'ASSERT_TEXT – Contains Text',   needsLocator: true,  needsValue: true,  valuePlaceholder: 'Expected text' },
  { group: 'Assert',     value: 'ASSERT_VISIBLE', label: 'ASSERT_VISIBLE – Is Visible',   needsLocator: true,  needsValue: false },
  { group: 'Assert',     value: 'ASSERT_URL',     label: 'ASSERT_URL – URL Contains',     needsLocator: false, needsValue: true,  valuePlaceholder: '/dashboard' },
  { group: 'Assert',     value: 'ASSERT_TITLE',   label: 'ASSERT_TITLE – Title Contains', needsLocator: false, needsValue: true,  valuePlaceholder: 'Page Title' },
  // Capture
  { group: 'Capture',    value: 'GET_TEXT',       label: 'GET_TEXT – Read Element Text',  needsLocator: true,  needsValue: false },
  { group: 'Capture',    value: 'SCREENSHOT',     label: 'SCREENSHOT – Take Screenshot',  needsLocator: false, needsValue: false, valuePlaceholder: 'fullpage (optional)' },
  // Dialog
  { group: 'Dialog',     value: 'ACCEPT_DIALOG',  label: 'ACCEPT_DIALOG – Alert Accept',  needsLocator: false, needsValue: false },
  { group: 'Dialog',     value: 'DISMISS_DIALOG', label: 'DISMISS_DIALOG – Alert Dismiss',needsLocator: false, needsValue: false },
];

const groupColors = {
  Navigation: '#38bdf8', Mouse: '#a78bfa', Input: '#34d399', Scroll: '#fbbf24',
  Wait: '#f97316', Assert: '#f472b6', Capture: '#60a5fa', Dialog: '#fb923c',
};

const s = {
  page:      { minHeight: '100vh', background: '#0f172a', color: '#f8fafc', padding: '32px', fontFamily: "'Inter', system-ui, sans-serif" },
  wrap:      { maxWidth: '1300px', margin: '0 auto' },
  hdr:       { display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b', padding: '22px 32px', borderRadius: '16px', border: '1px solid rgba(51,65,85,0.6)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)', marginBottom: '28px' },
  title:     { fontSize: '1.7rem', fontWeight: 'bold', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' },
  subtitle:  { color: '#94a3b8', marginTop: '4px', fontSize: '0.85rem' },
  runBtn:    { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 28px', borderRadius: '12px', fontWeight: 'bold', fontSize: '1rem', color: 'white', border: 'none', cursor: 'pointer' },
  errBar:    { background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.4)', color: '#fca5a5', padding: '14px 20px', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', fontSize: '0.9rem' },
  tblWrap:   { borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(51,65,85,0.6)', boxShadow: '0 8px 32px rgba(0,0,0,0.3)' },
  table:     { width: '100%', borderCollapse: 'collapse', background: '#1e293b' },
  th:        { padding: '14px 16px', textAlign: 'left', background: '#0f172a', borderBottom: '1px solid rgba(51,65,85,0.5)', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', color: '#64748b', fontWeight: '600' },
  td:        { padding: '12px 14px', borderBottom: '1px solid rgba(51,65,85,0.25)', verticalAlign: 'middle' },
  input:     { background: '#0f172a', border: '1px solid rgba(51,65,85,0.6)', borderRadius: '8px', padding: '9px 13px', width: '100%', color: '#f8fafc', outline: 'none', fontSize: '0.85rem', fontFamily: "'JetBrains Mono','Fira Code',monospace", transition: 'border-color 0.2s' },
  selectEl:  { background: '#0f172a', border: '1px solid rgba(51,65,85,0.6)', borderRadius: '8px', padding: '9px 13px', width: '100%', color: '#f8fafc', outline: 'none', fontSize: '0.85rem' },
  delBtn:    { background: 'transparent', color: '#475569', padding: '8px', borderRadius: '8px', display: 'flex', alignItems: 'center', cursor: 'pointer', border: 'none', transition: 'color 0.2s' },
  addRow:    { padding: '14px 18px', background: '#1e293b', borderTop: '1px solid rgba(51,65,85,0.5)' },
  addBtn:    { display: 'flex', alignItems: 'center', gap: '8px', color: '#38bdf8', fontWeight: '600', background: 'transparent', padding: '9px 14px', borderRadius: '10px', fontSize: '0.9rem', cursor: 'pointer', border: 'none' },
  failRow:   { background: 'rgba(239,68,68,0.07)', color: '#fca5a5', padding: '10px 56px', fontSize: '0.82rem', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'pre-wrap', borderBottom: '1px solid rgba(239,68,68,0.15)' },
  captureRow:{ background: 'rgba(56,189,248,0.07)', color: '#7dd3fc', padding: '10px 56px', fontSize: '0.82rem', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'pre-wrap', borderBottom: '1px solid rgba(56,189,248,0.15)' },
};

function Badge({ group }) {
  return (
    <span style={{ background: groupColors[group] + '22', color: groupColors[group], border: `1px solid ${groupColors[group]}44`, borderRadius: '6px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: '700', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>
      {group}
    </span>
  );
}

const SAMPLE_STEPS = [
  { id: '1', action: 'GOTO',        locator: '', value: 'https://example.com' },
  { id: '2', action: 'ASSERT_TEXT', locator: 'h1', value: 'Example Domain' },
];

export default function App() {
  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem('kw-engine-steps');
    return saved ? JSON.parse(saved) : SAMPLE_STEPS;
  });
  const [running, setRunning]   = useState(false);
  const [results, setResults]   = useState(null);
  const [error,   setError]     = useState('');
  const [savedScripts, setSavedScripts] = useState([]);
  const [scriptName, setScriptName] = useState('');
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('kw-engine-steps', JSON.stringify(steps));
  }, [steps]);

  useEffect(() => {
    fetchSavedScripts();
  }, []);

  const fetchSavedScripts = async () => {
    try {
      const res = await axios.get(`${API_BASE}/scripts`);
      setSavedScripts(res.data);
    } catch (err) { console.error('Failed to fetch scripts'); }
  };

  const handleSaveClick = () => {
    setModalInput(scriptName || 'my-test');
    setShowSaveModal(true);
  };

  const confirmSave = async () => {
    if (!modalInput) return;
    setSaving(true);
    try {
      await axios.post(`${API_BASE}/save`, { name: modalInput, steps });
      setScriptName(modalInput);
      setShowSaveModal(false);
      fetchSavedScripts();
    } catch (err) { 
      setError('Save failed: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const loadScript = async (name) => {
    try {
      const res = await axios.get(`${API_BASE}/scripts/${name}`);
      setSteps(res.data);
      setScriptName(name);
      setResults(null);
      setError('');
    } catch (err) { setError('Load failed: ' + err.message); }
  };

  const deleteScript = async (name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try {
      await axios.delete(`${API_BASE}/scripts/${name}`);
      fetchSavedScripts();
    } catch (err) { setError('Delete failed: ' + err.message); }
  };

  const getActionDef = (action) => ACTIONS.find(a => a.value === action) || {};

  const addStep = () => setSteps(prev => [...prev, { id: Date.now().toString(), action: 'CLICK', locator: '', value: '' }]);
  const removeStep = (id) => setSteps(prev => prev.filter(s => s.id !== id));
  const updateStep = (id, field, val) => setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));

  const clearAll = () => setSteps([]);
  const resetToSample = () => setSteps(SAMPLE_STEPS);

  const exportJson = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(steps, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href",     dataStr);
    downloadAnchorNode.setAttribute("download", "keyword-test.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const importJson = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          setSteps(json);
        } else {
          alert('Invalid format: Expected a JSON array of steps.');
        }
      } catch (err) {
        alert('Failed to parse file: ' + err.message);
      }
    };
    reader.readAsText(file);
    event.target.value = ''; // Reset input
  };

  const executeTest = async () => {
    setRunning(true); setResults(null); setError('');
    try {
      const res = await axios.post('http://localhost:5002/api/execute', { steps });
      setResults(res.data.results);
    } catch (err) {
      setError(err.response?.data?.error || err.message);
      if (err.response?.data?.results) setResults(err.response.data.results);
    } finally {
      setRunning(false);
    }
  };

  const statusIcon = (status) => {
    if (status === 'PASS') return <CheckCircle2 size={20} style={{ color: '#22c55e' }} />;
    if (status === 'FAIL') return <XCircle     size={20} style={{ color: '#ef4444' }} />;
    return null;
  };

  // Group options for <select optgroup>
  const groups = [...new Set(ACTIONS.map(a => a.group))];

  return (
    <div style={s.page}>
      <div style={s.wrap}>
        {/* Header */}
        <header style={s.hdr}>
          <div>
            <h1 style={s.title}>Keyword Driven Engine</h1>
            <p style={s.subtitle}>Playwright Execution Engine — {ACTIONS.length} Actions Supported</p>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', background: '#0f172a', borderRadius: '10px', padding: '4px', border: '1px solid rgba(51,65,85,0.6)', marginRight: '8px' }}>
              <button type="button" onClick={() => setShowSidebar(!showSidebar)} style={{ ...s.delBtn, color: '#a78bfa' }} title="Saved Scripts Library"><FolderOpen size={18} /></button>
              <button type="button" onClick={handleSaveClick} style={{ ...s.delBtn, color: '#38bdf8' }} title="Save Script to Server"><Save size={18} /></button>
              <button type="button" onClick={exportJson} style={{ ...s.delBtn, color: '#312e81' }} title="Export JSON (Local Download)"><Download size={18} /></button>
              <button type="button" onClick={() => fileInputRef.current?.click()} style={{ ...s.delBtn, color: '#34d399' }} title="Import JSON (Local Upload)"><Upload size={18} /></button>
              <button type="button" onClick={resetToSample} style={{ ...s.delBtn, color: '#fbbf24' }} title="Reset to Demo"><RotateCcw size={18} /></button>
              <button type="button" onClick={clearAll} style={{ ...s.delBtn, color: '#ef4444' }} title="Clear All"><Trash2 size={18} /></button>
              <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={importJson} accept=".json" />
            </div>
            <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
              {scriptName ? <strong style={{ color: '#38bdf8', marginRight: '10px' }}>{scriptName}</strong> : null}
              {steps.length} step{steps.length !== 1 ? 's' : ''}
              {results && ` · ${results.filter(r => r.status === 'PASS').length} passed · ${results.filter(r => r.status === 'FAIL').length} failed`}
            </span>
            <button
              type="button"
              onClick={executeTest}
              disabled={running || steps.length === 0}
              style={{ ...s.runBtn, background: running ? '#334155' : 'linear-gradient(135deg,#38bdf8,#818cf8)', boxShadow: running ? 'none' : '0 4px 14px rgba(56,189,248,0.25)', opacity: running ? 0.7 : 1 }}
            >
              {running ? <Clock size={18} /> : <Play size={18} />}
              {running ? 'Executing…' : 'Run Test Script'}
            </button>
          </div>
        </header>

        {error && <div style={s.errBar}><XCircle size={18}/>{error}</div>}

        {/* Table */}
        <div style={s.tblWrap}>
          <table style={s.table}>
            <thead>
              <tr>
                <th style={{ ...s.th, width: '48px' }}>#</th>
                <th style={{ ...s.th, width: '56px' }}>Group</th>
                <th style={{ ...s.th, width: '260px' }}>Action</th>
                <th style={s.th}>Locator (CSS / XPath)</th>
                <th style={s.th}>Value / Input</th>
                <th style={{ ...s.th, width: '80px', textAlign: 'center' }}>Status</th>
                <th style={{ ...s.th, width: '48px' }}></th>
              </tr>
            </thead>
            <tbody>
              {steps.map((step, idx) => {
                const def    = getActionDef(step.action);
                const result = results?.find(r => r.id === step.id);
                const isFail = result?.status === 'FAIL';
                const hasCapture = result?.captured;
                return (
                  <React.Fragment key={step.id}>
                    <tr style={{ borderBottom: '1px solid rgba(51,65,85,0.25)', background: isFail ? 'rgba(239,68,68,0.04)' : 'transparent', transition: 'background 0.2s' }}>
                      <td style={{ ...s.td, color: '#475569', fontFamily: 'monospace', fontSize: '0.85rem' }}>{idx + 1}</td>
                      <td style={s.td}><Badge group={def.group || '?'} /></td>
                      <td style={s.td}>
                        <select value={step.action} onChange={e => updateStep(step.id, 'action', e.target.value)} style={s.selectEl}>
                          {groups.map(grp => (
                            <optgroup key={grp} label={grp}>
                              {ACTIONS.filter(a => a.group === grp).map(a => (
                                <option key={a.value} value={a.value}>{a.label}</option>
                              ))}
                            </optgroup>
                          ))}
                        </select>
                      </td>
                      <td style={s.td}>
                        <input
                          type="text"
                          placeholder={def.needsLocator ? '#id, .class, xpath=//button' : '—'}
                          value={step.locator}
                          onChange={e => updateStep(step.id, 'locator', e.target.value)}
                          disabled={!def.needsLocator}
                          style={{ ...s.input, opacity: def.needsLocator ? 1 : 0.3 }}
                        />
                      </td>
                      <td style={s.td}>
                        <input
                          type="text"
                          placeholder={def.needsValue ? (def.valuePlaceholder || 'Value…') : '—'}
                          value={step.value}
                          onChange={e => updateStep(step.id, 'value', e.target.value)}
                          disabled={!def.needsValue}
                          style={{ ...s.input, opacity: def.needsValue ? 1 : 0.3 }}
                        />
                      </td>
                      <td style={{ ...s.td, textAlign: 'center' }}>
                        {result ? statusIcon(result.status) : <div style={{ width: '20px', height: '20px', borderRadius: '50%', border: '2px solid rgba(51,65,85,0.5)', margin: '0 auto' }} />}
                      </td>
                      <td style={s.td}>
                        <button onClick={() => removeStep(step.id)} style={s.delBtn} title="Delete step">✕</button>
                      </td>
                    </tr>
                    {isFail && result.error && (
                      <tr><td colSpan="7" style={{ padding: 0 }}><div style={s.failRow}>❌ {result.error}</div></td></tr>
                    )}
                    {hasCapture && (
                      <tr><td colSpan="7" style={{ padding: 0 }}>
                        <div style={s.captureRow}>
                          {step.action === 'SCREENSHOT' ? <span>Saved: {result.captured}</span> : <>📋 Captured: {result.captured}</>}
                        </div>
                      </td></tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          <div style={s.addRow}>
            <button onClick={addStep} style={s.addBtn}><span>＋</span> Add Keyword Step</button>
          </div>
        </div>
      </div>

      {/* Sidebar / Library */}
      {showSidebar && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '320px', height: '100vh', background: '#1e293b', borderRight: '1px solid rgba(51,65,85,0.6)', boxShadow: '10px 0 30px rgba(0,0,0,0.5)', zIndex: 1000, padding: '24px', display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Script Library</h2>
            <button type="button" onClick={() => setShowSidebar(false)} style={{ color: '#64748b', fontSize: '1.5rem', background: 'transparent', border: 'none', cursor: 'pointer' }}>✕</button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {savedScripts.length === 0 ? (
              <p style={{ color: '#64748b', textAlign: 'center', marginTop: '40px' }}>No saved scripts found on server.</p>
            ) : (
              savedScripts.map(lib => (
                <div key={lib.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#0f172a', borderRadius: '12px', marginBottom: '12px', border: lib.name === scriptName ? '1px solid #38bdf8' : '1px solid transparent' }}>
                  <button 
                    type="button"
                    onClick={() => { loadScript(lib.name); setShowSidebar(false); }}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#f8fafc', fontSize: '0.9rem', textAlign: 'left', fontWeight: lib.name === scriptName ? 'bold' : 'normal' }}
                  >
                    {lib.name}
                  </button>
                  <button type="button" onClick={() => deleteScript(lib.name)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '0.75rem' }}>✕</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Save Modal */}
      {showSaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(51,65,85,0.6)', borderRadius: '20px', padding: '32px', width: '400px', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '8px' }}>Save Script</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '24px' }}>Enter a name to save this test to the server.</p>
            
            <input 
              autoFocus
              type="text" 
              value={modalInput} 
              onChange={e => setModalInput(e.target.value)} 
              onKeyDown={e => e.key === 'Enter' && confirmSave()}
              style={{ ...s.input, padding: '12px 16px', fontSize: '1rem', marginBottom: '24px' }}
              placeholder="e.g., login-flow-test"
            />

            <div style={{ display: 'flex', gap: '12px' }}>
              <button 
                type="button"
                onClick={() => setShowSaveModal(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#334155', color: '#f8fafc', fontWeight: '600', border: 'none', cursor: 'pointer' }}
              >
                Cancel
              </button>
              <button 
                type="button"
                onClick={confirmSave}
                disabled={saving || !modalInput}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', background: 'linear-gradient(135deg, #38bdf8, #818cf8)', color: 'white', fontWeight: '600', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Saving...' : 'Save Script'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
