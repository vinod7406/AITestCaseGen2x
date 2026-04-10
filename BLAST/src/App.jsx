import React, { useState } from 'react';
import { 
  Network, LayoutGrid, FileText, ClipboardList, PenTool, 
  Settings, Moon, Sun, ChevronRight, CheckCircle2, 
  Database, GitBranch, Terminal, BarChart3, Cloud, 
  Search, Play, Github, Zap, User, FileCode, Beaker,
  MoreVertical, Clock, ExternalLink, RefreshCw
} from 'lucide-react';

// ─────────────────────────────────────────────────────
// UI Components & Styles
// ─────────────────────────────────────────────────────

const COLORS = {
  primary: '#e11d48',
  sidebarBg: '#ffffff',
  headerBg: '#e11d48',
  textMain: '#1e293b',
  textSub: '#64748b',
  border: '#e2e8f0',
  cardBg: '#ffffff',
  activeMenuItem: '#fff1f2',
  contentBg: '#f8fafc',
  dark: {
    sidebarBg: '#0f172a',
    textMain: '#f8fafc',
    textSub: '#94a3b8',
    border: '#1e293b',
    cardBg: '#1e293b',
    activeMenuItem: '#1e1b4b',
    contentBg: '#020617'
  }
};

const s = {
  app: (dm) => ({ display: 'flex', height: '100vh', background: dm ? COLORS.dark.contentBg : COLORS.contentBg, color: dm ? COLORS.dark.textMain : COLORS.textMain, transition: 'all 0.3s' }),
  sidebar: (dm) => ({ width: '280px', background: dm ? COLORS.dark.sidebarBg : COLORS.sidebarBg, borderRight: `1px solid ${dm ? COLORS.dark.border : COLORS.border}`, display: 'flex', flexDirection: 'column', height: '100%' }),
  sbHeader: { padding: '24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' },
  sbTitle: { fontSize: '1.25rem', fontWeight: '800', color: COLORS.primary, letterSpacing: '-0.5px' },
  menu: { flex: 1, overflowY: 'auto', padding: '12px' },
  menuItem: (active, dm) => ({
    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 16px', borderRadius: '12px',
    cursor: 'pointer', marginBottom: '4px', transition: 'all 0.2s',
    background: active ? (dm ? COLORS.dark.activeMenuItem : COLORS.activeMenuItem) : 'transparent',
    color: active ? COLORS.primary : (dm ? COLORS.dark.textMain : COLORS.textMain),
    fontWeight: active ? '600' : '400'
  }),
  menuIcon: (active, dm) => ({ color: active ? COLORS.primary : (dm ? COLORS.dark.textSub : COLORS.textSub), width: '20px', height: '20px' }),
  
  main: { flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' },
  header: { 
    height: '70px', background: COLORS.headerBg, display: 'flex', alignItems: 'center', 
    justifyContent: 'space-between', padding: '0 32px', color: '#fff' 
  },
  content: { flex: 1, overflowY: 'auto', padding: '40px' },
  
  card: (dm) => ({ background: dm ? COLORS.dark.cardBg : COLORS.cardBg, borderRadius: '20px', border: `1px solid ${dm ? COLORS.dark.border : COLORS.border}`, padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.03)', marginBottom: '32px' }),
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' },
  
  input: (dm) => ({ width: '100%', padding: '12px 16px', borderRadius: '10px', border: `1px solid ${dm ? COLORS.dark.border : COLORS.border}`, background: dm ? '#0f172a' : '#f1f5f9', color: dm ? '#fff' : '#000', fontSize: '0.95rem', marginBottom: '16px', outline: 'none' }),
  label: (dm) => ({ display: 'block', fontSize: '0.85rem', fontWeight: '600', color: dm ? COLORS.dark.textSub : COLORS.textMain, marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }),
  btn: { padding: '12px 24px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' },
  btnPrimary: { background: COLORS.primary, color: '#fff' },
  btnOutline: (dm) => ({ background: 'transparent', border: `1px solid ${dm ? COLORS.dark.border : COLORS.border}`, color: dm ? COLORS.dark.textMain : COLORS.textMain }),
  
  badge: { padding: '4px 12px', borderRadius: '99px', fontSize: '0.75rem', fontWeight: '700', textTransform: 'uppercase' },
  badgeInfo: { background: '#fef2f2', color: COLORS.primary, border: `1px solid #fee2e2` }
};

// ─────────────────────────────────────────────────────
// App Component
// ─────────────────────────────────────────────────────

export default function App() {
  const [activeTab, setActiveTab] = useState('GitHub');
  const [darkMode, setDarkMode] = useState(false);

  const menu = [
    { name: 'Test Connection', icon: Network },
    { name: 'Create Test Plan', icon: ClipboardList },
    { name: 'Create Test Cases', icon: PenTool },
    { name: 'Create Test Scenarios', icon: LayoutGrid },
    { name: 'Review Test Cases', icon: FileText },
    { type: 'label', name: 'Automation' },
    { name: 'Selenium BDD', icon: FileCode, sub: true },
    { name: 'PW TS + BDD', icon: Zap, sub: true },
    { name: 'GitHub', icon: Github },
    { name: 'GitHub CICD', icon: Cloud },
    { name: 'Settings', icon: Settings },
  ];

  const repos = [
    { name: 'ht-test-agent-core', branch: 'main', sync: '2 hours ago', status: 'Active', icon: Database },
    { name: 'playwright-ui-suite', branch: 'develop', sync: 'Oct 24, 2023', status: 'Active', icon: 'JS' },
    { name: 'legacy-bdd-features', branch: 'archive/v2', sync: 'Aug 12, 2023', status: 'Paused', icon: FileText },
  ];

  const pushHistory = [
    { time: 'TODAY, 14:22', title: 'BDD Feature Pushed', desc: 'user-auth-flow.feature → main', user: 'admin_root', status: 'pass' },
    { time: 'TODAY, 09:15', title: 'Playwright Script Update', desc: 'checkout-validation.spec.js', user: 'moreshwar_qa', status: 'pass' },
    { time: 'YESTERDAY, 18:40', title: 'System Sync Event', desc: 'Automated BDD sync completed', user: 'Agent Alpha', status: 'sync' },
    { time: 'YESTERDAY, 11:10', title: 'Repo Initialized', desc: 'ht-test-agent-core', user: 'Moreshwar', status: 'init' },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'Test Connection':
        return (
          <div>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px', letterSpacing: '-1px' }}>Connection Settings</h2>
              <p style={{ color: darkMode ? COLORS.dark.textSub : COLORS.textSub, fontSize: '1.1rem' }}>Configure and verify connections to third-party services like JIRA, LLMs, Zephyr, and GitHub.</p>
            </div>
            <div style={s.grid}>
              <div style={s.card(darkMode)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                     <div style={{ padding: '12px', background: '#fef2f2', borderRadius: '12px', color: COLORS.primary }}><Database /></div>
                     <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>JIRA</h3>
                  </div>
                  <span style={s.badgeInfo}>Config Required</span>
                </div>
                <label style={s.label(darkMode)}>JIRA URL</label>
                <input style={s.input(darkMode)} placeholder="https://your-domain.atlassian.net" />
                <label style={s.label(darkMode)}>User Email</label>
                <input style={s.input(darkMode)} placeholder="you@company.com" />
                <label style={s.label(darkMode)}>API Token</label>
                <input style={s.input(darkMode)} type="password" placeholder="Enter your Jira API token" />
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button style={{ ...s.btn, ...s.btnOutline(darkMode), flex: 1 }}>Test Connection</button>
                   <button style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}>Save Connection</button>
                </div>
              </div>
              <div style={s.card(darkMode)}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                     <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '12px', color: '#2563eb' }}><Zap /></div>
                     <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>LLM Provider</h3>
                  </div>
                  <span style={{ ...s.badge, background: '#eff6ff', color: '#2563eb', border: '1px solid #dbeafe' }}>Config Required</span>
                </div>
                <label style={s.label(darkMode)}>Provider</label>
                <select style={{ ...s.input(darkMode), appearance: 'none' }}>
                    <option>Groq</option>
                    <option>OpenAI</option>
                </select>
                <label style={s.label(darkMode)}>Model</label>
                <input style={s.input(darkMode)} placeholder="llama3-70b" />
                <label style={s.label(darkMode)}>API Key</label>
                <input style={s.input(darkMode)} type="password" placeholder="sk-..." />
                <div style={{ display: 'flex', gap: '12px' }}>
                   <button style={{ ...s.btn, ...s.btnOutline(darkMode), flex: 1 }}>Test Connection</button>
                   <button style={{ ...s.btn, ...s.btnPrimary, flex: 1 }}>Save Connection</button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'Create Test Plan':
        return (
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ flex: '0 0 450px' }}>
               <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>Test Plan Generator</h2>
                  <p style={{ color: darkMode ? COLORS.dark.textSub : COLORS.textSub }}>Transform JIRA user stories into comprehensive, machine-readable markdown test plans with editorial precision and automated edge-case detection.</p>
               </div>
               
               <div style={s.card(darkMode)}>
                  <div style={{ marginBottom: '24px' }}>
                    <label style={s.label(darkMode)}>Target JIRA Ticket ID</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <input style={{ ...s.input(darkMode), marginBottom: 0 }} placeholder="QA-8429" />
                        <button style={{ ...s.btn, ...s.btnOutline(darkMode), padding: '0 16px', background: darkMode ? '#0f172a' : '#f1f5f9' }}>
                           <Search size={20} color={COLORS.primary} />
                        </button>
                    </div>
                  </div>

                  <div style={{ marginBottom: '24px' }}>
                     <label style={s.label(darkMode)}>Additional Context (Optional)</label>
                     <textarea style={{ ...s.input(darkMode), minHeight: '180px', resize: 'none' }} placeholder="Focus on edge cases for mobile devices..."></textarea>
                  </div>

                  <button style={{ ...s.btn, ...s.btnPrimary, width: '100%', padding: '16px', marginBottom: '12px' }}>
                     <Zap size={18} fill="white" /> Fetch Preview
                  </button>
                  <button disabled style={{ ...s.btn, ...s.btnOutline(darkMode), width: '100%', padding: '16px', marginBottom: '12px', background: darkMode ? '#0f172a' : '#f1f5f9', cursor: 'not-allowed' }}>
                     <FileText size={18} /> Generate .md Plan
                  </button>
                  <button disabled style={{ ...s.btn, ...s.btnOutline(darkMode), width: '100%', padding: '16px', background: darkMode ? '#0f172a' : '#f1f5f9', cursor: 'not-allowed' }}>
                     <Cloud size={18} /> Push to Confluence
                  </button>
               </div>
            </div>

            <div style={{ flex: 1 }}>
               <div style={{ marginBottom: '12px', fontSize: '1rem', fontWeight: 'bold', color: darkMode ? COLORS.dark.textSub : COLORS.textSub }}>
                  No ticket loaded — enter a JIRA ID and click Fetch
               </div>
               <div style={{ ...s.card(darkMode), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '603px', background: darkMode ? 'rgba(15,23,42,0.5)' : '#fff', borderStyle: 'solid', borderColor: darkMode ? COLORS.dark.border : COLORS.border }}>
                    <ClipboardList size={60} style={{ color: darkMode ? '#1e293b' : '#e2e8f0', marginBottom: '24px' }} />
                    <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: darkMode ? '#475569' : '#cbd5e1', marginBottom: '12px' }}>Test Plan Canvas</h3>
                    <p style={{ color: darkMode ? '#334155' : '#94a3b8', fontSize: '1rem', maxWidth: '350px', textAlign: 'center', lineHeight: '1.6' }}>
                        Fetch a JIRA ticket to preview requirements,<br />then generate a professional test plan.
                    </p>
               </div>
            </div>
          </div>
        );

      case 'Create Test Scenarios':
        return (
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ flex: '0 0 450px' }}>
               <div style={{ marginBottom: '24px' }}>
                  <h2 style={{ fontSize: '2.2rem', fontWeight: '800', marginBottom: '8px' }}>Test Scenarios</h2>
                  <p style={{ color: darkMode ? COLORS.dark.textSub : COLORS.textSub }}>Generate high-level scenarios from requirements.</p>
               </div>
               <div style={s.card(darkMode)}>
                  <label style={s.label(darkMode)}>Manual Requirement / PRD</label>
                  <textarea style={{ ...s.input(darkMode), minHeight: '180px', resize: 'none' }} placeholder="Paste requirement text..."></textarea>
                  
                  <label style={s.label(darkMode)}>Additional Context (Optional)</label>
                  <textarea style={{ ...s.input(darkMode), minHeight: '100px', resize: 'none' }} placeholder="Include performance or security scenarios..."></textarea>
                  
                  <button style={{ ...s.btn, ...s.btnPrimary, width: '100%', padding: '16px', marginBottom: '12px' }}>
                     <Zap size={18} fill="white" /> Fetch Preview
                  </button>
                  <button disabled style={{ ...s.btn, ...s.btnOutline(darkMode), width: '100%', padding: '16px', marginBottom: '12px', background: darkMode ? '#0f172a' : '#f1f5f9', cursor: 'not-allowed' }}>
                     <LayoutGrid size={18} /> Generate Scenarios
                  </button>
                  <button disabled style={{ ...s.btn, ...s.btnOutline(darkMode), width: '100%', padding: '16px', background: darkMode ? '#0f172a' : '#f1f5f9', cursor: 'not-allowed' }}>
                     <Cloud size={18} /> Upload to Zephyr
                  </button>
               </div>
            </div>
            <div style={{ flex: 1, ...s.card(darkMode), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '600px', background: darkMode ? 'rgba(15,23,42,0.5)' : '#fff', borderStyle: 'dashed' }}>
                 <h3 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: darkMode ? '#475569' : '#cbd5e1', marginBottom: '12px' }}>Scenario Canvas</h3>
                 <p style={{ color: darkMode ? '#334155' : '#e2e8f0', fontSize: '1rem', maxWidth: '300px', textAlign: 'center' }}>Fetch a JIRA ticket to generate high-level test scenarios.</p>
            </div>
          </div>
        );

      case 'GitHub':
        return (
          <div style={{ display: 'flex', gap: '40px' }}>
            <div style={{ flex: 1 }}>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
                  <div>
                    <h2 style={{ fontSize: '2.5rem', fontWeight: '800', marginBottom: '8px' }}>GitHub Integration</h2>
                    <p style={{ color: darkMode ? COLORS.dark.textSub : COLORS.textSub, fontSize: '1.1rem', maxWidth: '600px' }}>
                        Manage your automated test suites, synchronize Playwright scripts, and monitor BDD repository health.
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '12px' }}>
                     <button style={{ ...s.btn, ...s.btnOutline(darkMode), background: darkMode ? '#1e293b' : '#f1f5f9' }}>Manage Repos</button>
                     <button style={{ ...s.btn, ...s.btnPrimary, background: COLORS.primary }}>
                        <RefreshCw size={18} /> Sync with GitHub
                     </button>
                  </div>
               </div>
               
               <div style={s.card(darkMode)}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
                    <Network color={COLORS.primary} size={28} />
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>Connected Repositories</h3>
                  </div>
                  
                  {repos.map((repo, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', padding: '20px', background: darkMode ? '#0f172a' : '#f8fafc', borderRadius: '16px', marginBottom: '16px', border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}` }}>
                        <div style={{ width: '48px', height: '48px', background: darkMode ? '#1e293b' : '#fff', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginRight: '20px', border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}` }}>
                           {typeof repo.icon === 'string' ? repo.icon : <repo.icon size={24} color={COLORS.primary} />}
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{repo.name}</div>
                            <div style={{ fontSize: '0.85rem', color: darkMode ? COLORS.dark.textSub : COLORS.textSub, display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <GitBranch size={14} /> {repo.branch}
                            </div>
                        </div>
                        <div style={{ textAlign: 'right', marginRight: '40px' }}>
                            <div style={{ fontSize: '0.7rem', color: darkMode ? COLORS.dark.textSub : COLORS.textSub, textTransform: 'uppercase', fontWeight: 'bold' }}>Last Sync</div>
                            <div style={{ fontWeight: '600' }}>{repo.sync}</div>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 12px', borderRadius: '99px', background: repo.status === 'Active' ? '#f0fdf4' : '#f1f5f9', color: repo.status === 'Active' ? '#166534' : '#64748b', fontSize: '0.8rem', fontWeight: 'bold' }}>
                            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: repo.status === 'Active' ? '#22c55e' : '#94a3b8' }}></div>
                            {repo.status}
                        </div>
                        <button style={{ marginLeft: '20px', background: 'transparent', border: 'none', color: COLORS.textSub }}><MoreVertical size={20}/></button>
                    </div>
                  ))}
               </div>
            </div>
            
            <div style={{ width: '350px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Clock size={20} />
                        <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold' }}>Push History</h3>
                    </div>
                    <span style={{ fontSize: '0.7rem', fontWeight: '900', color: COLORS.primary, background: '#fef2f2', padding: '2px 8px', borderRadius: '4px' }}>LIVE</span>
                </div>
                
                <div style={{ position: 'relative', paddingLeft: '24px' }}>
                    <div style={{ position: 'absolute', left: '7px', top: '10px', bottom: '10px', width: '2px', background: darkMode ? '#1e293b' : '#e2e8f0' }}></div>
                    {pushHistory.map((item, i) => (
                        <div key={i} style={{ marginBottom: '32px', position: 'relative' }}>
                            <div style={{ position: 'absolute', left: '-22px', top: '4px', width: '12px', height: '12px', borderRadius: '50%', background: i === 0 ? COLORS.primary : (darkMode ? '#1e293b' : '#e2e8f0'), border: `3px solid ${dm ? COLORS.dark.sidebarBg : '#fff'}` }}></div>
                            <div style={{ fontSize: '0.75rem', color: darkMode ? COLORS.dark.textSub : COLORS.textSub, fontWeight: 'bold', marginBottom: '4px' }}>{item.time}</div>
                            <div style={{ fontWeight: 'bold', fontSize: '0.95rem', marginBottom: '4px' }}>{item.title}</div>
                            <div style={{ fontSize: '0.85rem', color: darkMode ? COLORS.dark.textSub : COLORS.textSub, marginBottom: '8px', fontFamily: 'monospace' }}>{item.desc}</div>
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: darkMode ? '#0f172a' : '#f8fafc', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', border: `1px solid ${darkMode ? '#1e293b' : '#e2e8f0'}` }}>
                                <User size={12} /> {item.user}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
          </div>
        );

      default:
        return (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60%', color: darkMode ? COLORS.dark.textSub : COLORS.textSub }}>
            <Terminal size={100} strokeWidth={1} style={{ opacity: 0.2, marginBottom: '20px' }} />
            <h2 style={{ fontWeight: 'bold', color: darkMode ? COLORS.dark.textMain : COLORS.textMain }}>{activeTab} Content</h2>
            <p>Module implementation coming soon...</p>
          </div>
        );
    }
  };

  const dm = darkMode; // shorthand

  return (
    <div style={s.app(dm)}>
      <aside style={s.sidebar(dm)}>
        <div style={s.sbHeader}>
          <div style={s.sbTitle}>COMMAND CENTER</div>
          <button style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: dm ? COLORS.dark.textSub : COLORS.textSub }}>
            <ChevronRight size={20} />
          </button>
        </div>
        <nav style={s.menu}>
          {menu.map((item, i) => (
            item.type === 'label' ? (
              <div key={i} style={{ padding: '20px 16px 8px', fontSize: '0.7rem', fontWeight: '800', color: dm ? COLORS.dark.textSub : COLORS.textSub, textTransform: 'uppercase', letterSpacing: '1px' }}>{item.name}</div>
            ) : (
              <div 
                key={i} 
                onClick={() => setActiveTab(item.name)}
                style={s.menuItem(activeTab === item.name, dm)}
              >
                <item.icon style={s.menuIcon(activeTab === item.name, dm)} />
                <span style={{ fontSize: '0.95rem' }}>{item.name}</span>
              </div>
            )
          ))}
        </nav>
        <div style={{ padding: '20px', borderTop: `1px solid ${dm ? COLORS.dark.border : COLORS.border}` }}>
          <div onClick={() => setDarkMode(!dm)} style={{ ...s.menuItem(false, dm), background: dm ? '#020617' : '#f8fafc', border: `1px solid ${dm ? COLORS.dark.border : COLORS.border}` }}>
             {dm ? <Sun size={18} /> : <Moon size={18} />}
             <span style={{ fontSize: '0.9rem' }}>{dm ? 'Light Mode' : 'Dark Mode'}</span>
          </div>
        </div>
      </aside>

      <main style={s.main}>
        <header style={s.header}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ fontWeight: '900', fontSize: '1.3rem', letterSpacing: '1px' }}>AI TEST COMMAND CENTER</div>
                <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 10px', borderRadius: '4px', fontSize: '0.65rem', fontWeight: 'bold', letterSpacing: '1px' }}>POWERED BY GENAI</span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>Moreshwar Landge</div>
                    <div style={{ fontSize: '0.65rem', opacity: 0.8, textTransform: 'uppercase', letterSpacing: '0.8px' }}>AI-Driven Test Automation Architect</div>
                </div>
                <div style={{ width: '40px', height: '40px', background: 'rgba(255,255,255,0.3)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>ML</div>
            </div>
        </header>

        <div style={s.content}>
           {renderContent()}
        </div>
      </main>
    </div>
  );
}
