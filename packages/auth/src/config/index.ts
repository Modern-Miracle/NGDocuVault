// Configuration for the auth package
export interface AuthConfig {
  apiBaseUrl: string;
  endpoints: {
    challenge: string;
    authenticate: string;
    refresh: string;
    logout: string;
    session: string;
    profile: string;
    did: string;
  };
  tokenStorage: {
    prefix: string;
    accessTokenKey: string;
    refreshTokenKey: string;
    userKey: string;
  };
  refresh: {
    beforeExpiry: number; // seconds
    retryAttempts: number;
  };
}

export const DEFAULT_CONFIG: AuthConfig = {
  apiBaseUrl: (typeof window !== 'undefined' && window.location) 
    ? `${window.location.protocol}//${window.location.hostname}:5000/api/v1`
    : 'http://localhost:5000/api/v1',
  endpoints: {
    challenge: '/auth/siwe/challenge',
    authenticate: '/auth/siwe/verify',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    session: '/auth/session',
    profile: '/auth/profile',
    did: '/auth/did',
  },
  tokenStorage: {
    prefix: 'docu_auth_',
    accessTokenKey: 'access_token',
    refreshTokenKey: 'refresh_token',
    userKey: 'user',
  },
  refresh: {
    beforeExpiry: 300, // 5 minutes
    retryAttempts: 3,
  },
};

export function createAuthConfig(overrides: Partial<AuthConfig> = {}): AuthConfig {
  return {
    ...DEFAULT_CONFIG,
    ...overrides,
    endpoints: {
      ...DEFAULT_CONFIG.endpoints,
      ...overrides.endpoints,
    },
    tokenStorage: {
      ...DEFAULT_CONFIG.tokenStorage,
      ...overrides.tokenStorage,
    },
    refresh: {
      ...DEFAULT_CONFIG.refresh,
      ...overrides.refresh,
    },
  };
}