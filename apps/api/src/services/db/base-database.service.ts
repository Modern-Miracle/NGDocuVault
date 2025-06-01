import * as sql from 'mssql';

/**
 * Configuration options for the database service
 */
export interface DatabaseConfig {
  server: string;
  port: number;
  user: string;
  password: string;
  database: string;
  options?: {
    encrypt?: boolean;
    trustServerCertificate?: boolean;
  };
}

/**
 * Base class for database services providing connection management
 */
export abstract class BaseDatabaseService {
  protected pool: sql.ConnectionPool | null = null;
  private poolPromise: Promise<sql.ConnectionPool> | null = null;
  protected config: DatabaseConfig;
  private initialized = false;

  /**
   * Create a new database service instance
   * Configuration is read from environment variables if not provided
   * @param config Optional database configuration to override environment variables
   */
  constructor(config?: Partial<DatabaseConfig>) {
    this.config = {
      server: config?.server || process.env.DB_SERVER || 'localhost',
      port: config?.port || parseInt(process.env.DB_PORT || '1433'),
      user: config?.user || process.env.DB_USER || 'sa',
      password:
        config?.password || process.env.DB_PASSWORD || 'DocuVault_P@ssw0rd',
      database: config?.database || process.env.DB_DATABASE || 'DocuVault',
      options: {
        encrypt: config?.options?.encrypt ?? false,
        trustServerCertificate: config?.options?.trustServerCertificate ?? true
      }
    };
  }

  /**
   * Initialize the database connection pool
   */
  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      this.poolPromise = new sql.ConnectionPool({
        server: this.config.server,
        port: this.config.port,
        user: this.config.user,
        password: this.config.password,
        database: this.config.database,
        options: {
          encrypt: this.config.options?.encrypt ?? false,
          trustServerCertificate:
            this.config.options?.trustServerCertificate ?? true
        }
      }).connect();

      this.pool = await this.poolPromise;
      this.initialized = true;
    } catch (error) {
      console.error('Error initializing database connection:', error);
      throw error;
    }
  }

  /**
   * Ensure the database connection is initialized
   */
  protected async ensureInitialized(): Promise<void> {
    if (!this.initialized || !this.pool) {
      await this.initialize();
    }
  }

  /**
   * Get the connection pool
   */
  protected async getPool(): Promise<sql.ConnectionPool> {
    await this.ensureInitialized();

    if (!this.pool) {
      throw new Error('Database connection pool is not initialized');
    }

    return this.pool;
  }

  /**
   * Get a new transaction for atomic operations
   * @returns A SQL transaction object
   */
  async getTransaction(): Promise<sql.Transaction> {
    const pool = await this.getPool();
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    return transaction;
  }

  /**
   * Clean up resources when done with the database service
   */
  async close(): Promise<void> {
    if (this.pool) {
      await this.pool.close();
      this.pool = null;
      this.initialized = false;
      console.log('Database connection closed.');
    }
  }
}
