import { readJsonFile, writeJsonFile } from '../utils/storage.js';
import { randomUUID } from 'crypto';

export interface HistoryEntry {
  id: string;
  prompt: string;
  output: any; // Can be string (chat) or array (test cases)
  provider: string;
  timestamp: string;
  type: 'test-case' | 'chat';
}

const HISTORY_FILE = 'history.json';

export const getHistory = async (): Promise<HistoryEntry[]> => {
  return await readJsonFile<HistoryEntry[]>(HISTORY_FILE, []);
};

export const saveHistoryEntry = async (entry: Omit<HistoryEntry, 'id' | 'timestamp'>): Promise<HistoryEntry> => {
  const history = await getHistory();
  const newEntry: HistoryEntry = {
    ...entry,
    id: randomUUID(),
    timestamp: new Date().toISOString()
  };
  history.unshift(newEntry); // Latest first
  await writeJsonFile(HISTORY_FILE, history);
  return newEntry;
};

export const deleteHistoryEntry = async (id: string): Promise<void> => {
  const history = await getHistory();
  const filtered = history.filter(h => h.id !== id);
  await writeJsonFile(HISTORY_FILE, filtered);
};
