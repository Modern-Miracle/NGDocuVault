import 'dotenv/config';

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import session from 'express-session';
import cookieParser from 'cookie-parser';

import { errorHandler } from './middleware/error.middleware';
import ipfsRouter from './routes/ipfs.routes';
// import { credentialRouter } from './routes/credential.routes';
// import { didRouter } from './routes/did.routes';

import { authRouter } from './routes/auth.routes';
import { authErrorHandler } from './middleware/auth.middleware';
import {
  populateUserFromSession,
  logAuthMethod
} from './middleware/session.middleware';
import { sessionConfig } from './config/session.config';
import { corsConfig } from './config/cors.config';
import { logger } from './utils/logger';

const app: express.Application = express();

// Trust proxies for proper IP detection behind load balancers
app.set('trust proxy', true);

// Middleware
app.use(cors(corsConfig)); // Enable CORS with credentials support
app.use(helmet()); // Security headers
app.use(logger.morganMiddleware); // HTTP request logging
app.use(express.json({ limit: '10mb' })); // Parse JSON bodies with increased limit
app.use(express.urlencoded({ limit: '10mb', extended: true })); // Parse URL-encoded bodies with increased limit
app.use(cookieParser()); // Parse cookies
app.use(session(sessionConfig));

// Populate user from session
app.use(populateUserFromSession);

// Log authentication method for auditing
app.use(logAuthMethod);

// Health check endpoint
app.get('/api/v1/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
// app.use('/api/v1/did', didRouter);
// app.use('/api/v1/credentials', credentialRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/ipfs', ipfsRouter);
// Error handling
app.use(authErrorHandler); // Handle Auth-SIWE-specific errors first
app.use(errorHandler); // General error handler

export default app;
