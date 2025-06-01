import { Request, Response, NextFunction } from 'express';
import { SiweAuthChallengeService } from '../services/auth/SiweAuthChallenge.service';
import { AuthService } from '../services/auth/AuthService';
import { SessionService } from '../services/session/session.service';
import {
  TokenPayload,
  DidInfo,
  ExtendedDidDocument,
  DidDocument
} from '../types';
import { logger } from '../utils/logger';
import { AuthenticationError, ValidationError } from '../utils/errors';
import { BlockchainManager } from '../lib/blockchain';
import { DidRegistryService, DidAuthService } from '../services/contract';
import { DidResolverService } from '../services/auth/DidResolverService';

/**
 * Controller for handling Sign-In with Ethereum (SIWE) authentication
 */
export class SiweController {
  private siweAuthChallengeService: SiweAuthChallengeService;
  private authService: AuthService;
  private sessionService: SessionService;
  private blockchainManager: BlockchainManager;
  private didRegistryService: DidRegistryService;
  private didAuthService: DidAuthService;
  private didResolverService: DidResolverService;
  private initialized = false;

  constructor() {
    this.siweAuthChallengeService = new SiweAuthChallengeService();
    this.authService = new AuthService();
    this.sessionService = new SessionService();
    this.blockchainManager = new BlockchainManager();
    // Initialize DID services
    this.didRegistryService = new DidRegistryService();
    this.didAuthService = new DidAuthService();
    this.didResolverService = new DidResolverService();
  }

  /**
   * Initialize services
   */
  private async initializeServices(): Promise<void> {
    if (!this.initialized) {
      await this.siweAuthChallengeService.init();
      await this.sessionService.init();
      this.initialized = true;
    }
  }

  /**
   * Generate a nonce for SIWE authentication
   */
  public generateNonce = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.initializeServices();

      // Get the Ethereum address from the query parameters
      const { address, chainId } = req.query;

      // Generate a challenge
      const { challenge, siweMessage } =
        await this.siweAuthChallengeService.createSiweChallenge(
          address as string,
          parseInt(chainId as string),
          'Sign in with Ethereum to access DocuVault',
          req.ip,
          req.headers['user-agent']
        );

      // Return the challenge
      res.status(200).json({
        message: siweMessage.prepareMessage(),
        expiresAt: challenge.expiresAt,
        nonce: challenge.nonce
      });
    } catch (error) {
      logger.error('Error generating SIWE nonce:', error);
      next(error);
    }
  };

  /**
   * Verify a signed SIWE message
   */
  public verifyMessage = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.initializeServices();

      const { message, signature } = req.body;

      // Verify the SIWE challenge but don't mark it as used yet
      const verification =
        await this.siweAuthChallengeService.verifySiweChallenge(
          signature,
          message,
          false // Don't mark as used until after authentication
        );

      if (!verification.success) {
        throw new AuthenticationError(
          verification.error || 'Verification failed'
        );
      }

      // Authenticate the user - add message as third parameter to skip challenge lookup
      try {
        // Use the same signature that was just verified, and pass the original message
        // This tells AuthService to skip challenge verification since we already did it
        const authResult = await this.authService.authenticate(
          verification.address as string,
          signature,
          message // Pass the message to bypass challenge lookup
        );

        // Mark challenge as used AFTER successful authentication
        if (verification.challengeId) {
          await this.siweAuthChallengeService.markChallengeUsed(
            verification.challengeId
          );
        }

        // Create a session
        const sessionResult = await this.sessionService.createSession(
          verification.address as string,
          req.ip,
          req.headers['user-agent']
        );

        // Store user and refresh token in session
        req.session.user = {
          did: authResult.did,
          address: verification.address as string,
          role: authResult.role || 'user',
          authenticated: true,
          authMethod: 'siwe'
        };

        // Store refresh token in session for future refreshes
        req.session.refreshToken = sessionResult.refreshToken;

        // Also set refresh token as a cookie for additional retrieval method
        if (sessionResult.refreshToken) {
          // Set cookie to expire in 7 days (matching the refresh token lifetime)
          const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
            path: '/'
          };

          res.cookie('refreshToken', sessionResult.refreshToken, cookieOptions);
        }

        // Combine the results
        res.status(200).json({
          auth: authResult,
          session: sessionResult,
          address: verification.address,
          siwe: verification.fields
        });
      } catch (error) {
        logger.error('Authentication failed after SIWE verification:', error);
        throw new AuthenticationError('Authentication failed');
      }
    } catch (error) {
      logger.error('Error verifying SIWE message:', error);
      next(error);
    }
  };

  /**
   * Get current session
   */
  public getSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Get the authorization header
      const authHeader = req.headers.authorization;

      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        res.status(401).json({ authenticated: false });
        return;
      }

      // Extract the token
      const token = authHeader.substring(7);

      // Verify the token
      const tokenPayload = this.authService.verifyToken(
        token
      ) as TokenPayload | null;

      if (!tokenPayload) {
        res.status(401).json({ authenticated: false });
        return;
      }

      res.status(200).json({
        authenticated: true,
        user: {
          address: tokenPayload.sub,
          did: tokenPayload.did,
          role: tokenPayload.role
        }
      });
    } catch (error) {
      logger.error('Error getting session:', error);
      next(error);
    }
  };

  /**
   * Logout from current session
   */
  public logout = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.initializeServices();

      // Try to get the refresh token from multiple sources
      let refreshToken = req.body?.refreshToken;
      
      // Try from session if not in body
      if (!refreshToken && req.session?.refreshToken) {
        refreshToken = req.session.refreshToken;
      }
      
      // Try from cookies if not in body or session
      if (!refreshToken && req.cookies?.refreshToken) {
        refreshToken = req.cookies.refreshToken;
      }

      // If we have a refresh token, revoke it
      if (refreshToken) {
        try {
          await this.sessionService.revokeRefreshToken(refreshToken);
        } catch (error) {
          logger.warn('Error revoking refresh token during logout:', error);
          // Continue with logout even if token revocation fails
        }
      }

      // Clear the refresh token cookie
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });

      // Clear session
      req.session.destroy((err) => {
        if (err) {
          logger.error('Error destroying session:', err);
        }
      });

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error logging out:', error);
      next(error);
    }
  };

  /**
   * Get user profile (protected route)
   */
  public getProfile = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user || !req.user.authenticated) {
        throw new AuthenticationError('Not authenticated');
      }

      const { address, did } = req.user;

      // Get additional profile information if available
      let profileData = {};

      if (did) {
        try {
          const didData = await this.blockchainManager.resolveDid(did);
          profileData = {
            isActive: didData.active,
            controller: didData.controller // Using controller property from blockchain data
          };
        } catch (error) {
          logger.warn(`Could not retrieve DID data for ${did}:`, error);
        }
      }

      res.status(200).json({
        success: true,
        data: {
          user: {
            address,
            did,
            ...profileData,
            authMethod: req.user.authMethod
          }
        }
      });
    } catch (error) {
      logger.error('Error getting user profile:', error);
      next(error);
    }
  };

  /**
   * Get admin data (admin role required)
   */
  public getAdminData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // User and role are already verified by middleware
      if (!req.user) {
        throw new AuthenticationError('Not authenticated');
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Admin access granted',
          adminData: {
            // Mock admin data
            userCount: 120,
            documentCount: 450,
            systemStatus: 'healthy'
          }
        }
      });
    } catch (error) {
      logger.error('Error getting admin data:', error);
      next(error);
    }
  };

  /**
   * Get producer data (producer role required)
   */
  public getProducerData = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // User and role are already verified by middleware
      if (!req.user) {
        throw new AuthenticationError('Not authenticated');
      }

      res.status(200).json({
        success: true,
        data: {
          message: 'Producer access granted',
          producerData: {
            // Mock producer data
            pendingDocuments: 5,
            recentlyVerified: 12,
            verificationQueue: 3
          }
        }
      });
    } catch (error) {
      logger.error('Error getting producer data:', error);
      next(error);
    }
  };

  /**
   * Get detailed DID information
   * Protected - requires authentication
   */
  public getDidInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user || !req.user.address) {
        throw new AuthenticationError('Not authenticated with DID');
      }

      let did = req.user.did;
      if (!did) {
        did = `did:docuvault:${req.user.address}`;
      }
      // check if the did exists
      const isDidExists = await this.didRegistryService.didExists(did);

      if (!isDidExists) {
        throw new AuthenticationError('DID does not exist');
      }

      // Get DID information using the appropriate services
      const document = (await this.didRegistryService.resolveDid(
        did
      )) as unknown as DidDocument;

      console.log('document', document);

      // Get user roles if available
      let roles: string[] = [];
      try {
        roles = await this.didAuthService.getUserRolesByDid(did);
      } catch (error) {
        logger.warn(`Could not retrieve roles for DID ${did}:`, error);
      }

      // Create the DID info response
      const didInfo: ExtendedDidDocument = {
        did: did,
        subject: document.subject,
        active: document.active,
        publicKey: document.publicKey,
        metadata: document.document,
        lastUpdated: document.lastUpdated,
        roles: roles
      };

      res.json({
        success: true,
        data: didInfo
      });
    } catch (error) {
      logger.error('Error getting DID info:', error);
      next(error);
    }
  };

  /**
   * Refresh authentication tokens
   */
  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      await this.initializeServices();

      // Try to get the refresh token from multiple sources
      // 1. From request body
      let refreshToken = req.body?.refreshToken;

      // 2. From session (if not in body)
      if (!refreshToken && req.session && req.session.refreshToken) {
        refreshToken = req.session.refreshToken;
        logger.debug('Using refresh token from session');
      }

      // 3. From cookies (if not in body or session)
      if (!refreshToken && req.cookies && req.cookies.refreshToken) {
        refreshToken = req.cookies.refreshToken;
        logger.debug('Using refresh token from cookies');
      }

      // If we still don't have a token, check if the user is in the session
      if (
        !refreshToken &&
        req.session &&
        req.session.user &&
        req.session.user.address
      ) {
        logger.debug(
          'No refresh token found, but user is in session. Creating new session.'
        );
        // Create a new session for the user if they're already authenticated
        const sessionResult = await this.sessionService.createSession(
          req.session.user.address,
          req.ip,
          req.headers['user-agent']
        );

        res.status(200).json({
          accessToken: sessionResult.accessToken,
          refreshToken: sessionResult.refreshToken,
          expiresIn: sessionResult.accessToken ? 3600 : 0, // Default to 1 hour expiration or 0 if no token
          success: true
        });
        return;
      }

      // If no refresh token is found anywhere
      if (!refreshToken) {
        logger.warn('No refresh token provided');
        throw new AuthenticationError('No refresh token provided');
      }

      // Refresh the session
      const result = await this.sessionService.refreshSession(
        refreshToken,
        req.ip,
        req.headers['user-agent']
      );

      if (!result) {
        throw new AuthenticationError('Invalid or expired refresh token');
      }

      // Store new refresh token in session for future use
      if (req.session) {
        req.session.refreshToken = result.refreshToken;
      }

      res.status(200).json({
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
        expiresIn: result.accessToken ? 3600 : 0, // Default to 1 hour expiration or 0 if no token
        success: true
      });
    } catch (error) {
      logger.error('Error refreshing token:', error);
      next(error);
    }
  };

  /**
   * Clear session without requiring refresh token
   * This is a simpler logout endpoint that just clears the session
   */
  public clearSession = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Clear the refresh token cookie if it exists
      res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });

      // Clear session
      req.session.destroy((err) => {
        if (err) {
          logger.error('Error destroying session:', err);
          // Still send success response as the main goal is achieved
        }
      });

      res.status(200).json({ 
        success: true,
        message: 'Session cleared successfully' 
      });
    } catch (error) {
      logger.error('Error clearing session:', error);
      next(error);
    }
  };

  /**
   * Clear rate limiting for an address (development only)
   */
  public clearRateLimits = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Only allow in development mode
      if (process.env.NODE_ENV === 'production') {
        throw new ValidationError(
          'This endpoint is only available in development mode'
        );
      }

      await this.initializeServices();

      const { address } = req.body;

      if (!address) {
        throw new ValidationError('Address is required');
      }

      const addressLower = address.toLowerCase();
      const ipAddress = req.ip || 'unknown';

      // Clear rate limiting for address
      const addressCleared =
        await this.siweAuthChallengeService.clearRateLimiting(
          addressLower,
          'ADDRESS'
        );

      // Clear rate limiting for IP
      let ipCleared = 0;
      if (ipAddress !== 'unknown') {
        ipCleared = await this.siweAuthChallengeService.clearRateLimiting(
          ipAddress,
          'IP'
        );
      }

      logger.debug(
        `Cleared rate limiting for address ${addressLower} and IP ${ipAddress}`
      );

      res.status(200).json({
        success: true,
        message: `Cleared ${addressCleared} address entries and ${ipCleared} IP entries`
      });
    } catch (error) {
      logger.error('Error clearing rate limiting:', error);
      next(error);
    }
  };

  /**
   * Reset a challenge's used status (development only)
   */
  public resetChallenge = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Only allow in development mode
      if (process.env.NODE_ENV === 'production') {
        throw new ValidationError(
          'This endpoint is only available in development mode'
        );
      }

      await this.initializeServices();

      const { address, challengeId } = req.body;

      if (!address && !challengeId) {
        throw new ValidationError('Either address or challengeId is required');
      }

      let challenge;

      if (address) {
        const addressLower = address.toLowerCase();
        challenge =
          await this.siweAuthChallengeService.getActiveChallenge(addressLower);

        if (!challenge) {
          throw new ValidationError(
            'No active challenge found for this address'
          );
        }
      } else if (challengeId) {
        challenge =
          await this.siweAuthChallengeService.getChallengeById(challengeId);

        if (!challenge) {
          throw new ValidationError('Challenge not found');
        }
      }

      // Access the database directly - only for development purposes
      // For production, we would use a proper service method
      const databaseService = (this.siweAuthChallengeService as any)
        .databaseService;
      const pool = await databaseService.getPool();

      // Reset the Used flag for this challenge
      const result = await pool.request().input('id', challenge.id).query(`
          UPDATE AuthChallenges
          SET Used = 0, UsedAt = NULL
          WHERE Id = @id
        `);

      const rowsAffected = result.rowsAffected[0];

      logger.debug(
        `Reset challenge ${challenge.id}: ${rowsAffected} rows affected`
      );

      res.status(200).json({
        success: true,
        message: `Reset challenge: ${challenge.id}`,
        challengeId: challenge.id,
        rowsAffected
      });
    } catch (error) {
      logger.error('Error resetting challenge:', error);
      next(error);
    }
  };

  /**
   * Reset ALL challenges for an address (development only)
   */
  public resetAllChallenges = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Only allow in development mode
      if (process.env.NODE_ENV === 'production') {
        throw new ValidationError(
          'This endpoint is only available in development mode'
        );
      }

      await this.initializeServices();

      const { address } = req.body;

      if (!address) {
        throw new ValidationError('Address is required');
      }

      const addressLower = address.toLowerCase();

      // Access the database directly - only for development purposes
      // For production, we would use a proper service method
      const databaseService = (this.siweAuthChallengeService as any)
        .databaseService;
      const pool = await databaseService.getPool();

      // Reset the Used flag for ALL challenges for this address
      const result = await pool.request().input('address', addressLower).query(`
          UPDATE AuthChallenges
          SET Used = 0, UsedAt = NULL
          WHERE Address = @address
        `);

      const rowsAffected = result.rowsAffected[0];

      logger.debug(
        `Reset ALL challenges for address ${addressLower}: ${rowsAffected} rows affected`
      );

      res.status(200).json({
        success: true,
        message: `Reset ${rowsAffected} challenges for address: ${addressLower}`
      });
    } catch (error) {
      logger.error('Error resetting challenges:', error);
      next(error);
    }
  };
}
