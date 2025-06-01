import { rateLimit } from 'express-rate-limit';
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

// Common rate limiter configuration
const createLimiter = (options: {
  windowMs: number;
  limit: number;
  message: string;
  logPrefix: string;
}) => {
  return rateLimit({
    windowMs: options.windowMs,
    limit: options.limit,
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    message: { error: options.message },
    // Use the IP from X-Forwarded-For when behind a proxy (trust proxy is set in app.ts)
    // Fall back to req.ip if not available
    keyGenerator: (req) => {
      const xForwardedFor = req.headers['x-forwarded-for'];
      const ip = Array.isArray(xForwardedFor)
        ? xForwardedFor[0]
        : typeof xForwardedFor === 'string'
          ? xForwardedFor.split(',')[0].trim()
          : req.ip;

      return ip;
    },
    handler: (req: Request, res: Response) => {
      logger.warn(`${options.logPrefix} rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ error: options.message });
    }
  });
};

/**
 * Standard rate limiter configuration
 * Limits to 100 requests per 15 minutes
 */
export const standardLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 100, // Limit each IP to 100 requests per window
  message: 'Too many requests, please try again later.',
  logPrefix: 'Standard'
});

/**
 * Authentication-specific rate limiter
 * More restrictive to prevent brute force attacks
 * Limits to 20 requests per 15 minutes
 */
export const authLimiter = createLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 20, // Limit each IP to 20 requests per window
  message: 'Too many authentication attempts, please try again later.',
  logPrefix: 'Authentication'
});

/**
 * Special endpoints rate limiter
 * For endpoints that need stricter protection
 * Limits to 5 requests per minute
 */
export const sensitiveEndpointLimiter = createLimiter({
  windowMs: 60 * 1000, // 1 minute
  limit: 5, // Limit each IP to 5 requests per minute
  message: 'Rate limit exceeded for sensitive operation.',
  logPrefix: 'Sensitive endpoint'
});
