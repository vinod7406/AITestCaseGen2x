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
    
    // Construct a more persuasive system prompt
    const selectedTypes = types && types.length > 0 ? types : ['functional'];
    const typesStr = selectedTypes.join(', ');
    const systemPrompt = `You are an expert QA Engineer. Your task is to generate a comprehensive suite of test cases based on the provided requirements.
    
    CRITICAL INSTRUCTIONS:
    1. You MUST generate at least 2-3 test cases for EACH of the following categories: ${typesStr}.
    2. Your response MUST be a valid JSON array of objects.
    3. Each object MUST have these exact keys: "id", "summary", "preconditions", "steps", "expectedResult", "type".
    4. The "type" field MUST match one of the categories: ${typesStr}.
    5. Do NOT include any introductory or concluding text. Only return the JSON array starting with [ and ending with ].`;

    console.log(`Generating test cases for types: ${typesStr} using provider: ${provider}`);
    const responseText = await llmService.generate(prompt, systemPrompt);
    
    // Parse JSON from response
    let testCases;
    try {
      // Find JSON array in the response (handle potential markdown blocks)
      const cleanContent = responseText.replace(/```json|```/g, '').trim();
      const startIdx = cleanContent.indexOf('[');
      const endIdx = cleanContent.lastIndexOf(']');
      
      if (startIdx !== -1 && endIdx !== -1) {
        const jsonStr = cleanContent.substring(startIdx, endIdx + 1);
        testCases = JSON.parse(jsonStr);
      } else {
        testCases = JSON.parse(cleanContent);
      }
    } catch (e) {
      console.error('JSON Parse Error:', e);
      testCases = [{ error: "Failed to parse test cases as JSON. Please try again or check the LLM output.", raw: responseText.substring(0, 200) + '...' }];
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
    res.status(500).json({ error: error.message });
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
    res.status(500).json({ error: error.message });
  }
});

export default router;
