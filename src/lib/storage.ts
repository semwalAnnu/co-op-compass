import { env } from '@/env.mjs';
import fs from 'fs/promises';
import path from 'path';

interface Storage {
  get(key: string): Promise<string | null>;
  put(key: string, value: string): Promise<void>;
}

class FileStorage implements Storage {
  private filePath: string;
  private data: Record<string, string>;
  private initialized: Promise<void>;

  constructor() {
    this.filePath = path.join(process.cwd(), '.dev-storage.json');
    this.data = {};
    this.initialized = this.loadData();
  }

  private async loadData() {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf-8');
      this.data = JSON.parse(fileContent);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty data
      this.data = {};
      await this.saveData();
    }
  }

  private async saveData() {
    await fs.writeFile(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  async get(key: string): Promise<string | null> {
    await this.initialized;
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      throw new Error('Invalid storage key');
    }
    return this.data[key] || null;
  }

  async put(key: string, value: string): Promise<void> {
    await this.initialized;
    if (!key || typeof key !== 'string' || key.trim().length === 0) {
      throw new Error('Invalid storage key');
    }
    if (!value || typeof value !== 'string') {
      throw new Error('Invalid storage value');
    }
    
    this.data[key] = value;
    await this.saveData();
  }
}

// Mock storage for development that doesn't require Cloudflare KV
const createDevStorage = (): Storage => {
  return new FileStorage();
};

// Create production storage with Cloudflare KV
const createProdStorage = (): Storage => {
  if (!env.USERS) {
    throw new Error('Cloudflare KV binding not found. Please set up KV namespace in wrangler.toml');
  }

  return {
    get: async (key: string) => {
      if (!key || typeof key !== 'string' || key.trim().length === 0) {
        throw new Error('Invalid storage key');
      }
      return env.USERS.get(key);
    },
    put: async (key: string, value: string) => {
      if (!key || typeof key !== 'string' || key.trim().length === 0) {
        throw new Error('Invalid storage key');
      }
      if (!value || typeof value !== 'string') {
        throw new Error('Invalid storage value');
      }
      await env.USERS.put(key, value);
    }
  };
};

// Use development storage or Cloudflare KV based on environment
const storage: Storage = process.env.NODE_ENV === 'development'
  ? createDevStorage()
  : createProdStorage();

export default storage; 