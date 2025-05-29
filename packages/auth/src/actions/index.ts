// Export all authentication actions
export * from './authenticate';
export * from './challenge';
export * from './refresh';
export * from './logout';
export * from './verify-token';
export * from './did-actions';

// Types
export interface AuthResponse {
  success: boolean;
  message?: string;
  sessionId?: string;
  did?: string;
  roles?: string[];
  user?: {
    address: string;
    did: string;
    roles: string[];
  };
}

export interface ChallengeResponse {
  challenge: string;
  expiresAt: number;
}

export class AuthError extends Error {
  code?: string;
  statusCode?: number;
  details?: any;

  constructor(message: string, code?: string, statusCode?: number) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.statusCode = statusCode;
  }
}
