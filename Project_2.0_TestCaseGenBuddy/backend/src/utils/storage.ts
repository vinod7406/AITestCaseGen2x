import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, '../data');

export const readJsonFile = async <T>(filename: string, defaultValue: T): Promise<T> => {
  const filePath = path.join(DATA_DIR, filename);
  try {
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // Create data directory if it doesn't exist
      await fs.mkdir(DATA_DIR, { recursive: true });
      // Create file with default value
      await fs.writeFile(filePath, JSON.stringify(defaultValue, null, 2));
      return defaultValue;
    }
    throw error;
  }
};

export const writeJsonFile = async <T>(filename: string, data: T): Promise<void> => {
  const filePath = path.join(DATA_DIR, filename);
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
};
