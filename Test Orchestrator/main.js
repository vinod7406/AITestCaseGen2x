/**
 * Test Orchestrator - Main Application Logic
 * Feature 1: Jira Integration (Mock)
 * Feature 2: Test Plan Generation
 * Feature 3: Smart TC Generation
 */

const state = {
    config: {
        domain: localStorage.getItem('jira_domain') || '',
        email: localStorage.getItem('jira_email') || '',
        token: localStorage.getItem('jira_token') || ''
    },
    stories: [],
    testPlan: null,
    testCases: [],
    selectedTC: null,
    engine: 'Playwright'
};

const jiraStoriesMock = [
    { id: 'VWO-101', summary: 'As a user I want to login with valid credentials so that I can see my dashboard', module: 'Auth' },
    { id: 'VWO-102', summary: 'As an admin, I want to manage test campaigns to optimize digital growth', module: 'Campaigns' },
    { id: 'VWO-103', summary: 'As a user I want to reset my password via email verification link', module: 'Auth' }
];

// UI Elements
const syncBtn = document.getElementById('sync-jira');
const openSettings = document.getElementById('open-settings');
const closeSettings = document.getElementById('close-settings');
const saveSettings = document.getElementById('save-settings');
const settingsModal = document.getElementById('settings-modal');

const storyList = document.getElementById('story-list');
const navItems = document.querySelectorAll('.nav-links li');
const sections = document.querySelectorAll('.page-section');

// Modal Logic
openSettings.addEventListener('click', () => {
    document.getElementById('jira-domain').value = state.config.domain;
    document.getElementById('jira-email').value = state.config.email;
    document.getElementById('jira-token').value = state.config.token;
    settingsModal.style.display = 'flex';
});

closeSettings.addEventListener('click', () => {
    settingsModal.style.display = 'none';
});

saveSettings.addEventListener('click', () => {
    state.config.domain = document.getElementById('jira-domain').value.trim();
    state.config.email = document.getElementById('jira-email').value.trim();
    state.config.token = document.getElementById('jira-token').value.trim();
    
    localStorage.setItem('jira_domain', state.config.domain);
    localStorage.setItem('jira_email', state.config.email);
    localStorage.setItem('jira_token', state.config.token);
    
    settingsModal.style.display = 'none';
    alert('Settings Saved Successfully');
});

// Navigation Logic
navItems.forEach(item => {
    item.addEventListener('click', () => {
        const page = item.getAttribute('data-page');
        navItems.forEach(nav => nav.classList.remove('active'));
        item.classList.add('active');
        
        sections.forEach(sec => {
            sec.style.display = sec.id === `${page}-section` ? 'block' : 'none';
        });
    });
});

// Sync Jira Logic
syncBtn.addEventListener('click', async () => {
    let success = false;
    
    if (state.config.domain && state.config.token) {
        syncBtn.innerHTML = 'Connecting to Jira...';
        syncBtn.disabled = true;
        
        try {
            const auth = btoa(`${state.config.email}:${state.config.token}`);
            const response = await fetch(`https://${state.config.domain}.atlassian.net/rest/api/3/search?jql=issuetype=Story`, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                }
            });

            if (!response.ok) throw new Error('Jira Auth Failed');
            
            const data = await response.json();
            state.stories = data.issues.map(issue => ({
                id: issue.key,
                summary: issue.fields.summary,
                module: issue.fields.project.name
            }));
            success = true;
        } catch (err) {
            console.error(err);
            alert('Jira Fetch Error. Running in Demo Mode with mock data.');
        } finally {
            syncBtn.innerHTML = 'Sync Jira';
            syncBtn.disabled = false;
        }
    } else {
        alert('Jira Settings not found. Running in Demo Mode with mock data.');
    }

    if (!success) {
        state.stories = jiraStoriesMock;
    }

    renderStories();
    generateTestPlan();
    generateTestCases();
});

function renderStories() {
    storyList.innerHTML = state.stories.map(story => `
        <div class="story-card">
            <span class="story-tag">${story.id}</span>
            <h3 style="margin: 0.75rem 0">${story.summary}</h3>
            <p style="color: var(--text-secondary); font-size: 0.85rem">Module: ${story.module}</p>
        </div>
    `).join('');
}

function generateTestPlan() {
    state.testPlan = `# Enterprise Test Plan: VWO Release v2.4\n\n## Objectives\nValidate core authentication and campaign flows.\n\n## Scope\n- ${state.stories.map(s => s.id).join(', ')}`;
    document.getElementById('plan-viewer').innerHTML = `<pre style="white-space: pre-wrap">${state.testPlan}</pre>`;
}

function generateTestCases() {
    state.testCases = state.stories.flatMap(story => ([
        { id: `TC-${story.id}-01`, category: 'Functional', summary: `Verify successful flow for ${story.id}`, priority: 'High', steps: '1. Navigate\n2. Perform action\n3. Verify result' },
        { id: `TC-${story.id}-02`, category: 'Negative', summary: `Verify failure handling for ${story.id}`, priority: 'Medium', steps: '1. Input invalid data\n2. Click submit\n3. Check error' }
    ]));
    
    renderTestCases();
}

function renderTestCases() {
    const tbody = document.getElementById('tc-body');
    tbody.innerHTML = state.testCases.map(tc => `
        <tr onclick="generateCode('${tc.id}')" style="cursor: pointer">
            <td>${tc.id}</td>
            <td><span class="story-tag">${tc.category}</span></td>
            <td>${tc.summary}</td>
            <td style="color: #F43F5E; font-weight: 600">${tc.priority}</td>
            <td><button class="btn btn-secondary" style="font-size: 0.7rem">Select</button></td>
        </tr>
    `).join('');
}

window.generateCode = (tcId) => {
    const tc = state.testCases.find(t => t.id === tcId);
    state.selectedTC = tc;
    
    // Switch to code section
    document.querySelector('[data-page="code"]').click();
    
    const code = `
/**
 * Automation Generated for ${tc.id}
 * Summary: ${tc.summary}
 */
const { test, expect } = require('@playwright/test');

test('test execution for ${tc.id}', async ({ page }) => {
    await page.goto('https://app.vwo.com');
    // Steps: ${tc.steps.replace(/\n/g, ' ')}
    await expect(page).toBeVisible();
});
    `;
    document.getElementById('code-output').innerText = code.trim();
};
