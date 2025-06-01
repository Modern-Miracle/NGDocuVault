import sql from 'mssql';

// Configuration from environment variables or defaults
const config = {
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433'),
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'DocuVault_P@ssw0rd',

  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

async function setupDatabase() {
  console.log('Connecting to SQL Server...');
  const pool = await new sql.ConnectionPool(config).connect();

  try {
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

    // Create AccessGrants table if it doesn't exist
    console.log("Creating AccessGrants table if it doesn't exist...");
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

        )
      END
    `);

    console.log('Database setup completed successfully!');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    await pool.close();
  }
}

// Execute the setup
setupDatabase().catch((err) => {
  console.error('Unhandled error:', err);
  process.exit(1);
});
