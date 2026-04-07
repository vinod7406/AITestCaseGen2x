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
app.use(express.json());

app.post('/api/execute', async (req, res) => {
    const { steps } = req.body;
    let browser;
    const results = [];
    
    try {
        browser = await chromium.launch({ headless: false, slowMo: 100 });
        const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
        const page = await context.newPage();
        
        for (const step of steps) {
            const result = { ...step, status: 'PENDING', error: null, captured: null };
            try {
                if (step.action === 'GOTO') {
                    if (!step.value) throw new Error("URL is required for GOTO.");
                    await page.goto(step.value, { timeout: 30000, waitUntil: 'domcontentloaded' });

                } else if (step.action === 'CLICK') {
                    if (!step.locator) throw new Error("Locator is required for CLICK.");
                    await page.locator(step.locator).first().click({ timeout: 10000 });

                } else if (step.action === 'DOUBLE_CLICK') {
                    if (!step.locator) throw new Error("Locator is required for DOUBLE_CLICK.");
                    await page.locator(step.locator).first().dblclick({ timeout: 10000 });

                } else if (step.action === 'RIGHT_CLICK') {
                    if (!step.locator) throw new Error("Locator is required for RIGHT_CLICK.");
                    await page.locator(step.locator).first().click({ button: 'right', timeout: 10000 });

                } else if (step.action === 'TYPE') {
                    if (!step.locator || !step.value) throw new Error("Locator and Value required for TYPE.");
                    await page.locator(step.locator).first().fill(step.value, { timeout: 10000 });

                } else if (step.action === 'CLEAR') {
                    if (!step.locator) throw new Error("Locator is required for CLEAR.");
                    await page.locator(step.locator).first().clear({ timeout: 10000 });

                } else if (step.action === 'PRESS_KEY') {
                    const key = step.value || 'Enter';
                    if (step.locator) {
                        await page.locator(step.locator).first().press(key, { timeout: 10000 });
                    } else {
                        await page.keyboard.press(key);
                    }

                } else if (step.action === 'HOVER') {
                    if (!step.locator) throw new Error("Locator is required for HOVER.");
                    await page.locator(step.locator).first().hover({ timeout: 10000 });

                } else if (step.action === 'SELECT') {
                    if (!step.locator || !step.value) throw new Error("Locator and Value required for SELECT.");
                    await page.locator(step.locator).first().selectOption(step.value, { timeout: 10000 });

                } else if (step.action === 'CHECK') {
                    if (!step.locator) throw new Error("Locator is required for CHECK.");
                    await page.locator(step.locator).first().check({ timeout: 10000 });

                } else if (step.action === 'UNCHECK') {
                    if (!step.locator) throw new Error("Locator is required for UNCHECK.");
                    await page.locator(step.locator).first().uncheck({ timeout: 10000 });

                } else if (step.action === 'SCROLL_TO') {
                    if (!step.locator) throw new Error("Locator is required for SCROLL_TO.");
                    await page.locator(step.locator).first().scrollIntoViewIfNeeded({ timeout: 10000 });

                } else if (step.action === 'SCROLL_PAGE') {
                    const dir = step.value || 'down';
                    const amount = dir === 'up' ? -500 : 500;
                    await page.mouse.wheel(0, amount);

                } else if (step.action === 'WAIT') {
                    const time = parseInt(step.value || '1000', 10);
                    await page.waitForTimeout(time);

                } else if (step.action === 'WAIT_FOR_ELEMENT') {
                    if (!step.locator) throw new Error("Locator is required for WAIT_FOR_ELEMENT.");
                    await page.locator(step.locator).first().waitFor({ state: 'visible', timeout: 15000 });

                } else if (step.action === 'WAIT_FOR_URL') {
                    if (!step.value) throw new Error("URL pattern is required for WAIT_FOR_URL.");
                    await page.waitForURL(step.value, { timeout: 15000 });

                } else if (step.action === 'ASSERT_TEXT') {
                    if (!step.locator || !step.value) throw new Error("Locator and Value required for ASSERT_TEXT.");
                    const text = await page.locator(step.locator).first().innerText({ timeout: 10000 });
                    if (!text.includes(step.value)) {
                        throw new Error(`Assertion Failed: Expected "${step.value}" but found "${text}"`);
                    }
                    result.captured = text;

                } else if (step.action === 'ASSERT_VISIBLE') {
                    if (!step.locator) throw new Error("Locator is required for ASSERT_VISIBLE.");
                    const isVisible = await page.locator(step.locator).first().isVisible({ timeout: 10000 });
                    if (!isVisible) throw new Error(`Element "${step.locator}" is not visible.`);

                } else if (step.action === 'ASSERT_URL') {
                    if (!step.value) throw new Error("Value is required for ASSERT_URL.");
                    const currentUrl = page.url();
                    if (!currentUrl.includes(step.value)) {
                        throw new Error(`URL mismatch: Expected "${step.value}" in "${currentUrl}"`);
                    }
                    result.captured = currentUrl;

                } else if (step.action === 'ASSERT_TITLE') {
                    if (!step.value) throw new Error("Value is required for ASSERT_TITLE.");
                    const title = await page.title();
                    if (!title.includes(step.value)) {
                        throw new Error(`Title mismatch: Expected "${step.value}" in "${title}"`);
                    }
                    result.captured = title;

                } else if (step.action === 'GET_TEXT') {
                    if (!step.locator) throw new Error("Locator is required for GET_TEXT.");
                    const text = await page.locator(step.locator).first().innerText({ timeout: 10000 });
                    result.captured = text;

                } else if (step.action === 'SCREENSHOT') {
                    const path = `/tmp/screenshot_${Date.now()}.png`;
                    await page.screenshot({ path, fullPage: step.value === 'fullpage' });
                    result.captured = path;

                } else if (step.action === 'SWITCH_FRAME') {
                    // switch into an iframe by selector
                    if (!step.locator) throw new Error("Locator required for SWITCH_FRAME.");
                    const frame = page.frameLocator(step.locator);
                    if (!frame) throw new Error(`Frame "${step.locator}" not found.`);

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
