// Client-side authentication types
export interface AuthUser {
  address: string;
  did?: string;
  role?: string;
  authenticated: boolean;
  authMethod?: 'siwe' | 'jwt';
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthSession {
  auth: {
    did: string;
    address: string;
    role: string;
    token: string;
    authenticated: boolean;
    refreshToken?: string;
    expiresIn?: number;
  };
  session: {
    accessToken: string;
    refreshToken?: string;
    expiresIn: number;
  };
  address: string;
  siwe?: any;
}

export interface SiweChallenge {
  message: string;
  expiresAt: number;
  nonce: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  user: AuthUser | null;
  tokens: AuthTokens | null;
  error: Error | null;
}

export interface AuthActions {
  generateChallenge: (address: string, chainId: number) => Promise<SiweChallenge>;
  authenticate: (message: string, signature: string) => Promise<void>;
  refreshToken: () => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
}