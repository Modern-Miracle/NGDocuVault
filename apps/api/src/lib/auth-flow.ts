/**
 * @fileoverview DID-based Authentication Flow Documentation
 *
 * This file provides documentation for the DID-based authentication flow
 * implemented in this API. The actual implementation is spread across multiple
 * files:
 * - controllers/auth.controller.ts: Main authentication logic
 * - middleware/auth.middleware.ts: JWT verification middleware
 * - utils/jwt.ts: Token generation and verification
 * - utils/challenge-store.ts: Challenge storage (in-memory for dev, should be replaced with DB in prod)
 */

/**
 * Authentication Flow
 *
 * The DID-based authentication flow works as follows:
 *
 * 1. Generate Challenge:
 *    - Client requests a challenge by sending their DID to /api/v1/auth/generate-challenge
 *    - Server verifies the DID exists on the blockchain
 *    - Server generates a random challenge and message to be signed
 *    - Server stores the challenge with the DID and an expiration time
 *    - Server sends the challenge and message to the client
 *
 * 2. Sign Challenge:
 *    - Client signs the message using their private key
 *    - This is typically done in the client's wallet
 *
 * 3. Authenticate:
 *    - Client sends the DID, message, and signature to /api/v1/auth/authenticate
 *    - Server retrieves the stored challenge for the DID
 *    - Server verifies the message matches the stored challenge
 *    - Server uses ethers.js to recover the signer's address from the signature
 *    - Server verifies that the recovered address controls the DID on the blockchain
 *    - On success, server generates a JWT token and returns it to the client
 *    - Server removes the used challenge to prevent replay attacks
 *
 * 4. Use Authentication:
 *    - Client includes the JWT token in the Authorization header for subsequent requests
 *    - Server verifies the token using the JWT middleware
 *    - If the token is valid, the request is allowed to proceed
 *    - The user's DID and address are available in req.user
 *
 * 5. Token Refresh:
 *    - When the token is about to expire, the client can request a new token
 *    - Client sends a request to /api/v1/auth/refresh with their current token
 *    - Server verifies the token and issues a new one
 */

/**
 * JWT Tokens
 *
 * The JWT tokens contain the following payload:
 *
 * {
 *   did: string,      // The user's DID
 *   address: string,  // The Ethereum address of the DID controller
 *   iat: number,      // Issued at timestamp
 *   exp: number       // Expiration timestamp
 * }
 *
 * Tokens are signed with the JWT_SECRET environment variable
 * Token expiration is controlled by TOKEN_EXPIRY environment variable (defaults to 1 day)
 */

/**
 * Production Considerations
 *
 * For a production environment, consider the following:
 *
 * 1. Challenge Storage:
 *    - Replace the in-memory challenge store with a database
 *    - Implement proper cleanup for expired challenges
 *
 * 2. JWT Configuration:
 *    - Use a strong, randomly generated JWT_SECRET
 *    - Consider shorter token expiration times with refresh tokens
 *    - Store JWT revocation list for logged-out users
 *
 * 3. Security:
 *    - Implement rate limiting for authentication endpoints
 *    - Add HTTPS to prevent man-in-the-middle attacks
 *    - Consider adding 2FA for sensitive operations
 */
