import { Router } from 'express';
import { JwtController } from '../../controllers/jwt.controller';
import { authenticateJWT } from '../../middleware/auth.middleware';
import {
  authLimiter,
  standardLimiter
} from '../../middleware/rate-limit.middleware';

const router: Router = Router();
const jwtController = new JwtController();

/**
 * @route POST /api/v1/auth/jwt/generate-challenge
 * @desc Generate a challenge for authentication
 */
router.post(
  '/generate-challenge',
  authLimiter,
  jwtController.generateChallenge
);

/**
 * @route POST /api/v1/auth/jwt/authenticate
 * @desc Authenticate a DID by verifying a signature
 */
router.post('/authenticate', authLimiter, jwtController.authenticate);

/**
 * @route GET /api/v1/auth/jwt/check
 * @desc Check if the user is currently authenticated
 * @access Private
 */
router.get('/check', standardLimiter, authenticateJWT, jwtController.checkAuth);

/**
 * @route POST /api/v1/auth/jwt/refresh
 * @desc Refresh an authentication token
 * @access Private
 */
router.post(
  '/refresh',
  authLimiter,
  authenticateJWT,
  jwtController.refreshToken
);

/**
 * @route POST /api/v1/auth/jwt/verify-controller
 * @desc Verify that an address controls a DID
 */
router.post('/verify-controller', authLimiter, jwtController.verifyController);

/**
 * @route GET /api/v1/auth/jwt/address/:address
 * @desc Get the DID for an address
 */
router.get(
  '/address/:address',
  standardLimiter,
  jwtController.getDidForAddress
);

/**
 * @route GET /api/v1/auth/jwt/did/:did/active
 * @desc Check if a DID is active
 */
router.get('/did/:did/active', standardLimiter, jwtController.checkDidActive);

/**
 * @route GET /api/v1/auth/jwt/did-info
 * @desc Get DID information for the authenticated user
 * @access Private
 */
router.get(
  '/did-info',
  standardLimiter,
  authenticateJWT,
  jwtController.getDidInfo
);

export default router;
