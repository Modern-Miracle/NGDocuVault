/**
 * In-memory challenge store
 * NOTE: In production, this should be replaced with a proper database
 */

interface Challenge {
  challenge: string;
  message: string;
  expiresAt: number;
}

class ChallengeStore {
  private challenges: Map<string, Challenge>;
  private cleanupInterval: NodeJS.Timeout | null = null;

  constructor() {
    this.challenges = new Map<string, Challenge>();

    // Only start cleanup in non-test environments
    if (process.env.NODE_ENV !== 'test') {
      this.startCleanupInterval();
    }
  }

  /**
   * Store a challenge for a DID
   * @param did The DID requesting authentication
   * @param challenge The generated challenge
   * @param message The message to be signed
   * @param expiresAt Expiration timestamp in seconds
   */
  storeChallenge(
    did: string,
    challenge: string,
    message: string,
    expiresAt: number
  ): void {
    this.challenges.set(did, {
      challenge,
      message,
      expiresAt
    });
  }

  /**
   * Get a challenge for a DID
   * @param did The DID
   * @returns The challenge data or null if not found or expired
   */
  getChallenge(did: string): Challenge | null {
    const challenge = this.challenges.get(did);

    if (!challenge) {
      return null;
    }

    // Check if challenge has expired
    const now = Math.floor(Date.now() / 1000);
    if (challenge.expiresAt < now) {
      this.removeChallenge(did);
      return null;
    }

    return challenge;
  }

  /**
   * Remove a challenge after use
   * @param did The DID
   */
  removeChallenge(did: string): void {
    this.challenges.delete(did);
  }

  /**
   * Clean up expired challenges
   */
  cleanupExpiredChallenges(): void {
    const now = Math.floor(Date.now() / 1000);

    for (const [did, challenge] of this.challenges.entries()) {
      if (challenge.expiresAt < now) {
        this.challenges.delete(did);
      }
    }
  }

  /**
   * Start the cleanup interval
   */
  startCleanupInterval(): void {
    if (this.cleanupInterval === null) {
      this.cleanupInterval = setInterval(() => {
        this.cleanupExpiredChallenges();
      }, 60000); // Clean up every minute

      // Allow the process to exit even if this interval is active
      if (this.cleanupInterval.unref) {
        this.cleanupInterval.unref();
      }
    }
  }

  /**
   * Stop the cleanup interval
   */
  stopCleanupInterval(): void {
    if (this.cleanupInterval !== null) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// Create a singleton instance
export const challengeStore = new ChallengeStore();
