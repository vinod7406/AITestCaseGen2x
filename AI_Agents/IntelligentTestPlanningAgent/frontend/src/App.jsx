import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, BookOpen, Settings, ChevronLeft, 
  History, Target, CheckCircle2, Search, Zap, 
  FileText, Database, Shield, Github, Layers, 
  Plus, X, AlertCircle, ExternalLink, RefreshCw, BarChart, Cloud
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
  const [jiraConnected, setJiraConnected] = useState(true);
  const [jiraIssues, setJiraIssues] = useState([]);
  const [activeTab, setActiveTab] = useState('Intelligent Test Planning Agent');
  const [jiraForm, setJiraForm] = useState({ name: '', url: '', email: '', token: '' });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
    setLoading(true);
    setMessage('');
    try {
        const response = await fetch('/api/jira/test', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(jiraForm)
        });
        const data = await response.json();
        if (data.success) {
            setJiraConnected(true);
            setMessage('Connection saved successfully!');
            setTimeout(() => { setIsAddingJira(false); setMessage(''); }, 2000);
        } else {
            setMessage('Error: ' + data.message);
        }
    } catch (err) {
        setMessage('Backend error. Please try again.');
    } finally {
        setLoading(false);
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
                        onClick={() => setIsAddingJira(false)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', borderRadius: '8px', border: '1px solid #2563eb', background: 'transparent', color: '#2563eb', fontWeight: '600', marginBottom: '32px' }}
                    >
                        <Settings size={18} /> Cancel
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
                         <button 
                            disabled={loading}
                            onClick={handleSaveJira}
                            style={{ background: '#2563eb', color: '#fff', padding: '12px', borderRadius: '8px', fontWeight: '600', width: 'fit-content', paddingLeft: '32px', paddingRight: '32px' }}
                         >
                            {loading ? 'Saving...' : 'Save Connection'}
                         </button>
                         <button onClick={nextStep} style={{ background: '#2563eb', color: '#fff', padding: '16px', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', width: '100%' }}>Continue to Fetch Issues</button>
                    </div>
                </div>
            ) : (
                <>
                <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '32px', marginBottom: '40px' }}>
                    <h2 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '24px' }}>Jira Connection</h2>
                    <label>Select Jira Connection</label>
                    <select style={{ marginBottom: '20px' }}>
                        <option>VWO (https://bugzz.atlassian.net/)</option>
                    </select>
                    <button 
                        onClick={() => setIsAddingJira(true)}
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', border: '1px solid #2563eb', background: 'transparent', color: '#2563eb', fontWeight: '600' }}
                    >
                        <Plus size={18} /> Add New Connection
                    </button>
                    <button onClick={nextStep} style={{ width: '100%', marginTop: '32px', padding: '16px', background: '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '1rem' }}>Continue to Fetch Issues</button>
                </div>
                
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Import from Test Management Tools</h3>
                <p style={{ color: '#64748b', marginBottom: '32px' }}>Connect to your existing test case repositories and management platforms</p>
                
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
                        <div style={{ fontWeight: '600', color: '#1e293b' }}>VWO (https://bugzz.atlassian.net/)</div>
                    </div>
                    <button onClick={prevStep} style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.9rem', background: 'transparent' }}>Change</button>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px', marginBottom: '24px' }}>
                    <div>
                        <label>Product Name</label>
                        <input placeholder="e.g., App.vwo.com" />
                    </div>
                    <div>
                        <label>Project Key *</label>
                        <input placeholder="e.g., VWOAPP" />
                    </div>
                </div>

                <div style={{ marginBottom: '24px' }}>
                    <label>Sprint/Fix Version (Optional)</label>
                    <input placeholder="e.g., Sprint 15 or leave empty for all open issues" />
                </div>

                <div style={{ marginBottom: '32px' }}>
                    <label>Additional Context (Optional)</label>
                    <textarea style={{ minHeight: '120px' }} placeholder="Any additional information about the product, testing goals, or constraints..."></textarea>
                </div>

                <button 
                   onClick={nextStep}
                   style={{ width: '100%', padding: '16px', background: '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    <RefreshCw size={18} /> Fetch Jira Issues
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
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '8px' }}>Review Jira Issues (0)</h3>
                <p style={{ color: '#64748b', marginBottom: '32px', fontSize: '0.9rem' }}>Issues that will be used to generate the test plan</p>
                
                <button 
                    onClick={nextStep}
                    style={{ width: '100%', padding: '16px', background: '#2563eb', color: '#fff', borderRadius: '8px', fontWeight: '700', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}
                >
                    <Target size={20} /> Generate Test Plan
                </button>
            </div>
          </motion.div>
        );
      case 4:
        return (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div style={{ background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '64px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
                <FileText size={48} style={{ color: '#94a3b8' }} />
                <h3 style={{ fontSize: '1.25rem', fontWeight: '700' }}>No test plan generated yet</h3>
                <p style={{ color: '#64748b', textAlign: 'center' }}>Complete the previous steps to generate your test plan</p>
                <button onClick={() => setStep(1)} style={{ color: '#2563eb', fontWeight: '700', background: 'transparent', marginTop: '12px' }}>Go back to Setup</button>
            </div>
          </motion.div>
        );
      default: return null;
    }
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
                onClick={() => setActiveTab('Intelligent Test Planning Agent')} 
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
        <header style={{ padding: '40px 64px 20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                <div style={{ display: 'flex', gap: '24px', alignItems: 'center' }}>
                    <div style={{ width: '64px', height: '64px', background: '#eff6ff', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#2563eb' }}>
                        <Target size={32} />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: '800', color: '#1e293b' }}>Intelligent Test Planning Agent</h1>
                        <p style={{ color: '#64748b', fontSize: '1rem' }}>Generate comprehensive test plans from Jira requirements using AI</p>
                    </div>
                </div>
                <button style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '12px', border: '1px solid #2563eb', background: 'transparent', color: '#2563eb', fontWeight: '700', fontSize: '0.9rem' }}>
                    <History size={18} /> View History
                </button>
            </div>
            
            <Stepper currentStep={step} onStepClick={(s) => setStep(s)} />
        </header>

        <section style={{ flex: 1, padding: '0 64px 64px', maxWidth: '1000px', width: '100%' }}>
            <AnimatePresence mode="wait">
                {renderCurrentStep()}
            </AnimatePresence>
        </section>

        <footer style={{ padding: '20px 64px', borderTop: '1px solid #e2e8f0', background: '#fff', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
             <p style={{ color: '#94a3b8', fontSize: '0.75rem' }}>© 2026 TestingBuddy AI • Powered by Advanced GenAI</p>
        </footer>
      </main>
    </div>
  );
}
