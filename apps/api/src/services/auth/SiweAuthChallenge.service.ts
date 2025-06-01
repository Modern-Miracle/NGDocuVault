import { SiweMessage } from 'siwe';
import * as crypto from 'crypto';
import { AuthChallengeService } from './AuthChallenge.service';
import { AuthChallenge } from '../../models';
import { getAddress } from 'ethers';

/**
 * Service for generating and verifying SIWE authentication challenges
 * Extends the base AuthChallengeService with SIWE-specific functionality
 */
export class SiweAuthChallengeService extends AuthChallengeService {
  /**
   * Domain for SIWE messages
   */
  private domain: string;

  /**
   * URI for SIWE messages
   */
  private uri: string;

  /**
   * Create a new SIWE authentication challenge service
   * @param domain Domain for SIWE messages (e.g., 'docuvault.app')
   * @param uri URI for SIWE messages (e.g., 'https://docuvault.app')
   * @param databaseService Optional database service instance
   */
  constructor(
    domain: string = process.env.SIWE_DOMAIN || 'localhost',
    uri: string = process.env.SIWE_URI || 'https://localhost',
    databaseService?: any
  ) {
    super(databaseService);
    this.domain = domain;
    this.uri = uri;
  }

  /**
   * Generate a SIWE authentication challenge
   * @param address Ethereum address to create challenge for
   * @param chainId Chain ID to use in SIWE message
   * @param statement Statement to include in SIWE message
   * @param ipAddress Optional IP address of the requesting client
   * @param userAgent Optional user agent of the requesting client
   * @returns The created challenge with SIWE message
   */
  async createSiweChallenge(
    address: string,
    chainId: number,
    statement: string = 'Sign in with Ethereum to DocuVault',
    ipAddress?: string,
    userAgent?: string
  ): Promise<{
    challenge: AuthChallenge;
    siweMessage: SiweMessage;
  }> {
    try {
      // Format address as proper EIP-55 checksum address
      const checksumAddress = getAddress(address);

      // Lowercase for database storage
      const normalizedAddress = checksumAddress.toLowerCase();

      // Generate a cryptographically secure nonce
      const nonce = this.generateNonce();

      // Create SIWE message object with proper EIP-55 checksum address
      const siweMessage = new SiweMessage({
        domain: this.domain,
        address: checksumAddress, // Use checksum address here, not lowercase
        statement,
        uri: this.uri,
        version: '1',
        chainId,
        nonce,
        issuedAt: new Date().toISOString(),
        expirationTime: this.getExpirationTime(30).toISOString() // 30 minutes expiration (increased from 15)
      });

      // Convert to string format
      const message = siweMessage.prepareMessage();

      const challenge = await this.createChallengeWithTransaction(
        normalizedAddress,
        nonce,
        message,
        ipAddress,
        userAgent
      );

      // Check for either lowercase or uppercase property names
      // This can happen if the database returns column names with different casing
      if (!challenge || (!(challenge as any).id && !(challenge as any).Id)) {
        console.error(
          'Failed to create challenge - received invalid challenge object:',
          challenge
        );
        throw new Error('Failed to create challenge - database error');
      }

      // Use either lowercase or uppercase ID property
      const challengeId = (challenge as any).id || (challenge as any).Id;

      return {
        challenge,
        siweMessage
      };
    } catch (error) {
      console.error('Error creating SIWE challenge:', error);
      throw new Error('Failed to create SIWE challenge');
    }
  }

  /**
   * Verify a SIWE authentication challenge
   * @param signature The signed SIWE message
   * @param message The original SIWE message
   * @param markAsUsedImmediately Whether to mark the challenge as used immediately (default: true)
   * @returns Verification result with the message fields if successful
   */
  async verifySiweChallenge(
    signature: string,
    message: string,
    markAsUsedImmediately: boolean = true
  ): Promise<{
    success: boolean;
    address?: string;
    fields?: any;
    error?: string;
    challengeId?: string;
  }> {
    try {
      // Parse the SIWE message
      const siweMessage = new SiweMessage(message);

      // Verify the signature
      const {
        success,
        data: fields,
        error
      } = await siweMessage.verify({
        signature,
        domain: this.domain
      });

      if (!success || !fields) {
        // Check if it's an expiration error
        if (
          error &&
          typeof error === 'object' &&
          'type' in error &&
          error.type === 'Expired message.'
        ) {
          console.error(`SIWE message expired: ${JSON.stringify(error)}`);
          return {
            success: false,
            error:
              'Authentication message has expired. Please request a new sign-in message and try again.'
          };
        }

        console.error(`SIWE signature verification failed: ${error}`);
        return {
          success: false,
          error: error ? String(error) : 'Invalid signature'
        };
      }

      // Ensure we look up with lowercase in our database
      const addressForLookup = fields.address.toLowerCase();

      // Look up the challenge in our database
      const challenge = await this.getActiveChallenge(addressForLookup);

      if (!challenge) {
        console.error(
          `No active challenge found for address: ${addressForLookup}`
        );
        return {
          success: false,
          error: 'No active challenge found'
        };
      }

      // Verify that the nonce matches
      if (fields.nonce !== challenge.nonce) {
        console.error(
          `Nonce mismatch: Message has ${fields.nonce}, challenge has ${challenge.nonce}`
        );
        return {
          success: false,
          error: 'Nonce mismatch'
        };
      }

      // Mark the challenge as used to prevent replay attacks, but only if requested
      if (markAsUsedImmediately) {
        await this.markChallengeUsed(challenge.id);
        console.log(
          `Successfully verified SIWE message and marked challenge ${challenge.id} as used`
        );
      } else {
        console.log(
          `Successfully verified SIWE message for challenge ${challenge.id} (not marked as used yet)`
        );
      }

      // Return the checksummed address for the client but use lowercase internally
      const checksumAddress = getAddress(fields.address);

      return {
        success: true,
        address: checksumAddress,
        fields,
        challengeId: challenge.id
      };
    } catch (error) {
      console.error('Error verifying SIWE challenge:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate a cryptographically secure nonce
   * @returns A secure random string
   */
  private generateNonce(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Get expiration time from now
   * @param minutes Minutes from now
   * @returns Date object
   */
  private getExpirationTime(minutes: number): Date {
    const expiration = new Date();
    expiration.setMinutes(expiration.getMinutes() + minutes);
    return expiration;
  }
}
