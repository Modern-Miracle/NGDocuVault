import * as sql from 'mssql';
import { randomBytes } from 'crypto';
import { SiweMessage } from 'siwe';

import { AuthChallenge, AuthChallengeInput } from '../../models';
import {
  AuthDatabaseService,
  DatabaseService as DatabaseSetupService
} from '../db';
import { generateSiweMessage } from '../../utils/siwe.utils';

/**
 * Service for managing authentication challenges
 * This service provides methods for creating, retrieving, and updating challenges
 */
export class AuthChallengeService {
  private authDbService: AuthDatabaseService;
  private dbSetupService: DatabaseSetupService;

  /**
   * Create a new authentication challenge service
   * @param authDbService The authentication database service instance
   * @param dbSetupService The database setup service instance
   */
  constructor(
    authDbService: AuthDatabaseService = new AuthDatabaseService(),
    dbSetupService: DatabaseSetupService = new DatabaseSetupService()
  ) {
    this.authDbService = authDbService;
    this.dbSetupService = dbSetupService;
  }

  /**
   * Initialize the service by initializing the underlying database services
   */
  async init(): Promise<void> {
    try {
      await Promise.all([
        this.authDbService.initialize(),
        this.dbSetupService.initialize()
      ]);

      try {
        await this.dbSetupService.setupDatabase();
      } catch (error: any) {
        console.warn('Error setting up database tables:', error.message);
      }
    } catch (error) {
      console.error(
        'Failed to initialize AuthChallengeService:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Generate a new authentication challenge for a user
   * @param address Ethereum address of the user
   * @param ipAddress Optional IP address of the user
   * @param userAgent Optional user agent string
   * @returns The generated challenge
   */
  async generateChallenge(
    address: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<AuthChallenge> {
    console.log(`Generating challenge for address: ${address}`);
    const normalizedAddress = address.toLowerCase();

    const rateLimit = await this.authDbService.checkRateLimit(
      normalizedAddress,
      'ADDRESS'
    );
    if (rateLimit.isBlocked) {
      const blockMsg = `Address ${normalizedAddress} is rate-limited until ${rateLimit.blockedUntil}`;
      console.warn(blockMsg);
      throw new Error(blockMsg);
    }

    if (ipAddress) {
      const ipRateLimit = await this.authDbService.checkRateLimit(
        ipAddress,
        'IP'
      );
      if (ipRateLimit.isBlocked) {
        const blockMsg = `IP address ${ipAddress} is rate-limited until ${ipRateLimit.blockedUntil}`;
        console.warn(blockMsg);
        throw new Error(blockMsg);
      }
    }

    await this.authDbService.recordAuthAttempt(normalizedAddress, 'ADDRESS');
    if (ipAddress) {
      await this.authDbService.recordAuthAttempt(ipAddress, 'IP');
    }

    const nonce = randomBytes(16).toString('hex');
    const issuedAt = new Date();
    const expiresAt = new Date(issuedAt.getTime() + 5 * 60 * 1000);

    const domain = process.env.SIWE_DOMAIN || 'localhost';
    const uri = process.env.SIWE_URI || 'http://localhost:3000';
    const chainId = parseInt(process.env.CHAIN_ID || '1');
    const statement = 'Sign in with Ethereum to the app.';

    const siweMessage = generateSiweMessage(
      domain,
      address,
      statement,
      uri,
      chainId,
      nonce,
      expiresAt
    );

    const challengeInput: AuthChallengeInput = {
      address: normalizedAddress,
      nonce,
      message: siweMessage,
      issuedAt,
      expiresAt,
      ipAddress,
      userAgent
    };

    try {
      const challenge =
        await this.authDbService.createAuthChallenge(challengeInput);
      console.log(
        `Challenge generated successfully for ${normalizedAddress}, ID: ${challenge.id}`
      );
      return challenge;
    } catch (error) {
      console.error(
        `Error generating challenge for ${normalizedAddress}:`,
        error
      );
      throw new Error('Failed to generate authentication challenge.');
    }
  }

  /**
   * Verify a signed message against an active challenge
   * @param address The address that signed the message
   * @param message The original SIWE message
   * @param signature The signature provided by the user
   * @returns True if verification is successful, false otherwise
   */
  async verifyChallenge(
    address: string,
    message: string,
    signature: string
  ): Promise<boolean> {
    const normalizedAddress = address.toLowerCase();
    console.log(
      `Verifying challenge for address: ${normalizedAddress}, signature: ${signature.substring(0, 10)}...`
    );

    let parsedMessage: SiweMessage;
    try {
      parsedMessage = new SiweMessage(message);
      if (!parsedMessage.nonce) {
        throw new Error('Nonce is missing from the SIWE message');
      }
    } catch (e: any) {
      console.error('Error parsing SIWE message:', e.message);
      return false;
    }

    const challengeId = parsedMessage.nonce;

    const activeChallenge =
      await this.authDbService.getActiveAuthChallengeForAddress(
        normalizedAddress
      );

    if (!activeChallenge) {
      console.log(`No active challenge found for address ${normalizedAddress}`);
      return false;
    }

    if (parsedMessage.nonce !== activeChallenge.nonce) {
      console.log(
        `Nonce mismatch: Expected ${activeChallenge.nonce}, got ${parsedMessage.nonce}`
      );
      const challengeByNonce = await this.authDbService.getAuthChallengeById(
        parsedMessage.nonce
      );
      if (!challengeByNonce || challengeByNonce.address !== normalizedAddress) {
        console.log(
          `Challenge with nonce ${parsedMessage.nonce} not found or address mismatch.`
        );
        return false;
      }
      if (challengeByNonce.expiresAt < new Date()) {
        console.log(`Challenge ${parsedMessage.nonce} has expired.`);
        return false;
      }
      if (challengeByNonce.used) {
        console.log(`Challenge ${parsedMessage.nonce} has already been used.`);
        return false;
      }
      console.log(`Using challenge ${challengeByNonce.id} found via nonce.`);
      Object.assign(activeChallenge, challengeByNonce);
    }

    console.log(`Verifying against challenge ID: ${activeChallenge.id}`);

    try {
      await parsedMessage.verify({ signature });

      console.log(
        `Challenge verification successful for address ${normalizedAddress}, challenge ID: ${activeChallenge.id}`
      );

      const marked = await this.authDbService.markAuthChallengeAsUsed(
        activeChallenge.id
      );
      if (!marked) {
        console.warn(
          `Failed to mark challenge ${activeChallenge.id} as used after verification.`
        );
      }
      return true;
    } catch (error: any) {
      console.error(
        `Challenge verification failed for address ${normalizedAddress}:`,
        error.message
      );
      return false;
    }
  }

  /**
   * Get an active challenge by address
   * @param address Ethereum address
   * @returns The active challenge or null
   */
  async getActiveChallenge(address: string): Promise<AuthChallenge | null> {
    return this.authDbService.getActiveAuthChallengeForAddress(
      address.toLowerCase()
    );
  }

  /**
   * Mark a challenge as used
   * @param challengeId The ID of the challenge
   * @returns boolean indicating success
   */
  async markChallengeUsed(challengeId: string): Promise<boolean> {
    return this.authDbService.markAuthChallengeAsUsed(challengeId);
  }

  /**
   * Get a challenge by its ID
   * @param id The ID of the challenge to retrieve
   * @returns The challenge or null if not found
   */
  async getChallengeById(id: string): Promise<AuthChallenge | null> {
    return await this.authDbService.getAuthChallengeById(id);
  }

  /**
   * Delete all expired challenges
   * @returns The number of challenges deleted
   */
  async cleanupExpiredChallenges(): Promise<number> {
    return await this.authDbService.deleteExpiredAuthChallenges();
  }

  /**
   * Close the service and release resources
   */
  async close(): Promise<void> {
    await this.authDbService.close();
  }

  /**
   * Create a new authentication challenge for a wallet address with transaction support
   * @param address The Ethereum address to create the challenge for
   * @param nonce The nonce to use for the challenge
   * @param message The challenge message
   * @param ipAddress Optional IP address of the requesting client
   * @param userAgent Optional user agent of the requesting client
   * @param transaction Optional transaction for atomic operations
   * @returns The created authentication challenge
   */
  async createChallengeWithTransaction(
    address: string,
    nonce: string,
    message: string,
    ipAddress?: string,
    userAgent?: string,
    transaction?: sql.Transaction
  ): Promise<AuthChallenge> {
    // Set expiration to 15 minutes from now
    const issuedAt = new Date();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 15);

    const challengeInput: AuthChallengeInput = {
      address,
      nonce,
      message,
      issuedAt,
      expiresAt,
      ipAddress,
      userAgent
    };

    return await this.authDbService.createAuthChallengeWithTransaction(
      challengeInput,
      transaction
    );
  }

  /**
   * Mark a challenge as used (consumed) with transaction support
   * @param challengeId The ID of the challenge to mark as used
   * @param transaction Optional transaction for atomic operations
   * @returns True if the challenge was marked as used, false otherwise
   */
  async markAsUsedWithTransaction(
    challengeId: string,
    transaction?: sql.Transaction
  ): Promise<boolean> {
    return await this.authDbService.markAuthChallengeAsUsedWithTransaction(
      challengeId,
      transaction
    );
  }

  /**
   * Create a transaction for atomic operations
   * @returns A new SQL transaction
   */
  async createTransaction(): Promise<sql.Transaction> {
    return await this.authDbService.getTransaction();
  }

  /**
   * Commit a transaction
   * @param transaction The transaction to commit
   */
  async commitTransaction(transaction: sql.Transaction): Promise<void> {
    await transaction.commit();
  }

  /**
   * Rollback a transaction
   * @param transaction The transaction to rollback
   */
  async rollbackTransaction(transaction: sql.Transaction): Promise<void> {
    await transaction.rollback();
  }

  /**
   * Check if an identifier is rate-limited
   * @param identifier The identifier (address or IP) to check
   * @param type The type of identifier (ADDRESS or IP)
   * @returns Information about the rate limit status
   */
  async checkRateLimit(
    identifier: string,
    type: 'ADDRESS' | 'IP'
  ): Promise<{
    isBlocked: boolean;
    blockedUntil?: Date;
    attemptCount: number;
  }> {
    try {
      return await this.authDbService.checkRateLimit(identifier, type);
    } catch (error: unknown) {
      console.error(
        `Rate limit check error for ${type} ${identifier}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );

      return {
        isBlocked: false,
        attemptCount: 0
      };
    }
  }

  /**
   * Record an authentication attempt for rate limiting purposes
   * @param identifier The identifier (address or IP) to record the attempt for
   * @param type The type of identifier (ADDRESS or IP)
   * @returns Information about the rate limit status
   */
  async recordAuthAttempt(
    identifier: string,
    type: 'ADDRESS' | 'IP'
  ): Promise<{
    attemptCount: number;
    isBlocked: boolean;
    blockedUntil?: Date;
  }> {
    try {
      return await this.authDbService.recordAuthAttempt(identifier, type);
    } catch (error: unknown) {
      console.error(
        `Error recording auth attempt for ${type} ${identifier}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );

      return {
        attemptCount: 0,
        isBlocked: false
      };
    }
  }

  /**
   * Clear rate limiting for an identifier
   * @param identifier The identifier to clear rate limiting for
   * @param type The type of identifier (ADDRESS or IP)
   * @returns The number of records cleared
   */
  async clearRateLimiting(
    identifier: string,
    type: 'ADDRESS' | 'IP'
  ): Promise<number> {
    try {
      return await this.authDbService.clearRateLimitingForIdentifier(
        identifier,
        type
      );
    } catch (error: unknown) {
      console.error(
        `Error clearing rate limiting for ${type} ${identifier}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return 0;
    }
  }
}
