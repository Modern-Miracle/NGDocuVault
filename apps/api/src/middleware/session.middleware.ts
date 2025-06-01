import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AuthenticationError } from '../utils/errors';
import { UserRole } from '../types';

/**
 * Middleware to populate req.user from session if available
 */
export const populateUserFromSession = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.session && req.session.user) {
    // Copy session user to request user
    req.user = req.session.user;
    logger.debug(
      `User populated from session: ${req.user.did || req.user.address}`
    );
  }
  next();
};

/**
 * Unified authentication middleware that checks for authenticated user
 * regardless of authentication method (JWT or SIWE)
 */
export const requireAuthentication = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.authenticated) {
    return next();
  }

  throw new AuthenticationError('Authentication required');
};

/**
 * Role-based authorization middleware
 * Works with both JWT and SIWE authentication methods
 */
export const requireRole = (allowedRoles: string[] | string) => {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user || !req.user.authenticated) {
      throw new AuthenticationError('Authentication required');
    }

    const userRole = req.user.role;

    if (roles.includes(userRole as string) || roles.includes('*')) {
      return next();
    }

    logger.warn(
      `User ${req.user.did || req.user.address} with role ${userRole} attempted to access resource requiring roles: ${roles.join(', ')}`
    );
    throw new AuthenticationError('Insufficient permissions');
  };
};

/**
 * Log authentication method for auditing purposes
 */
export const logAuthMethod = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (req.user && req.user.authenticated) {
    const { authMethod, did, address } = req.user;
    logger.info(`Authentication via ${authMethod} - User: ${did || address}`);
  }
  next();
};
