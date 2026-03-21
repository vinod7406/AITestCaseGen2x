import React, { useState, useEffect } from 'react';
import { Settings, Send, History, Download, Trash2, MessageSquare, Table as TableIcon, Loader, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { historyApi, llmApi, settingsApi } from '../services/api';

const MainPage = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [testCaseTypes, setTestCaseTypes] = useState(['functional']); // functional, non-functional, edge, negative
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

  const types = [
    { id: 'functional', label: 'Functional' },
    { id: 'non-functional', label: 'Non-Functional' },
    { id: 'edge-cases', label: 'Edge Cases' },
    { id: 'negative', label: 'Negative' },
  ];

  useEffect(() => {
    fetchHistory();
    fetchProviders();
  }, []);

  const fetchProviders = async () => {
    try {
      const res = await settingsApi.get();
      setSelectedProvider(res.data.defaultProvider);
      // In a real app we'd map the keys of the settings object
      setProviders(['ollama', 'lmStudio', 'groq', 'openai', 'claude', 'gemini']);
    } catch (err) {
      console.error('Failed to fetch providers', err);
    }
  };

  const fetchHistory = async () => {
    try {
      const res = await historyApi.getAll();
      setHistory(res.data);
      if (res.data.length > 0 && !activeEntry) {
        setActiveEntry(res.data[0]);
      }
    } catch (err) {
      console.error('Failed to fetch history', err);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      // Determine if it's a test case request or simple chat
      const isTestCase = input.toLowerCase().includes('requirement') || input.toLowerCase().includes('generate');
      
      let res;
      if (isTestCase) {
        res = await llmApi.generate({
          prompt: input,
          provider: selectedProvider,
          types: testCaseTypes
        });
        // Response is the test cases array directly
        const newEntry = { 
          id: Date.now().toString(), 
          prompt: input, 
          output: res.data, 
          type: 'test-case', 
          timestamp: new Date().toISOString(),
          provider: selectedProvider
        };
        setActiveEntry(newEntry);
      } else {
        res = await llmApi.chat({
          prompt: input,
          provider: selectedProvider
        });
        const newEntry = { 
          id: Date.now().toString(), 
          prompt: input, 
          output: res.data.response, 
          type: 'chat', 
          timestamp: new Date().toISOString(),
          provider: selectedProvider
        };
        setActiveEntry(newEntry);
      }
      fetchHistory(); // Refresh history
      setInput('');
    } catch (err) {
      alert('Generation failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const deleteEntry = async (id, e) => {
    e.stopPropagation();
    try {
      await historyApi.remove(id);
      setHistory(prev => prev.filter(h => h.id !== id));
      if (activeEntry?.id === id) setActiveEntry(null);
    } catch (err) {
      console.error('Delete failed', err);
    }
  };

  const handleExport = (id) => {
    window.open(`http://localhost:5001/api/export/${id}`, '_blank');
  };

  const toggleType = (id) => {
    setTestCaseTypes(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', background: 'var(--bg-primary)' }}>
      {/* Sidebar */}
      <aside style={{ 
        width: isSidebarExpanded ? '320px' : '80px', 
        borderRight: '1px solid var(--border-color)', 
        display: 'flex', 
        flexDirection: 'column',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'relative'
      }} className="glass">
        {/* Toggle Button */}
        <button 
          onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
          style={{
            position: 'absolute',
            right: '-12px',
            top: '24px',
            width: '24px',
            height: '24px',
            background: 'var(--accent-primary)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            zIndex: 10,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)'
          }}
        >
          {isSidebarExpanded ? <ChevronLeft size={16} /> : <ChevronRight size={16} />}
        </button>

        <div style={{ 
          padding: '24px', 
          borderBottom: '1px solid var(--border-color)', 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px',
          justifyContent: isSidebarExpanded ? 'flex-start' : 'center'
        }}>
          <History size={20} color="var(--accent-primary)" />
          {isSidebarExpanded && <h2 style={{ fontSize: '1.25rem', whiteSpace: 'nowrap' }}>History</h2>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: isSidebarExpanded ? '12px' : '8px' }}>
          {history.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', marginTop: '40px' }}>
              {isSidebarExpanded ? "No history yet." : <MessageSquare size={20} style={{ opacity: 0.3 }} />}
            </div>
          ) : (
            history.map(entry => (
              <div 
                key={entry.id}
                onClick={() => setActiveEntry(entry)}
                style={{ 
                  padding: '12px', 
                  borderRadius: '8px', 
                  marginBottom: '8px', 
                  cursor: 'pointer',
                  background: activeEntry?.id === entry.id ? 'var(--bg-tertiary)' : 'transparent',
                  border: '1px solid',
                  borderColor: activeEntry?.id === entry.id ? 'var(--accent-primary)' : 'transparent',
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: isSidebarExpanded ? 'stretch' : 'center'
                }}
                className="entry-card"
                title={!isSidebarExpanded ? entry.prompt : ""}
              >
                {isSidebarExpanded ? (
                  <>
                    <div style={{ fontSize: '0.875rem', fontWeight: 'bold', marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.prompt}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                        {entry.type === 'test-case' ? 'TC' : 'Chat'} • {entry.provider}
                      </span>
                      <button onClick={(e) => deleteEntry(entry.id, e)} style={{ color: 'var(--text-secondary)', background: 'transparent' }}>
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                ) : (
                  <div style={{ color: activeEntry?.id === entry.id ? 'var(--accent-primary)' : 'var(--text-secondary)' }}>
                    {entry.type === 'test-case' ? <TableIcon size={20} /> : <MessageSquare size={20} />}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0' }}>
        <header style={{ padding: '16px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--accent-primary)' }}>VinodTestGen2.0</h1>
            <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Local-First QA Engine</span>
          </div>
          <Link to="/settings" style={{ color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
            <Settings size={20} />
            <span>Settings</span>
          </Link>
        </header>

        {/* Output Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
          {!activeEntry ? (
            <div style={{ height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', color: 'var(--text-secondary)', textAlign: 'center' }}>
              <MessageSquare size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
              <h3>Ready to Generate</h3>
              <p>Paste your Jira requirements or ask a question below.</p>
            </div>
          ) : (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                <div>
                  <h2 style={{ fontSize: '1.25rem', marginBottom: '4px' }}>Result</h2>
                  <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                    Generated by <strong style={{ color: 'var(--accent-primary)' }}>{activeEntry.provider}</strong>
                  </div>
                </div>
                {activeEntry.type === 'test-case' && (
                  <button 
                    onClick={() => handleExport(activeEntry.id)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '8px', 
                      padding: '8px 16px', 
                      background: 'var(--bg-tertiary)', 
                      color: 'var(--text-primary)', 
                      borderRadius: '8px',
                      border: '1px solid var(--border-color)'
                    }}
                  >
                    <Download size={18} />
                    Export CSV
                  </button>
                )}
              </div>

              {activeEntry.type === 'test-case' ? (
                <div style={{ overflowX: 'auto' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse', background: 'var(--bg-secondary)', borderRadius: '12px', overflow: 'hidden' }}>
                    <thead>
                      <tr style={{ background: 'var(--bg-tertiary)', textAlign: 'left' }}>
                        <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>ID</th>
                        <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>Summary</th>
                        <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>Preconditions</th>
                        <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>Steps</th>
                        <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>Expected Result</th>
                        <th style={{ padding: '16px', borderBottom: '1px solid var(--border-color)' }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {Array.isArray(activeEntry.output) ? activeEntry.output.map((tc, idx) => (
                        <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                          <td style={{ padding: '16px', verticalAlign: 'top' }}>{tc.id}</td>
                          <td style={{ padding: '16px', verticalAlign: 'top' }}>{tc.summary}</td>
                          <td style={{ padding: '16px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{tc.preconditions}</td>
                          <td style={{ padding: '16px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{tc.steps}</td>
                          <td style={{ padding: '16px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>{tc.expectedResult}</td>
                          <td style={{ padding: '16px', verticalAlign: 'top' }}>
                            <span style={{ 
                                padding: '4px 8px', 
                                background: 'var(--bg-tertiary)', 
                                borderRadius: '4px', 
                                fontSize: '0.75rem',
                                color: 'var(--accent-primary)'
                            }}>
                              {tc.type}
                            </span>
                          </td>
                        </tr>
                      )) : <tr><td colSpan="6" style={{ padding: '16px' }}>No test cases found or malformed output.</td></tr>}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="glass" style={{ padding: '24px', borderRadius: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                  {activeEntry.output}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '24px 32px', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>LLM:</span>
              <select 
                value={selectedProvider} 
                onChange={(e) => setSelectedProvider(e.target.value)}
                style={{ background: 'var(--bg-primary)', color: 'white', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '6px' }}
              >
                {providers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Types:</span>
              {types.map(t => (
                <label key={t.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.875rem', cursor: 'pointer' }}>
                  <input 
                    type="checkbox" 
                    checked={testCaseTypes.includes(t.id)} 
                    onChange={() => toggleType(t.id)}
                    style={{ accentColor: 'var(--accent-primary)' }}
                  />
                  {t.label}
                </label>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '16px', position: 'relative' }}>
            <textarea 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask here or paste Jira Requirement..."
              style={{ 
                flex: 1, 
                height: '80px', 
                background: 'var(--bg-primary)', 
                color: 'white', 
                border: '1px solid var(--border-color)', 
                borderRadius: '12px', 
                padding: '16px',
                paddingRight: '60px',
                resize: 'none',
                outline: 'none'
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleGenerate();
                }
              }}
            />
            <button 
              onClick={handleGenerate}
              disabled={loading || !input.trim()}
              style={{ 
                position: 'absolute',
                right: '12px',
                bottom: '12px',
                width: '40px',
                height: '40px',
                background: loading ? 'var(--bg-tertiary)' : 'var(--accent-primary)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(56, 189, 248, 0.3)'
              }}
            >
              {loading ? <Loader className="animate-spin" size={20} /> : <Send size={20} />}
            </button>
          </div>
        </div>
      </main>

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .entry-card:hover {
          background: rgba(255, 255, 255, 0.05) !important;
        }
      `}</style>
    </div>
  );
};

export default MainPage;
