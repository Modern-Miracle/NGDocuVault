import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { logger } from '../utils/logger';

/**
 * Global error handling middleware
 * Processes different types of errors and returns appropriate responses
 * 
 * @param error - The error object
 * @param req - Express request object
 * @param res - Express response object
 * @param next - Express next function
 */
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  logger.error(`Error handling request to ${req.method} ${req.url}`, error);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let stack = undefined;

  // Handle AppError instances (custom errors)
  if (error instanceof AppError) {
    statusCode = error.statusCode;
    message = error.message;

    // Only include stack trace for non-operational errors in development
    if (!error.isOperational && process.env.NODE_ENV === 'development') {
      stack = error.stack;
    }
  } else if (process.env.NODE_ENV === 'development') {
    // For non-AppError instances, include stack trace in development
    stack = error.stack;
    message = error.message;
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message,
      ...(stack && { stack })
    }
  });
};
