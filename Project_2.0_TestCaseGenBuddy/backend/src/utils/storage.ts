import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(process.cwd(), 'data');
const memoryCache: Record<string, any> = {};

export const readJsonFile = async <T>(filename: string, defaultValue: T): Promise<T> => {
  if (memoryCache[filename]) return memoryCache[filename];
  
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    memoryCache[filename] = parsed;
    return parsed;
  } catch (error: any) {
    if (error.code === 'ENOENT' || error.code === 'EROFS') {
      memoryCache[filename] = defaultValue;
      return defaultValue;
    }
    return defaultValue;
  }
};

export const writeJsonFile = async <T>(filename: string, data: T): Promise<void> => {
  memoryCache[filename] = data;
  const filePath = path.join(DATA_DIR, filename);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error: any) {
    console.warn(`Storage: Write failed for ${filename} (likely read-only environment):`, error.message);
  }
};
