import * as sql from 'mssql';
import { BaseDatabaseService, DatabaseConfig } from './base-database.service';

/**
 * Database service primarily responsible for initial schema setup.
 * Data operations are handled by specialized services (Auth, Access, Token).
 * Uses SQL Server as the backend.
 */
export class DatabaseService extends BaseDatabaseService {
  /**
   * Create a new database service instance
   * @param config Optional database configuration to override environment variables
   */
  constructor(config?: Partial<DatabaseConfig>) {
    super(config); // Call base class constructor
  }

  /**
   * Create the necessary database tables if they don't exist
   */
  async setupDatabase(): Promise<void> {
    const pool = await this.getPool();

    try {
      // Create AccessGrants table if it doesn't exist
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AccessGrants')
        BEGIN
          CREATE TABLE AccessGrants (
            Id NVARCHAR(50) PRIMARY KEY,
            UserAddress NVARCHAR(50) NOT NULL,
            DataId NVARCHAR(100) NOT NULL,
            GrantedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            ExpiresAt DATETIME2 NOT NULL,
            Revoked BIT NOT NULL DEFAULT 0,
            RevokedAt DATETIME2 NULL,
            TransactionHash NVARCHAR(100) NULL,
            IpfsHash NVARCHAR(100) NULL,            
            INDEX IX_AccessGrants_UserAddress (UserAddress),
            INDEX IX_AccessGrants_DataId (DataId),
            INDEX IX_AccessGrants_ExpiresAt (ExpiresAt)
          )
        END
      `);

      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuthChallenges')
        BEGIN
          CREATE TABLE AuthChallenges (
            Id NVARCHAR(50) PRIMARY KEY,
            Address NVARCHAR(50) NOT NULL,
            Nonce NVARCHAR(100) NOT NULL,
            Message NVARCHAR(1000) NOT NULL,
            IssuedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            ExpiresAt DATETIME2 NOT NULL,
            Used BIT NOT NULL DEFAULT 0,
            UsedAt DATETIME2 NULL,
            IpAddress NVARCHAR(50) NULL,
            UserAgent NVARCHAR(500) NULL
          );

          CREATE INDEX IX_AuthChallenges_Address ON AuthChallenges(Address);
          CREATE INDEX IX_AuthChallenges_ExpiresAt ON AuthChallenges(ExpiresAt);
          PRINT 'AuthChallenges table created.';
        END
        ELSE
        BEGIN
          PRINT 'AuthChallenges table already exists.';
          -- Check if we need to alter the table to increase Message column size
          IF EXISTS (
            SELECT * FROM INFORMATION_SCHEMA.COLUMNS
            WHERE TABLE_NAME = 'AuthChallenges'
            AND COLUMN_NAME = 'Message'
            AND CHARACTER_MAXIMUM_LENGTH < 1000
          )
          BEGIN
            ALTER TABLE AuthChallenges ALTER COLUMN Message NVARCHAR(1000) NOT NULL;
            PRINT 'Increased AuthChallenges.Message column size to 1000.';
          END;
        END
      `);

      // Create AuthRateLimits table if it doesn't exist
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'AuthRateLimits')
        BEGIN
          CREATE TABLE AuthRateLimits (
            Id NVARCHAR(50) PRIMARY KEY,
            Identifier NVARCHAR(100) NOT NULL,
            Type NVARCHAR(20) NOT NULL, -- ADDRESS or IP
            AttemptCount INT NOT NULL DEFAULT 1,
            FirstAttemptAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            LastAttemptAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            BlockedUntil DATETIME2 NULL,
            INDEX IX_AuthRateLimits_Identifier (Identifier),
            INDEX IX_AuthRateLimits_LastAttemptAt (LastAttemptAt)
          )
          PRINT 'AuthRateLimits table created.';
        END
        ELSE
        BEGIN
            PRINT 'AuthRateLimits table already exists.';
        END
      `);

      // Create RefreshTokens table if it doesn't exist
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.tables WHERE name = 'RefreshTokens')
        BEGIN
          CREATE TABLE RefreshTokens (
            Id NVARCHAR(50) PRIMARY KEY,
            UserAddress NVARCHAR(50) NOT NULL,
            Token NVARCHAR(256) NOT NULL,
            IssuedAt DATETIME2 NOT NULL DEFAULT GETUTCDATE(),
            ExpiresAt DATETIME2 NOT NULL,
            Used BIT NOT NULL DEFAULT 0,
            UsedAt DATETIME2 NULL,
            Revoked BIT NOT NULL DEFAULT 0,
            RevokedAt DATETIME2 NULL,
            ReplacedByTokenId NVARCHAR(50) NULL,
            IpAddress NVARCHAR(50) NULL,
            UserAgent NVARCHAR(500) NULL,
            INDEX IX_RefreshTokens_UserAddress (UserAddress),
            INDEX IX_RefreshTokens_Token (Token),
            INDEX IX_RefreshTokens_ExpiresAt (ExpiresAt)
          )
          PRINT 'RefreshTokens table created.';
        END
        ELSE
        BEGIN
            PRINT 'RefreshTokens table already exists.';
            -- Check if we need to alter the table to increase Token column size
            IF EXISTS (
              SELECT * FROM INFORMATION_SCHEMA.COLUMNS
              WHERE TABLE_NAME = 'RefreshTokens'
              AND COLUMN_NAME = 'Token'
              AND CHARACTER_MAXIMUM_LENGTH < 256
            )
            BEGIN
              ALTER TABLE RefreshTokens ALTER COLUMN Token NVARCHAR(256) NOT NULL;
              PRINT 'Increased RefreshTokens.Token column size to 256.';
            END;
        END
      `);
    } catch (error) {
      console.error('Error during database setup:', error);
      throw error;
    }
  }
}
