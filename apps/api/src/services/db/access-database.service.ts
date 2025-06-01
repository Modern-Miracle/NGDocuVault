import * as sql from 'mssql';
import { v4 as uuidv4 } from 'uuid';

import { AccessGrant, AccessGrantInput } from '../../models'; // Adjust path as needed
import { BaseDatabaseService } from './base-database.service';

/**
 * Database service for managing access grants
 */
export class AccessDatabaseService extends BaseDatabaseService {
  /**
   * Create a new access grant record
   * @param accessGrant The access grant data to create
   * @returns The created access grant with ID
   */
  async createAccessGrant(accessGrant: AccessGrantInput): Promise<AccessGrant> {
    const pool = await this.getPool();
    const id = uuidv4();

    await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input('userAddress', sql.NVarChar, accessGrant.userAddress.toLowerCase())
      .input('dataId', sql.NVarChar, accessGrant.dataId)
      .input('expiresAt', sql.DateTime2, accessGrant.expiresAt)
      .input(
        'transactionHash',
        sql.NVarChar,
        accessGrant.transactionHash || null
      )
      .input('ipfsHash', sql.NVarChar, accessGrant.ipfsHash || null).query(`
        INSERT INTO AccessGrants (Id, UserAddress, DataId, ExpiresAt, TransactionHash, IpfsHash)
        VALUES (@id, @userAddress, @dataId, @expiresAt, @transactionHash, @ipfsHash)
      `);

    // Return the created access grant
    const result = await pool
      .request()
      .input('id', sql.NVarChar, id)
      .query<AccessGrant>('SELECT * FROM AccessGrants WHERE Id = @id');

    if (result.recordset.length === 0) {
      throw new Error('Failed to retrieve the created access grant.');
    }

    // Normalize keys
    const rawGrant = result.recordset[0];
    return {
      id: rawGrant.Id,
      userAddress: rawGrant.UserAddress,
      dataId: rawGrant.DataId,
      grantedAt: rawGrant.GrantedAt,
      expiresAt: rawGrant.ExpiresAt,
      revoked: rawGrant.Revoked,
      revokedAt: rawGrant.RevokedAt || undefined,
      transactionHash: rawGrant.TransactionHash || undefined,
      ipfsHash: rawGrant.IpfsHash || undefined
    };
  }

  /**
   * Get an access grant by ID
   * @param id The ID of the access grant to retrieve
   * @returns The access grant or null if not found
   */
  async getAccessGrantById(id: string): Promise<AccessGrant | null> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('id', sql.NVarChar, id)
      .query<AccessGrant>('SELECT * FROM AccessGrants WHERE Id = @id');

    if (result.recordset.length > 0) {
      const rawGrant = result.recordset[0];

      return {
        id: rawGrant.Id,
        userAddress: rawGrant.UserAddress,
        dataId: rawGrant.DataId,
        grantedAt: rawGrant.GrantedAt,
        expiresAt: rawGrant.ExpiresAt,
        revoked: rawGrant.Revoked,
        revokedAt: rawGrant.RevokedAt || undefined,
        transactionHash: rawGrant.TransactionHash || undefined,
        ipfsHash: rawGrant.IpfsHash || undefined
      };
    }
    return null;
  }

  /**
   * Check if a user has access to a specific data item
   * @param userAddress The blockchain address of the user
   * @param dataId The ID of the data to check access for
   * @returns True if the user has access, false otherwise
   */
  async checkAccess(userAddress: string, dataId: string): Promise<boolean> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('userAddress', sql.NVarChar, userAddress.toLowerCase())
      .input('dataId', sql.NVarChar, dataId)
      .input('now', sql.DateTime2, new Date()).query<{ hasAccess: number }>(`
        SELECT COUNT(*) AS hasAccess
        FROM AccessGrants
        WHERE UserAddress = @userAddress
          AND DataId = @dataId
          AND ExpiresAt > @now
          AND Revoked = 0
      `);
    // Check if count is greater than 0
    return result.recordset[0].hasAccess > 0;
  }

  /**
   * Revoke an access grant
   * @param id The ID of the access grant to revoke
   * @returns True if the grant was revoked, false otherwise
   */
  async revokeAccessGrant(id: string): Promise<boolean> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('id', sql.NVarChar, id)
      .input('revokedAt', sql.DateTime2, new Date()).query(`
        UPDATE AccessGrants
        SET Revoked = 1, RevokedAt = @revokedAt
        WHERE Id = @id AND Revoked = 0
      `);

    return result.rowsAffected[0] > 0;
  }

  /**
   * List all access grants for a user
   * @param userAddress The blockchain address of the user
   * @returns Array of access grants
   */
  async getAccessGrantsByUser(userAddress: string): Promise<AccessGrant[]> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('userAddress', sql.NVarChar, userAddress.toLowerCase())
      .query<AccessGrant>(
        'SELECT * FROM AccessGrants WHERE UserAddress = @userAddress'
      );

    return result.recordset.map((rawGrant) => ({
      id: rawGrant.Id,
      userAddress: rawGrant.UserAddress,
      dataId: rawGrant.DataId,
      grantedAt: rawGrant.GrantedAt,
      expiresAt: rawGrant.ExpiresAt,
      revoked: rawGrant.Revoked,
      revokedAt: rawGrant.RevokedAt || undefined,
      transactionHash: rawGrant.TransactionHash || undefined,
      ipfsHash: rawGrant.IpfsHash || undefined
    }));
  }

  /**
   * List all access grants for a data item
   * @param dataId The ID of the data item
   * @returns Array of access grants
   */
  async getAccessGrantsByData(dataId: string): Promise<AccessGrant[]> {
    const pool = await this.getPool();

    const result = await pool
      .request()
      .input('dataId', sql.NVarChar, dataId)
      .query<AccessGrant>('SELECT * FROM AccessGrants WHERE DataId = @dataId');

    // Normalize keys for each grant
    return result.recordset.map((rawGrant) => ({
      id: rawGrant.Id,
      userAddress: rawGrant.UserAddress,
      dataId: rawGrant.DataId,
      grantedAt: rawGrant.GrantedAt,
      expiresAt: rawGrant.ExpiresAt,
      revoked: rawGrant.Revoked,
      revokedAt: rawGrant.RevokedAt || undefined,
      transactionHash: rawGrant.TransactionHash || undefined,
      ipfsHash: rawGrant.IpfsHash || undefined
    }));
  }
}
