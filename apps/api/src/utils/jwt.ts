import jwt from 'jsonwebtoken';
import { config } from '../config/blockchain.config';
import { TokenPayload } from '../types';

export interface JwtPayload {
  did: string;
  address: string;
  iat?: number;
  exp?: number;
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// Use a number for expiresIn instead of string to avoid type issues
const TOKEN_EXPIRY = 86400; // 1 day in seconds

/**
 * Generate a JWT token for an authenticated DID
 * @param did The DID that was authenticated
 * @param address The Ethereum address of the DID controller
 * @returns JWT token string
 */
export const generateToken = (did: string, address: string): string => {
  const payload: JwtPayload = {
    did,
    address
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
};

/**
 * Verify a JWT token and return the payload
 * @param token JWT token to verify
 * @returns Decoded token payload or null if invalid
 */
export const verifyToken = (token: string): TokenPayload | null => {
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload;
  } catch (error) {
    return null;
  }
};
