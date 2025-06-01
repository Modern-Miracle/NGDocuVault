import { TokenDatabaseService } from '../db';
import { JWTService } from './jwt.service';
import { RefreshTokenInput } from '../../models';
import * as crypto from 'crypto';

/**
 * Service for managing user sessions and refresh tokens
 */
export class SessionService {
  private tokenDbService: TokenDatabaseService;
  private jwtService: JWTService;

  private readonly REFRESH_TOKEN_LENGTH = 64;
  private readonly REFRESH_TOKEN_EXPIRY_DAYS = 7; // Refresh tokens expire after 7 days

  /**
   * Create a new session service
   * @param tokenDbService The token database service instance
   * @param jwtService The JWT service instance
   */
  constructor(
    tokenDbService: TokenDatabaseService = new TokenDatabaseService(),
    jwtService: JWTService = new JWTService()
  ) {
    this.tokenDbService = tokenDbService;
    this.jwtService = jwtService;
  }

  /**
   * Initialize the service by initializing the underlying database service
   */
  async init(): Promise<void> {
    try {
      await this.tokenDbService.initialize();
      // No need to call setupDatabase here, assume it's handled elsewhere (e.g., app startup)
    } catch (error) {
      console.error(
        'Failed to initialize SessionService:',
        error instanceof Error ? error.message : 'Unknown error'
      );
      throw error;
    }
  }

  /**
   * Generate a secure refresh token string
   * @returns A cryptographically secure random string
   */
  private generateRefreshTokenString(): string {
    return crypto.randomBytes(this.REFRESH_TOKEN_LENGTH).toString('hex');
  }

  /**
   * Create a new session (access token + refresh token)
   * @param userAddress The user's wallet address
   * @param ipAddress Optional IP address
   * @param userAgent Optional user agent
   * @returns Access token and refresh token string
   */
  async createSession(
    userAddress: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const normalizedAddress = userAddress.toLowerCase();

    // 1. Generate General Access Token using generateToken
    const accessTokenPayload = { sub: normalizedAddress }; // Standard subject claim
    const accessToken = this.jwtService.generateToken(accessTokenPayload); // Use default expiration

    // 2. Generate Refresh Token
    const refreshTokenString = this.generateRefreshTokenString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS);

    const refreshTokenInput: RefreshTokenInput = {
      userAddress: normalizedAddress,
      token: refreshTokenString,
      expiresAt,
      ipAddress,
      userAgent
    };

    // 3. Store Refresh Token using the specific service
    await this.tokenDbService.createRefreshToken(refreshTokenInput);

    return { accessToken, refreshToken: refreshTokenString };
  }

  /**
   * Refresh an access token using a refresh token
   * @param oldRefreshTokenString The refresh token string provided by the client
   * @param ipAddress Optional IP address for security check
   * @param userAgent Optional user agent for security check
   * @returns New access token and new refresh token string
   */
  async refreshSession(
    oldRefreshTokenString: string,
    ipAddress?: string,
    userAgent?: string
  ): Promise<{ accessToken: string; refreshToken: string }> {
    // 1. Find the existing refresh token using the specific service
    const oldRefreshToken = await this.tokenDbService.getRefreshTokenByToken(
      oldRefreshTokenString
    );

    if (!oldRefreshToken) {
      throw new Error('Invalid or expired refresh token');
    }

    // Optional: Add extra security checks (e.g., compare IP/UserAgent if they exist)
    // if (oldRefreshToken.ipAddress && oldRefreshToken.ipAddress !== ipAddress) { ... }
    // if (oldRefreshToken.userAgent && oldRefreshToken.userAgent !== userAgent) { ... }

    // 2. Generate new general access token using generateToken
    const accessTokenPayload = { sub: oldRefreshToken.userAddress };
    const newAccessToken = this.jwtService.generateToken(accessTokenPayload); // Use default expiration

    // 3. Generate new refresh token
    const newRefreshTokenString = this.generateRefreshTokenString();
    const newExpiresAt = new Date();
    newExpiresAt.setDate(
      newExpiresAt.getDate() + this.REFRESH_TOKEN_EXPIRY_DAYS
    );

    const newRefreshTokenInput: RefreshTokenInput = {
      userAddress: oldRefreshToken.userAddress,
      token: newRefreshTokenString,
      expiresAt: newExpiresAt,
      ipAddress,
      userAgent
    };

    // 4. Rotate the refresh token (mark old as used, create new) using the specific service
    try {
      await this.tokenDbService.rotateRefreshToken(
        oldRefreshToken.id,
        newRefreshTokenInput
      );
    } catch (error) {
      console.error(
        `Error rotating refresh token for user ${oldRefreshToken.userAddress}:`,
        error
      );

      await this.tokenDbService.revokeRefreshToken(oldRefreshTokenString);
      throw new Error('Failed to refresh session due to token rotation error.');
    }

    return { accessToken: newAccessToken, refreshToken: newRefreshTokenString };
  }

  /**
   * Revoke a specific refresh token
   * @param refreshTokenString The refresh token string to revoke
   * @returns True if revoked, false otherwise
   */
  async revokeRefreshToken(refreshTokenString: string): Promise<boolean> {
    return this.tokenDbService.revokeRefreshToken(refreshTokenString);
  }

  /**
   * Revoke all refresh tokens for a user
   * @param userAddress The user's wallet address
   * @returns The number of tokens revoked
   */
  async revokeAllUserSessions(userAddress: string): Promise<number> {
    return this.tokenDbService.revokeAllUserRefreshTokens(
      userAddress.toLowerCase()
    );
  }

  /**
   * Verify an access token
   * @param token The access token string
   * @returns The token payload if valid, null otherwise
   */
  verifyAccessToken(token: string): Record<string, any> | null {
    try {
      return this.jwtService.verifyToken(token);
    } catch (error) {
      console.warn(
        'Access token verification failed:',
        error instanceof Error ? error.message : error
      );
      return null;
    }
  }

  /**
   * Close the service and release resources
   */
  async close(): Promise<void> {
    await this.tokenDbService.close();
  }
}
