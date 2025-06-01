// apps/api/src/types/express.d.ts
import {
  Request as ExpressRequest,
  Response as ExpressResponse,
  NextFunction as ExpressNextFunction
} from 'express';
import session from 'express-session';
import { SessionUser } from './index';
import { SiweMessage } from 'siwe';

// Define session data with our User type
declare module 'express-session' {
  interface SessionData {
    user?: SessionUser;
  }
}

// Extend Express Request with session user
declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
      session: session.Session & Partial<session.SessionData>;
      body: {
        parsedMessage?: SiweMessage;
        [key: string]: any;
      };
    }
  }
}

export type Request = ExpressRequest;
export type Response = ExpressResponse;
export type NextFunction = ExpressNextFunction;
