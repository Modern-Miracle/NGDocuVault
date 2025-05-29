import { AuthTokens } from '../types/client';

interface StoredAuth {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

class AuthStore {
  private memoryStore: StoredAuth | null = null;
  private readonly STORAGE_KEY = 'docu_auth';

  // Store tokens in memory only for security
  setTokens(tokens: AuthTokens): void {
    const expiresAt = Date.now() + (tokens.expiresIn * 1000);
    
    this.memoryStore = {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiresAt,
    };

    // Store only non-sensitive metadata in localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem(`${this.STORAGE_KEY}_active`, 'true');
      localStorage.setItem(`${this.STORAGE_KEY}_expires`, String(expiresAt));
    }
  }

  getAccessToken(): string | null {
    if (!this.memoryStore) return null;
    
    if (Date.now() >= this.memoryStore.expiresAt) {
      this.clear();
      return null;
    }

    return this.memoryStore.accessToken;
  }

  getRefreshToken(): string | null {
    return this.memoryStore?.refreshToken || null;
  }

  isAuthenticated(): boolean {
    if (!this.memoryStore) {
      // Check localStorage for session indicator
      if (typeof window !== 'undefined') {
        const active = localStorage.getItem(`${this.STORAGE_KEY}_active`);
        const expires = localStorage.getItem(`${this.STORAGE_KEY}_expires`);
        
        if (active === 'true' && expires) {
          const expiresAt = parseInt(expires, 10);
          return Date.now() < expiresAt;
        }
      }
      return false;
    }

    return Date.now() < this.memoryStore.expiresAt;
  }

  getTimeUntilExpiry(): number | null {
    if (!this.memoryStore) return null;
    
    const remaining = this.memoryStore.expiresAt - Date.now();
    return remaining > 0 ? remaining : 0;
  }

  clear(): void {
    this.memoryStore = null;
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`${this.STORAGE_KEY}_active`);
      localStorage.removeItem(`${this.STORAGE_KEY}_expires`);
    }
  }
}

export const authStore = new AuthStore();