import { Router } from 'express';
import { validateRequest } from '../../middleware/validation.middleware';
import {
  SiweNonceRequestSchema,
  SiweVerifyRequestSchema,
  SiweLogoutRequestSchema,
  SiweRefreshTokenSchema
} from '../../validators/siwe.validators';
import { SiweController } from '../../controllers/siwe.controller';
import { verifySiweAuth } from '../../middleware/auth.middleware';
import {
  authLimiter,
  standardLimiter
} from '../../middleware/rate-limit.middleware';
import { validateSiweMessage } from '../../middleware/siwe-validation.middleware';

const router: Router = Router();
const siweController = new SiweController();

/**
 * @route GET /api/v1/auth/siwe/nonce
 * @desc Generate a nonce for SIWE authentication
 */
router.get(
  '/nonce',
  authLimiter, // Rate limit for authentication endpoints
  validateRequest(SiweNonceRequestSchema, 'query'),
  siweController.generateNonce
);

/**
 * @route POST /api/v1/auth/siwe/verify
 * @desc Verify a signed SIWE message
 */
router.post(
  '/verify',
  authLimiter, // Rate limit for authentication endpoints
  validateRequest(SiweVerifyRequestSchema),
  validateSiweMessage(), // Use our new middleware
  siweController.verifyMessage
);

/**
 * @route POST /api/v1/auth/siwe/refresh
 * @desc Refresh authentication tokens
 */
router.post(
  '/refresh',
  authLimiter,
  validateRequest(SiweRefreshTokenSchema),
  siweController.refreshToken
);

/**
 * @route GET /api/v1/auth/siwe/session
 * @desc Get current session info
 */
router.get('/session', standardLimiter, siweController.getSession);

/**
 * @route POST /api/v1/auth/siwe/logout
 * @desc Logout from the current session
 */
router.post(
  '/logout',
  standardLimiter,
  validateRequest(SiweLogoutRequestSchema),
  siweController.logout
);

/**
 * @route GET /api/v1/auth/siwe/profile
 * @desc Get user profile
 * @access Private (requires SIWE auth)
 */
router.get(
  '/profile',
  standardLimiter,
  verifySiweAuth,
  siweController.getProfile
);

/**
 * @route GET /api/v1/auth/siwe/did-info
 * @desc Get DID information for authenticated user
 * @access Private (requires SIWE auth)
 */
router.get(
  '/did-info',
  standardLimiter,
  verifySiweAuth,
  siweController.getDidInfo
);

export default router;
