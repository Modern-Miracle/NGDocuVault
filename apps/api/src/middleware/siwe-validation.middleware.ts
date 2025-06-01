import { Request, Response, NextFunction } from 'express';
import { SiweMessage } from 'siwe';
import { logger } from '../utils/logger';

/**
 * Middleware that validates a SIWE message using the official library parser
 */
export const validateSiweMessage = () => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract the message and signature from request body
      const { message, signature } = req.body;

      if (!message) {
        return res.status(400).json({
          validationError: true,
          error: 'Message is required'
        });
      }

      if (!signature) {
        return res.status(400).json({
          validationError: true,
          error: 'Signature is required'
        });
      }

      try {
        // Use the SIWE library to parse the message
        const siweMessage = new SiweMessage(message);

        // Store the parsed message for later use
        req.body.parsedMessage = siweMessage;

        // Log successful parsing
        logger.debug('SIWE message successfully parsed', {
          address: siweMessage.address,
          domain: siweMessage.domain,
          nonce: siweMessage.nonce
        });

        // Continue to the next middleware
        next();
      } catch (parseError) {
        logger.error('SIWE message parsing error:', parseError);
        return res.status(400).json({
          validationError: true,
          error:
            parseError instanceof Error
              ? parseError.message
              : 'Invalid SIWE message format'
        });
      }
    } catch (error) {
      // Handle other types of errors
      logger.error('SIWE message validation error:', error);
      return res.status(500).json({
        error: 'Validation failed due to server error'
      });
    }
  };
};
