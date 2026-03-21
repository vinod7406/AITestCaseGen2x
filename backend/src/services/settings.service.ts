import { readJsonFile, writeJsonFile } from '../utils/storage.js';

export interface ProviderConfig {
  baseUrl?: string;
  apiKey?: string;
  model: string;
}

export interface Settings {
  ollama: ProviderConfig;
  lmStudio: ProviderConfig;
  groq: ProviderConfig;
  openai: ProviderConfig;
  claude: ProviderConfig;
  gemini: ProviderConfig;
  defaultProvider: string;
}

const SETTINGS_FILE = 'settings.json';

const defaultSettings: Settings = {
  ollama: { baseUrl: 'http://127.0.0.1:11434', model: 'gemma3:1b' },
  lmStudio: { baseUrl: 'http://127.0.0.1:1234', model: '' },
  groq: { apiKey: '', model: '' },
  openai: { apiKey: '', model: '' },
  claude: { apiKey: '', model: '' },
  gemini: { apiKey: '', model: '' },
  defaultProvider: 'ollama'
};

export const getSettings = async (): Promise<Settings> => {
  return await readJsonFile<Settings>(SETTINGS_FILE, defaultSettings);
};

export const updateSettings = async (settings: Partial<Settings>): Promise<Settings> => {
  const current = await getSettings();
  const updated = { ...current, ...settings };
  await writeJsonFile(SETTINGS_FILE, updated);
  return updated;
};
