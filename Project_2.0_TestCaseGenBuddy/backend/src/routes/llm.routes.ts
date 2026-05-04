import { Router } from 'express';
import { getLLMService } from '../services/llm.service.js';
import * as historyService from '../services/history.service.js';

const router = Router();

router.post('/test-connection', async (req, res) => {
  try {
    const { provider } = req.body;
    const llmService = await getLLMService(provider);
    const success = await llmService.testConnection();
    res.json({ success });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/generate', async (req, res) => {
  try {
    const { prompt, provider, types } = req.body;
    const llmService = await getLLMService(provider);
    
    const selectedTypes = types && types.length > 0 ? types : ['functional'];
    const typesStr = selectedTypes.join(', ');
    
    const isAutomation = selectedTypes.includes('automation');
    
    let systemPrompt = `You are an expert QA Engineer. Your task is to generate comprehensive outputs perfectly aligned with the user's requirements.
    
    CRITICAL INSTRUCTIONS:
    1. Look carefully at the user's entire prompt. If they provide a "FORMAT" section, a specific table structure, or custom fields (e.g. '| Test ID | Endpoint |...'), you MUST use ONLY those exact columns/fields as your JSON object keys (converted to camelCase).
    2. If NO format or custom fields are provided, fall back to these default keys: "id", "summary", "preconditions", "steps", "expectedResult", "type".
    3. Your response MUST be a valid JSON array of objects representing rows.
    4. Do NOT include any introductory or concluding text (no markdown wrapping other than the JSON block itself). ONLY return the JSON array starting with [ and ending with ].`;

    if (isAutomation) {
      systemPrompt += `
      
      SPECIAL INSTRUCTION FOR AUTOMATION:
      Since the user requested an "Automation Script", you MUST generate a Playwright Keyword-based script instead of standard test cases.
      Each object in the array MUST follow this exact structure compatible with our Keyword Engine:
      { 
        "id": "string", 
        "action": "KEYWORD", 
        "locator": "css_selector", 
        "value": "input_value_or_url" 
      }
      
      Supported Keywords: GOTO, CLICK, TYPE, ASSERT_TEXT, WAIT, SCREENSHOT, SELECT, CHECK, HOVER, SCROLL_TO, ASSERT_VISIBLE, CUSTOM_CODE.
      - Use GOTO for URL navigation.
      - Use CLICK and TYPE for element interaction.
      - Use ASSERT_TEXT or ASSERT_VISIBLE for validation.
      - ALWAYS prioritize CSS Selectors for "locator".`;
    }

    console.log(`Generating test cases for types: ${typesStr} using provider: ${provider}`);
    const responseText = await llmService.generate(prompt, systemPrompt);
    
    // Parse JSON from response
    let testCases;
    try {
      // More robust JSON extraction: find the widest array structure [...]
      const startIdx = responseText.indexOf('[');
      const endIdx = responseText.lastIndexOf(']');
      
      if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
        const jsonStr = responseText.substring(startIdx, endIdx + 1);
        try {
          testCases = JSON.parse(jsonStr);
        } catch (innerError) {
          // If pure substring fails, try stripping common markdown artifacts
          const furtherClean = jsonStr.replace(/```json|```/g, '').trim();
          testCases = JSON.parse(furtherClean);
        }
      } else {
        // Fallback for single object or direct JSON string
        const cleanContent = responseText.replace(/```json|```/g, '').trim();
        testCases = JSON.parse(cleanContent);
      }
    } catch (e: any) {
      console.error('JSON Parse Error:', e);
      console.error('Raw Response (first 500 chars):', responseText.substring(0, 500));
      testCases = [{ 
        error: "Failed to parse test cases. The AI response was not in a valid JSON format.", 
        details: e.message,
        rawPreview: responseText.substring(0, 100) + '...' 
      }];
    }

    // Save to history
    await historyService.saveHistoryEntry({
      prompt,
      output: testCases,
      provider: provider || 'default',
      type: 'test-case'
    });

    res.json(testCases);
  } catch (error: any) {
    const errorDetail = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    console.error('Generation Error Detail:', errorDetail);
    res.status(500).json({ error: errorDetail });
  }
});

router.post('/chat', async (req, res) => {
  try {
    const { prompt, provider } = req.body;
    const llmService = await getLLMService(provider);
    
    const responseText = await llmService.generate(prompt);

    // Save to history
    await historyService.saveHistoryEntry({
      prompt,
      output: responseText,
      provider: provider || 'default',
      type: 'chat'
    });

    res.json({ response: responseText });
  } catch (error: any) {
    const errorDetail = error.response?.data?.error?.message || error.response?.data?.message || error.message;
    console.error('Chat Error Detail:', errorDetail);
    res.status(500).json({ error: errorDetail });
  }
});

export default router;
