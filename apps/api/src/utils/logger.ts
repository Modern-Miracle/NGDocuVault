import morgan from 'morgan';
import { StreamOptions } from 'morgan';
import fs from 'fs';
import path from 'path';
import winston from 'winston';

// Define log directory
const logDir = 'logs';

// Create log directory if it doesn't exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

// Define log format
const { combine, timestamp, printf, colorize, json } = winston.format;

// Custom log format
const logFormat = printf(({ level, message, timestamp, ...meta }) => {
  return `[${level.toUpperCase()}] ${timestamp} - ${message} ${
    Object.keys(meta).length ? JSON.stringify(meta) : ''
  }`;
});

// Create Winston logger
const winstonLogger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    process.env.NODE_ENV === 'production'
      ? json()
      : combine(colorize(), logFormat)
  ),
  defaultMeta: { service: 'api' },
  transports: [
    // Write all logs with level 'error' and below to error.log
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error'
    }),
    // Write all logs to combined.log
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log')
    })
  ],
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(logDir, 'exceptions.log')
    })
  ]
});

// Add console transport in development
if (process.env.NODE_ENV !== 'production') {
  winstonLogger.add(
    new winston.transports.Console({
      format: combine(colorize(), logFormat)
    })
  );
}

// Stream for Morgan
const stream: StreamOptions = {
  write: (message: string) => winstonLogger.http(message.trim())
};

// Create Morgan middleware with custom format
const morganMiddleware = morgan(
  // Define format
  ':method :url :status :res[content-length] - :response-time ms',
  // Options: use the defined stream
  { stream }
);

/**
 * Application logger
 * Unified logger with Winston and Morgan integration
 */
export const logger = {
  /**
   * Log informational messages
   * @param message - The message to log
   * @param args - Additional arguments to log
   */
  info: (message: string, ...args: any[]): void => {
    winstonLogger.info(message, ...args);
  },

  /**
   * Log error messages
   * @param message - The message to log
   * @param args - Additional arguments to log (including Error objects)
   */
  error: (message: string, ...args: any[]): void => {
    winstonLogger.error(message, ...args);
  },

  /**
   * Log warning messages
   * @param message - The message to log
   * @param args - Additional arguments to log
   */
  warn: (message: string, ...args: any[]): void => {
    winstonLogger.warn(message, ...args);
  },

  /**
   * Log debug messages (only in non-production environments)
   * @param message - The message to log
   * @param args - Additional arguments to log
   */
  debug: (message: string, ...args: any[]): void => {
    winstonLogger.debug(message, ...args);
  },

  /**
   * Log HTTP request information (used by Morgan)
   * @param message - The HTTP log message
   */
  http: (message: string): void => {
    winstonLogger.http(message);
  },

  /**
   * Morgan middleware for Express
   * Preconfigured with appropriate format and log handling
   */
  morganMiddleware
};
