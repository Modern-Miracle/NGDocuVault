import { NextFunction, Request, Response } from 'express';
import { ethers } from 'ethers';
import { SiweAuthChallengeService } from '../services/auth/SiweAuthChallenge.service';
import { AuthService } from '../services/auth/AuthService';
import { SessionService } from '../services/session/session.service';
import { TokenPayload } from '../types';
import { logger } from '../utils/logger';
import { SiweUser } from '../middleware/auth.middleware';
import { BlockchainManager } from '../lib/blockchain';
import { generateToken } from '../utils/jwt';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError
} from '../utils/errors';
import { challengeStore } from '../utils/challengeStore';

/**
 * Controller for handling Sign-In with Ethereum (SIWE) authentication
 */
export class AuthController {
  private siweAuthChallengeService: SiweAuthChallengeService;
  private authService: AuthService;
  private sessionService: SessionService;
  private blockchainManager: BlockchainManager;
  private initialized = false;

  constructor() {
    this.siweAuthChallengeService = new SiweAuthChallengeService();
    this.authService = new AuthService();
    this.sessionService = new SessionService();
    this.blockchainManager = new BlockchainManager();
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
  public generateNonce = async (req: Request, res: Response): Promise<void> => {
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
        expiresAt: challenge.expiresAt
      });
    } catch (error) {
      logger.error('Error generating SIWE nonce:', error);
      res.status(500).json({ error: 'Failed to generate SIWE nonce' });
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

      // Verify the SIWE challenge
      const verification =
        await this.siweAuthChallengeService.verifySiweChallenge(
          signature,
          message
        );

      if (!verification.success) {
        throw new AuthenticationError(
          verification.error || 'Verification failed'
        );
      }

      // Authenticate the user
      try {
        const authResult = await this.authService.authenticate(
          verification.address as string,
          signature
        );

        // Create a session
        const sessionResult = await this.sessionService.createSession(
          verification.address as string,
          req.ip,
          req.headers['user-agent']
        );

        // Store user in session
        if (req.session) {
          req.session.user = {
            did: authResult.did,
            address: verification.address as string,
            role: authResult.role || 'user',
            authenticated: true,
            authMethod: 'siwe'
          };
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
  public getSession = async (req: Request, res: Response): Promise<void> => {
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
      res.status(500).json({ error: 'Failed to get session' });
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

      // Get the refresh token from the request body
      const { refreshToken } = req.body;

      // Revoke the session
      const success =
        await this.sessionService.revokeRefreshToken(refreshToken);

      if (!success) {
        throw new ValidationError('Failed to revoke session');
      }

      // Clear session
      if (req.session) {
        req.session.destroy((err) => {
          if (err) {
            logger.error('Error destroying session:', err);
          }
        });
      }

      res.status(200).json({ success: true });
    } catch (error) {
      logger.error('Error logging out:', error);
      next(error);
    }
  };

  /**
   * Get user profile (protected route)
   */
  public getProfile = (req: Request, res: Response): void => {
    const user = (req as any).user as SiweUser;

    res.status(200).json({
      message: 'You have accessed a protected endpoint',
      user
    });
  };

  /**
   * Get admin data (protected route for admins only)
   */
  public getAdminData = (req: Request, res: Response): void => {
    const user = (req as any).user as SiweUser;

    res.status(200).json({
      message: 'You have accessed an admin-only endpoint',
      user
    });
  };

  /**
   * Get producer data (protected route for producers only)
   */
  public getProducerData = (req: Request, res: Response): void => {
    const user = (req as any).user as SiweUser;

    res.status(200).json({
      message: 'You have accessed a producer-only endpoint',
      user
    });
  };

  /**
   * Get DID information (protected route)
   */
  public getDidInfo = (req: Request, res: Response): void => {
    const user = (req as any).user as SiweUser;

    if (!user?.did) {
      res.status(404).json({
        message: 'No DID associated with this account',
        address: user?.address
      });
      return;
    }

    res.status(200).json({
      message: 'DID information retrieved successfully',
      did: user.did,
      address: user.address,
      role: user.role
    });
  };

  // ****************** LEGACY ROUTES ******************

  /**
   * Authenticate a DID by verifying a signature
   */
  public authenticate = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { did, message, signature } = req.body;

      if (!did || !message || !signature) {
        throw new ValidationError('DID, message, and signature are required');
      }

      // Get the stored challenge
      const storedChallenge = challengeStore.getChallenge(did);

      if (!storedChallenge) {
        throw new AuthenticationError(
          'Challenge not found or expired. Please request a new challenge.'
        );
      }

      // Verify the message matches the stored challenge
      if (message !== storedChallenge.message) {
        throw new AuthenticationError(
          'Message does not match the issued challenge'
        );
      }

      // Get the DID data from the blockchain
      const didData = await this.blockchainManager.resolveDid(did);

      if (!didData.active) {
        throw new AuthenticationError('DID is deactivated');
      }

      // Verify the signature using ethers
      const messageHash = ethers.hashMessage(message);
      const recoveredAddress = ethers.recoverAddress(messageHash, signature);

      // Verify that the signer is the DID controller
      const isController = await this.blockchainManager.isOwner(
        did,
        recoveredAddress
      );

      if (!isController) {
        throw new AuthenticationError(
          'Signature verification failed: Not the DID controller'
        );
      }

      // Remove the used challenge to prevent replay attacks
      challengeStore.removeChallenge(did);

      // Store user in session
      if (req.session) {
        req.session.user = {
          did,
          address: recoveredAddress,
          role: 'user', // Default role - may need to retrieve from didData
          authenticated: true,
          authMethod: 'jwt'
        };
      }

      // Generate a JWT token for the authenticated user
      const token = generateToken(did, recoveredAddress);

      res.json({
        success: true,
        data: {
          did,
          authenticated: true,
          controller: recoveredAddress,
          token
        }
      });
    } catch (error: any) {
      logger.error('Authentication error:', error);
      next(error);
    }
  };

  /**
   * Verify that an address controls a DID
   */
  public verifyController = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { did, address } = req.body;

      if (!did || !address) {
        throw new ValidationError('DID and address are required');
      }

      const isController = await this.blockchainManager.isOwner(did, address);

      res.json({
        success: true,
        data: {
          did,
          address,
          isController
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get the DID for an address
   */
  public getDidForAddress = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { address } = req.params;

      if (!address) {
        throw new ValidationError('Address is required');
      }

      try {
        const did = await this.blockchainManager.addressToDid(address);

        res.json({
          success: true,
          data: {
            address,
            did
          }
        });
      } catch (error: any) {
        if (error.message.includes('No DID found')) {
          throw new NotFoundError(`No DID found for address ${address}`);
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Check if a DID is active
   */
  public checkDidActive = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { did } = req.params;

      if (!did) {
        throw new ValidationError('DID is required');
      }

      try {
        // Use a method in BlockchainManager instead of accessing contract directly
        const isActive = await this.blockchainManager.isDidActive(did);

        res.json({
          success: true,
          data: {
            did,
            isActive
          }
        });
      } catch (error: any) {
        // If the DID doesn't exist, return false
        if (
          error.message.includes('not found') ||
          error.message.includes('not registered')
        ) {
          res.json({
            success: true,
            data: {
              did,
              isActive: false,
              exists: false
            }
          });
          return;
        }
        throw error;
      }
    } catch (error) {
      next(error);
    }
  };

  /**
   * Generate a challenge for authentication
   */
  public generateChallenge = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const { did } = req.body;

      if (!did) {
        throw new ValidationError('DID is required');
      }

      // Check if the DID exists and is active
      try {
        const isActive = await this.blockchainManager.isDidActive(did);
        if (!isActive) {
          const error = new ValidationError(
            'DID is not active or does not exist'
          );
          logger.warn(`Could not verify DID activity: ${did}`, error);
          next(error);
          return;
        }
      } catch (error) {
        // If there's an error checking the DID, continue - we'll handle non-existent DIDs at login
        logger.warn(`Could not verify DID activity: ${did}`, error);
      }

      // Generate a random challenge
      const challenge = Buffer.from(ethers.randomBytes(32)).toString('hex');
      const timestamp = Math.floor(Date.now() / 1000);
      const expiresAt = timestamp + 3600; // 1 hour expiration

      // Create the message to be signed
      const message = `Authenticate with DID ${did} at time ${timestamp}. Challenge: ${challenge}`;

      // Store the challenge
      challengeStore.storeChallenge(did, challenge, message, expiresAt);

      res.json({
        success: true,
        data: {
          did,
          challenge,
          message,
          expires: expiresAt
        }
      });
    } catch (error) {
      logger.error('Error generating challenge:', error);
      next(error);
    }
  };

  /**
   * Check if the user is currently authenticated
   */
  public checkAuth = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // This route is protected by the authenticateJWT middleware
    // If we reach this point, the user is authenticated
    try {
      res.json({
        success: true,
        data: {
          authenticated: true,
          user: req.user
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Refresh an authentication token
   */
  public refreshToken = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    // This route is protected by the authenticateJWT middleware
    // If we reach this point, the user is authenticated
    try {
      if (!req.user) {
        throw new AuthenticationError('Not authenticated');
      }

      // Generate a new token
      const newToken = generateToken(req.user.did, req.user.address);

      res.json({
        success: true,
        data: {
          token: newToken
        }
      });
    } catch (error) {
      next(error);
    }
  };
  // ****************** LEGACY ROUTES ******************
}
