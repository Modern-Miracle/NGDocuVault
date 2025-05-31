import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { env } from '@/config/env';

// Secret key for cookie encryption - store in env variable in production
const SECRET_KEY = env.VITE_COOKIE_SECRET!;

// Define a type for the session data
export interface SessionData {
  user?: {
    address: string | null;
    did: string | null;
    roles: string[];
  };
  message?: string;
  signature?: string;
  [key: string]: unknown;
}

/**
 * Encrypt data for cookie storage
 */
function encrypt(data: string): string {
  return CryptoJS.AES.encrypt(data, SECRET_KEY).toString();
}

/**
 * Decrypt data from cookie storage
 */
function decrypt(encryptedData: string): string {
  const bytes = CryptoJS.AES.decrypt(encryptedData, SECRET_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
}

/**
 * Set encrypted session data in a cookie
 */
export function setSession(session: SessionData): void {
  const encryptedSession = encrypt(JSON.stringify(session));

  Cookies.set('siwe-session', encryptedSession, {
    secure: env.VITE_NODE_ENV === 'production',
    sameSite: 'strict',
    expires: 7, // 7 days
    path: '/',
  });
}

/**
 * Retrieve and decrypt session data from cookie
 */
export function getSession(): SessionData | null {
  const encryptedSession = Cookies.get('siwe-session');
  if (!encryptedSession) return null;

  try {
    const sessionData = decrypt(encryptedSession);
    return JSON.parse(sessionData) as SessionData;
  } catch {
    // If decryption fails, clear the invalid cookie
    clearSession();
    return null;
  }
}

/**
 * Clear the session cookie
 */
export function clearSession(): void {
  Cookies.remove('siwe-session', { path: '/' });
}
