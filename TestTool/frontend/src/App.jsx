import React, { useState, useEffect, useRef } from 'react';
import {
  Play, Plus, Trash2, CheckCircle2, XCircle, Clock, Download, Upload,
  RotateCcw, Save, FolderOpen, Database, Cloud, Server, Zap,
  Settings as GearIcon, ChevronLeft, ChevronRight, GitMerge, X
} from 'lucide-react';
import axios from 'axios';

const API_BASE = 'http://localhost:5002/api';

const ACTIONS = [
  { group: 'Navigation', value: 'GOTO',           label: 'GOTO – Navigate to URL',        needsLocator: false, needsValue: true,  valuePlaceholder: 'https://example.com' },
  { group: 'Navigation', value: 'BACK',           label: 'BACK – Go Back',                needsLocator: false, needsValue: false },
  { group: 'Navigation', value: 'FORWARD',        label: 'FORWARD – Go Forward',          needsLocator: false, needsValue: false },
  { group: 'Navigation', value: 'REFRESH',        label: 'REFRESH – Reload Page',         needsLocator: false, needsValue: false },
  { group: 'Mouse',      value: 'CLICK',          label: 'CLICK – Single Click',          needsLocator: true,  needsValue: false },
  { group: 'Mouse',      value: 'DOUBLE_CLICK',   label: 'DOUBLE_CLICK',                  needsLocator: true,  needsValue: false },
  { group: 'Mouse',      value: 'RIGHT_CLICK',    label: 'RIGHT_CLICK – Context Menu',    needsLocator: true,  needsValue: false },
  { group: 'Mouse',      value: 'HOVER',          label: 'HOVER – Mouse Over',            needsLocator: true,  needsValue: false },
  { group: 'Input',      value: 'TYPE',           label: 'TYPE – Fill Field',             needsLocator: true,  needsValue: true,  valuePlaceholder: 'Text to type' },
  { group: 'Input',      value: 'CLEAR',          label: 'CLEAR – Clear Field',           needsLocator: true,  needsValue: false },
  { group: 'Input',      value: 'PRESS_KEY',      label: 'PRESS_KEY – Keyboard Press',    needsLocator: false, needsValue: true,  valuePlaceholder: 'Enter, Tab, Escape...' },
  { group: 'Input',      value: 'SELECT',         label: 'SELECT – Dropdown Option',      needsLocator: true,  needsValue: true,  valuePlaceholder: 'option value or label' },
  { group: 'Input',      value: 'CHECK',          label: 'CHECK – Checkbox On',           needsLocator: true,  needsValue: false },
  { group: 'Input',      value: 'UNCHECK',        label: 'UNCHECK – Checkbox Off',        needsLocator: true,  needsValue: false },
  { group: 'Scroll',     value: 'SCROLL_TO',      label: 'SCROLL_TO – Scroll to Element', needsLocator: true,  needsValue: false },
  { group: 'Scroll',     value: 'SCROLL_PAGE',    label: 'SCROLL_PAGE – Scroll Page',     needsLocator: false, needsValue: true,  valuePlaceholder: 'up or down' },
  { group: 'Wait',       value: 'WAIT',           label: 'WAIT – Sleep (ms)',             needsLocator: false, needsValue: true,  valuePlaceholder: '1000' },
  { group: 'Wait',       value: 'WAIT_FOR_ELEMENT',label:'WAIT_FOR_ELEMENT – Visible',    needsLocator: true,  needsValue: false },
  { group: 'Wait',       value: 'WAIT_FOR_URL',   label: 'WAIT_FOR_URL – URL matches',   needsLocator: false, needsValue: true,  valuePlaceholder: '**/dashboard**' },
  { group: 'Assert',     value: 'ASSERT_TEXT',    label: 'ASSERT_TEXT – Contains Text',  needsLocator: true,  needsValue: true,  valuePlaceholder: 'Expected text' },
  { group: 'Assert',     value: 'ASSERT_VISIBLE', label: 'ASSERT_VISIBLE – Is Visible',  needsLocator: true,  needsValue: false },
  { group: 'Assert',     value: 'ASSERT_URL',     label: 'ASSERT_URL – URL Contains',    needsLocator: false, needsValue: true,  valuePlaceholder: '/dashboard' },
  { group: 'Assert',     value: 'ASSERT_TITLE',   label: 'ASSERT_TITLE – Title Contains',needsLocator: false, needsValue: true,  valuePlaceholder: 'Page Title' },
  { group: 'Capture',    value: 'GET_TEXT',       label: 'GET_TEXT – Read Element Text', needsLocator: true,  needsValue: false },
  { group: 'Capture',    value: 'SCREENSHOT',     label: 'SCREENSHOT – Take Screenshot', needsLocator: false, needsValue: false },
  { group: 'Dialog',     value: 'ACCEPT_DIALOG',  label: 'ACCEPT_DIALOG – Alert Accept', needsLocator: false, needsValue: false },
  { group: 'Dialog',     value: 'DISMISS_DIALOG', label: 'DISMISS_DIALOG – Dismiss',    needsLocator: false, needsValue: false },
  { group: 'Advanced',   value: 'CUSTOM_CODE',    label: 'CUSTOM_CODE – JS/Playwright',  needsLocator: false, needsValue: true,  valuePlaceholder: 'await page.click(".btn"); // page, variables available' },
];

const groupColors = {
  Navigation: '#38bdf8', Mouse: '#a78bfa', Input: '#34d399', Scroll: '#fbbf24',
  Wait: '#f97316', Assert: '#f472b6', Capture: '#60a5fa', Dialog: '#fb923c', Advanced: '#6366f1',
};

function Badge({ group }) {
  return (
    <span style={{
      background: groupColors[group] + '18', color: groupColors[group],
      border: `1px solid ${groupColors[group]}33`, borderRadius: '8px',
      padding: '4px 10px', fontSize: '0.7rem', fontWeight: '800',
      letterSpacing: '0.06em', whiteSpace: 'nowrap', textTransform: 'uppercase'
    }}>
      {group}
    </span>
  );
}

const SAMPLE_STEPS = [
  { id: '1', action: 'GOTO',        locator: '', value: 'https://example.com' },
  { id: '2', action: 'ASSERT_TEXT', locator: 'h1', value: 'Example Domain' },
];

/* ─── Sidebar nav item ─── */
function NavItem({ icon, label, color, onClick, expanded, danger }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px',
        padding: expanded ? '14px 20px' : '14px',
        background: 'transparent', border: 'none', cursor: 'pointer',
        color: danger ? '#ef4444' : (color || '#94a3b8'),
        borderRadius: '14px', width: '100%', textAlign: 'left',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.07)'}
      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
    >
      {icon}
      {expanded && <span style={{ fontSize: '0.92rem', fontWeight: '600', whiteSpace: 'nowrap' }}>{label}</span>}
    </button>
  );
}

/* ─── Section divider ─── */
function SectionLabel({ label, expanded }) {
  if (!expanded) return <div style={{ height: '1px', background: 'rgba(255,255,255,0.07)', margin: '8px 12px' }} />;
  return (
    <div style={{ padding: '16px 20px 6px', fontSize: '0.68rem', fontWeight: '800', letterSpacing: '0.12em', color: '#475569', textTransform: 'uppercase' }}>
      {label}
    </div>
  );
}

export default function App() {
  const [steps, setSteps] = useState(() => {
    const saved = localStorage.getItem('kw-engine-steps');
    return saved ? JSON.parse(saved) : SAMPLE_STEPS;
  });
  const [variables, setVariables] = useState(() => {
    const saved = localStorage.getItem('kw-engine-vars');
    return saved ? JSON.parse(saved) : { base_url: 'https://example.com' };
  });
  const [cloudSettings, setCloudSettings] = useState(() => {
    const saved = localStorage.getItem('kw-engine-cloud-settings');
    return saved ? JSON.parse(saved) : { lambdaUrl: '', region: 'us-east-1', apiKey: '', serverHost: '', serverPort: '5002', serverToken: '' };
  });

  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [activePanel, setActivePanel] = useState(null); // 'scripts' | 'variables' | 'merge' | 'cloud'

  const [execMode, setExecMode] = useState('local');
  const [architecture, setArchitecture] = useState('serverless');
  const [running, setRunning]   = useState(false);
  const [results, setResults]   = useState(null);
  const [error,   setError]     = useState('');
  const [savedScripts, setSavedScripts] = useState([]);
  const [scriptName, setScriptName] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [modalInput, setModalInput] = useState('');
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => { localStorage.setItem('kw-engine-steps', JSON.stringify(steps)); }, [steps]);
  useEffect(() => { localStorage.setItem('kw-engine-vars', JSON.stringify(variables)); }, [variables]);
  useEffect(() => { localStorage.setItem('kw-engine-cloud-settings', JSON.stringify(cloudSettings)); }, [cloudSettings]);
  useEffect(() => { fetchSavedScripts(); }, []);

  const fetchSavedScripts = async () => {
    try { const res = await axios.get(`${API_BASE}/scripts`); setSavedScripts(res.data); }
    catch (err) { console.error('Failed to fetch scripts'); }
  };

  const confirmSave = async () => {
    if (!modalInput) return; setSaving(true);
    try {
      await axios.post(`${API_BASE}/save`, { name: modalInput, steps });
      setScriptName(modalInput); setShowSaveModal(false); fetchSavedScripts();
    } catch (err) { setError('Save failed: ' + err.message); }
    finally { setSaving(false); }
  };

  const loadScript = async (name) => {
    try { const res = await axios.get(`${API_BASE}/scripts/${name}`); setSteps(res.data); setScriptName(name); setResults(null); setError(''); }
    catch (err) { setError('Load failed: ' + err.message); }
  };

  const mergeScript = async (name) => {
    try {
      const res = await axios.get(`${API_BASE}/scripts/${name}`);
      const newSteps = res.data.map(s => ({ ...s, id: Date.now().toString() + Math.random().toString(36).substr(2, 5) }));
      setSteps(prev => [...prev, ...newSteps]); setActivePanel(null);
    } catch (err) { setError('Merge failed: ' + err.message); }
  };

  const deleteScript = async (name) => {
    if (!confirm(`Delete ${name}?`)) return;
    try { await axios.delete(`${API_BASE}/scripts/${name}`); fetchSavedScripts(); }
    catch (err) { setError('Delete failed: ' + err.message); }
  };

  const getActionDef = (action) => ACTIONS.find(a => a.value === action) || {};
  const addStep = () => setSteps(prev => [...prev, { id: Date.now().toString(), action: 'CLICK', locator: '', value: '' }]);
  const removeStep = (id) => setSteps(prev => prev.filter(s => s.id !== id));
  const updateStep = (id, field, val) => setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: val } : s));
  const clearAll = () => setSteps([]);
  const resetToSample = () => setSteps(SAMPLE_STEPS);

  const exportJson = () => {
    const a = document.createElement('a');
    a.setAttribute('href', 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(steps, null, 2)));
    a.setAttribute('download', 'keyword-test.json');
    document.body.appendChild(a); a.click(); a.remove();
  };

  const importJson = (event) => {
    const file = event.target.files[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try { const json = JSON.parse(e.target.result); if (Array.isArray(json)) setSteps(json); else alert('Expected a JSON array.'); }
      catch (err) { alert('Parse error: ' + err.message); }
    };
    reader.readAsText(file); event.target.value = '';
  };

  const executeTest = async () => {
    setRunning(true); setResults(null); setError('');
    try {
      let endpoint = API_BASE + '/execute', headers = {};
      if (execMode === 'cloud') {
        if (architecture === 'serverless') {
          endpoint = cloudSettings.lambdaUrl || 'https://CONFIGURE-LAMBDA-URL.execute-api.amazonaws.com/run';
          if (cloudSettings.apiKey) headers['x-api-key'] = cloudSettings.apiKey;
        } else {
          endpoint = `http://${cloudSettings.serverHost}:${cloudSettings.serverPort}/api/execute`;
          if (cloudSettings.serverToken) headers['Authorization'] = `Bearer ${cloudSettings.serverToken}`;
        }
      }
      const res = await axios.post(endpoint, { steps, variables, config: { architecture, region: cloudSettings.region } }, { headers });
      setResults(res.data.results);
    } catch (err) {
      setError(execMode === 'cloud'
        ? `Cloud execution failed: ${err.message} — Check Cloud Settings.`
        : err.response?.data?.error || err.message);
      if (err.response?.data?.results) setResults(err.response.data.results);
    } finally { setRunning(false); }
  };

  const statusIcon = (status) => {
    if (status === 'PASS') return <CheckCircle2 size={22} style={{ color: '#22c55e' }} />;
    if (status === 'FAIL') return <XCircle size={22} style={{ color: '#ef4444' }} />;
    return null;
  };

  const groups = [...new Set(ACTIONS.map(a => a.group))];
  const SIDEBAR_W = sidebarExpanded ? 260 : 72;

  // ── Inline panel content (renders below items when active panel matches) ──
  const togglePanel = (name) => setActivePanel(prev => prev === name ? null : name);

  const inp = {
    background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '10px', padding: '10px 14px', color: '#f8fafc', outline: 'none',
    fontSize: '0.9rem', width: '100%',
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0f1e', color: '#f8fafc', fontFamily: "'Outfit','Inter',sans-serif" }}>

      {/* ═══ LEFT SIDEBAR ═══ */}
      <aside style={{
        width: SIDEBAR_W + 'px', minHeight: '100vh', flexShrink: 0,
        background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(16px)',
        borderRight: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(.4,0,.2,1)',
        overflow: 'hidden',
        position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 100,
      }}>
        {/* Logo / Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: sidebarExpanded ? 'space-between' : 'center', padding: '20px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          {sidebarExpanded && (
            <div>
              <div style={{ fontSize: '1.05rem', fontWeight: '800', background: 'linear-gradient(135deg,#38bdf8,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                KD Engine
              </div>
              <div style={{ fontSize: '0.7rem', color: '#475569', marginTop: '2px' }}>{ACTIONS.length} Actions</div>
            </div>
          )}
          <button
            onClick={() => setSidebarExpanded(p => !p)}
            style={{ padding: '8px', borderRadius: '10px', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: '#94a3b8', cursor: 'pointer' }}
          >
            {sidebarExpanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Script Actions */}
        <div style={{ padding: '12px 8px 0', overflowY: 'auto', flex: 1 }}>
          <SectionLabel label="Script" expanded={sidebarExpanded} />

          <NavItem expanded={sidebarExpanded} icon={<Save size={22} />} label="Save Script" color="#38bdf8"
            onClick={() => { setModalInput(scriptName || 'my-test'); setShowSaveModal(true); }} />

          <NavItem expanded={sidebarExpanded} icon={<FolderOpen size={22} />} label="Script Library" color="#a78bfa"
            onClick={() => { togglePanel('scripts'); fetchSavedScripts(); }} />

          {/* Scripts Panel (inline) */}
          {activePanel === 'scripts' && sidebarExpanded && (
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '14px', margin: '4px 4px 8px', padding: '12px', maxHeight: '260px', overflowY: 'auto' }}>
              {savedScripts.length === 0
                ? <p style={{ color: '#475569', fontSize: '0.82rem', textAlign: 'center', padding: '16px 0' }}>No saved scripts.</p>
                : savedScripts.map(lib => (
                  <div key={lib.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 10px', borderRadius: '10px', marginBottom: '6px', background: lib.name === scriptName ? 'rgba(56,189,248,0.12)' : 'rgba(255,255,255,0.04)', border: lib.name === scriptName ? '1px solid rgba(56,189,248,0.3)' : '1px solid transparent' }}>
                    <button onClick={() => { loadScript(lib.name); setActivePanel(null); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f1f5f9', fontSize: '0.85rem', flex: 1, textAlign: 'left' }}>
                      {lib.name}
                    </button>
                    <button onClick={() => deleteScript(lib.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
            </div>
          )}

          <NavItem expanded={sidebarExpanded} icon={<GitMerge size={22} />} label="Merge Script" color="#f472b6"
            onClick={() => { togglePanel('merge'); fetchSavedScripts(); }} />

          {/* Merge Panel */}
          {activePanel === 'merge' && sidebarExpanded && (
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '14px', margin: '4px 4px 8px', padding: '12px', maxHeight: '260px', overflowY: 'auto' }}>
              <p style={{ color: '#94a3b8', fontSize: '0.78rem', marginBottom: '10px' }}>Select script to append:</p>
              {savedScripts.map(lib => (
                <button key={lib.name} onClick={() => mergeScript(lib.name)} style={{ width: '100%', padding: '9px 12px', background: 'rgba(244,114,182,0.08)', border: '1px solid rgba(244,114,182,0.2)', borderRadius: '10px', color: '#f8fafc', marginBottom: '6px', textAlign: 'left', cursor: 'pointer', fontSize: '0.85rem' }}>
                  + {lib.name}
                </button>
              ))}
            </div>
          )}

          {/* File I/O */}
          <SectionLabel label="File I/O" expanded={sidebarExpanded} />
          <NavItem expanded={sidebarExpanded} icon={<Download size={22} />} label="Export JSON" color="#818cf8" onClick={exportJson} />
          <NavItem expanded={sidebarExpanded} icon={<Upload size={22} />} label="Import JSON" color="#34d399" onClick={() => fileInputRef.current?.click()} />
          <input type="file" ref={fileInputRef} style={{ display: 'none' }} onChange={importJson} accept=".json" />

          {/* Variables */}
          <SectionLabel label="Variables" expanded={sidebarExpanded} />
          <NavItem expanded={sidebarExpanded} icon={<Database size={22} />} label="Global Variables" color="#34d399"
            onClick={() => togglePanel('variables')} />

          {/* Variables Panel */}
          {activePanel === 'variables' && sidebarExpanded && (
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '14px', margin: '4px 4px 8px', padding: '14px', maxHeight: '300px', overflowY: 'auto' }}>
              <p style={{ color: '#64748b', fontSize: '0.75rem', marginBottom: '12px' }}>
                Use <code style={{ color: '#38bdf8' }}>{'{{name}}'}</code> in steps
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Object.entries(variables).map(([key, val]) => (
                  <div key={key} style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <input style={{ ...inp, flex: 1, fontSize: '0.8rem', padding: '8px 10px' }} value={key}
                      onChange={e => {
                        const nv = { ...variables }; const v = nv[key]; delete nv[key]; nv[e.target.value] = v; setVariables(nv);
                      }} />
                    <input style={{ ...inp, flex: 1.5, fontSize: '0.8rem', padding: '8px 10px' }} value={val}
                      onChange={e => setVariables({ ...variables, [key]: e.target.value })} />
                    <button onClick={() => { const nv = { ...variables }; delete nv[key]; setVariables(nv); }}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '4px' }}>
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setVariables({ ...variables, [`var_${Object.keys(variables).length + 1}`]: '' })}
                style={{ marginTop: '10px', width: '100%', padding: '9px', background: 'rgba(52,211,153,0.1)', border: '1px dashed rgba(52,211,153,0.4)', borderRadius: '10px', color: '#34d399', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
                + Add Variable
              </button>
            </div>
          )}

          {/* Cloud */}
          <SectionLabel label="Execution" expanded={sidebarExpanded} />

          {/* Mode toggle */}
          {sidebarExpanded ? (
            <div style={{ margin: '4px 8px 8px', background: 'rgba(15,23,42,0.5)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex' }}>
              <button onClick={() => setExecMode('local')} style={{ flex: 1, padding: '8px', borderRadius: '9px', background: execMode === 'local' ? 'rgba(56,189,248,0.15)' : 'transparent', color: execMode === 'local' ? '#38bdf8' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Server size={15} /> Local
              </button>
              <button onClick={() => setExecMode('cloud')} style={{ flex: 1, padding: '8px', borderRadius: '9px', background: execMode === 'cloud' ? 'rgba(129,140,248,0.15)' : 'transparent', color: execMode === 'cloud' ? '#818cf8' : '#64748b', border: 'none', cursor: 'pointer', fontWeight: '700', fontSize: '0.82rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                <Cloud size={15} /> AWS
              </button>
            </div>
          ) : (
            <NavItem expanded={false} icon={execMode === 'local' ? <Server size={22} /> : <Cloud size={22} />} label="Toggle Mode" color={execMode === 'local' ? '#38bdf8' : '#818cf8'} onClick={() => setExecMode(m => m === 'local' ? 'cloud' : 'local')} />
          )}

          {/* Architecture (cloud only) */}
          {execMode === 'cloud' && sidebarExpanded && (
            <div style={{ margin: '0 8px 8px', background: 'rgba(15,23,42,0.5)', borderRadius: '12px', padding: '4px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex' }}>
              <button onClick={() => setArchitecture('server')} style={{ flex: 1, padding: '7px', borderRadius: '9px', background: architecture === 'server' ? 'rgba(255,255,255,0.08)' : 'transparent', color: '#94a3b8', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700' }}>
                Server
              </button>
              <button onClick={() => setArchitecture('serverless')} style={{ flex: 1, padding: '7px', borderRadius: '9px', background: architecture === 'serverless' ? 'rgba(244,114,182,0.15)' : 'transparent', color: '#f472b6', border: 'none', cursor: 'pointer', fontSize: '0.78rem', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <Zap size={12} /> λ Lambda
              </button>
            </div>
          )}

          {execMode === 'cloud' && (
            <NavItem expanded={sidebarExpanded} icon={<GearIcon size={22} />} label="Cloud Settings" color="#94a3b8"
              onClick={() => togglePanel('cloud')} />
          )}

          {/* Cloud Settings Panel */}
          {activePanel === 'cloud' && sidebarExpanded && execMode === 'cloud' && (
            <div style={{ background: 'rgba(30,41,59,0.6)', borderRadius: '14px', margin: '4px 4px 8px', padding: '14px', overflowY: 'auto' }}>
              {architecture === 'serverless' ? (
                <>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: '#475569', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>Lambda URL</label>
                  <input style={{ ...inp, marginBottom: '10px' }} placeholder="https://...amazonaws.com/run" value={cloudSettings.lambdaUrl} onChange={e => setCloudSettings({ ...cloudSettings, lambdaUrl: e.target.value })} />
                  <label style={{ display: 'block', fontSize: '0.68rem', color: '#475569', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>Region</label>
                  <input style={{ ...inp, marginBottom: '10px' }} placeholder="us-east-1" value={cloudSettings.region} onChange={e => setCloudSettings({ ...cloudSettings, region: e.target.value })} />
                  <label style={{ display: 'block', fontSize: '0.68rem', color: '#475569', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>API Key</label>
                  <input type="password" style={inp} placeholder="x-api-key value" value={cloudSettings.apiKey} onChange={e => setCloudSettings({ ...cloudSettings, apiKey: e.target.value })} />
                </>
              ) : (
                <>
                  <label style={{ display: 'block', fontSize: '0.68rem', color: '#475569', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>Host IP / Domain</label>
                  <input style={{ ...inp, marginBottom: '10px' }} placeholder="192.168.1.100" value={cloudSettings.serverHost} onChange={e => setCloudSettings({ ...cloudSettings, serverHost: e.target.value })} />
                  <label style={{ display: 'block', fontSize: '0.68rem', color: '#475569', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>Port</label>
                  <input style={{ ...inp, marginBottom: '10px' }} placeholder="5002" value={cloudSettings.serverPort} onChange={e => setCloudSettings({ ...cloudSettings, serverPort: e.target.value })} />
                  <label style={{ display: 'block', fontSize: '0.68rem', color: '#475569', marginBottom: '6px', fontWeight: '800', textTransform: 'uppercase' }}>Auth Token</label>
                  <input type="password" style={inp} placeholder="Bearer ..." value={cloudSettings.serverToken} onChange={e => setCloudSettings({ ...cloudSettings, serverToken: e.target.value })} />
                </>
              )}
              <button onClick={() => setActivePanel(null)} style={{ marginTop: '12px', width: '100%', padding: '10px', background: 'linear-gradient(135deg,#818cf8,#6366f1)', border: 'none', borderRadius: '10px', color: 'white', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}>
                Save ✓
              </button>
            </div>
          )}

          {/* Danger zone */}
          <SectionLabel label="Danger Zone" expanded={sidebarExpanded} />
          <NavItem expanded={sidebarExpanded} icon={<RotateCcw size={22} />} label="Reset to Sample" color="#fbbf24" onClick={resetToSample} />
          <NavItem expanded={sidebarExpanded} icon={<Trash2 size={22} />} label="Clear All Steps" color="#ef4444" onClick={clearAll} danger />
        </div>

        {/* Step count at bottom */}
        {sidebarExpanded && (
          <div style={{ padding: '16px 20px', borderTop: '1px solid rgba(255,255,255,0.06)', fontSize: '0.8rem', color: '#475569' }}>
            {scriptName && <div style={{ color: '#38bdf8', fontWeight: '700', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{scriptName}</div>}
            <div>{steps.length} step{steps.length !== 1 ? 's' : ''}
              {results && <> &middot; <span style={{ color: '#22c55e' }}>{results.filter(r => r.status === 'PASS').length}✓</span> <span style={{ color: '#ef4444' }}>{results.filter(r => r.status === 'FAIL').length}✗</span></>}
            </div>
          </div>
        )}
      </aside>

      {/* ═══ MAIN AREA ═══ */}
      <div style={{ marginLeft: SIDEBAR_W + 'px', flex: 1, display: 'flex', flexDirection: 'column', transition: 'margin-left 0.3s cubic-bezier(.4,0,.2,1)', minHeight: '100vh' }}>

        {/* Header */}
        <header style={{
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          padding: '24px 40px',
          background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          position: 'sticky', top: 0, zIndex: 50,
        }}>
          <div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800', background: 'linear-gradient(135deg,#38bdf8,#818cf8,#c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 }}>
              Keyword Driven Engine
            </h1>
            <p style={{ color: '#475569', marginTop: '4px', fontSize: '0.9rem', fontWeight: '500' }}>
              Playwright Execution Engine — {execMode === 'cloud' ? `☁️ AWS ${architecture}` : '🖥 Local'} mode
            </p>
          </div>
          <button
            onClick={executeTest}
            disabled={running || steps.length === 0}
            style={{
              display: 'flex', alignItems: 'center', gap: '14px',
              padding: '16px 36px', borderRadius: '16px', fontWeight: '800', fontSize: '1.1rem',
              color: 'white', border: 'none', cursor: running || steps.length === 0 ? 'not-allowed' : 'pointer',
              background: running ? '#1e293b' : 'linear-gradient(135deg,#38bdf8,#818cf8)',
              boxShadow: running ? 'none' : '0 10px 30px rgba(56,189,248,0.3)',
              opacity: steps.length === 0 ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            {running ? <Clock size={26} /> : <Play size={26} />}
            {running ? 'Executing…' : 'RUN TEST SCRIPT'}
          </button>
        </header>

        {/* Content */}
        <main style={{ flex: 1, padding: '32px 40px', overflowY: 'auto' }}>
          {/* Error bar */}
          {error && (
            <div style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '16px 24px', borderRadius: '16px', display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '24px', fontSize: '1rem' }}>
              <XCircle size={24} />{error}
            </div>
          )}

          {/* Table */}
          <div style={{ borderRadius: '24px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 25px 60px rgba(0,0,0,0.4)', background: 'rgba(30,41,59,0.35)', backdropFilter: 'blur(10px)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {['#', 'Group', 'Action', 'Locator (CSS / XPath)', 'Value / Input', 'Status', ''].map((h, i) => (
                    <th key={i} style={{ padding: '20px 20px', textAlign: 'left', background: 'rgba(15,23,42,0.5)', borderBottom: '1px solid rgba(255,255,255,0.07)', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.12em', color: '#475569', fontWeight: '800', width: i === 0 ? '48px' : i === 1 ? '80px' : i === 5 ? '80px' : i === 6 ? '56px' : 'auto' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {steps.map((step, idx) => {
                  const def = getActionDef(step.action);
                  const result = results?.find(r => r.id === step.id);
                  const isFail = result?.status === 'FAIL';
                  const hasCapture = result?.captured;
                  const cellStyle = { padding: '14px 20px', borderBottom: '1px solid rgba(255,255,255,0.04)', verticalAlign: 'middle' };
                  const inputStyle = { background: 'rgba(15,23,42,0.5)', border: '1px solid rgba(255,255,255,0.09)', borderRadius: '10px', padding: '10px 14px', width: '100%', color: '#f8fafc', outline: 'none', fontSize: '0.92rem', fontFamily: 'inherit' };
                  return (
                    <React.Fragment key={step.id}>
                      <tr style={{ background: isFail ? 'rgba(239,68,68,0.04)' : 'transparent', transition: 'background 0.2s' }}>
                        <td style={{ ...cellStyle, color: '#334155', fontFamily: 'monospace', fontSize: '0.85rem' }}>{idx + 1}</td>
                        <td style={cellStyle}><Badge group={def.group || '?'} /></td>
                        <td style={cellStyle}>
                          <select value={step.action} onChange={e => updateStep(step.id, 'action', e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                            {groups.map(grp => (
                              <optgroup key={grp} label={grp}>
                                {ACTIONS.filter(a => a.group === grp).map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                              </optgroup>
                            ))}
                          </select>
                        </td>
                        <td style={cellStyle}>
                          <input type="text" placeholder={def.needsLocator ? '#id, .class, xpath=//btn' : '—'} value={step.locator}
                            onChange={e => updateStep(step.id, 'locator', e.target.value)} disabled={!def.needsLocator}
                            style={{ ...inputStyle, opacity: def.needsLocator ? 1 : 0.25 }} />
                        </td>
                        <td style={cellStyle}>
                          {def.value === 'CUSTOM_CODE'
                            ? <textarea placeholder={def.valuePlaceholder} value={step.value} onChange={e => updateStep(step.id, 'value', e.target.value)} style={{ ...inputStyle, minHeight: '72px', paddingTop: '10px', resize: 'vertical' }} />
                            : <input type="text" placeholder={def.needsValue ? (def.valuePlaceholder || 'Value…') : '—'} value={step.value}
                                onChange={e => updateStep(step.id, 'value', e.target.value)} disabled={!def.needsValue}
                                style={{ ...inputStyle, opacity: def.needsValue ? 1 : 0.25 }} />
                          }
                        </td>
                        <td style={{ ...cellStyle, textAlign: 'center' }}>
                          {result ? statusIcon(result.status) : <div style={{ width: '22px', height: '22px', borderRadius: '50%', border: '2px solid rgba(51,65,85,0.5)', margin: '0 auto' }} />}
                        </td>
                        <td style={cellStyle}>
                          <button onClick={() => removeStep(step.id)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '8px', borderRadius: '10px', color: '#475569', display: 'flex', alignItems: 'center' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#ef4444'} onMouseLeave={e => e.currentTarget.style.color = '#475569'}>
                            <Trash2 size={20} />
                          </button>
                        </td>
                      </tr>
                      {isFail && result.error && (
                        <tr><td colSpan="7" style={{ padding: 0 }}>
                          <div style={{ background: 'rgba(239,68,68,0.08)', color: '#fca5a5', padding: '14px 60px', fontSize: '0.9rem', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'pre-wrap', borderBottom: '1px solid rgba(239,68,68,0.15)' }}>
                            ❌ {result.error}
                          </div>
                        </td></tr>
                      )}
                      {hasCapture && (
                        <tr><td colSpan="7" style={{ padding: 0 }}>
                          <div style={{ background: 'rgba(56,189,248,0.07)', color: '#7dd3fc', padding: '14px 60px', fontSize: '0.9rem', fontFamily: "'JetBrains Mono',monospace", whiteSpace: 'pre-wrap', borderBottom: '1px solid rgba(56,189,248,0.15)' }}>
                            {step.action === 'SCREENSHOT' ? `📸 Saved: ${result.captured}` : `📋 Captured: ${result.captured}`}
                          </div>
                        </td></tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
            {/* Add step */}
            <div style={{ padding: '20px 28px', background: 'rgba(15,23,42,0.2)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              <button onClick={addStep} style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#38bdf8', fontWeight: '800', background: 'rgba(56,189,248,0.08)', padding: '14px 28px', borderRadius: '14px', fontSize: '1rem', cursor: 'pointer', border: '1px solid rgba(56,189,248,0.25)', transition: 'all 0.2s' }}>
                <Plus size={24} /> Add Automation Step
              </button>
            </div>
          </div>
        </main>
      </div>

      {/* ═══ SAVE MODAL ═══ */}
      {showSaveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div style={{ background: '#1e293b', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '24px', padding: '36px', width: '420px', boxShadow: '0 40px 80px rgba(0,0,0,0.6)' }}>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', marginBottom: '8px' }}>Save Script</h3>
            <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>Enter a name to save this test to the server.</p>
            <input autoFocus type="text" value={modalInput} onChange={e => setModalInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && confirmSave()}
              style={{ background: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px', padding: '14px 18px', width: '100%', color: '#f8fafc', outline: 'none', fontSize: '1rem', marginBottom: '24px' }}
              placeholder="e.g., login-flow-test" />
            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setShowSaveModal(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#1e293b', color: '#94a3b8', fontWeight: '700', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer' }}>Cancel</button>
              <button onClick={confirmSave} disabled={saving || !modalInput} style={{ flex: 1, padding: '14px', borderRadius: '12px', background: 'linear-gradient(135deg,#38bdf8,#818cf8)', color: 'white', fontWeight: '700', border: 'none', cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
                {saving ? 'Saving…' : 'Save Script'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
