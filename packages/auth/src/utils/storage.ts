import { DEFAULT_CONFIG } from '../config';

/**
 * Enhanced storage utility for authentication data
 * Handles both localStorage and sessionStorage with proper error handling
 */
export class AuthStorage {
  private prefix: string;
  private storage: Storage;

  constructor(prefix: string = DEFAULT_CONFIG.tokenStorage.prefix, useSessionStorage = false) {
    this.prefix = prefix;
    this.storage = useSessionStorage 
      ? (typeof window !== 'undefined' ? window.sessionStorage : {} as Storage)
      : (typeof window !== 'undefined' ? window.localStorage : {} as Storage);
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`;
  }

  setItem(key: string, value: any): void {
    try {
      const serializedValue = typeof value === 'string' ? value : JSON.stringify(value);
      this.storage.setItem(this.getKey(key), serializedValue);
    } catch (error) {
      console.warn('Failed to store item:', key, error);
    }
  }

  getItem<T = string>(key: string): T | null {
    try {
      const value = this.storage.getItem(this.getKey(key));
      if (value === null) return null;
      
      try {
        return JSON.parse(value) as T;
      } catch {
        return value as T;
      }
    } catch (error) {
      console.warn('Failed to retrieve item:', key, error);
      return null;
    }
  }

  removeItem(key: string): void {
    try {
      this.storage.removeItem(this.getKey(key));
    } catch (error) {
      console.warn('Failed to remove item:', key, error);
    }
  }

  clear(): void {
    try {
      const keys = Object.keys(this.storage).filter(key => key.startsWith(this.prefix));
      keys.forEach(key => this.storage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear storage:', error);
    }
  }

  // Token-specific methods
  setAuthToken(token: string, expiresIn?: number): void {
    this.setItem(DEFAULT_CONFIG.tokenStorage.accessTokenKey, token);
    if (expiresIn) {
      const expiresAt = Date.now() + (expiresIn * 1000);
      this.setItem('token_expires_at', expiresAt);
    }
  }

  getAuthToken(): string | null {
    const token = this.getItem<string>(DEFAULT_CONFIG.tokenStorage.accessTokenKey);
    const expiresAt = this.getItem<number>('token_expires_at');
    
    if (!token) return null;
    if (expiresAt && expiresAt <= Date.now()) {
      this.removeAuthToken();
      return null;
    }
    
    return token;
  }

  removeAuthToken(): void {
    this.removeItem(DEFAULT_CONFIG.tokenStorage.accessTokenKey);
    this.removeItem('token_expires_at');
  }

  setRefreshToken(token: string): void {
    this.setItem(DEFAULT_CONFIG.tokenStorage.refreshTokenKey, token);
  }

  getRefreshToken(): string | null {
    return this.getItem<string>(DEFAULT_CONFIG.tokenStorage.refreshTokenKey);
  }

  removeRefreshToken(): void {
    this.removeItem(DEFAULT_CONFIG.tokenStorage.refreshTokenKey);
  }

  setUser(user: any): void {
    this.setItem(DEFAULT_CONFIG.tokenStorage.userKey, user);
  }

  getUser<T = any>(): T | null {
    return this.getItem<T>(DEFAULT_CONFIG.tokenStorage.userKey);
  }

  removeUser(): void {
    this.removeItem(DEFAULT_CONFIG.tokenStorage.userKey);
  }

  // Check if tokens are valid
  isTokenValid(): boolean {
    const token = this.getAuthToken();
    return !!token;
  }

  // Get time until token expiry
  getTokenExpiryTime(): number | null {
    const expiresAt = this.getItem<number>('token_expires_at');
    return expiresAt ? Math.max(0, expiresAt - Date.now()) : null;
  }
}

// Default storage instance
export const authStorage = new AuthStorage();

// Legacy compatibility functions
export function setAuthToken(token: string, expiresIn?: number): void {
  authStorage.setAuthToken(token, expiresIn);
}

export function getAuthToken(): string | null {
  return authStorage.getAuthToken();
}

export function removeAuthToken(): void {
  authStorage.removeAuthToken();
}

export function setRefreshToken(token: string): void {
  authStorage.setRefreshToken(token);
}

export function getRefreshToken(): string | null {
  return authStorage.getRefreshToken();
}

export function removeRefreshToken(): void {
  authStorage.removeRefreshToken();
}

export function clearAuthData(): void {
  authStorage.clear();
}