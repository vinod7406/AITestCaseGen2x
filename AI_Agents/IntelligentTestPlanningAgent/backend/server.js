const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());

// Mock Jira Connection
app.post('/api/jira/test', (req, res) => {
    const { url, email, token } = req.body;
    if (url && email && token) {
        res.json({ success: true, message: "Connected to Jira!" });
    } else {
        res.status(400).json({ success: false, message: "Missing required Jira credentials." });
    }
});

// Mock Fetch Jira Issues
app.post('/api/jira/fetch', (req, res) => {
    const { product, projectKey } = req.body;
    // Simulate some latency
    setTimeout(() => {
        const mockIssues = [
            { id: 'VWO-101', summary: 'Implement user login with MFA', type: 'Story' },
            { id: 'VWO-102', summary: 'Fix memory leak in dashboard', type: 'Bug' },
            { id: 'VWO-103', summary: 'Add automated logout on session expiry', type: 'Story' }
        ];
        res.json({ success: true, issues: mockIssues });
    }, 1500);
});

// Mock Generate Test Plan
app.post('/api/generate-plan', (req, res) => {
    const { issues, context } = req.body;
    setTimeout(() => {
        res.json({ 
            success: true, 
            plan: `## Software Test Plan: ${new Date().toLocaleDateString()}\n\n### 1. Overview\nGenerated for Project Key: VWOAPP\n\n### 2. Scope\nFocusing on ${issues.length} issues including MFA and memory leaks.\n\n### 3. Strategy\n- Automated Functional Testing\n- Security Boundary Testing\n- Performance Profiling\n\n### 4. Context\n${context || 'No additional context provided.'}` 
        });
    }, 3000);
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
