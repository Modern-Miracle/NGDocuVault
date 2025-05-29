import { AuthSession, AuthTokens } from '../types';
import { SecureStorage } from './secure-storage';

interface AuthClientConfig {
  apiUrl: string;
  storagePrefix?: string;
  autoRefresh?: boolean;
  refreshBeforeExpiry?: number; // seconds before expiry to refresh
}

export class AuthClient {
  private config: AuthClientConfig;
  private storage: SecureStorage;
  private refreshTimer?: NodeJS.Timeout;

  constructor(config: AuthClientConfig) {
    this.config = {
      autoRefresh: true,
      refreshBeforeExpiry: 300, // 5 minutes
      ...config,
    };

    this.storage = new SecureStorage({
      prefix: config.storagePrefix || 'docu_auth_',
    });
  }

  async generateChallenge(address: string, chainId: number): Promise<{
    message: string;
    nonce: string;
    expiresAt: number;
  }> {
    const response = await this.request('/auth/siwe/challenge', {
      method: 'POST',
      body: JSON.stringify({ address, chainId }),
    });

    return response;
  }

  async authenticateWithSiwe(
    message: string,
    signature: string
  ): Promise<AuthSession> {
    const response = await this.request('/auth/siwe/verify', {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
    });

    this.handleAuthSuccess(response);
    return response;
  }

  async refreshTokens(): Promise<AuthTokens> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await this.request('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });

    this.updateTokens(response);
    return response;
  }

  async signOut(): Promise<void> {
    const sessionId = this.getSessionId();
    if (sessionId) {
      try {
        await this.authenticatedRequest('/auth/signout', {
          method: 'POST',
          body: JSON.stringify({ sessionId }),
        });
      } catch (error) {
        console.error('Sign out error:', error);
      }
    }

    this.clearAuth();
  }

  async getSession(): Promise<AuthSession | null> {
    const sessionId = this.getSessionId();
    if (!sessionId) return null;

    try {
      return await this.authenticatedRequest(`/auth/session/${sessionId}`);
    } catch {
      return null;
    }
  }

  isAuthenticated(): boolean {
    const token = this.getAccessToken();
    const expiresAt = this.storage.getItem('token_expires_at');
    
    return !!token && (!expiresAt || expiresAt > Date.now());
  }

  getAccessToken(): string | null {
    return this.storage.getItem('access_token');
  }

  private getRefreshToken(): string | null {
    return this.storage.getItem('refresh_token');
  }

  private getSessionId(): string | null {
    return this.storage.getItem('session_id');
  }

  private handleAuthSuccess(response: AuthSession): void {
    this.storage.setItem('access_token', response.session.accessToken);
    this.storage.setItem('refresh_token', response.session.refreshToken || '');
    this.storage.setItem('session_id', response.auth.did);
    
    const expiresAt = Date.now() + ((response.session.expiresIn || 3600) * 1000);
    this.storage.setItem('token_expires_at', expiresAt);
    
    this.storage.setItem('user', {
      address: response.address,
      did: response.auth.did,
      role: response.auth.role,
      authenticated: response.auth.authenticated,
      authMethod: 'siwe' as const,
    });

    if (this.config.autoRefresh) {
      this.scheduleTokenRefresh(expiresAt);
    }
  }

  private updateTokens(tokens: AuthTokens): void {
    this.storage.setItem('access_token', tokens.accessToken);
    this.storage.setItem('refresh_token', tokens.refreshToken);
    
    const expiresAt = Date.now() + (tokens.expiresIn * 1000);
    this.storage.setItem('token_expires_at', expiresAt);

    if (this.config.autoRefresh) {
      this.scheduleTokenRefresh(expiresAt);
    }
  }

  private scheduleTokenRefresh(expiresAt: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const now = Date.now();
    const refreshAt = expiresAt - (this.config.refreshBeforeExpiry! * 1000);
    const delay = Math.max(0, refreshAt - now);

    this.refreshTimer = setTimeout(async () => {
      try {
        await this.refreshTokens();
      } catch (error) {
        console.error('Auto-refresh failed:', error);
        this.clearAuth();
      }
    }, delay);
  }

  private clearAuth(): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    this.storage.clear();
  }

  private async request(
    path: string,
    options: RequestInit = {}
  ): Promise<any> {
    const url = `${this.config.apiUrl}${path}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private async authenticatedRequest(
    path: string,
    options: RequestInit = {}
  ): Promise<any> {
    const token = this.getAccessToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    return this.request(path, {
      ...options,
      headers: {
        ...options.headers,
        Authorization: `Bearer ${token}`,
      },
    });
  }
}