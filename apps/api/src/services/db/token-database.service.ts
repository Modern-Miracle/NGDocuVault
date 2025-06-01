import * as sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

import { RefreshToken, RefreshTokenInput } from '../../models'; // Adjust path as needed
import { BaseDatabaseService } from './base-database.service';

/**
 * Database service for managing refresh tokens
 */
export class TokenDatabaseService extends BaseDatabaseService {
  /**
   * Create a new refresh token for a user
   * @param refreshToken The refresh token data to create
   * @returns The created refresh token record
   */
  async createRefreshToken(
    refreshToken: RefreshTokenInput
  ): Promise<RefreshToken> {
    const pool = await this.getPool();
    const id = uuidv4();
    const now = new Date();

    await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input(
        'userAddress',
        sql.NVarChar,
        refreshToken.userAddress.toLowerCase()
      )
      .input('token', sql.NVarChar, refreshToken.token)
      .input('issuedAt', sql.DateTime2, now)
      .input('expiresAt', sql.DateTime2, refreshToken.expiresAt)
      .input('ipAddress', sql.NVarChar, refreshToken.ipAddress || null)
      .input('userAgent', sql.NVarChar, refreshToken.userAgent || null).query(`
        INSERT INTO RefreshTokens (Id, UserAddress, Token, IssuedAt, ExpiresAt, IpAddress, UserAgent)
        VALUES (@id, @userAddress, @token, @issuedAt, @expiresAt, @ipAddress, @userAgent)
      `);

    // Return the created refresh token
    const result = await pool
      .request()
      .input('id', sql.NVarChar, id)
      .query<RefreshToken>('SELECT * FROM RefreshTokens WHERE Id = @id');

    if (result.recordset.length === 0) {
      throw new Error('Failed to retrieve the created refresh token.');
    }
    // Normalize keys
    const rawToken = result.recordset[0];
    return {
      id: rawToken.Id,
      userAddress: rawToken.UserAddress,
      token: rawToken.Token,
      issuedAt: rawToken.IssuedAt,
      expiresAt: rawToken.ExpiresAt,
      used: rawToken.Used,
      usedAt: rawToken.UsedAt || undefined,
      revoked: rawToken.Revoked,
      revokedAt: rawToken.RevokedAt || undefined,
      replacedByTokenId: rawToken.ReplacedByTokenId || undefined,
      ipAddress: rawToken.IpAddress || undefined,
      userAgent: rawToken.UserAgent || undefined
    };
  }

  /**
   * Get a refresh token by its token value
   * @param token The refresh token value
   * @returns The refresh token record or null if not found
   */
  async getRefreshTokenByToken(token: string): Promise<RefreshToken | null> {
    const pool = await this.getPool();

    const result = await pool.request().input('token', sql.NVarChar, token)
      .query<RefreshToken>(`
        SELECT * FROM RefreshTokens
        WHERE Token = @token AND Used = 0 AND Revoked = 0 AND ExpiresAt > GETUTCDATE()
      `);

    if (result.recordset.length > 0) {
      const rawToken = result.recordset[0];
      // Normalize keys
      return {
        id: rawToken.Id,
        userAddress: rawToken.UserAddress,
        token: rawToken.Token,
        issuedAt: rawToken.IssuedAt,
        expiresAt: rawToken.ExpiresAt,
        used: rawToken.Used,
        usedAt: rawToken.UsedAt || undefined,
        revoked: rawToken.Revoked,
        revokedAt: rawToken.RevokedAt || undefined,
        replacedByTokenId: rawToken.ReplacedByTokenId || undefined,
        ipAddress: rawToken.IpAddress || undefined,
        userAgent: rawToken.UserAgent || undefined
      };
    }
    return null;
  }

  /**
   * Mark a refresh token as used and create a new one (token rotation)
   * @param tokenId The ID of the token to mark as used
   * @param refreshToken The new refresh token data
   * @returns The new refresh token record
   */
  async rotateRefreshToken(
    tokenId: string,
    refreshToken: RefreshTokenInput
  ): Promise<RefreshToken> {
    const pool = await this.getPool();
    const transaction = await this.getTransaction(); // Use base class method

    try {
      const newId = uuidv4();
      const now = new Date();

      // Mark the old token as used in the transaction
      const updateResult = await new sql.Request(transaction)
        .input('id', sql.NVarChar, tokenId)
        .input('usedAt', sql.DateTime2, now)
        .input('newId', sql.NVarChar, newId).query(`
          UPDATE RefreshTokens
          SET Used = 1, UsedAt = @usedAt, ReplacedByTokenId = @newId
          WHERE Id = @id AND Used = 0 AND Revoked = 0 AND ExpiresAt > GETUTCDATE()
        `);

      if (updateResult.rowsAffected[0] === 0) {
        throw new Error(
          'Failed to mark the old refresh token as used. It might be expired, already used, revoked, or not found.'
        );
      }

      // Create a new token in the transaction
      const userAddressValue =
        refreshToken.userAddress || (refreshToken as any).UserAddress;
      if (!userAddressValue) {
        throw new Error('User address is missing in refresh token input');
      }

      await new sql.Request(transaction)
        .input('id', sql.NVarChar, newId)
        .input('userAddress', sql.NVarChar, userAddressValue.toLowerCase())
        .input('token', sql.NVarChar, refreshToken.token)
        .input('issuedAt', sql.DateTime2, now)
        .input('expiresAt', sql.DateTime2, refreshToken.expiresAt)
        .input('ipAddress', sql.NVarChar, refreshToken.ipAddress || null)
        .input('userAgent', sql.NVarChar, refreshToken.userAgent || null)
        .query(`
          INSERT INTO RefreshTokens (Id, UserAddress, Token, IssuedAt, ExpiresAt, IpAddress, UserAgent)
          VALUES (@id, @userAddress, @token, @issuedAt, @expiresAt, @ipAddress, @userAgent)
        `);

      // Commit the transaction
      await transaction.commit();

      // Get and return the new token
      const result = await pool
        .request()
        .input('id', sql.NVarChar, newId)
        .query<RefreshToken>('SELECT * FROM RefreshTokens WHERE Id = @id');

      if (result.recordset.length === 0) {
        throw new Error(
          'Failed to retrieve the newly created refresh token after rotation.'
        );
      }
      // Normalize keys
      const rawToken = result.recordset[0];
      return {
        id: rawToken.Id,
        userAddress: rawToken.UserAddress,
        token: rawToken.Token,
        issuedAt: rawToken.IssuedAt,
        expiresAt: rawToken.ExpiresAt,
        used: rawToken.Used,
        usedAt: rawToken.UsedAt || undefined,
        revoked: rawToken.Revoked,
        revokedAt: rawToken.RevokedAt || undefined,
        replacedByTokenId: rawToken.ReplacedByTokenId || undefined,
        ipAddress: rawToken.IpAddress || undefined,
        userAgent: rawToken.UserAgent || undefined
      };
    } catch (error) {
      // Rollback the transaction on error
      await transaction.rollback();
      console.error('Error rotating refresh token:', error);
      // Re-throw the original error or a more specific one
      if (
        error instanceof Error &&
        error.message.startsWith('Failed to mark')
      ) {
        throw error; // Propagate the specific error
      }
      throw new Error(
        'Failed to rotate refresh token due to a database error.'
      );
    }
  }

  /**
   * Revoke a refresh token by token value
   * @param token The refresh token value to revoke
   * @returns True if successfully revoked, false otherwise
   */
  async revokeRefreshToken(token: string): Promise<boolean> {
    const pool = await this.getPool();
    const now = new Date();

    const result = await pool
      .request()
      .input('token', sql.NVarChar, token)
      .input('revokedAt', sql.DateTime2, now).query(`
        UPDATE RefreshTokens
        SET Revoked = 1, RevokedAt = @revokedAt
        WHERE Token = @token AND Revoked = 0
      `);

    return result.rowsAffected[0] > 0;
  }

  /**
   * Revoke all refresh tokens for a user
   * @param userAddress The user's wallet address
   * @returns The number of tokens revoked
   */
  async revokeAllUserRefreshTokens(userAddress: string): Promise<number> {
    const pool = await this.getPool();
    const now = new Date();

    const result = await pool
      .request()
      .input('userAddress', sql.NVarChar, userAddress.toLowerCase())
      .input('revokedAt', sql.DateTime2, now).query(`
        UPDATE RefreshTokens
        SET Revoked = 1, RevokedAt = @revokedAt
        WHERE UserAddress = @userAddress AND Revoked = 0 AND Used = 0
      `);

    return result.rowsAffected[0];
  }

  /**
   * Clean up expired refresh tokens
   * @param expirationDate Optional date to use instead of current time
   * @returns Number of tokens cleaned up
   */
  async cleanupExpiredRefreshTokens(expirationDate?: Date): Promise<number> {
    const pool = await this.getPool();
    const date = expirationDate || new Date();

    const result = await pool.request().input('date', sql.DateTime2, date)
      .query(`
      DELETE FROM RefreshTokens
      WHERE ExpiresAt < @date
    `);

    return result.rowsAffected[0];
  }
}
