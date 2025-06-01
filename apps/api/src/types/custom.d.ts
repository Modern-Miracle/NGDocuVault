import { JwtPayload } from 'jsonwebtoken';

declare global {
  namespace Express {
    // Override the Request interface
    interface Request {
      // Add custom user type that extends JwtPayload
      user?: JwtPayload & {
        did?: string;
        address: string;
        role?: string;
        authenticated: boolean;
        authMethod: string;
      };
      // Extend session type
      session: {
        user?: {
          did?: string;
          address: string;
          role?: string;
          authenticated: boolean;
          authMethod: string;
        };
        destroy: (callback: (err: any) => void) => void;
        [key: string]: any;
      };
    }
  }
}

// Required to make this file a module
export {};
