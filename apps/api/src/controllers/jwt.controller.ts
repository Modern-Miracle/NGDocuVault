import { Request, Response, NextFunction } from 'express';
import { ethers } from 'ethers';
import { BlockchainManager } from '../lib/blockchain';
import { challengeStore } from '../utils/challengeStore';
import { generateToken } from '../utils/jwt';
import { logger } from '../utils/logger';
import {
  ValidationError,
  AuthenticationError,
  NotFoundError
} from '../utils/errors';
import { SessionUser, DidInfo } from '../types';
import jwt from 'jsonwebtoken';
import { JWTService } from '../services/session/jwt.service';
import { AuthService } from '../services/auth/AuthService';
import { SessionService } from '../services/session/session.service';
import { DidRegistryService, DidAuthService } from '../services/contract';
import { DidResolverService } from '../services/auth/DidResolverService';

/**
 * Controller for handling JWT-based authentication flow
 */
export class JwtController {
  private blockchainManager: BlockchainManager;
  private jwtService: JWTService;
  private authService: AuthService;
  private sessionService: SessionService;
  private didRegistryService: DidRegistryService;
  private didAuthService: DidAuthService;
  private didResolverService: DidResolverService;
  private initialized = false;

  constructor() {
    this.blockchainManager = new BlockchainManager();
    this.jwtService = new JWTService();
    this.authService = new AuthService();
    this.sessionService = new SessionService();
    // Initialize DID services
    this.didRegistryService = new DidRegistryService();
    this.didAuthService = new DidAuthService();
    this.didResolverService = new DidResolverService();
  }

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
          throw new ValidationError('DID is not active or does not exist');
        }
      } catch (error) {
        // If there's an error checking the DID, warn but continue
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

      // Determine role - for now using a default role
      // In a real implementation, you would retrieve this from a role mapping contract
      const role = 'user'; // Default role

      // Store user in session
      const sessionUser: SessionUser = {
        did,
        address: recoveredAddress,
        role,
        authenticated: true,
        authMethod: 'jwt'
      };

      req.session.user = sessionUser;

      // Generate a JWT token for the authenticated user
      const token = generateToken(did, recoveredAddress);

      res.json({
        success: true,
        data: {
          did,
          authenticated: true,
          controller: recoveredAddress,
          role,
          token
        }
      });
    } catch (error: any) {
      logger.error('Authentication error:', error);
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
    try {
      // This route is protected by authenticateJWT middleware
      // If we reach this point, the user is authenticated
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
   * Get detailed DID information
   * Protected - requires authentication
   */
  public getDidInfo = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user || !req.user.did) {
        throw new AuthenticationError('Not authenticated with DID');
      }

      const { did } = req.user;

      // Get DID information using the appropriate services
      const [isActive, controller, publicKey, document] = await Promise.all([
        this.didRegistryService.isDidActive(did),
        this.didRegistryService.getDidController(did),
        this.didRegistryService.getPublicKeyForDid(did),
        this.didRegistryService.getDocument(did)
      ]);

      // Get user roles if available
      let credentials: string[] = [];
      try {
        const roles = await this.didAuthService.getUserRolesByDid(did);
        credentials = roles || [];
      } catch (error) {
        logger.warn(`Could not retrieve roles for DID ${did}:`, error);
        // Continue without roles if there's an error
      }

      // Create the DID info response
      const didInfo: DidInfo = {
        did,
        controller,
        active: isActive,
        created: new Date(), // We don't have creation date from contract, use current as fallback
        updated: new Date(), // Use current date since we don't have lastUpdated
        credentials
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
}
