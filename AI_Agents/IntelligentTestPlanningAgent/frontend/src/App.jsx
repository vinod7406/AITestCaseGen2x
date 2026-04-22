import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Settings, ChevronLeft, 
  History, Target, CheckCircle2, Search, Zap, 
  FileText, Database, Shield, Github, Layers, 
  Plus, X, AlertCircle, ExternalLink, RefreshCw, BarChart, Cloud,
  Eye, Code, Download, Share2, Trash2, Edit2, ChevronDown, ChevronUp
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// ─────────────────────────────────────────────────────
// API Configuration
// ─────────────────────────────────────────────────────
const API_BASE = import.meta.env.PROD ? 'https://tp-backend-murex.vercel.app' : '';

// ─────────────────────────────────────────────────────
// Components
// ─────────────────────────────────────────────────────

const SidebarItem = ({ icon: Icon, label, active, onClick, collapsed }) => (
  <div 
    onClick={onClick}
    style={{
      display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
      cursor: 'pointer', marginBottom: '4px', transition: 'all 0.2s',
      background: active ? '#2563eb' : 'transparent',
      color: active ? '#fff' : '#94a3b8'
    }}
  >
    <Icon size={20} />
    {!collapsed && <span style={{ fontWeight: '500', fontSize: '0.95rem' }}>{label}</span>}
  </div>
);

const Stepper = ({ currentStep, onStepClick }) => {
  const steps = ['Setup', 'Fetch Issues', 'Review', 'Test Plan'];
  return (
    <div style={{ display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '32px' }}>
      {steps.map((step, i) => {
        const isActive = currentStep === i + 1;
        return (
          <div 
            key={i} 
            onClick={() => onStepClick(i + 1)}
            style={{ 
              flex: 1, textAlign: 'center', padding: '10px', borderRadius: '8px', 
              fontSize: '0.875rem', fontWeight: isActive ? '600' : '400',
              background: isActive ? '#fff' : 'transparent',
              color: isActive ? '#1e293b' : '#64748b',
              boxShadow: isActive ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            {i + 1}. {step}
          </div>
        );
      })}
    </div>
  );
};

const ToolCard = ({ icon: Icon, name, status, features, onManage, onNotify, connected }) => (
  <div style={{ 
    background: connected ? '#f0fdf4' : '#fff', border: `1px solid ${connected ? '#bbf7d0' : '#e2e8f0'}`, 
    borderRadius: '16px', padding: '24px', position: 'relative', display: 'flex', flexDirection: 'column', height: '100%'
  }}>
    {connected && <div style={{ position: 'absolute', top: '20px', right: '20px', color: '#16a34a', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle2 size={14}/> Connected</div>}
    
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        <div style={{ width: '40px', height: '40px', background: connected ? '#fff' : '#f8fafc', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Icon size={24} color={connected ? '#2563eb' : '#64748b'} />
        </div>
        <div>
            <h4 style={{ fontWeight: '700', fontSize: '1.1rem' }}>{name}</h4>
            <div style={{ fontSize: '0.75rem', color: connected ? '#16a34a' : '#94a3b8', background: connected ? '#dcfce7' : '#f1f5f9', display: 'inline-block', padding: '1px 8px', borderRadius: '99px', marginTop: '4px' }}>{status}</div>
        </div>
    </div>
    
    <p style={{ fontSize: '0.85rem', color: '#64748b', marginBottom: '16px', lineHeight: '1.5' }}>
        {name === 'Jira' ? 'Import requirements and user stories from Atlassian Jira' : `Connect to your existing test case repositories in ${name}`}
    </p>
    
    <div style={{ flex: 1 }}>
        <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px', textTransform: 'uppercase' }}>Key Features:</div>
        <ul style={{ paddingLeft: '20px', fontSize: '0.8rem', color: '#64748b', listStyleType: 'disc' }}>
            {features.map((f, i) => <li key={i} style={{ marginBottom: '4px' }}>{f}</li>)}
        </ul>
    </div>
    
    <div style={{ marginTop: '24px' }}>
        {status === 'Available' ? (
            <button 
                onClick={onManage}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #2563eb', background: '#fff', color: '#2563eb', fontWeight: '600', fontSize: '0.85rem' }}
            >
                Manage Connection
            </button>
        ) : (
            <button 
                onClick={onNotify}
                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', color: '#2563eb', fontWeight: '600', fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
            >
                <AlertCircle size={16} /> Notify Me
            </button>
        )}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────
// Main Application
// ─────────────────────────────────────────────────────

export default function App() {
  const [step, setStep] = useState(1);
  const [collapsed, setCollapsed] = useState(false);
  const [isAddingJira, setIsAddingJira] = useState(false);
  const [editingIdx, setEditingIdx] = useState(null);
  const [expandedIdx, setExpandedIdx] = useState(null);
  const [jiraConnected, setJiraConnected] = useState(true);
  const [jiraIssues, setJiraIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('Intelligent Test Planning Agent');
  const [jiraForm, setJiraForm] = useState({ name: '', url: '', email: '', token: '' });
  const [savedConnections, setSavedConnections] = useState(() => {
    const saved = localStorage.getItem('jira_connections');
    return saved ? JSON.parse(saved) : [{ name: 'VWO', url: 'https://bugzz.atlassian.net/' }];
  });
  const [selectedConnectionIdx, setSelectedConnectionIdx] = useState(0);
  const [llmConfig, setLlmConfig] = useState(() => {
    const saved = localStorage.getItem('llm_config');
    return saved ? JSON.parse(saved) : (import.meta.env.PROD ? {
        provider: 'Groq', 
        baseUrl: '', 
        apiKey: '', 
        model: 'llama-3.3-70b-versatile'
    } : { 
        provider: 'Ollama', 
        baseUrl: 'http://127.0.0.1:11434', 
        apiKey: '', 
        model: 'llama3' 
    });
  });
  const [loading, setLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [llmTestLoading, setLlmTestLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchError, setFetchError] = useState('');
  const [genLoading, setGenLoading] = useState(false);
  const [publishLoading, setPublishLoading] = useState(false);
  const [showConfluenceModal, setShowConfluenceModal] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState(null); // { url: '' }
  const [confluenceSpaceKey, setConfluenceSpaceKey] = useState('TEAM');
  const [previewMode, setPreviewMode] = useState('preview'); // 'preview' or 'raw'
  const [message, setMessage] = useState('');
  const [llmMessage, setLlmMessage] = useState('');
  const [fetchParams, setFetchParams] = useState({ product: '', projectKey: '', sprint: '', context: '' });
  const [generatedPlan, setGeneratedPlan] = useState('');
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('test_plan_history');
    return saved ? JSON.parse(saved) : [];
  });

  const tools = [
    { icon: Database, name: 'Jira', status: 'Available', features: ['Requirements import', 'User stories', 'Acceptance criteria'], connected: true },
    { icon: BarChart, name: 'TestRail', status: 'Coming Soon', features: ['Test cases', 'Test suites', 'Test runs'] },
    { icon: Layers, name: 'Zephyr', status: 'Coming Soon', features: ['Test plans', 'Execution history', 'Traceability'] },
    { icon: X, name: 'Xray', status: 'Coming Soon', features: ['Native Jira integration', 'Requirement coverage'] },
    { icon: FileText, name: 'Qase', status: 'Coming Soon', features: ['Modern test management', 'Team collaboration'] },
    { icon: Cloud, name: 'Azure DevOps', status: 'Coming Soon', features: ['CI/CD integration', 'Work items sync'] },
  ];

  const nextStep = () => setStep(s => Math.min(s + 1, 4));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleSaveJira = async () => {
    if (!jiraForm.name || !jiraForm.url) {
        setMessage('Error: Connection Name and URL are required.');
        return;
    }
    setLoading(true);
    setMessage('');
    try {
        const response = await fetch(`${API_BASE}/api/jira/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jiraForm)
        });
        const data = await response.json();
        if (data.success) {
            const newConn = { ...jiraForm };
            let newConns;
            if (editingIdx !== null) {
                newConns = [...savedConnections];
                newConns[editingIdx] = newConn;
                setMessage('Connection updated successfully!');
            } else {
                newConns = [...savedConnections, newConn];
                setMessage('Connection saved successfully!');
            }
            setSavedConnections(newConns);
            localStorage.setItem('jira_connections', JSON.stringify(newConns));
            if (editingIdx === null) setSelectedConnectionIdx(newConns.length - 1); 
            setJiraConnected(true);
            setTimeout(() => { 
                setIsAddingJira(false); 
                setEditingIdx(null);
                setMessage(''); 
            }, 2000);
        } else {
            setMessage('Error: ' + data.message);
        }
    } catch (err) {
        setMessage('Backend error. Please try again.');
    } finally {
        setLoading(false);
    }
  };

  const handleEditConnection = (idx, e) => {
    e.stopPropagation();
    const conn = savedConnections[idx];
    setJiraForm({ ...conn });
    setEditingIdx(idx);
    setIsAddingJira(true);
  };

  const handleDeleteConnection = (idx, e) => {
    e.stopPropagation();
    if (savedConnections.length <= 0) return; // Should not happen with current logic but safe
    const newConns = savedConnections.filter((_, i) => i !== idx);
    setSavedConnections(newConns);
    localStorage.setItem('jira_connections', JSON.stringify(newConns));
    if (selectedConnectionIdx === idx) {
        setSelectedConnectionIdx(0);
    } else if (selectedConnectionIdx > idx) {
        setSelectedConnectionIdx(selectedConnectionIdx - 1);
    }
  };

  const handleTestConnection = async () => {
    setTestLoading(true);
    setMessage('');
    try {
        const response = await fetch(`${API_BASE}/api/jira/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jiraForm)
        });
        const data = await response.json();
        if (data.success) {
            setMessage('Test connection successful!');
        } else {
            setMessage('Error: ' + data.message);
        }
    } catch (err) {
        setMessage('Backend error during test.');
    } finally {
        setTestLoading(false);
    }
  };

  const handleTestLLM = async () => {
    setLlmTestLoading(true);
    setLlmMessage('');
    try {
        const response = await fetch(`${API_BASE}/api/llm/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(llmConfig)
        });
        const data = await response.json();
        if (data.success) {
            setLlmMessage('LLM Connection successful!');
        } else {
            setLlmMessage('Error: ' + data.message);
        }
    } catch (err) {
        setLlmMessage('LLM connectivity error.');
    } finally {
        setLlmTestLoading(false);
    }
  };

  const handleFetchJira = async () => {
    setFetchLoading(true);
    setFetchError('');
    try {
        const response = await fetch(`${API_BASE}/api/jira/fetch`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...savedConnections[selectedConnectionIdx],
                ...fetchParams
            })
        });
        const data = await response.json();
        if (data.success) {
            setJiraIssues(data.issues);
            setStep(3); 
        } else {
            setFetchError(data.message || 'Failed to fetch requirements');
        }
    } catch (err) {
        setFetchError('Network error connecting to Jira.');
    } finally {
        setFetchLoading(false);
    }
  };

  const handleGeneratePlan = async (additionalContext) => {
    setGenLoading(true);
    try {
        const response = await fetch(`${API_BASE}/api/generate-plan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                issues: jiraIssues,
                context: additionalContext,
                llmConfig: llmConfig
            })
        });
        const data = await response.json();
        if (data.success) {
            const newPlan = data.plan;
            setGeneratedPlan(newPlan);
            
            // Save to history
            const historyItem = {
                id: Date.now(),
                date: new Date().toLocaleString(),
                product: fetchParams.product || fetchParams.projectKey,
                plan: newPlan,
                model: llmConfig.model
            };
            const newHistory = [historyItem, ...history];
            setHistory(newHistory);
            localStorage.setItem('test_plan_history', JSON.stringify(newHistory));
            
            setStep(4);
        }
    } catch (err) {
        console.error(err);
        alert("Plan Generation Failed: " + err.message);
    } finally {
        setGenLoading(false);
    }
  };

  const handleAddToContextLibrary = async () => {
    try {
        const title = `AI Test Plan - ${fetchParams.product || fetchParams.projectKey || 'Generated'}`;
        const targetBackend = import.meta.env.PROD ? 'https://tc-backend-mu.vercel.app/api' : 'http://localhost:5006/api';
        const response = await fetch(`${targetBackend}/context`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: title,
                type: 'Template',
                content: generatedPlan,
            })
        });
        if (response.ok) {
            alert("Successfully added to Test Case Generator Context Library!");
        } else {
            alert("Failed to add to Context Library. Ensure Test Case Generator backend is running.");
        }
    } catch (err) {
        alert("Network error connecting to Test Case Generator API.");
        console.error(err);
    }
  };

  const handleDownloadMd = () => {
    const element = document.createElement("a");
    const file = new Blob([generatedPlan], {type: 'text/markdown'});
    element.href = URL.createObjectURL(file);
    element.download = `TestPlan_${fetchParams.projectKey || 'Generated'}.md`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handlePublishConfluence = async () => {
    setPublishLoading(true);
    setPublishSuccess(null);
    try {
        const response = await fetch(`${API_BASE}/api/confluence/publish`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                ...savedConnections[selectedConnectionIdx],
                title: `AI Test Plan - ${fetchParams.product || fetchParams.projectKey}`,
                content: generatedPlan,
                spaceKey: confluenceSpaceKey
            })
        });
        const data = await response.json();
        if (data.success) {
            setPublishSuccess({ url: data.url });
        } else {
            alert("Publish failed: " + data.message);
        }
    } catch (err) {
        alert("Network error publishing to Confluence.");
    } finally {
        setPublishLoading(false);
    }
  };

  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
            {isAddingJira ? (
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
                    <div style={{ marginBottom: '32px' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Jira Connection</h2>
                        <p style={{ color: '#64748b' }}>Connect to your Jira instance to fetch requirements</p>
                    </div>
                    
                    <button 
                        onClick={() => {
                            setIsAddingJira(false);
                            setEditingIdx(null);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #2563eb', background: 'transparent', color: '#2563eb', fontWeight: '600', marginBottom: '32px' }}
                    >
                        <X size={18} /> Cancel
                    </button>

                    <div style={{ display: 'grid', gap: '24px' }}>
                        <div>
                            <label>Connection Name</label>
                            <input 
                                value={jiraForm.name} 
                                onChange={e => setJiraForm({...jiraForm, name: e.target.value})}
                                placeholder="e.g., VWO Production" 
                            />
                        </div>
                        <div>
                            <label>Jira URL</label>
                            <input 
                                value={jiraForm.url} 
                                onChange={e => setJiraForm({...jiraForm, url: e.target.value})}
                                placeholder="https://yourcompany.atlassian.net" 
                            />
                        </div>
                        <div>
                            <label>Jira Email</label>
                            <input 
                                value={jiraForm.email} 
                                onChange={e => setJiraForm({...jiraForm, email: e.target.value})}
                                type="email" placeholder="your-email@company.com" 
                            />
                        </div>
                        <div>
                            <label>API Token</label>
                            <input 
                                value={jiraForm.token} 
                                onChange={e => setJiraForm({...jiraForm, token: e.target.value})}
                                type="password" placeholder="Your Jira API token" 
                            />
                            <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>
                                Generate at: <a href="#" style={{ color: '#2563eb', textDecoration: 'none' }}>https://id.atlassian.com/manage-profile/security/api-tokens</a>
                            </p>
                        </div>
                    </div>

                    {message && (
                        <div style={{ marginTop: '16px', padding: '12px', borderRadius: '8px', background: message.includes('Error') ? '#fef2f2' : '#f0fdf4', color: message.includes('Error') ? '#dc2626' : '#16a34a', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            {message.includes('Error') ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
                            {message}
                        </div>
                    )}

                    <div style={{ marginTop: '32px', borderTop: '1px solid #e2e8f0', paddingTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                         <div style={{ display: 'flex', gap: '12px' }}>
                             <button 
                                disabled={testLoading || loading}
                                onClick={handleTestConnection}
                                style={{ background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', padding: '12px 24px', borderRadius: '8px', fontWeight: '600' }}
                             >
                                {testLoading ? 'Testing...' : 'Test Connection'}
                             </button>
                             <button 
                                disabled={loading || testLoading}
                                onClick={handleSaveJira}
                                style={{ background: '#2563eb', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: '600', flex: 1 }}
                             >
                                 {loading ? 'Saving...' : (editingIdx !== null ? 'Update Connection' : 'Save Connection')}
                             </button>
                         </div>
                         <button onClick={nextStep} style={{ background: '#2563eb', color: '#fff', padding: '16px', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', width: '100%' }}>Continue to Fetch Issues</button>
                    </div>
                </div>
            ) : (
                <>
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Jira Connection</h2>
                    <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
                        {savedConnections.map((conn, idx) => (
                            <div 
                                key={idx}
                                onClick={() => setSelectedConnectionIdx(idx)}
                                style={{ 
                                    padding: '16px', borderRadius: '12px', border: `2px solid ${selectedConnectionIdx === idx ? '#2563eb' : '#e2e8f0'}`,
                                    background: selectedConnectionIdx === idx ? '#eff6ff' : '#fff',
                                    cursor: 'pointer', transition: 'all 0.2s'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                        <div style={{ width: '32px', height: '32px', background: selectedConnectionIdx === idx ? '#2563eb' : '#f1f5f9', color: selectedConnectionIdx === idx ? '#fff' : '#64748b', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
                                            {idx + 1}
                                        </div>
                                        <div>
                                            <div style={{ fontWeight: '700', color: '#1e293b' }}>{conn.name}</div>
                                            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{conn.url}</div>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '4px' }}>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setExpandedIdx(expandedIdx === idx ? null : idx);
                                            }}
                                            style={{ padding: '8px', borderRadius: '8px', color: '#64748b', background: 'transparent', border: 'none' }}
                                        >
                                            {expandedIdx === idx ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                                        </button>
                                        <button 
                                            onClick={(e) => handleEditConnection(idx, e)}
                                            style={{ padding: '8px', borderRadius: '8px', color: '#2563eb', background: 'transparent', border: 'none' }}
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button 
                                            onClick={(e) => handleDeleteConnection(idx, e)}
                                            style={{ padding: '8px', borderRadius: '8px', color: '#ef4444', background: 'transparent', border: 'none' }}
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </div>
                                
                                {expandedIdx === idx && (
                                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0', fontSize: '0.85rem', color: '#64748b' }}>
                                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px', marginBottom: '4px' }}>
                                            <span style={{ fontWeight: '600' }}>Email:</span>
                                            <span>{conn.email || 'N/A'}</span>
                                        </div>
                                        <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr', gap: '8px' }}>
                                            <span style={{ fontWeight: '600' }}>Token:</span>
                                            <span>••••••••••••{conn.token?.slice(-4) || '••••'}</span>
                                        </div>
                                    </motion.div>
                                )}
                            </div>
                        ))}
                    </div>
                    <button 
                        onClick={() => {
                            setJiraForm({ name: '', url: '', email: '', token: '' });
                            setIsAddingJira(true);
                        }}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 24px', borderRadius: '8px', border: '1px solid #2563eb', background: 'transparent', color: '#2563eb', fontWeight: '700', fontSize: '0.9rem' }}
                    >
                        <Plus size={18} /> Add New Connection
                    </button>
                    <button 
                      onClick={nextStep} 
                      style={{ width: '100%', marginTop: '32px', padding: '16px', background: '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '1rem' }}
                    >
                      Continue to Fetch Requirements
                    </button>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Import from Test Management Tools</h3>
                <p style={{ color: '#64748b', marginBottom: '24px' }}>Connect to your existing test case repositories and management platforms</p>

                {import.meta.env.PROD && llmConfig.provider === 'Ollama' && (
                    <div style={{ marginBottom: '24px', padding: '16px', background: '#fff7ed', border: '1px solid #ffedd5', borderRadius: '12px', color: '#9a3412', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <AlertCircle size={20} />
                        <div>
                            <strong>Cloud Deployment Tip:</strong> You are currently using Ollama (Local). For the live demo, please switch to <strong>Groq</strong> or <strong>Gemini</strong> in Settings to enable AI generation.
                        </div>
                    </div>
                )}
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' }}>
                    {tools.map((t, i) => <ToolCard key={i} {...t} onManage={() => setIsAddingJira(true)} />)}
                </div>
                </>
            )}
          </motion.div>
        );
      case 2:
        return (
          <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '8px' }}>Fetch Jira Requirements</h2>
                <p style={{ color: '#64748b', marginBottom: '32px' }}>Enter project details to fetch user stories and requirements</p>
                
                <div style={{ background: '#f8fafc', padding: '16px 24px', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                    <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>Connected to:</div>
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>
                            {savedConnections[selectedConnectionIdx]?.name} ({savedConnections[selectedConnectionIdx]?.url})
                        </div>
                    </div>
                    <button onClick={() => setStep(1)} style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.9rem', background: 'transparent' }}>Change</button>
                </div>

                {fetchError && (
                  <div style={{ marginBottom: '24px', padding: '12px', borderRadius: '8px', background: '#fef2f2', border: '1px solid #fee2e2', color: '#dc2626', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <AlertCircle size={16} />
                    {fetchError}
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                        <label>Product Name</label>
                        <input 
                            value={fetchParams.product} 
                            onChange={e => setFetchParams({...fetchParams, product: e.target.value})}
                            placeholder="e.g., App.vwo.com" 
                        />
                    </div>
                    <div>
                        <label>Project Key *</label>
                        <input 
                            value={fetchParams.projectKey} 
                            onChange={e => setFetchParams({...fetchParams, projectKey: e.target.value})}
                            placeholder="e.g., VS" 
                        />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label>Sprint/Fix Version (Optional)</label>
                    <input 
                        value={fetchParams.sprint} 
                        onChange={e => setFetchParams({...fetchParams, sprint: e.target.value})}
                        placeholder="e.g., Sprint 15 or leave empty for all open issues" 
                    />
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <label>Additional Context (Optional)</label>
                    <textarea 
                        style={{ minHeight: '120px' }} 
                        value={fetchParams.context} 
                        onChange={e => setFetchParams({...fetchParams, context: e.target.value})}
                        placeholder="Any additional information about the product, testing goals, or constraints..."
                    ></textarea>
                </div>

                <button 
                   onClick={handleFetchJira}
                   disabled={fetchLoading}
                   style={{ width: '100%', marginTop: '32px', padding: '16px', background: fetchLoading ? '#94a3b8' : '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    {fetchLoading ? (
                      <>
                        <RefreshCw size={18} className="animate-spin" /> 
                        Fetching Requirements...
                      </>
                    ) : 'Fetch Jira Requirements'}
                </button>
            </div>
          </motion.div>
        );
      case 3:
        return (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', background: '#fff', border: '1px solid #e2e8f0', padding: '6px 16px', borderRadius: '99px' }}>
                    <span style={{ fontSize: '14px' }}>🎯 VWO (https://bugzz.atlassian.net/)</span>
                </div>
                <button style={{ color: '#1e293b', fontWeight: '600', fontSize: '0.9rem', background: 'transparent', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <RefreshCw size={16} /> Refresh Issues
                </button>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', marginBottom: '24px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Additional Context & Notes</h3>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Add any additional context, special requirements, or constraints</p>
                <textarea style={{ minHeight: '150px' }} placeholder="Add any additional context about the testing approach, special requirements, constraints, team structure, or specific areas of focus..."></textarea>
            </div>

            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Review Jira Issues ({jiraIssues.length})</h3>
                <p style={{ color: '#64748b', marginBottom: '24px', fontSize: '0.9rem' }}>Issues that will be used to generate the test plan</p>
                
                <div style={{ display: 'grid', gap: '12px', marginBottom: '32px' }}>
                    {jiraIssues.map(issue => (
                        <div key={issue.id} style={{ padding: '16px', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div>
                                <span style={{ fontWeight: '700', color: '#2563eb', marginRight: '12px' }}>{issue.id}</span>
                                <span style={{ fontWeight: '500' }}>{issue.summary}</span>
                            </div>
                            <div style={{ fontSize: '0.75rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 8px', borderRadius: '99px', fontWeight: 'bold' }}>{issue.type || 'Story'}</div>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={() => handleGeneratePlan('')}
                    disabled={genLoading}
                    style={{ width: '100%', padding: '16px', background: '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    <Target size={20} /> 
                    {genLoading ? 'Generating...' : 'Generate Test Plan'}
                </button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '40px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '32px' }}>
                    <div>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: '800' }}>Generated Test Plan</h2>
                        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                            <button 
                                onClick={() => setPreviewMode('preview')}
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', background: previewMode === 'preview' ? '#2563eb' : '#f1f5f9', color: previewMode === 'preview' ? '#fff' : '#64748b', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Eye size={14} /> Preview Mode
                            </button>
                            <button 
                                onClick={() => setPreviewMode('raw')}
                                style={{ padding: '6px 12px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '700', background: previewMode === 'raw' ? '#2563eb' : '#f1f5f9', color: previewMode === 'raw' ? '#fff' : '#64748b', border: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}
                            >
                                <Code size={14} /> Raw Markdown
                            </button>
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button 
                            onClick={handleAddToContextLibrary}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px', color: '#16a34a' }}
                        >
                            <BookOpen size={14} /> Add to Context Library
                        </button>
                        <button 
                            onClick={handleDownloadMd}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #e2e8f0', background: '#fff', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            <Download size={14} /> Download .md
                        </button>
                        <button 
                            disabled={publishLoading}
                            onClick={() => {
                                setPublishSuccess(null);
                                setShowConfluenceModal(true);
                            }}
                            style={{ padding: '6px 16px', borderRadius: '6px', background: '#2563eb', color: '#fff', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                            {publishLoading ? 'Publishing...' : (
                                <>
                                    <Share2 size={14} /> Publish to Confluence
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {generatedPlan ? (
                    <div style={{ background: '#f8fafc', padding: '32px', borderRadius: '12px', border: '1px solid #e2e8f0', minHeight: '400px', whiteSpace: 'pre-wrap' }}>
                        {previewMode === 'preview' ? (
                            <div className="markdown-preview">
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedPlan}</ReactMarkdown>
                            </div>
                        ) : (
                            <code style={{ fontSize: '0.9rem', color: '#475569', display: 'block', fontFamily: 'monospace' }}>
                                {generatedPlan}
                            </code>
                        )}
                    </div>
                ) : (
                    <div style={{ padding: '100px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#cbd5e1' }}>
                            <FileText size={40} />
                        </div>
                        <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>No test plan generated yet</h3>
                        <p style={{ color: '#64748b', textAlign: 'center', maxWidth: '300px' }}>Complete the fetch and review steps to see your AI-generated plan here.</p>
                    </div>
                )}
                <button onClick={() => setStep(1)} style={{ color: '#2563eb', fontWeight: '700', background: 'transparent', marginTop: '32px', border: 'none', cursor: 'pointer' }}>Generate New Plan</button>
            </div>

            {showConfluenceModal && (
                <div style={{ position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.75)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '24px' }}>
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} style={{ background: '#fff', padding: '40px', borderRadius: '24px', maxWidth: '500px', width: '100%', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
                        {!publishSuccess ? (
                            <>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Publish to Confluence</h3>
                                <p style={{ color: '#64748b', marginBottom: '32px' }}>Create a new page in your Confluence space</p>
                                
                                <div style={{ marginBottom: '32px' }}>
                                    <label>Confluence Space Key</label>
                                    <input 
                                        value={confluenceSpaceKey}
                                        onChange={e => {
                                            const val = e.target.value;
                                            if (val.includes('/spaces/')) {
                                                const parts = val.split('/spaces/');
                                                const extracted = parts[1].split('/')[0];
                                                setConfluenceSpaceKey(extracted);
                                            } else {
                                                setConfluenceSpaceKey(val);
                                            }
                                        }}
                                        placeholder="e.g., TEAM or Paste URL"
                                        style={{ fontSize: '1rem', fontWeight: '700' }}
                                    />
                                    <p style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '8px' }}>Paste your Confluence page link to auto-detect the Space Key.</p>
                                </div>

                                <div style={{ display: 'flex', gap: '12px' }}>
                                    <button 
                                        onClick={() => setShowConfluenceModal(false)}
                                        style={{ flex: 1, padding: '14px', borderRadius: '12px', background: '#f1f5f9', color: '#475569', fontWeight: '700' }}
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        disabled={publishLoading}
                                        onClick={handlePublishConfluence}
                                        style={{ flex: 2, padding: '14px', borderRadius: '12px', background: '#2563eb', color: '#fff', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                                    >
                                        {publishLoading ? (
                                            <>
                                                <RefreshCw size={20} className="animate-spin" />
                                                Publishing...
                                            </>
                                        ) : 'Publish Page'}
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: '#f0fdf4', color: '#22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px' }}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '8px' }}>Published Successfully!</h3>
                                <p style={{ color: '#64748b', marginBottom: '32px' }}>Your test plan is now live on Confluence.</p>
                                
                                <a 
                                    href={publishSuccess.url} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    style={{ display: 'block', width: '100%', padding: '16px', background: '#2563eb', color: '#fff', borderRadius: '12px', fontWeight: '700', textDecoration: 'none', marginBottom: '12px' }}
                                >
                                    Open Confluence Page
                                </a>
                                <button 
                                    onClick={() => setShowConfluenceModal(false)}
                                    style={{ width: '100%', padding: '12px', background: 'transparent', color: '#64748b', fontWeight: '600' }}
                                >
                                    Close
                                </button>
                            </div>
                        )}
                    </motion.div>
                </div>
            )}
          </motion.div>
        );
      default: return null;
    }
  };

  const renderContent = () => {
    if (activeTab === 'Curriculum') {
        const templates = [
            { title: 'Standard QA Strategy', desc: 'Comprehensive functional and non-functional testing', target: 'Enterprise apps' },
            { title: 'Mobile App Coverage', desc: 'Focus on touch interactions & network edge cases', target: 'iOS/Android' },
            { title: 'Security & Penetration', desc: 'Focused on OWASP Top 10 and data privacy', target: 'Fintech/SaaS' },
            { title: 'Performance Benchmark', desc: 'Load, stress, and scalability testing scenarios', target: 'High-traffic backend' }
        ];
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 64px 64px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>Templates & Curriculum</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {templates.map((t, i) => (
                        <div key={i} className="card" style={{ padding: '24px' }}>
                            <div style={{ width: '40px', height: '40px', background: '#eff6ff', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb', marginBottom: '16px' }}>
                                <BookOpen size={20} />
                            </div>
                            <h4 style={{ fontWeight: '700', marginBottom: '8px' }}>{t.title}</h4>
                            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '16px' }}>{t.desc}</p>
                            <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#2563eb' }}>Target: {t.target}</div>
                        </div>
                    ))}
                </div>
            </motion.div>
        );
    }

    if (activeTab === 'Dashboard') {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 64px 64px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>Connected Ecosystem</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px' }}>
                    {tools.map((tool, i) => (
                        <ToolCard key={i} {...tool} onManage={() => setActiveTab('Settings')} />
                    ))}
                </div>
            </motion.div>
        );
    }

    if (activeTab === 'History') {
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ padding: '0 64px 64px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>Test Planning History</h2>
                {history.length > 0 ? (
                    <div style={{ display: 'grid', gap: '16px' }}>
                        {history.map(item => (
                            <div key={item.id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 32px' }}>
                                <div>
                                    <div style={{ fontWeight: '700', fontSize: '1.1rem' }}>{item.product}</div>
                                    <div style={{ color: '#94a3b8', fontSize: '0.75rem', marginTop: '4px' }}>Generated on {item.date} using {item.model}</div>
                                </div>
                                <button 
                                    onClick={() => {
                                        setGeneratedPlan(item.plan);
                                        setActiveTab('Intelligent Test Planning Agent');
                                        setStep(4);
                                    }}
                                    style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #2563eb', color: '#2563eb', fontWeight: '700', background: 'transparent' }}
                                >
                                    View Plan
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="card" style={{ padding: '64px', textAlign: 'center', color: '#94a3b8' }}>
                        No history found. Generate your first plan to see it here!
                    </div>
                )}
            </motion.div>
        );
    }

    if (activeTab === 'Settings') {
        // ... (existing settings code)
        return (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card" style={{ maxWidth: '800px' }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '800', marginBottom: '24px' }}>AI Model Settings</h2>
                <div style={{ display: 'grid', gap: '24px' }}>
                    <div>
                        <label>AI Provider</label>
                        <select 
                            value={llmConfig.provider} 
                            onChange={e => {
                                const p = e.target.value;
                                let defaults = { provider: p, baseUrl: '', apiKey: '', model: '' };
                                if (p === 'Ollama') { defaults.baseUrl = 'http://127.0.0.1:11434'; defaults.model = 'gemma3:1b'; }
                                if (p === 'LM Studio') { defaults.baseUrl = 'http://127.0.0.1:1234'; }
                                if (p === 'Groq') { defaults.model = 'llama-3.3-70b-versatile'; }
                                if (p === 'OpenAI') { defaults.model = 'gpt-4o'; }
                                if (p === 'Gemini') { defaults.model = 'gemini-1.5-flash'; }
                                if (p === 'Claude') { defaults.model = 'claude-3-5-sonnet-20240620'; }
                                setLlmConfig(defaults);
                            }}
                        >
                            <option value="Ollama">Ollama (Local)</option>
                            <option value="LM Studio">LM Studio</option>
                            <option value="Groq">Groq</option>
                            <option value="Grok (xAI)">Grok (xAI)</option>
                            <option value="OpenAI">OpenAI</option>
                            <option value="Gemini">Gemini</option>
                            <option value="Claude">Claude</option>
                        </select>
                    </div>
                    
                    {(llmConfig.provider === 'Ollama' || llmConfig.provider === 'LM Studio') ? (
                        <div>
                            <label>{llmConfig.provider} Base URL</label>
                            <input 
                                value={llmConfig.baseUrl} 
                                onChange={e => setLlmConfig({...llmConfig, baseUrl: e.target.value})}
                                placeholder={llmConfig.provider === 'Ollama' ? "http://127.0.0.1:11434" : "http://127.0.0.1:1234"} 
                            />
                        </div>
                    ) : (
                        <div>
                            <label>API Key</label>
                            <input 
                                value={llmConfig.apiKey} 
                                onChange={e => setLlmConfig({...llmConfig, apiKey: e.target.value})}
                                type="password" placeholder={`Enter your ${llmConfig.provider} API Key`} 
                            />
                        </div>
                    )}
                    
                    <div>
                        <label>Model Name</label>
                        <input 
                            value={llmConfig.model} 
                            onChange={e => setLlmConfig({...llmConfig, model: e.target.value})}
                            placeholder="e.g., llama3, mixtral-8x7b-32768, etc." 
                        />
                    </div>

                    {llmMessage && (
                        <div style={{ padding: '12px', borderRadius: '8px', background: llmMessage.includes('Error') ? '#fef2f2' : '#f0fdf4', color: llmMessage.includes('Error') ? '#dc2626' : '#16a34a', fontSize: '0.85rem', fontWeight: 'bold' }}>
                            {llmMessage}
                        </div>
                    )}

                    <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                        <button 
                            onClick={handleTestLLM}
                            disabled={llmTestLoading}
                            style={{ background: 'transparent', border: '1px solid #2563eb', color: '#2563eb', padding: '12px 24px', borderRadius: '8px', fontWeight: '600' }}
                        >
                            {llmTestLoading ? 'Testing...' : 'Test Connection'}
                        </button>
                        <button 
                            style={{ background: '#2563eb', color: '#fff', padding: '12px 24px', borderRadius: '8px', fontWeight: '600', flex: 1 }}
                            onClick={async () => {
                                localStorage.setItem('llm_config', JSON.stringify(llmConfig));
                                
                                // Sync to Test Case Generator
                                try {
                                    const mapProviderName = (p) => {
                                       if (p === 'Ollama') return 'ollama';
                                       if (p === 'LM Studio') return 'lmStudio';
                                       return p.toLowerCase();
                                    };
                                    const payloadKey = mapProviderName(llmConfig.provider);
                                    
                                    const targetBackend = import.meta.env.PROD ? 'https://tc-backend-mu.vercel.app/api' : 'http://localhost:5006/api';
                                    await fetch(`${targetBackend}/settings`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({
                                            defaultProvider: payloadKey,
                                            [payloadKey]: {
                                                baseUrl: llmConfig.baseUrl,
                                                apiKey: llmConfig.apiKey,
                                                model: llmConfig.model
                                            }
                                        })
                                    });
                                    setLlmMessage('Settings saved across all AI Agents!');
                                } catch (e) {
                                    setLlmMessage('Settings saved locally. Note: Test Case Generator sync failed.');
                                }
                            }}
                        >
                            Save AI Config
                        </button>
                    </div>
                </div>
            </motion.div>
        );
    }

    if (activeTab === 'Test Case Generator') {
        return (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <iframe 
                    src={import.meta.env.PROD ? "https://tc-frontend-nu.vercel.app" : "http://localhost:5177"} 
                    style={{ flex: 1, width: '100%', height: '100%', border: 'none', background: '#fff' }}
                    title="Test Case Generator"
                />
            </motion.div>
        );
    }

    return (
        <section style={{ flex: 1, padding: '0 64px 64px', maxWidth: '1000px', width: '100%' }}>
            <AnimatePresence mode="wait">
                {renderCurrentStep()}
            </AnimatePresence>
        </section>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#f8fafc' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: collapsed ? '80px' : '280px', background: '#0f172a', transition: 'all 0.3s ease',
        display: 'flex', flexDirection: 'column', padding: '24px 16px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px', padding: '0 8px' }}>
          <div style={{ width: '40px', height: '40px', background: '#2563eb', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900', fontSize: '1.2rem' }}>TB</div>
          {!collapsed && (
            <div>
                <h1 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: '700' }}>TestingBuddy AI</h1>
                <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>Testing Platform</p>
            </div>
          )}
        </div>
        
        <div style={{ flex: 1 }}>
            <div style={{ fontSize: '0.7rem', fontWeight: 'bold', color: '#475569', marginBottom: '16px', padding: '0 8px', textTransform: 'uppercase' }}>Main</div>
            <SidebarItem icon={LayoutDashboard} label="Dashboard" active={activeTab === 'Dashboard'} onClick={() => setActiveTab('Dashboard')} collapsed={collapsed} />
            <SidebarItem icon={BookOpen} label="Curriculum" active={activeTab === 'Curriculum'} onClick={() => setActiveTab('Curriculum')} collapsed={collapsed} />
            <SidebarItem icon={Settings} label="Settings" active={activeTab === 'Settings'} onClick={() => setActiveTab('Settings')} collapsed={collapsed} />
            
            <div style={{ height: '32px' }} />
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.7rem', fontWeight: 'bold', color: '#475569', marginBottom: '16px', padding: '0 8px', textTransform: 'uppercase' }}>
                <ChevronLeft size={14} /> Planning & Strategy
            </div>
            <SidebarItem 
                icon={Target} 
                label="Intelligent Test Planning Agent" 
                active={activeTab === 'Intelligent Test Planning Agent'} 
                onClick={() => { setActiveTab('Intelligent Test Planning Agent'); setStep(1); }} 
                collapsed={collapsed} 
            />
            <SidebarItem 
                icon={Zap} 
                label="Test Case Generator" 
                active={activeTab === 'Test Case Generator'} 
                onClick={() => { setActiveTab('Test Case Generator'); }} 
                collapsed={collapsed} 
            />
        </div>

        <button 
           onClick={() => setCollapsed(!collapsed)}
           style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', padding: '12px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
        >
            <ChevronLeft style={{ transition: 'all 0.3s', transform: collapsed ? 'rotate(180deg)' : 'none' }} />
        </button>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
        {activeTab !== 'Test Case Generator' && (
            <header style={{ padding: '40px 64px 20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                    <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                        <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                            <Target size={32} />
                        </div>
                        <div>
                            <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>{activeTab}</h1>
                            <p style={{ color: '#64748b', fontSize: '1rem' }}>
                                {activeTab === 'Intelligent Test Planning Agent' ? 'Generate comprehensive test plans from Jira requirements using AI' : 
                                 activeTab === 'Curriculum' ? 'Access specialized test strategies and industry templates' :
                                 activeTab === 'Dashboard' ? 'Manage your connected test architecture and tools' :
                                 activeTab === 'History' ? 'Review and manage your past AI-generated test plans' :
                                 'Configure your AI and synchronization settings'}
                            </p>
                        </div>
                    </div>
                    {activeTab !== 'History' && (
                        <button 
                            onClick={() => setActiveTab('History')}
                            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #2563eb', background: 'transparent', color: '#2563eb', fontWeight: '700', fontSize: '0.9rem' }}
                        >
                            <History size={18} /> View History
                        </button>
                    )}
                </div>
                
                {activeTab === 'Intelligent Test Planning Agent' && <Stepper currentStep={step} onStepClick={(s) => setStep(s)} />}
            </header>
        )}

        {renderContent()}

        {activeTab !== 'Test Case Generator' && (
            <footer style={{ padding: '20px 64px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: 'auto' }}>
                 <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>© 2026 TestingBuddy AI • Powered by Advanced GenAI</p>
            </footer>
        )}
      </main>
    </div>
  );
}

