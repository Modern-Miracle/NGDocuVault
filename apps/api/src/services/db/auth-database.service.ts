import * as sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

import { AuthChallenge, AuthChallengeInput } from '../../models'; // Assuming models are in ../../models
import { BaseDatabaseService } from './base-database.service';

/**
 * Database service for managing authentication challenges and rate limiting
 */
export class AuthDatabaseService extends BaseDatabaseService {
  /**
   * Create a new authentication challenge with transaction support
   * @param challenge The challenge details to create
   * @param transaction Optional transaction for atomic operations
   * @returns The created challenge
   */
  async createAuthChallengeWithTransaction(
    challenge: AuthChallengeInput,
    transaction?: sql.Transaction
  ): Promise<AuthChallenge> {
    const id = uuidv4();
    const now = new Date();

    try {
      const request = transaction
        ? new sql.Request(transaction)
        : (await this.getPool()).request();

      // First, mark any existing active challenges for this address as used
      // This ensures only one active challenge per address at a time
      await request
        .input(
          'addressToDeactivate',
          sql.NVarChar,
          challenge.address.toLowerCase()
        )
        .input('usedAt', sql.DateTime2, now).query(`
          UPDATE AuthChallenges
          SET Used = 1, UsedAt = @usedAt
          WHERE Address = @addressToDeactivate AND Used = 0
        `);

      // Now create the new challenge
      await request
        .input('id', sql.NVarChar, id)
        .input('addressForNew', sql.NVarChar, challenge.address.toLowerCase())
        .input('nonce', sql.NVarChar, challenge.nonce)
        .input('message', sql.NVarChar, challenge.message)
        .input('issuedAt', sql.DateTime2, now)
        .input('expiresAt', sql.DateTime2, challenge.expiresAt)
        .input('ipAddress', sql.NVarChar, challenge.ipAddress || null)
        .input('userAgent', sql.NVarChar, challenge.userAgent || null).query(`
          INSERT INTO AuthChallenges (Id, Address, Nonce, Message, IssuedAt, ExpiresAt, Used, IpAddress, UserAgent)
          VALUES (@id, @addressForNew, @nonce, @message, @issuedAt, @expiresAt, 0, @ipAddress, @userAgent)
        `);

      // Return the created challenge
      const result = await request
        .input('queryId', sql.NVarChar, id)
        .query<AuthChallenge>(
          'SELECT * FROM AuthChallenges WHERE Id = @queryId'
        );

      // Normalize property names
      const rawResult = result.recordset[0];
      const normalizedResult: any = {};
      if (rawResult) {
        Object.entries(rawResult).forEach(([key, value]) => {
          normalizedResult[key.charAt(0).toLowerCase() + key.slice(1)] = value;
        });
      }

      return normalizedResult as AuthChallenge;
    } catch (error) {
      // If we're using a transaction, don't handle the error here
      // Let the caller handle it so they can rollback if needed
      if (transaction) {
        throw error;
      }

      throw new Error('Failed to create authentication challenge');
    }
  }

  /**
   * Mark an authentication challenge as used with transaction support
   * @param challengeId The ID of the challenge to mark as used
   * @param transaction Optional transaction for atomic operations
   * @returns True if the challenge was marked as used, false otherwise
   */
  async markAuthChallengeAsUsedWithTransaction(
    challengeId: string,
    transaction?: sql.Transaction
  ): Promise<boolean> {
    const now = new Date();

    try {
      const request = transaction
        ? new sql.Request(transaction)
        : (await this.getPool()).request();

      // First check if the challenge exists and is not already used
      const checkResult = await request.input('id', sql.NVarChar, challengeId)
        .query<{ Used: boolean }>(`
        SELECT Used FROM AuthChallenges WHERE Id = @id
      `);

      if (checkResult.recordset.length === 0 || checkResult.recordset[0].Used) {
        return false;
      }

      // Now mark it as used
      const result = await request
        .input('id2', sql.NVarChar, challengeId)
        .input('usedAt', sql.DateTime2, now).query(`
          UPDATE AuthChallenges
          SET Used = 1, UsedAt = @usedAt
          WHERE Id = @id2 AND Used = 0
        `);

      return result.rowsAffected[0] > 0;
    } catch (error) {
      // If we're using a transaction, don't handle the error here
      if (transaction) {
        throw error;
      }

      throw new Error('Failed to mark authentication challenge as used');
    }
  }

  /**
   * Get an unused authentication challenge for an address that hasn't expired
   * @param address Ethereum address
   * @returns The challenge or null if no active challenge exists
   */
  async getActiveAuthChallengeForAddress(
    address: string
  ): Promise<AuthChallenge | null> {
    const pool = await this.getPool();
    const normalizedAddress = address.toLowerCase();

    try {
      // Main query to find active challenge
      const result = await pool
        .request()
        .input('address', sql.NVarChar, normalizedAddress)
        .input('now', sql.DateTime2, new Date()).query<AuthChallenge>(`
          SELECT TOP 1 Id, Address, Nonce, Message, IssuedAt, ExpiresAt, Used, UsedAt, IpAddress, UserAgent
          FROM AuthChallenges
          WHERE Address = @address
            AND Used = 0
            AND ExpiresAt > @now
          ORDER BY IssuedAt DESC
        `);

      if (result.recordset.length === 0) {
        return null;
      }

      const rawChallenge = result.recordset[0];
      const challenge: AuthChallenge = {
        id: rawChallenge.Id,
        address: rawChallenge.Address,
        nonce: rawChallenge.Nonce,
        message: rawChallenge.Message,
        issuedAt: rawChallenge.IssuedAt,
        expiresAt: rawChallenge.ExpiresAt,
        used: rawChallenge.Used,
        usedAt: rawChallenge.UsedAt || undefined,
        ipAddress: rawChallenge.IpAddress || undefined,
        userAgent: rawChallenge.UserAgent || undefined
      };

      // Validate we have all required fields
      if (!challenge.id || !challenge.nonce || !challenge.expiresAt) {
        return null;
      }

      return challenge;
    } catch (error) {
      throw error;
    }
  }

  /**
   * Get an authentication challenge by its ID
   * @param id The ID of the challenge to retrieve
   * @returns The authentication challenge or null if not found
   */
  async getAuthChallengeById(id: string): Promise<AuthChallenge | null> {
    const pool = await this.getPool();

    const result = await pool.request().input('id', sql.NVarChar, id)
      .query<AuthChallenge>(`
        SELECT * FROM AuthChallenges
        WHERE Id = @id
        ORDER BY IssuedAt DESC
      `);

    if (result.recordset.length > 0) {
      const rawChallenge = result.recordset[0];
      // Normalize keys
      return {
        id: rawChallenge.Id,
        address: rawChallenge.Address,
        nonce: rawChallenge.Nonce,
        message: rawChallenge.Message,
        issuedAt: rawChallenge.IssuedAt,
        expiresAt: rawChallenge.ExpiresAt,
        used: rawChallenge.Used,
        usedAt: rawChallenge.UsedAt || undefined,
        ipAddress: rawChallenge.IpAddress || undefined,
        userAgent: rawChallenge.UserAgent || undefined
      };
    }
    return null;
  }

  /**
   * Delete expired authentication challenges
   * @param expirationDate Optional date to use as expiration cutoff (defaults to current time)
   * @returns The number of records deleted
   */
  async deleteExpiredAuthChallenges(expirationDate?: Date): Promise<number> {
    const pool = await this.getPool();
    const cutoffDate = expirationDate || new Date();

    const result = await pool
      .request()
      .input('cutoffDate', sql.DateTime2, cutoffDate).query(`
        DELETE FROM AuthChallenges
        WHERE ExpiresAt < @cutoffDate AND Used = 0
      `);

    return result.rowsAffected[0];
  }

  /**
   * Delete used authentication challenges based on UsedAt date
   * @param olderThanDate Date to use as cutoff (challenges used before this date will be deleted)
   * @returns The number of records deleted
   */
  async deleteUsedAuthChallenges(olderThanDate: Date): Promise<number> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('cutoffDate', sql.DateTime2, olderThanDate).query(`
        DELETE FROM AuthChallenges
        WHERE Used = 1 AND UsedAt < @cutoffDate
      `);

    return result.rowsAffected[0];
  }

  /**
   * Create a new authentication challenge
   * @param challenge The challenge details to create
   * @returns The created challenge
   */
  async createAuthChallenge(
    challenge: AuthChallengeInput
  ): Promise<AuthChallenge> {
    try {
      // Use transaction version for consistency
      return await this.createAuthChallengeWithTransaction(challenge);
    } catch (error) {
      throw new Error('Failed to create authentication challenge');
    }
  }

  /**
   * Mark an authentication challenge as used
   * @param challengeId The ID of the challenge to mark as used
   * @returns True if the challenge was marked as used, false otherwise
   */
  async markAuthChallengeAsUsed(challengeId: string): Promise<boolean> {
    try {
      return await this.markAuthChallengeAsUsedWithTransaction(challengeId);
    } catch (error) {
      throw new Error('Failed to mark authentication challenge as used');
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
    const pool = await this.getPool();
    const id = uuidv4();
    const now = new Date();
    const hourAgo = new Date(now);
    hourAgo.setHours(hourAgo.getHours() - 1);

    // Set blocking rules
    const MAX_ATTEMPTS_1 = process.env.NODE_ENV === 'production' ? 5 : 20;
    const MAX_ATTEMPTS_2 = process.env.NODE_ENV === 'production' ? 10 : 40;
    const MAX_ATTEMPTS_3 = process.env.NODE_ENV === 'production' ? 20 : 80;
    const BLOCK_HOURS_1 = process.env.NODE_ENV === 'production' ? 1 : 0.1; // 6 minutes in dev
    const BLOCK_HOURS_2 = process.env.NODE_ENV === 'production' ? 3 : 0.2; // 12 minutes in dev
    const BLOCK_HOURS_3 = process.env.NODE_ENV === 'production' ? 12 : 0.5; // 30 minutes in dev

    // First, check if the identifier is already blocked
    const blockedResult = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('now', sql.DateTime2, now).query<{
      Id: string;
      BlockedUntil: Date;
    }>(`
        SELECT Id, BlockedUntil
        FROM AuthRateLimits
        WHERE Identifier = @identifier
        AND Type = @type
        AND BlockedUntil > @now
      `);

    if (blockedResult.recordset.length > 0) {
      // Already blocked
      return {
        attemptCount: 0, // Not incrementing since blocked
        isBlocked: true,
        blockedUntil: blockedResult.recordset[0].BlockedUntil
      };
    }

    // Get attempt count in the last hour
    const countResult = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('hourAgo', sql.DateTime2, hourAgo).query<{
      AttemptCount: number;
    }>(`
        SELECT COUNT(*) AS AttemptCount
        FROM AuthRateLimits
        WHERE Identifier = @identifier
        AND Type = @type
        AND LastAttemptAt > @hourAgo
      `);

    const attemptCount = (countResult.recordset[0]?.AttemptCount || 0) + 1;
    let blockedUntil: Date | null = null;

    // Apply blocking rules
    if (attemptCount > MAX_ATTEMPTS_3) {
      blockedUntil = new Date(now);
      blockedUntil.setHours(blockedUntil.getHours() + BLOCK_HOURS_3);
    } else if (attemptCount > MAX_ATTEMPTS_2) {
      blockedUntil = new Date(now);
      blockedUntil.setHours(blockedUntil.getHours() + BLOCK_HOURS_2);
    } else if (attemptCount > MAX_ATTEMPTS_1) {
      blockedUntil = new Date(now);
      blockedUntil.setHours(blockedUntil.getHours() + BLOCK_HOURS_1);
    }

    // Record the attempt
    await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('now', sql.DateTime2, now)
      .input(
        'blockedUntil',
        blockedUntil ? sql.DateTime2 : sql.NVarChar,
        blockedUntil || null
      ).query(`
        INSERT INTO AuthRateLimits (Id, Identifier, Type, AttemptCount, FirstAttemptAt, LastAttemptAt, BlockedUntil)
        VALUES (@id, @identifier, @type, 1, @now, @now, @blockedUntil)
      `);

    return {
      attemptCount,
      isBlocked: !!blockedUntil,
      blockedUntil: blockedUntil || undefined
    };
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
    const pool = await this.getPool();
    const now = new Date();
    const hourAgo = new Date(now);
    hourAgo.setHours(hourAgo.getHours() - 1);

    // Check if the identifier is blocked
    const blockedResult = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('now', sql.DateTime2, now).query<{ BlockedUntil: Date }>(`
        SELECT BlockedUntil
        FROM AuthRateLimits
        WHERE Identifier = @identifier
        AND Type = @type
        AND BlockedUntil > @now
        ORDER BY BlockedUntil DESC
      `);

    if (blockedResult.recordset.length > 0) {
      return {
        isBlocked: true,
        blockedUntil: blockedResult.recordset[0].BlockedUntil,
        attemptCount: 0 // Attempt count isn't relevant if blocked
      };
    }

    // Get attempt count in the last hour
    const countResult = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type)
      .input('hourAgo', sql.DateTime2, hourAgo).query<{
      AttemptCount: number;
    }>(`
        SELECT COUNT(*) AS AttemptCount
        FROM AuthRateLimits
        WHERE Identifier = @identifier
        AND Type = @type
        AND LastAttemptAt > @hourAgo
      `);

    return {
      isBlocked: false,
      attemptCount: countResult.recordset[0]?.AttemptCount || 0
    };
  }

  /**
   * Clean up expired rate limiting entries
   * @param olderThan Date threshold for cleanup
   * @returns Number of records deleted
   */
  async cleanupRateLimits(olderThan: Date): Promise<number> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('cutoffDate', sql.DateTime2, olderThan).query(`
      DELETE FROM AuthRateLimits
      WHERE LastAttemptAt < @cutoffDate
      AND (BlockedUntil IS NULL OR BlockedUntil < @cutoffDate)
    `);

    return result.rowsAffected[0];
  }

  /**
   * Clear rate limiting for a specific identifier
   * This is primarily for development/testing purposes
   * @param identifier The identifier (address or IP) to clear rate limiting for
   * @param type The type of identifier (ADDRESS or IP)
   * @returns Number of records deleted
   */
  async clearRateLimitingForIdentifier(
    identifier: string,
    type: 'ADDRESS' | 'IP'
  ): Promise<number> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('identifier', sql.NVarChar, identifier)
      .input('type', sql.NVarChar, type).query(`
        DELETE FROM AuthRateLimits
        WHERE Identifier = @identifier AND Type = @type
      `);

    return result.rowsAffected[0];
  }
}
