import axios from 'axios';
import { getSettings } from './settings.service.js';

export interface LLMService {
  testConnection(): Promise<boolean>;
  generate(prompt: string, systemPrompt?: string): Promise<string>;
}

// Helper to handle multiple provider types
export class BaseLLMService implements LLMService {
  constructor(
    protected config: { baseUrl?: string; apiKey?: string; model: string },
    protected providerName: string
  ) {}

  async testConnection(): Promise<boolean> {
    try {
      if (this.providerName === 'ollama') {
        const response = await axios.get(`${this.config.baseUrl}/api/tags`);
        return response.status === 200;
      }
      // For OpenAI-compatible APIs (LM Studio, Groq, OpenAI, etc.)
      const url = this.providerName === 'google' 
        ? `https://generativelanguage.googleapis.com/v1beta/models?key=${this.config.apiKey}`
        : `${this.config.baseUrl || this.getDefaultBaseUrl()}/models`;
      
      const response = await axios.get(url, {
        headers: this.config.apiKey ? { 'Authorization': `Bearer ${this.config.apiKey}` } : {}
      });
      return response.status === 200;
    } catch (error) {
      console.error(`${this.providerName} connection test failed:`, error);
      return false;
    }
  }

  protected getDefaultBaseUrl(): string {
    switch (this.providerName) {
      case 'openai': return 'https://api.openai.com/v1';
      case 'groq': return 'https://api.groq.com/openai/v1';
      case 'claude': return 'https://api.anthropic.com/v1';
      default: return '';
    }
  }

  async generate(prompt: string, systemPrompt: string = ''): Promise<string> {
    const { baseUrl, apiKey, model } = this.config;
    
    if (this.providerName === 'ollama') {
      const response = await axios.post(`${baseUrl}/api/generate`, {
        model,
        prompt,
        system: systemPrompt,
        stream: false,
        options: {
          num_predict: 2048,
          temperature: 0.7
        }
      });
      return response.data.response;
    }

    if (this.providerName === 'gemini') {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      const response = await axios.post(url, {
        contents: [{ parts: [{ text: `${systemPrompt}\n\n${prompt}` }] }]
      });
      return response.data.candidates[0].content.parts[0].text;
    }

    // OpenAI and compatible (Groq, LM Studio)
    const url = `${baseUrl || this.getDefaultBaseUrl()}/chat/completions`;
    const response = await axios.post(url, {
      model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      max_tokens: 2048
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.choices[0].message.content;
  }
}

export class OllamaService extends BaseLLMService {
  constructor(config: { baseUrl?: string; model: string }) {
    super(config, 'ollama');
  }
}

export class LMStudioService extends BaseLLMService {
  constructor(config: { baseUrl?: string; model: string }) {
    super(config, 'lmStudio');
  }
}

export class GroqService extends BaseLLMService {
  constructor(config: { apiKey?: string; model: string }) {
    super(config, 'groq');
  }
}

export class OpenAIService extends BaseLLMService {
  constructor(config: { apiKey?: string; model: string }) {
    super(config, 'openai');
  }
}

export class ClaudeService extends BaseLLMService {
  constructor(config: { apiKey?: string; model: string }) {
    // Anthropic has a slightly different API, but many proxies make it OpenAI compatible
    // For now, let's treat it as OpenAI compatible or use their specific SDK if needed
    // But since v2.0 is focused on a quick rollout, we'll try the generic approach first
    super(config, 'claude');
  }
}

export class GeminiService extends BaseLLMService {
  constructor(config: { apiKey?: string; model: string }) {
    super(config, 'gemini');
  }
}

// Factory to get the correct service
export const getLLMService = async (provider?: string): Promise<LLMService> => {
  const settings = await getSettings();
  const selectedProvider = provider || settings.defaultProvider;

  switch (selectedProvider) {
    case 'ollama': return new OllamaService(settings.ollama);
    case 'lmStudio': return new LMStudioService(settings.lmStudio);
    case 'groq': return new GroqService(settings.groq);
    case 'openai': return new OpenAIService(settings.openai);
    case 'claude': return new ClaudeService(settings.claude);
    case 'gemini': return new GeminiService(settings.gemini);
    default: return new OllamaService(settings.ollama);
  }
};
