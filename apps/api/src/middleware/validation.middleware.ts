import { Request, Response, NextFunction } from 'express';
import { AnyZodObject, ZodError, ZodType } from 'zod';

/**
 * Middleware that validates request against a Zod schema
 * @param schema Zod schema to validate against
 * @param source Request property to validate ('body', 'query', 'params')
 */
export const validateRequest = (
  schema: ZodType<any, any, any>,
  source: 'body' | 'query' | 'params' = 'body'
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate the request data against the schema
      const validatedData = await schema.parseAsync(req[source]);

      // Replace the request data with the validated data
      req[source] = validatedData;

      // Continue to the next middleware
      next();
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        // Format the error messages
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message
        }));

        // Return a 400 Bad Request response with error details
        return res.status(400).json({
          validationError: true,
          errors: errorMessages
        });
      }

      // Handle other types of errors
      console.error('Validation error:', error);
      return res.status(500).json({
        error: 'Validation failed due to server error'
      });
    }
  };
};

/**
 * Middleware that validates the SIWE message format
 * @param schema Zod schema to validate against
 */
export const validateSiweMessage = (schema: AnyZodObject) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Extract the message from request body
      const { message } = req.body;

      if (!message) {
        return res.status(400).json({
          validationError: true,
          error: 'Message is required'
        });
      }

      // Parse the message to extract the fields
      try {
        // Extract the message parts based on SIWE format
        // This is a simple parser for demonstration
        // In a real implementation, you should use the SIWE library parser
        const parts = message.split('\n');
        const domain = parts[0].split(' ')[0];
        const address = parts[1].trim();
        const statement = parts[3] ? parts[3].trim() : '';

        // Look for the known fields like URI, Chain ID, etc.
        const fieldMap: Record<string, string> = {};
        for (let i = 4; i < parts.length; i++) {
          const line = parts[i];
          if (line.includes(':')) {
            const [key, value] = line.split(':').map((part) => part.trim());
            fieldMap[key] = value;
          }
        }

        // Create a message object for validation
        const messageObject = {
          domain,
          address,
          statement,
          uri: fieldMap['URI'],
          version: fieldMap['Version'],
          chainId: parseInt(fieldMap['Chain ID'] || '0'),
          nonce: fieldMap['Nonce'],
          issuedAt: fieldMap['Issued At'],
          expirationTime: fieldMap['Expiration Time'],
          notBefore: fieldMap['Not Before'],
          requestId: fieldMap['Request ID'],
          resources: fieldMap['Resources']
            ? fieldMap['Resources'].split(',')
            : []
        };

        // Validate the message object
        await schema.parseAsync(messageObject);

        // Continue to the next middleware
        next();
      } catch (parseError) {
        return res.status(400).json({
          validationError: true,
          error: 'Invalid SIWE message format'
        });
      }
    } catch (error) {
      // Handle Zod validation errors
      if (error instanceof ZodError) {
        const errorMessages = error.errors.map((err) => ({
          path: err.path.join('.'),
          message: err.message
        }));

        return res.status(400).json({
          validationError: true,
          errors: errorMessages
        });
      }

      // Handle other types of errors
      console.error('SIWE message validation error:', error);
      return res.status(500).json({
        error: 'Validation failed due to server error'
      });
    }
  };
};
