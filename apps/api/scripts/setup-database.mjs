import sql from 'mssql';

// Configuration from environment variables or defaults
const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'DocuVault_P@ssw0rd',

  options: {
    trustServerCertificate: true,
    encrypt: false,
    connectTimeout: 15000 // Increase connection timeout
  }
};

// Sleep function for delay
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function connectWithRetry(maxRetries = 10, initialDelay = 1500) {
  let retries = 0;
  let delay = initialDelay;

  while (retries < maxRetries) {
    try {
      console.log(`Attempt ${retries + 1} to connect to SQL Server...`);
      return await new sql.ConnectionPool(config).connect();
    } catch (error) {
      retries++;
      console.log(`Connection failed: ${error.message}`);

      if (retries >= maxRetries) {
        throw new Error(
          `Failed to connect after ${maxRetries} attempts: ${error.message}`
        );
      }

      console.log(`Retrying in ${delay / 1000} seconds...`);
      await sleep(delay);
      delay = Math.min(delay * 1.5, 10000); // Exponential backoff with 10s max
    }
  }
}

async function setupDatabase() {
  console.log('Connecting to SQL Server with retry mechanism...');
  let pool;

  try {
    pool = await connectWithRetry();

    // Create database if it doesn't exist
    console.log("Creating database if it doesn't exist...");
    await pool.request().query(`
      IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'DocuVault')
      BEGIN
        CREATE DATABASE DocuVault;
      END
    `);

    console.log('Switching to DocuVault database...');
    await pool.request().query(`USE DocuVault;`);

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

    // Create AuthChallenges table if it doesn't exist
    console.log('Checking/Creating AuthChallenges table...');
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
    console.log('Checked/Created AuthChallenges table.');

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
    console.log('Checked/Created AuthRateLimits table.');

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
    console.log('Checked/Created RefreshTokens table.');
  } catch (error) {
    console.error('Error setting up database:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
    }
  }
}

// Execute the setup
setupDatabase().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
