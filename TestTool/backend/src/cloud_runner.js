const { chromium } = require('playwright'); // Use playwright-aws-lambda for actual Deployment

/**
 * AWS Lambda Handler for Keyword Driven Execution
 */
exports.handler = async (event, context) => {
    const { steps, variables = {} } = event;
    const results = [];
    let browser;

    const interpolate = (text, vars = {}) => {
        if (!text || typeof text !== 'string') return text;
        return text.replace(/\{\{(.*?)\}\}/g, (match, key) => {
            const val = vars[key.trim()];
            return val !== undefined ? val : match;
        });
    };

    try {
        // Optimization: Use headful for local, headless for cloud
        browser = await chromium.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        const ctx = await browser.newContext();
        const page = await ctx.newPage();

        for (const step of steps) {
            const interpolatedLocator = interpolate(step.locator, variables);
            const interpolatedValue = interpolate(step.value, variables);
            const result = { ...step, status: 'PENDING', error: null, captured: null, locator: interpolatedLocator, value: interpolatedValue };

            try {
                // ... core execution logic ...
                if (step.action === 'GOTO') {
                    await page.goto(result.value, { timeout: 30000 });
                } else if (step.action === 'CLICK') {
                    await page.locator(result.locator).click({ timeout: 10000 });
                } else if (step.action === 'TYPE') {
                    await page.locator(result.locator).fill(result.value, { timeout: 10000 });
                } else if (step.action === 'CUSTOM_CODE') {
                    const asyncFn = new Function('page', 'context', 'browser', 'variables', `
                        return (async () => {
                            ${result.value}
                        })();
                    `);
                    await asyncFn(page, ctx, browser, variables);
                }
                // (Extend with remaining keywords as needed for cloud parity)
                
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
        return {
            statusCode: 200,
            body: { success: true, results }
        };
    } catch (err) {
        if (browser) await browser.close();
        return {
            statusCode: 500,
            body: { success: false, error: err.message, results }
        };
    }
};
