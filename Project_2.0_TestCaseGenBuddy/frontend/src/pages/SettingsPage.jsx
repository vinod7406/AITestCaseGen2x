import React, { useState, useEffect } from 'react';
import { ArrowLeft, Save, Activity, CheckCircle, XCircle, Loader } from 'lucide-react';
import { Link } from 'react-router-dom';
import { settingsApi, llmApi } from '../services/api';

const SettingsPage = () => {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState({}); // provider -> loading state
  const [testResults, setTestResults] = useState({}); // provider -> result
  const [toast, setToast] = useState(null); // { message, type }

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await settingsApi.get();
      setSettings(res.data);
    } catch (err) {
      console.error('Failed to fetch settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await settingsApi.update(settings);
      showToast('Settings saved successfully!');
    } catch (err) {
      showToast('Failed to save settings: ' + err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const testConnection = async (provider) => {
    setTesting(prev => ({ ...prev, [provider]: true }));
    try {
      const res = await llmApi.testConnection(provider);
      setTestResults(prev => ({ ...prev, [provider]: res.data.success ? 'success' : 'fail' }));
    } catch (err) {
      setTestResults(prev => ({ ...prev, [provider]: 'fail' }));
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const updateProviderField = (provider, field, value) => {
    setSettings(prev => ({
      ...prev,
      [provider]: {
        ...prev[provider],
        [field]: value
      }
    }));
  };

  if (loading) return <div style={{ padding: '40px', color: 'var(--text-secondary)' }}>Loading settings...</div>;

  const providers = [
    { id: 'ollama', name: 'Ollama', hasUrl: true, hasKey: false },
    { id: 'lmStudio', name: 'LM Studio', hasUrl: true, hasKey: false },
    { id: 'groq', name: 'Groq', hasUrl: false, hasKey: true },
    { id: 'openai', name: 'OpenAI', hasUrl: false, hasKey: true },
    { id: 'claude', name: 'Anthropic Claude', hasUrl: false, hasKey: true },
    { id: 'gemini', name: 'Google Gemini', hasUrl: false, hasKey: true },
  ];

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }} className="fade-in">
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: 'var(--text-primary)' }}>
            <ArrowLeft size={24} />
          </Link>
          <h1>Settings</h1>
        </div>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            padding: '10px 20px', 
            background: 'var(--accent-primary)', 
            color: 'white', 
            borderRadius: '8px',
            fontWeight: 'bold',
            opacity: saving ? 0.7 : 1
          }}
        >
          {saving ? <Loader className="animate-spin" size={18} /> : <Save size={18} />}
          Save All
        </button>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {providers.map(p => (
          <section key={p.id} className="glass" style={{ padding: '24px', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ fontSize: '1.25rem' }}>{p.name}</h2>
              <button 
                onClick={() => testConnection(p.id)}
                disabled={testing[p.id]}
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  padding: '6px 12px', 
                  background: 'var(--bg-tertiary)', 
                  color: 'var(--text-primary)', 
                  borderRadius: '6px',
                  fontSize: '0.875rem'
                }}
              >
                {testing[p.id] ? <Loader className="animate-spin" size={14} /> : <Activity size={14} />}
                Test
                {testResults[p.id] === 'success' && <CheckCircle size={14} color="var(--success)" />}
                {testResults[p.id] === 'fail' && <XCircle size={14} color="var(--error)" />}
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {p.hasUrl && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Base URL</label>
                  <input 
                    type="text" 
                    value={settings[p.id].baseUrl || ''} 
                    onChange={(e) => updateProviderField(p.id, 'baseUrl', e.target.value)}
                    style={{ 
                      background: 'var(--bg-primary)', 
                      border: '1px solid var(--border-color)', 
                      color: 'white', 
                      padding: '8px 12px', 
                      borderRadius: '6px' 
                    }}
                  />
                </div>
              )}
              {p.hasKey && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>API Key</label>
                  <input 
                    type="password" 
                    value={settings[p.id].apiKey || ''} 
                    onChange={(e) => updateProviderField(p.id, 'apiKey', e.target.value)}
                    style={{ 
                      background: 'var(--bg-primary)', 
                      border: '1px solid var(--border-color)', 
                      color: 'white', 
                      padding: '8px 12px', 
                      borderRadius: '6px' 
                    }}
                  />
                </div>
              )}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Model Name</label>
                <input 
                  type="text" 
                  value={settings[p.id].model || ''} 
                  placeholder={p.id === 'ollama' ? 'gemma3:1b' : ''}
                  onChange={(e) => updateProviderField(p.id, 'model', e.target.value)}
                  style={{ 
                    background: 'var(--bg-primary)', 
                    border: '1px solid var(--border-color)', 
                    color: 'white', 
                    padding: '8px 12px', 
                    borderRadius: '6px' 
                  }}
                />
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* Toast Notification */}
      {toast && (
        <div 
          className="toast-in"
          style={{
            position: 'fixed',
            top: '40px',
            left: '40%',
            transform: 'translateX(-50%)',
            padding: '12px 24px',
            background: toast.type === 'error' ? 'var(--error)' : 'var(--accent-gradient)',
            color: 'white',
            borderRadius: '12px',
            boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            border: '1px solid rgba(255,255,255,0.2)',
            minWidth: '300px',
            justifyContent: 'center'
          }}
        >
          {toast.type === 'error' ? <XCircle size={20} /> : <CheckCircle size={20} />}
          <span style={{ fontWeight: '600' }}>{toast.message}</span>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;
