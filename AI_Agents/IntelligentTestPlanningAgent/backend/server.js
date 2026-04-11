const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5005;

app.use(cors());
app.use(express.json());
const axios = require('axios');
const { marked } = require('marked');

// Real Jira Connection Test
app.post('/api/jira/test', async (req, res) => {
    let { url, email, token } = req.body;
    
    if (!url || !email || !token) {
        return res.status(400).json({ success: false, message: "Missing required Jira credentials." });
    }

    try {
        let domain = url.trim();
        if (domain.includes('.atlassian.net')) {
            domain = domain.split('.atlassian.net')[0] + '.atlassian.net';
        }
        if (!domain.startsWith('http')) domain = 'https://' + domain;

        const auth = Buffer.from(`${email.trim()}:${token.trim()}`).toString('base64');
        
        console.log(`Testing Jira connection to: ${domain}/rest/api/3/myself`);
        
        const response = await axios.get(`${domain}/rest/api/3/myself`, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Accept': 'application/json'
            },
            timeout: 10000
        });

        if (response.data && response.data.displayName) {
            return res.json({ 
                success: true, 
                message: `Successfully connected as "${response.data.displayName}" (${response.data.emailAddress})` 
            });
        }
        res.json({ success: true, message: "Successfully connected to Jira!" });
    } catch (err) {
        console.error('Jira Test Error:', err.response?.data || err.message);
        const errorDetail = err.response?.data?.errorMessages?.[0] || err.message;
        res.status(err.response?.status || 500).json({ 
            success: false, 
            message: `Connection Failed: ${errorDetail}` 
        });
    }
});

// Robust LLM Connection Test
app.post('/api/llm/test', async (req, res) => {
    const { provider, baseUrl, apiKey, model } = req.body;
    try {
        if (provider === 'Ollama' || provider === 'LM Studio') {
            const defaultUrl = provider === 'Ollama' ? 'http://127.0.0.1:11434' : 'http://127.0.0.1:1234';
            const base = baseUrl || defaultUrl;
            const checkUrl = base.endsWith('/') ? `${base.slice(0, -1)}` : base;
            const checkPath = provider === 'Ollama' ? '/api/tags' : '/v1/models';
            
            const response = await axios.get(`${checkUrl}${checkPath}`, { timeout: 5000 });
            
            if (provider === 'Ollama') {
                const models = response.data.models || [];
                const modelExists = models.some(m => m.name === model || m.model === model);
                if (!modelExists) {
                    return res.status(404).json({ success: false, message: `Ollama is running, but model '${model}' not found. Available: ${models.slice(0, 5).map(m => m.name).join(', ')}...` });
                }
            }
            return res.json({ success: true, message: `${provider} is reachable and model '${model}' is verified!` });
        }
        
        if (provider === 'Groq' || provider === 'OpenAI' || provider === 'Grok (xAI)') {
            const url = provider === 'Groq' ? 'https://api.groq.com/openai/v1/models' : 
                        provider === 'OpenAI' ? 'https://api.openai.com/v1/models' : 
                        'https://api.x.ai/v1/models';
            
            const response = await axios.get(url, {
                headers: { 'Authorization': `Bearer ${apiKey}` }
            });

            // Check if specific model exists in the list
            const models = response.data.data || [];
            const modelExists = models.some(m => m.id === model);
            if (!modelExists && model) {
                return res.status(404).json({ success: false, message: `${provider} connected, but model '${model}' not found. Available: ${models.slice(0, 5).map(m => m.id).join(', ')}...` });
            }

            return res.json({ success: true, message: `${provider} API validated and model '${model}' verified!` });
        }

        if (provider === 'Gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
            const response = await axios.get(url);
            const models = response.data.models || [];
            // Gemini models usually look like 'models/gemini-pro'
            const modelExists = models.some(m => m.name === model || m.name === `models/${model}`);
            if (!modelExists && model) {
                return res.status(404).json({ success: false, message: `Gemini connected, but model '${model}' not found. Available: ${models.slice(0, 5).map(m => m.name.replace('models/', '')).join(', ')}...` });
            }
            return res.json({ success: true, message: "Gemini API validated and model verified!" });
        }

        if (provider === 'Claude') {
            // Anthropic doesn't have a simple public models list endpoint like OpenAI
            // We verify by doing a small chat completion with max_tokens=1
            const url = 'https://api.anthropic.com/v1/messages';
            try {
                await axios.post(url, {
                    model: model || 'claude-3-5-sonnet-20240620',
                    max_tokens: 1,
                    messages: [{ role: 'user', content: 'hi' }]
                }, {
                    headers: { 
                        'x-api-key': apiKey,
                        'anthropic-version': '2023-06-01',
                        'content-type': 'application/json'
                    }
                });
                return res.json({ success: true, message: `Claude API and model '${model}' validated!` });
            } catch (claudeErr) {
                return res.status(401).json({ success: false, message: `Claude validation failed: ${claudeErr.response?.data?.error?.message || claudeErr.message}` });
            }
        }

        res.status(400).json({ success: false, message: "Unsupported provider for testing." });
    } catch (err) {
        console.error('LLM Test Error:', err.response?.data || err.message);
        const errorMsg = err.response?.data?.error?.message || err.message;
        res.status(500).json({ success: false, message: `Connection failed: ${errorMsg}` });
    }
});

// Real Jira Fetch Flow
app.post('/api/jira/fetch', async (req, res) => {
    let { url, email, token, projectKey } = req.body;
    
    if (!url || !email || !token || !projectKey) {
        return res.status(400).json({ success: false, message: "Missing required Jira parameters." });
    }

    try {
        // Robust URL sanitization - ensure we only have the base domain
        let domain = url.trim();
        if (domain.includes('.atlassian.net')) {
            domain = domain.split('.atlassian.net')[0] + '.atlassian.net';
        }
        if (!domain.startsWith('http')) domain = 'https://' + domain;
        
        const auth = Buffer.from(`${email.trim()}:${token.trim()}`).toString('base64');
        
        // Sanitize projectKey - it might be a key OR a full URL
        let targetKey = projectKey.trim();
        if (targetKey.includes('/browse/')) {
            targetKey = targetKey.split('/browse/')[1].split('/')[0].split('?')[0];
        }
        
        console.log(`Jira Request: Domain [${domain}] | Target [${targetKey}]`);

        // If it looks like a specific issue (e.g., VS-3)
        const isSpecificIssue = /[A-Z]+-\d+/.test(targetKey);

        if (isSpecificIssue) {
            const apiURL = `${domain}/rest/api/3/issue/${targetKey}`;
            console.log(`Fetching specific issue from: ${apiURL}`);
            
            const response = await axios.get(apiURL, {
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                }
            });

            const issue = {
                id: response.data.key,
                summary: response.data.fields.summary,
                description: response.data.fields.description?.content?.map(c => c.content?.map(inner => inner.text).join('')).join('\n') || 'No description',
                type: response.data.fields.issuetype.name
            };
            return res.json({ success: true, issues: [issue] });
        } else {
            // Project-wide search
            const jql = `project="${targetKey}" ORDER BY created DESC`;
            const response = await axios.get(`${domain}/rest/api/3/search`, {
                params: { jql, maxResults: 20 },
                headers: {
                    'Authorization': `Basic ${auth}`,
                    'Accept': 'application/json'
                }
            });

            if (response.data.issues && response.data.issues.length > 0) {
                const issues = response.data.issues.map(issue => ({
                    id: issue.key,
                    summary: issue.fields.summary,
                    description: issue.fields.description?.content?.map(c => c.content?.map(inner => inner.text).join('')).join('\n') || 'No description',
                    type: issue.fields.issuetype.name
                }));
                return res.json({ success: true, issues });
            } else {
                return res.status(404).json({ success: false, message: `No issues found for project "${targetKey}".` });
            }
        }
    } catch (err) {
        console.error('Jira Fetch Error:', err.response?.data || err.message);
        const errorDetail = err.response?.data?.errorMessages?.[0] || err.message;
        res.status(err.response?.status || 500).json({ 
            success: false, 
            message: `Jira Request Failed: ${errorDetail}` 
        });
    }
});

// Generate Test Plan using LLM
app.post('/api/generate-plan', async (req, res) => {
    const { issues, context, llmConfig } = req.body;
    const { provider, baseUrl, apiKey, model } = llmConfig;
    
    const issueSummaries = issues.map(i => `- ${i.id}: ${i.summary}\n  Description: ${i.description || 'N/A'}`).join('\n');
    const prompt = `Generate a comprehensive Software Test Plan for the following Jira issues:\n${issueSummaries}\n\nAdditional Context: ${context || 'None'}\n\nPlease include sections for Overview, Scope, Test Strategy, and specific Test Cases.`;
    const systemPrompt = "You are an expert QA Engineer and Test Lead specializing in high-quality test planning.";

    try {
        if (provider === 'Ollama') {
            const response = await axios.post(`${baseUrl}/api/generate`, {
                model,
                prompt: `${systemPrompt}\n\n${prompt}`,
                stream: false
            });
            return res.json({ success: true, plan: response.data.response });
        }

        if (provider === 'Groq' || provider === 'OpenAI' || provider === 'Grok (xAI)' || provider === 'LM Studio') {
            const url = provider === 'Groq' ? 'https://api.groq.com/openai/v1/chat/completions' :
                        provider === 'OpenAI' ? 'https://api.openai.com/v1/chat/completions' :
                        provider === 'Grok (xAI)' ? 'https://api.x.ai/v1/chat/completions' :
                        `${baseUrl}/v1/chat/completions`;
            
            const response = await axios.post(url, {
                model,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: prompt }
                ],
                temperature: 0.7
            }, {
                headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' }
            });
            return res.json({ success: true, plan: response.data.choices[0].message.content });
        }

        if (provider === 'Gemini') {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
            const response = await axios.post(url, {
                contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }]
            });
            return res.json({ success: true, plan: response.data.candidates[0].content.parts[0].text });
        }

        res.status(400).json({ success: false, message: "LLM Provider not yet supported for generation." });
    } catch (err) {
        console.error('Generation Error:', err.response?.data || err.message);
        res.status(500).json({ success: false, message: "LLM generation failed: " + (err.response?.data?.error?.message || err.message) });
    }
});

// Confluence Publishing
app.post('/api/confluence/publish', async (req, res) => {
    const { url, email, token, title, content, spaceKey } = req.body;
    
    if (!url || !email || !token || !title || !content || !spaceKey) {
        return res.status(400).json({ success: false, message: "Missing required Confluence parameters (URL, Email, Token, Title, SpaceKey)." });
    }

    try {
        let domain = url.trim();
        if (domain.includes('.atlassian.net')) {
            domain = domain.split('.atlassian.net')[0] + '.atlassian.net';
        }
        if (!domain.startsWith('http')) domain = 'https://' + domain;
        
        // Ensure /wiki is included for Confluence API
        const confluenceBase = `${domain}/wiki/rest/api`;
        const auth = Buffer.from(`${email.trim()}:${token.trim()}`).toString('base64');
        
        console.log(`Publishing to Confluence: ${confluenceBase}/content`);

        // Convert Markdown to rich HTML for Confluence
        const htmlContent = marked.parse(content);

        const payload = {
            type: 'page',
            title: title + ' - ' + new Date().toLocaleDateString(),
            space: { key: spaceKey },
            body: {
                storage: {
                    value: `
                        <p><strong>Generated by AI Test Planning Agent</strong></p>
                        <hr/>
                        <div class="test-plan-content">
                            ${htmlContent}
                        </div>
                    `,
                    representation: 'storage'
                }
            }
        };

        const response = await axios.post(`${confluenceBase}/content`, payload, {
            headers: {
                'Authorization': `Basic ${auth}`,
                'Content-Type': 'application/json'
            }
        });

        res.json({ 
            success: true, 
            message: "Successfully published to Confluence!", 
            url: `${domain}/wiki${response.data._links.webui}` 
        });
    } catch (err) {
        console.error('Confluence API Error:', err.response?.data || err.message);
        const errorDetail = err.response?.data?.message || err.message;
        res.status(err.response?.status || 500).json({ 
            success: false, 
            message: `Confluence Failed: ${errorDetail}` 
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
