import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth/AuthService';
import { TokenPayload, UserRole } from '../types';
import { BlockchainManager } from '../lib/blockchain';
import { JwtPayload } from 'jsonwebtoken';
import { verifyToken } from '../utils/jwt';
import { AuthenticationError } from '../utils/errors';
import { logger } from '../utils/logger';
import { SiweMessage } from 'siwe';

const authService = new AuthService();

// Define custom user type for request augmentation
export interface SiweUser {
  address: string;
  role: UserRole;
  did?: string;
}

/**
 * JWT Authentication middleware
 * Verifies JWT token from Authorization header and populates session
 */
export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AuthenticationError('JWT token required');
    }

    // Extract and verify the token
    const token = authHeader.substring(7);
    const payload = verifyToken(token) as TokenPayload;

    if (!payload) {
      throw new AuthenticationError('Invalid JWT token');
    }

    // Store user in session for future requests
    if (req.session) {
      req.session.user = {
        did: payload.did,
        address: payload.sub,
        role: payload.role || UserRole.USER,
        authenticated: true,
        authMethod: 'jwt'
      };
    }

    // Copy to request object
    req.user = req.session?.user;

    logger.debug(`JWT Authentication successful for: ${payload.did}`);
    next();
  } catch (error) {
    logger.warn('JWT Authentication failed:', error);
    next(error);
  }
};

/**
 * SIWE Authentication middleware
 * Verifies SIWE authentication (from session) and populates user
 */
export const verifySiweAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.session?.user || req.session.user.authMethod !== 'siwe') {
      throw new AuthenticationError('SIWE authentication required');
    }

    // Session already has user info from SIWE auth
    req.user = req.session.user;

    if (!req.user.authenticated) {
      throw new AuthenticationError('SIWE authentication failed');
    }

    logger.debug(`SIWE Authentication verified for: ${req.user.address}`);
    next();
  } catch (error) {
    logger.warn('SIWE Authentication failed:', error);
    next(error);
  }
};

/**
 * SIWE Role-based authorization middleware
 * Requires specific roles for SIWE authenticated users
 * @deprecated Use requireRole from session.middleware instead
 */
export const requireSiweRoles = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (
        !req.user ||
        !req.user.authenticated ||
        req.user.authMethod !== 'siwe'
      ) {
        throw new AuthenticationError('SIWE authentication required');
      }

      const userRole = req.user.role;

      if (allowedRoles.includes(userRole as UserRole)) {
        return next();
      }

      logger.warn(
        `SIWE authorization failed: User has role ${userRole}, but one of [${allowedRoles.join(', ')}] is required`
      );
      throw new AuthenticationError('Insufficient permissions');
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to verify control of a DID
 */
export const verifyDidControl = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    if (!req.user || !req.user.did) {
      throw new AuthenticationError('Authentication with DID required');
    }

    // Extract DID parameter from request
    const requestedDid = req.params.did || req.body.did;

    if (!requestedDid) {
      throw new AuthenticationError('DID parameter required');
    }

    // Check if user's DID matches requested DID
    if (req.user.did !== requestedDid) {
      logger.warn(
        `DID control verification failed: User DID ${req.user.did} doesn't match requested DID ${requestedDid}`
      );
      throw new AuthenticationError('Not authorized to control this DID');
    }

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Error handler middleware for auth errors
 */
export const authErrorHandler = (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (err instanceof AuthenticationError) {
    res.status(401).json({
      error: err.message,
      authenticated: false
    });
    return;
  }

  // Pass to next error handler
  next(err);
};

// ****************** LEGACY MIDDLEWARE ******************
// Extend Express Request type to include authenticated user info
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}
