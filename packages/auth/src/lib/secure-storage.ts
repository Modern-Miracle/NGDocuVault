interface StorageOptions {
  prefix?: string;
  encrypt?: boolean;
}

export class SecureStorage {
  private prefix: string;
  private memoryStorage: Map<string, any> = new Map();

  constructor(options: StorageOptions = {}) {
    this.prefix = options.prefix || 'docu_auth_';
  }

  setItem(key: string, value: any): void {
    const prefixedKey = this.prefix + key;
    
    // Store in memory for immediate access
    this.memoryStorage.set(prefixedKey, value);

    // Only store non-sensitive metadata in localStorage
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        // Store a flag indicating the presence of data, not the actual data
        if (key.includes('token')) {
          localStorage.setItem(prefixedKey + '_exists', 'true');
          localStorage.setItem(prefixedKey + '_expires', String(value.expiresAt || 0));
        } else {
          localStorage.setItem(prefixedKey, JSON.stringify(value));
        }
      } catch (error) {
        console.error('Failed to store in localStorage:', error);
      }
    }
  }

  getItem(key: string): any {
    const prefixedKey = this.prefix + key;
    
    // Try memory first
    if (this.memoryStorage.has(prefixedKey)) {
      return this.memoryStorage.get(prefixedKey);
    }

    // Fall back to localStorage for non-sensitive data
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const item = localStorage.getItem(prefixedKey);
        if (item) {
          return JSON.parse(item);
        }
      } catch (error) {
        console.error('Failed to retrieve from localStorage:', error);
      }
    }

    return null;
  }

  removeItem(key: string): void {
    const prefixedKey = this.prefix + key;
    
    this.memoryStorage.delete(prefixedKey);

    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.removeItem(prefixedKey);
      localStorage.removeItem(prefixedKey + '_exists');
      localStorage.removeItem(prefixedKey + '_expires');
    }
  }

  clear(): void {
    // Clear memory storage
    this.memoryStorage.clear();

    // Clear localStorage items with our prefix
    if (typeof window !== 'undefined' && window.localStorage) {
      const keysToRemove: string[] = [];
      
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(this.prefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    }
  }

  isTokenValid(key: string): boolean {
    const prefixedKey = this.prefix + key;
    
    if (typeof window !== 'undefined' && window.localStorage) {
      const expiresStr = localStorage.getItem(prefixedKey + '_expires');
      if (!expiresStr) return false;
      
      const expires = parseInt(expiresStr, 10);
      return expires > Date.now();
    }

    return false;
  }
}