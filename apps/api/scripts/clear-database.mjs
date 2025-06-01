#!/usr/bin/env node

import sql from 'mssql';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Database configuration from environment variables
const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'YourStrong@Passw0rd',
  server: process.env.DB_SERVER || 'localhost',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  database: process.env.DB_NAME || 'DocuVault',
  options: {
    trustServerCertificate: true,
    encrypt: false
  }
};

async function resetDatabase() {
  console.log('Connecting to SQL Server...');
  let pool;

  try {
    // Connect to the database
    pool = await sql.connect(config);
    console.log('Connected to SQL Server successfully');

    // Get list of all tables
    const result = await pool.request().query(`
      SELECT TABLE_NAME
      FROM INFORMATION_SCHEMA.TABLES
      WHERE TABLE_TYPE = 'BASE TABLE' AND TABLE_CATALOG = '${config.database}'
    `);

    const tables = result.recordset.map((record) => record.TABLE_NAME);
    console.log(`Found ${tables.length} tables to drop: ${tables.join(', ')}`);

    // Drop all tables (disable foreign key constraints first)
    console.log('Dropping all tables...');
    await pool.request().query(`
      EXEC sp_MSforeachtable "ALTER TABLE ? NOCHECK CONSTRAINT all"
      EXEC sp_MSforeachtable "DROP TABLE ?"
    `);

    console.log('All tables dropped successfully');

    // Run the setup-database script to recreate all tables
    console.log(
      'Now running the database setup script to recreate all tables...'
    );
  } catch (error) {
    console.error('Error resetting database:', error);
    process.exit(1);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed');
    }
  }
}

// Run the function if this script is executed directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  resetDatabase().catch((err) => {
    console.error('Fatal error:', err);
    process.exit(1);
  });
}

export default resetDatabase;
