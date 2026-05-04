const express = require('express');
const cors = require('cors');
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCRIPTS_DIR = path.join(__dirname, '..', 'scripts');
if (!fs.existsSync(SCRIPTS_DIR)) {
    fs.mkdirSync(SCRIPTS_DIR);
}

const app = express();
app.use(cors());
const interpolate = (text, vars = {}) => {
    if (!text || typeof text !== 'string') return text;
    return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
        const val = vars[key.trim()];
        return val !== undefined ? val : match;
    });
};

app.post('/api/execute', async (req, res) => {
    const { steps, variables = {} } = req.body;
    let browser;
    const results = [];
    
    try {
        browser = await chromium.launch({ headless: false, slowMo: 100 });
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await context.newPage();
        
        for (const step of steps) {
            // Interpolate variables in locator and value
            const interpolatedLocator = interpolate(step.locator, variables);
            const interpolatedValue = interpolate(step.value, variables);
            
            const result = { ...step, status: 'PENDING', error: null, captured: null, locator: interpolatedLocator, value: interpolatedValue };
            try {
                if (step.action === 'GOTO') {
                    if (!result.value) throw new Error("URL is required for GOTO.");
                    await page.goto(result.value, { timeout: 30000, waitUntil: 'domcontentloaded' });

                } else if (step.action === 'CLICK') {
                    if (!result.locator) throw new Error("Locator is required for CLICK.");
                    await page.locator(result.locator).first().click({ timeout: 10000 });

                } else if (step.action === 'DOUBLE_CLICK') {
                    if (!result.locator) throw new Error("Locator is required for DOUBLE_CLICK.");
                    await page.locator(result.locator).first().dblclick({ timeout: 10000 });

                } else if (step.action === 'RIGHT_CLICK') {
                    if (!result.locator) throw new Error("Locator is required for RIGHT_CLICK.");
                    await page.locator(result.locator).first().click({ button: 'right', timeout: 10000 });

                } else if (step.action === 'TYPE') {
                    if (!result.locator || !result.value) throw new Error("Locator and Value required for TYPE.");
                    await page.locator(result.locator).first().fill(result.value, { timeout: 10000 });

                } else if (step.action === 'CLEAR') {
                    if (!result.locator) throw new Error("Locator is required for CLEAR.");
                    await page.locator(result.locator).first().clear({ timeout: 10000 });

                } else if (step.action === 'PRESS_KEY') {
                    const key = result.value || 'Enter';
                    if (result.locator) {
                        await page.locator(result.locator).first().press(key, { timeout: 10000 });
                    } else {
                        await page.keyboard.press(key);
                    }

                } else if (step.action === 'HOVER') {
                    if (!result.locator) throw new Error("Locator is required for HOVER.");
                    await page.locator(result.locator).first().hover({ timeout: 10000 });

                } else if (step.action === 'SELECT') {
                    if (!result.locator || !result.value) throw new Error("Locator and Value required for SELECT.");
                    await page.locator(result.locator).first().selectOption(result.value, { timeout: 10000 });

                } else if (step.action === 'CHECK') {
                    if (!result.locator) throw new Error("Locator is required for CHECK.");
                    await page.locator(result.locator).first().check({ timeout: 10000 });

                } else if (step.action === 'UNCHECK') {
                    if (!result.locator) throw new Error("Locator is required for UNCHECK.");
                    await page.locator(result.locator).first().uncheck({ timeout: 10000 });

                } else if (step.action === 'SCROLL_TO') {
                    if (!result.locator) throw new Error("Locator is required for SCROLL_TO.");
                    await page.locator(result.locator).first().scrollIntoViewIfNeeded({ timeout: 10000 });

                } else if (step.action === 'SCROLL_PAGE') {
                    const dir = result.value || 'down';
                    const amount = dir === 'up' ? -500 : 500;
                    await page.mouse.wheel(0, amount);

                } else if (step.action === 'WAIT') {
                    const time = parseInt(result.value || '1000', 10);
                    await page.waitForTimeout(time);

                } else if (step.action === 'WAIT_FOR_ELEMENT') {
                    if (!result.locator) throw new Error("Locator is required for WAIT_FOR_ELEMENT.");
                    await page.locator(result.locator).first().waitFor({ state: 'visible', timeout: 15000 });

                } else if (step.action === 'WAIT_FOR_URL') {
                    if (!result.value) throw new Error("URL pattern is required for WAIT_FOR_URL.");
                    await page.waitForURL(result.value, { timeout: 15000 });

                } else if (step.action === 'ASSERT_TEXT') {
                    if (!result.locator || !result.value) throw new Error("Locator and Value required for ASSERT_TEXT.");
                    const text = await page.locator(result.locator).first().innerText({ timeout: 10000 });
                    if (!text.includes(result.value)) {
                        throw new Error(`Assertion Failed: Expected "${result.value}" but found "${text}"`);
                    }
                    result.captured = text;

                } else if (step.action === 'ASSERT_VISIBLE') {
                    if (!result.locator) throw new Error("Locator is required for ASSERT_VISIBLE.");
                    const isVisible = await page.locator(result.locator).first().isVisible({ timeout: 10000 });
                    if (!isVisible) throw new Error(`Element "${result.locator}" is not visible.`);

                } else if (step.action === 'ASSERT_URL') {
                    if (!result.value) throw new Error("Value is required for ASSERT_URL.");
                    const currentUrl = page.url();
                    if (!currentUrl.includes(result.value)) {
                        throw new Error(`URL mismatch: Expected "${result.value}" in "${currentUrl}"`);
                    }
                    result.captured = currentUrl;

                } else if (step.action === 'ASSERT_TITLE') {
                    if (!result.value) throw new Error("Value is required for ASSERT_TITLE.");
                    const title = await page.title();
                    if (!title.includes(result.value)) {
                        throw new Error(`Title mismatch: Expected "${result.value}" in "${title}"`);
                    }
                    result.captured = title;

                } else if (step.action === 'GET_TEXT') {
                    if (!result.locator) throw new Error("Locator is required for GET_TEXT.");
                    const text = await page.locator(result.locator).first().innerText({ timeout: 10000 });
                    result.captured = text;

                } else if (step.action === 'SCREENSHOT') {
                    const path = `/tmp/screenshot_${Date.now()}.png`;
                    await page.screenshot({ path, fullPage: result.value === 'fullpage' });
                    result.captured = path;

                } else if (step.action === 'SWITCH_FRAME') {
                    // switch into an iframe by selector
                    if (!result.locator) throw new Error("Locator required for SWITCH_FRAME.");
                    const frame = page.frameLocator(result.locator);
                    if (!frame) throw new Error(`Frame "${result.locator}" not found.`);

                } else if (step.action === 'CUSTOM_CODE') {
                    if (!result.value) throw new Error("Code snippet is required for CUSTOM_CODE.");
                    // Run the code in an async function context
                    const asyncFn = new Function('page', 'context', 'browser', 'variables', `
                        return (async () => {
                            ${result.value}
                        })();
                    `);
                    await asyncFn(page, context, browser, variables);

                } else if (step.action === 'ACCEPT_DIALOG') {
                    page.once('dialog', dialog => dialog.accept());

                } else if (step.action === 'DISMISS_DIALOG') {
                    page.once('dialog', dialog => dialog.dismiss());

                } else if (step.action === 'BACK') {
                    await page.goBack({ timeout: 10000 });

                } else if (step.action === 'FORWARD') {
                    await page.goForward({ timeout: 10000 });

                } else if (step.action === 'REFRESH') {
                    await page.reload({ timeout: 15000 });
                }

                result.status = 'PASS';
            } catch (err) {
                result.status = 'FAIL';
                result.error = err.message;
                results.push(result);
                break;
            }
            results.push(result);
        }
        await browser.close();
        res.json({ success: true, results });
    } catch (err) {
        if (browser) await browser.close();
        res.status(500).json({ error: err.message, results });
    }
});

app.post('/api/save', (req, res) => {
    const { name, steps } = req.body;
    if (!name || !steps) return res.status(400).json({ error: 'Name and steps are required' });
    
    const fileName = name.endsWith('.json') ? name : `${name}.json`;
    const filePath = path.join(SCRIPTS_DIR, fileName);
    
    try {
        fs.writeFileSync(filePath, JSON.stringify(steps, null, 2));
        res.json({ success: true, message: `Script saved as ${fileName}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/scripts', (req, res) => {
    try {
        const files = fs.readdirSync(SCRIPTS_DIR)
            .filter(file => file.endsWith('.json'))
            .map(file => ({ name: file }));
        res.json(files);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/scripts/:name', (req, res) => {
    const { name } = req.params;
    const filePath = path.join(SCRIPTS_DIR, name);
    
    try {
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        const content = fs.readFileSync(filePath, 'utf8');
        res.json(JSON.parse(content));
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/scripts/:name', (req, res) => {
    const { name } = req.params;
    const filePath = path.join(SCRIPTS_DIR, name);
    
    try {
        if (!fs.existsSync(filePath)) return res.status(404).json({ error: 'File not found' });
        fs.unlinkSync(filePath);
        res.json({ success: true, message: 'Script deleted' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

const PORT = 5002;
app.listen(PORT, () => {
    console.log(`Keyword Execution Engine running on http://localhost:${PORT}`);
});
