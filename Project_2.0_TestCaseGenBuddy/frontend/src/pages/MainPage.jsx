import React, { useState, useEffect } from 'react';
import { Settings, Send, History, Download, Trash2, Edit2, MessageSquare, Table as TableIcon, Loader, ChevronLeft, ChevronRight, ChevronDown, X, Layers, Database, LayoutDashboard, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { historyApi, llmApi, settingsApi, templatesApi, contextApi } from '../services/api';

const MainPage = () => {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState([]);
  const [activeEntry, setActiveEntry] = useState(null);
  const [loading, setLoading] = useState(false);
  const [providers, setProviders] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('ollama');
  const [testCaseTypes, setTestCaseTypes] = useState(['functional']); // functional, non-functional, edge, negative
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [templates, setTemplates] = useState([]);
  const [contexts, setContexts] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [attachedContexts, setAttachedContexts] = useState([]);
  
  // Modal states
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showContextModal, setShowContextModal] = useState(false);
  const [newTemplate, setNewTemplate] = useState({ name: '', content: '', category: 'General' });
  const [newContext, setNewContext] = useState({ title: '', type: 'PRD', content: '', files: [] });
  const [editContextModal, setEditContextModal] = useState(null);
  const [activeView, setActiveView] = useState('generator'); // generator, templates_library, contexts_library
  const [previewTemplate, setPreviewTemplate] = useState(null);
  const [inputHeight, setInputHeight] = useState(150);
  const [isResizing, setIsResizing] = useState(false);
  const [collapsedFolders, setCollapsedFolders] = useState([]);
  const [deleteConfirm, setDeleteConfirm] = useState(null); // { id, type, action }
  const [theme, setTheme] = useState(() => localStorage.getItem('app-theme') || 'dark');

  const types = [
    { id: 'functional', label: 'Functional' },
    { id: 'non-functional', label: 'Non-Functional' },
    { id: 'edge-cases', label: 'Edge Cases' },
    { id: 'negative', label: 'Negative' },
  ];

  useEffect(() => {
    fetchHistory();
    fetchProviders();
    fetchTemplates();
    fetchContexts();
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'light' : 'dark');
  };

  const handleMouseDown = (e) => {
    setIsResizing(true);
    e.preventDefault();
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;
      const newHeight = window.innerHeight - e.clientY - 60; // 60 for bottom padding/offset
      if (newHeight > 100 && newHeight < 600) {
        setInputHeight(newHeight);
      }
    };

    const handleMouseUp = () => {
      setIsResizing(false);
    };

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const fetchTemplates = async () => {
    try {
      const res = await templatesApi.getAll();
      setTemplates(res.data);
    } catch (err) { console.error(err); }
  };

  const fetchContexts = async () => {
    try {
      const res = await contextApi.getAll();
      setContexts(res.data);
    } catch (err) { console.error(err); }
  };

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

  const updateTemplateCategory = async (templateId, newCategory) => {
    try {
      const template = templates.find(t => t.id === templateId);
      if (!template) return;
      await templatesApi.update(templateId, { ...template, category: newCategory });
      fetchTemplates();
    } catch (err) {
      console.error('Failed to update category', err);
    }
  };

  const onDragStart = (e, templateId) => {
    e.dataTransfer.setData('templateId', templateId);
  };

  const onDragOver = (e) => {
    e.preventDefault();
  };

  const onDrop = (e, newCategory) => {
    e.preventDefault();
    const templateId = e.dataTransfer.getData('templateId');
    if (templateId) {
      updateTemplateCategory(templateId, newCategory);
    }
  };

  const handleGenerate = async () => {
    if (!input.trim()) return;
    setLoading(true);
    try {
      // Determine if it's a test case request or simple chat
      const isTestCase = input.toLowerCase().includes('requirement') || input.toLowerCase().includes('generate') || !!selectedTemplate;
      
      let finalPrompt = input;
      if (selectedTemplate) {
        finalPrompt = `${selectedTemplate.content}\n\nRequirement: ${input}`;
      }
      if (attachedContexts.length > 0) {
        const contextStr = attachedContexts.map(c => `[CONTEXT: ${c.type} - ${c.title}]\n${c.content}`).join('\n\n');
        finalPrompt = `${finalPrompt}\n\nAdditional Knowledge / Context constraints:\n${contextStr}`;
      }

      let res;
      if (isTestCase) {
        res = await llmApi.generate({
          prompt: finalPrompt,
          provider: selectedProvider,
          types: testCaseTypes,
          hasTemplate: !!selectedTemplate
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
          prompt: finalPrompt,
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

  const handleAddTemplate = async () => {
    if (!newTemplate.name || !newTemplate.content) return;
    try {
      await templatesApi.save(newTemplate);
      setShowTemplateModal(false);
      setNewTemplate({ name: '', content: '' });
      fetchTemplates();
    } catch (err) { alert('Failed to save template'); }
  };

  const handleAddContext = async () => {
    if (!newContext.title || !newContext.content) return;
    try {
      await contextApi.save(newContext);
      setShowContextModal(false);
      setNewContext({ title: '', type: 'PRD', content: '' });
      fetchContexts();
    } catch (err) { alert('Failed to save context item'); }
  };

  const handleEditContextSave = async () => {
    if (!editContextModal.title || !editContextModal.content) return;
    try {
      await contextApi.update(editContextModal.id, {
          title: editContextModal.title,
          type: editContextModal.type,
          content: editContextModal.content
      });
      setEditContextModal(null);
      fetchContexts();
      setAttachedContexts(prev => prev.map(c => c.id === editContextModal.id ? { ...c, ...editContextModal } : c));
    } catch (err) { alert('Failed to update context item'); }
  };

  const deleteTemplate = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteConfirm({
      id,
      type: 'Template',
      message: 'Are you sure you want to delete this prompt template?',
      action: async () => {
        await templatesApi.remove(id);
        fetchTemplates();
        if (selectedTemplate?.id === id) setSelectedTemplate(null);
      }
    });
  };

  const toggleFolder = (folder) => {
    setCollapsedFolders(prev => 
      prev.includes(folder) ? prev.filter(f => f !== folder) : [...prev, folder]
    );
  };

  const deleteContext = async (id, e) => {
    e.stopPropagation();
    e.preventDefault();
    setDeleteConfirm({
      id,
      type: 'Knowledge Asset',
      message: 'Are you sure you want to delete this context asset?',
      action: async () => {
        await contextApi.remove(id);
        fetchContexts();
        setAttachedContexts(prev => prev.filter(c => c.id !== id));
      }
    });
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
          justifyContent: isSidebarExpanded ? 'flex-start' : 'center',
          minHeight: '73px' // Approximate header height match
        }}>
          <LayoutDashboard size={24} style={{ color: 'var(--accent-primary)', minWidth: '24px' }} />
          {isSidebarExpanded && <span style={{ fontWeight: 'bold', fontSize: '1.2rem', whiteSpace: 'nowrap', overflow: 'hidden' }}>TestGen 2.0</span>}
        </div>

        {/* Navigation Section */}
        <div style={{ padding: isSidebarExpanded ? '16px 12px' : '16px 8px', borderBottom: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <button 
            onClick={() => setActiveView('generator')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', width: '100%',
              background: activeView === 'generator' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', 
              color: activeView === 'generator' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: activeView === 'generator' ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
              borderRadius: '8px', cursor: 'pointer', justifyContent: isSidebarExpanded ? 'flex-start' : 'center'
            }}
          >
            <MessageSquare size={20} style={{ minWidth: '20px' }} />
            {isSidebarExpanded && <span style={{ fontWeight: activeView === 'generator' ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>Generator</span>}
          </button>
          <button 
            onClick={() => setActiveView('templates_library')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', width: '100%',
              background: activeView === 'templates_library' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', 
              color: activeView === 'templates_library' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: activeView === 'templates_library' ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
              borderRadius: '8px', cursor: 'pointer', justifyContent: isSidebarExpanded ? 'flex-start' : 'center'
            }}
          >
            <Layers size={20} style={{ minWidth: '20px' }} />
            {isSidebarExpanded && <span style={{ fontWeight: activeView === 'templates_library' ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>Templates Library</span>}
          </button>
          <button 
            onClick={() => setActiveView('contexts_library')}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', width: '100%',
              background: activeView === 'contexts_library' ? 'rgba(56, 189, 248, 0.1)' : 'transparent', 
              color: activeView === 'contexts_library' ? 'var(--accent-primary)' : 'var(--text-secondary)',
              border: activeView === 'contexts_library' ? '1px solid rgba(56, 189, 248, 0.2)' : '1px solid transparent',
              borderRadius: '8px', cursor: 'pointer', justifyContent: isSidebarExpanded ? 'flex-start' : 'center'
            }}
          >
            <Database size={20} style={{ minWidth: '20px' }} />
            {isSidebarExpanded && <span style={{ fontWeight: activeView === 'contexts_library' ? 'bold' : 'normal', whiteSpace: 'nowrap' }}>Context Library</span>}
          </button>
        </div>

        <div style={{ 
          padding: isSidebarExpanded ? '16px 24px 8px' : '16px 8px 8px', 
          display: 'flex', 
          alignItems: 'center',
          gap: '12px',
          justifyContent: isSidebarExpanded ? 'flex-start' : 'center'
        }}>
          <History size={16} style={{ color: 'var(--text-secondary)', minWidth: '16px' }} />
          {isSidebarExpanded && <span style={{ fontWeight: '600', fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Recent Chats</span>}
        </div>
        <div style={{ flex: 1, overflowY: 'auto', padding: isSidebarExpanded ? '12px' : '8px' }}>
          {/* New Chat Button */}
          {isSidebarExpanded && (
            <div style={{ padding: '0 12px 16px' }}>
              <button 
                onClick={() => { setActiveEntry(null); setActiveView('generator'); }} 
                style={{ width: '100%', padding: '10px', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
              >
                + New Chat
              </button>
            </div>
          )}

          {history.length === 0 ? <p style={{textAlign:'center', color:'var(--text-secondary)', marginTop: '20px' }}>No history</p> :
          history.map(entry => (
            <div 
              key={entry.id}
              onClick={() => { setActiveEntry(entry); setActiveView('generator'); }}
              style={{ 
                padding: '12px', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer',
                background: activeEntry?.id === entry.id ? 'var(--bg-tertiary)' : 'transparent',
                border: '1px solid',
                borderColor: activeEntry?.id === entry.id ? 'var(--accent-primary)' : 'transparent',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis', paddingRight: '12px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 'bold', textOverflow: 'ellipsis', overflow: 'hidden' }}>{entry.prompt.substring(0, 30)}...</div>
                {isSidebarExpanded && <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{new Date(entry.timestamp).toLocaleTimeString()}</div>}
              </div>
              {isSidebarExpanded && (
                <button 
                  onClick={(e) => deleteEntry(entry.id, e)} 
                  style={{ background: 'transparent', color: 'var(--text-secondary)', padding: 0 }}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </aside>

      {/* Main Content */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '0' }}>
        <header style={{ padding: '24px 32px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', minHeight: '73px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>
              {activeView === 'generator' ? 'Test Case Generator Workspace' : activeView === 'templates_library' ? 'Prompt Templates Library' : 'Knowledge & Context Library'}
            </h1>
            <div style={{ height: '20px', width: '1px', background: 'var(--border-color)' }}></div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>VinodTestGen 2.0 Engine</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <button 
              onClick={toggleTheme}
              style={{ background: 'transparent', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </header>

        {/* Output Area */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '32px', position: 'relative' }}>
          <div style={{ 
            position: 'absolute', 
            top: 0, 
            left: 0, 
            right: 0, 
            height: '2px', 
            background: 'linear-gradient(to bottom, rgba(56, 189, 248, 0.2), transparent)', 
            pointerEvents: 'none' 
          }}></div>
          {activeView === 'generator' ? (
            !activeEntry ? (
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
                          {Array.isArray(activeEntry.output) && activeEntry.output.length > 0 
                            ? Object.keys(activeEntry.output[0]).map((key, idx) => (
                                <th key={idx} style={{ padding: '16px', borderBottom: '1px solid var(--border-color)', textTransform: 'capitalize' }}>
                                  {key.replace(/([A-Z])/g, ' $1').trim()}
                                </th>
                              ))
                            : <th style={{ padding: '16px' }}>Result</th>
                          }
                        </tr>
                      </thead>
                      <tbody>
                        {Array.isArray(activeEntry.output) && activeEntry.output.length > 0 ? activeEntry.output.map((row, idx) => (
                          <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                            {Object.values(row).map((val, colIdx) => (
                              <td key={colIdx} style={{ padding: '16px', verticalAlign: 'top', whiteSpace: 'pre-wrap' }}>
                                {typeof val === 'object' ? JSON.stringify(val) : String(val)}
                              </td>
                            ))}
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="10" style={{ padding: '16px', whiteSpace: 'pre-wrap' }}>
                              {typeof activeEntry.output === 'string' ? activeEntry.output : 'No formatted items found or malformed output.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <div className="glass" style={{ padding: '24px', borderRadius: '12px', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>
                    {activeEntry.output}
                  </div>
                )}
              </div>
            )
          ) : activeView === 'templates_library' ? (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Templates Library</h2>
                <button 
                  onClick={() => setShowTemplateModal(true)}
                  style={{ padding: '10px 24px', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
                >
                  + Create New Template
                </button>
              </div>
              {/* Folder Classification Grouping */}
              {Array.from(new Set(templates.map(t => t.category || 'General'))).map(category => (
                <div 
                  key={category} 
                  onDragOver={onDragOver}
                  onDrop={(e) => onDrop(e, category)}
                  style={{ 
                    marginBottom: '24px', 
                    padding: '20px', 
                    borderRadius: '16px', 
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div 
                    onClick={() => toggleFolder(category)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      paddingBottom: collapsedFolders.includes(category) ? '0' : '16px', 
                      borderBottom: collapsedFolders.includes(category) ? 'none' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {collapsedFolders.includes(category) ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{category}</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                      {templates.filter(tmp => (tmp.category || 'General') === category).length} Templates
                    </span>
                  </div>

                  {!collapsedFolders.includes(category) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
                    {templates.filter(tmp => (tmp.category || 'General') === category).map(tmp => (
                      <div 
                        key={tmp.id} 
                        draggable
                        onDragStart={(e) => onDragStart(e, tmp.id)}
                        className="glass template-card"
                        style={{ 
                          padding: '24px', 
                          borderRadius: '16px', 
                          display: 'flex', 
                          flexDirection: 'column', 
                          gap: '12px',
                          border: '1px solid var(--border-color)',
                          transition: 'all 0.3s',
                          cursor: 'grab'
                        }}
                      >
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{tmp.name}</h3>
                      <button onClick={(e) => deleteTemplate(tmp.id, e)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                        <Trash2 size={16} />
                      </button>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                      {tmp.content}
                    </p>
                    <div style={{ marginTop: 'auto', display: 'flex', gap: '8px' }}>
                      <button 
                        onClick={() => setPreviewTemplate(tmp)}
                        style={{ 
                          flex: 1, 
                          padding: '10px', 
                          borderRadius: '8px', 
                          background: 'var(--bg-tertiary)',
                          color: 'var(--text-secondary)',
                          fontWeight: '600'
                        }}
                      >
                        Preview
                      </button>
                      <button 
                        onClick={() => { setInput(tmp.content); setActiveView('generator'); }}
                        style={{ 
                          flex: 1, 
                          padding: '10px', 
                          borderRadius: '8px', 
                          background: 'var(--accent-primary)',
                          color: 'white',
                          fontWeight: '600'
                        }}
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                    ))}
                  </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="fade-in">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
                <h2 style={{ fontSize: '1.5rem' }}>Context Library</h2>
                <button 
                  onClick={() => setShowContextModal(true)}
                  style={{ padding: '10px 24px', background: 'var(--accent-primary)', color: 'white', borderRadius: '8px', fontWeight: 'bold' }}
                >
                  + Add Knowledge Asset
                </button>
              </div>
              {Array.from(new Set(contexts.map(c => c.type || 'General'))).map(category => (
                <div 
                  key={category} 
                  style={{ 
                    marginBottom: '24px', 
                    padding: '20px', 
                    borderRadius: '16px', 
                    background: 'var(--bg-secondary)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div 
                    onClick={() => toggleFolder(`Context_${category}`)}
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: '12px', 
                      paddingBottom: collapsedFolders.includes(`Context_${category}`) ? '0' : '16px', 
                      borderBottom: collapsedFolders.includes(`Context_${category}`) ? 'none' : '1px solid var(--border-color)',
                      cursor: 'pointer',
                      userSelect: 'none'
                    }}
                  >
                    {collapsedFolders.includes(`Context_${category}`) ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
                    <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', fontWeight: 'bold' }}>{category === 'PRD' || category === 'API' || category === 'LOG' || category === 'UX' || category === 'GEN' ? category : category} Assets</h3>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginLeft: 'auto' }}>
                      {contexts.filter(ctx => (ctx.type || 'General') === category).length} Items
                    </span>
                  </div>

                  {!collapsedFolders.includes(`Context_${category}`) && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '24px', marginTop: '24px' }}>
                      {contexts.filter(ctx => (ctx.type || 'General') === category).map(ctx => {
                          const isAttached = attachedContexts.find(p => p.id === ctx.id);
                          return (
                            <div 
                              key={ctx.id} 
                              className="glass template-card"
                              style={{ 
                                padding: '24px', 
                                borderRadius: '16px', 
                                display: 'flex', 
                                flexDirection: 'column', 
                                gap: '12px',
                                border: isAttached ? '2px solid var(--accent-primary)' : '1px solid var(--border-color)',
                                transition: 'all 0.3s'
                              }}
                            >
                              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                <div>
                                  <h3 style={{ fontSize: '1.1rem', color: 'var(--accent-primary)' }}>{ctx.title}</h3>
                                  <span style={{ fontSize: '0.75rem', background: 'rgba(56, 189, 248, 0.1)', color: 'var(--accent-primary)', padding: '2px 8px', borderRadius: '4px' }}>{ctx.type}</span>
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button onClick={(e) => { e.stopPropagation(); setEditContextModal({...ctx}); }} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                                     <Edit2 size={16} />
                                  </button>
                                  <button onClick={(e) => deleteContext(ctx.id, e)} style={{ background: 'transparent', color: 'var(--text-secondary)' }}>
                                     <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                              {ctx.files && ctx.files.length > 0 && (
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '8px' }}>
                                  {ctx.files.map((f, i) => (
                                    <span key={i} style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', background: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px', border: '1px solid var(--border-color)' }}>📎 {f}</span>
                                  ))}
                                </div>
                              )}
                              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical' }}>
                                {ctx.content}
                              </p>
                              <button 
                                onClick={() => setAttachedContexts(prev => isAttached ? prev.filter(p => p.id !== ctx.id) : [...prev, ctx])}
                                style={{ 
                                  marginTop: 'auto', 
                                  padding: '10px', 
                                  borderRadius: '8px', 
                                  background: isAttached ? 'var(--accent-primary)' : 'var(--bg-tertiary)',
                                  color: isAttached ? 'white' : 'var(--text-primary)',
                                  fontWeight: '600'
                                }}
                              >
                                {isAttached ? 'Attached ✓' : 'Attach Context'}
                              </button>
                            </div>
                          );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Resizable Input Area */}
        <div style={{ position: 'relative', borderTop: '1px solid var(--border-color)', background: 'var(--bg-secondary)', padding: '0 32px 32px 32px' }}>
          {/* Drag Handle */}
          <div 
            onMouseDown={handleMouseDown}
            style={{ 
              height: '16px', 
              cursor: 'ns-resize', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'absolute',
              top: '-8px',
              left: '0',
              right: '0',
              zIndex: 10
            }}
          >
            <div style={{ 
              width: '40px', 
              height: '4px', 
              borderRadius: '2px', 
              background: isResizing ? 'var(--accent-primary)' : 'var(--border-color)',
              opacity: 0.6
            }}></div>
          </div>

          <div style={{ paddingTop: '24px' }}>
          <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>LLM:</span>
              <select 
                value={selectedProvider} 
                onChange={(e) => setSelectedProvider(e.target.value)}
                style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-color)', padding: '6px 10px', borderRadius: '6px' }}
              >
                {providers.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            
            {/* Added Template Indicator */}
            {selectedTemplate && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(56, 189, 248, 0.1)', borderRadius: '50px', border: '1px solid var(--accent-primary)' }}>
                <span style={{ fontSize: '0.75rem' }}>Template: {selectedTemplate.name}</span>
                <X size={12} cursor="pointer" onClick={() => setSelectedTemplate(null)} style={{ color: 'var(--text-secondary)' }} />
              </div>
            )}

            {/* Added Context Indicator */}
            {attachedContexts.length > 0 && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '4px 12px', background: 'rgba(16, 185, 129, 0.1)', borderRadius: '50px', border: '1px solid var(--success-color)' }}>
                <span style={{ fontSize: '0.75rem' }}>Attached Contexts: {attachedContexts.length}</span>
                <Trash2 size={12} cursor="pointer" onClick={() => setAttachedContexts([])} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginLeft: 'auto' }}>
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
                  height: `${inputHeight}px`, 
                  background: 'var(--bg-primary)', 
                  color: 'var(--text-primary)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '16px',
                  paddingRight: '60px',
                  resize: 'none',
                  outline: 'none',
                  transition: isResizing ? 'none' : 'height 0.1s'
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
      </div>
    </main>

      {/* Modals */}
      {previewTemplate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 110 }}>
          <div className="glass" style={{ width: '800px', maxHeight: '80vh', padding: '40px', borderRadius: '24px', display: 'flex', flexDirection: 'column', gap: '24px', position: 'relative' }}>
            <button 
              onClick={() => setPreviewTemplate(null)}
              style={{ position: 'absolute', top: '24px', right: '24px', background: 'transparent', color: 'var(--text-secondary)' }}
            >
              <Trash2 size={24} style={{ transform: 'rotate(45deg)' }} />
            </button>
            <h2 style={{ fontSize: '1.75rem', color: 'var(--accent-primary)' }}>{previewTemplate.name}</h2>
            <div style={{ 
                flex: 1, 
                overflowY: 'auto', 
                background: 'var(--bg-secondary)', 
                padding: '24px', 
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                lineHeight: '1.6',
                fontFamily: 'monospace',
                whiteSpace: 'pre-wrap',
                fontSize: '0.9rem'
            }}>
              {previewTemplate.content}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px' }}>
              <button 
                onClick={() => setPreviewTemplate(null)}
                style={{ padding: '12px 32px', borderRadius: '12px', background: '#10b981', color: 'white', fontWeight: 'bold' }}
              >
                Close Preview
              </button>
              <button 
                onClick={() => { setInput(previewTemplate.content); setPreviewTemplate(null); setActiveView('generator'); }}
                style={{ padding: '12px 32px', borderRadius: '12px', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold' }}
              >
                Use This Template
              </button>
            </div>
          </div>
        </div>
      )}

      {showTemplateModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass" style={{ width: '500px', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h2>New Prompt Template</h2>
            <input 
              placeholder="Template Name (e.g. API Functional Tests)" 
              value={newTemplate.name} 
              onChange={e => setNewTemplate({...newTemplate, name: e.target.value})}
              style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
            />
            <input 
              placeholder="Folder/Category (e.g. API, Functional, UI)" 
              value={newTemplate.category || ''} 
              onChange={e => setNewTemplate({...newTemplate, category: e.target.value})}
              style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
            />
            <textarea 
              placeholder="Prompt Content..." 
              value={newTemplate.content} 
              onChange={e => setNewTemplate({...newTemplate, content: e.target.value})}
              style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', height: '200px' }}
            />
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button onClick={() => setShowTemplateModal(false)} style={{ padding: '10px 20px', borderRadius: '8px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>Cancel</button>
              <button onClick={handleAddTemplate} style={{ padding: '10px 20px', borderRadius: '8px', background: 'var(--accent-primary)', color: 'white' }}>Save Template</button>
            </div>
          </div>
        </div>
      )}

      {showContextModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass" style={{ width: '500px', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>Create Knowledge Asset</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Asset Category</label>
              <select 
                value={newContext.type} 
                onChange={e => setNewContext({...newContext, type: e.target.value})}
                style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
              >
                <option value="PRD">📄 PRD / Specification</option>
                <option value="API">🔌 API Documentation</option>
                <option value="LOG">🗄️ System Logs</option>
                <option value="UX">🎨 UI/UX Mockup</option>
                <option value="GEN">💡 General Knowledge</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Attach Files</label>
              <input 
                type="file" 
                multiple
                onChange={e => setNewContext({...newContext, files: Array.from(e.target.files).map(f => f.name), title: Array.from(e.target.files).map(f => f.name).join(', ') || newContext.title})}
                style={{ padding: '10px', background: 'var(--bg-tertiary)', borderRadius: '8px', color: 'var(--text-secondary)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Context Description</label>
              <textarea 
                placeholder="Paste content or describe the requirement..." 
                value={newContext.content} 
                onChange={e => setNewContext({...newContext, content: e.target.value, title: newContext.files.length > 0 ? newContext.title : e.target.value.substring(0, 30)})}
                style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', height: '150px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button 
                onClick={() => setShowContextModal(false)} 
                style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleAddContext} 
                style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold' }}
              >
                Create Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {editContextModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
          <div className="glass" style={{ width: '500px', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <h2 style={{ fontSize: '1.5rem', color: 'var(--accent-primary)' }}>Edit Knowledge Asset</h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Asset Title</label>
              <input 
                type="text"
                value={editContextModal.title} 
                onChange={e => setEditContextModal({...editContextModal, title: e.target.value})}
                style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Asset Category</label>
              <select 
                value={editContextModal.type} 
                onChange={e => setEditContextModal({...editContextModal, type: e.target.value})}
                style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)' }}
              >
                <option value="PRD">📄 PRD / Specification</option>
                <option value="API">🔌 API Documentation</option>
                <option value="LOG">🗄️ System Logs</option>
                <option value="UX">🎨 UI/UX Mockup</option>
                <option value="GEN">💡 General Knowledge</option>
                <option value="Template">🎯 Plan Template</option>
              </select>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 'bold' }}>Context Description</label>
              <textarea 
                value={editContextModal.content} 
                onChange={e => setEditContextModal({...editContextModal, content: e.target.value})}
                style={{ padding: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', height: '200px' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '12px' }}>
              <button 
                onClick={() => setEditContextModal(null)} 
                style={{ padding: '12px 24px', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}
              >
                Cancel
              </button>
              <button 
                onClick={handleEditContextSave} 
                style={{ padding: '12px 24px', borderRadius: '12px', background: 'var(--accent-primary)', color: 'white', fontWeight: 'bold' }}
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .entry-card:hover {
          background: var(--card-hover-bg) !important;
        }
        .glass {
          background: var(--glass-bg);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid var(--glass-border);
        }
        .template-card:hover {
          transform: translateY(-4px);
          background: var(--card-hover-bg);
          box-shadow: 0 10px 30px var(--glass-shadow);
        }
      `}</style>
      {deleteConfirm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
          <div className="glass" style={{ width: '400px', padding: '32px', borderRadius: '16px', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '20px' }}>
             <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
               <Trash2 size={24} />
             </div>
             <h3 style={{ fontSize: '1.25rem' }}>Delete {deleteConfirm.type}?</h3>
             <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{deleteConfirm.message}</p>
             <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button 
                  onClick={() => setDeleteConfirm(null)}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#10b981', color: 'white', fontWeight: 'bold' }}
                >
                  No, Cancel
                </button>
                <button 
                  onClick={async () => {
                    await deleteConfirm.action();
                    setDeleteConfirm(null);
                  }}
                  style={{ flex: 1, padding: '12px', borderRadius: '12px', background: '#ef4444', color: 'white', fontWeight: 'bold' }}
                >
                  Yes, Delete
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MainPage;
