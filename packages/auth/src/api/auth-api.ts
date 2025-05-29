import { AuthSession, SiweChallenge, AuthTokens } from '../types/client';

export interface AuthApiConfig {
  baseUrl: string;
  credentials?: RequestCredentials;
}

export const DEFAULT_AUTH_CONFIG: AuthApiConfig = {
  baseUrl: (typeof window !== 'undefined' && window.location) 
    ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1`
    : 'http://localhost:5000/api/v1',
  credentials: 'include',
};

export class AuthApi {
  private config: AuthApiConfig;

  constructor(config: AuthApiConfig) {
    this.config = {
      credentials: 'include',
      ...config,
    };
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.config.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      credentials: this.config.credentials,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(error.message || `Request failed: ${response.statusText}`);
    }

    return response.json();
  }

  private getAuthHeader(token?: string): HeadersInit {
    const authToken = token || this.getStoredToken();
    return authToken ? { Authorization: `Bearer ${authToken}` } : {};
  }

  private getStoredToken(): string | null {
    // Get from memory or secure storage
    return null;
  }

  // SIWE endpoints
  async generateNonce(address: string, chainId: number): Promise<SiweChallenge> {
    return this.request<SiweChallenge>(
      `/auth/siwe/nonce?address=${address}&chainId=${chainId}`
    );
  }

  async verifySiweMessage(message: string, signature: string): Promise<AuthSession> {
    return this.request<AuthSession>('/auth/siwe/verify', {
      method: 'POST',
      body: JSON.stringify({ message, signature }),
    });
  }

  // Token management
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    return this.request<AuthTokens>('/auth/token/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  }

  async getSession(token?: string): Promise<any> {
    return this.request('/auth/session', {
      headers: this.getAuthHeader(token),
    });
  }

  async logout(refreshToken?: string): Promise<void> {
    await this.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
      headers: this.getAuthHeader(),
    });
  }

  // Protected endpoints
  async getProfile(token?: string): Promise<any> {
    return this.request('/auth/profile', {
      headers: this.getAuthHeader(token),
    });
  }

  async getDidInfo(token?: string): Promise<any> {
    return this.request('/auth/did', {
      headers: this.getAuthHeader(token),
    });
  }
}