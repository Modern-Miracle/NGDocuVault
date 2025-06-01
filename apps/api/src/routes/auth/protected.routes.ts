import { Router } from 'express';
import {
  requireAuthentication,
  requireRole
} from '../../middleware/session.middleware';
import { SiweController } from '../../controllers/siwe.controller';
import { JwtController } from '../../controllers/jwt.controller';
import { UserRole } from '../../types';
import {
  sensitiveEndpointLimiter,
  standardLimiter
} from '../../middleware/rate-limit.middleware';

// Create router
const router: Router = Router();

// Initialize controllers
const siweController = new SiweController();
const jwtController = new JwtController();

// Apply authentication middleware to all routes
router.use(requireAuthentication);

/**
 * @route GET /api/v1/auth/protected/profile
 * @desc Get user profile
 * @access Authenticated users (any auth method)
 */
router.get('/profile', standardLimiter, siweController.getProfile);

/**
 * @route GET /api/v1/auth/protected/did-info
 * @desc Get DID information
 * @access Authenticated users (any auth method)
 */
router.get('/did-info', standardLimiter, (req, res, next) => {
  // Determine which controller to use based on authentication method
  if (req.user?.authMethod === 'siwe') {
    return siweController.getDidInfo(req, res, next);
  } else {
    return jwtController.getDidInfo(req, res, next);
  }
});

/**
 * @route GET /api/v1/auth/protected/admin
 * @desc Get admin data
 * @access Admin role only
 */
router.get(
  '/admin',
  sensitiveEndpointLimiter, // Stricter rate limiting for admin endpoints
  requireRole([UserRole.ADMIN, UserRole.DEFAULT_ADMIN_ROLE]),
  siweController.getAdminData
);

/**
 * @route GET /api/v1/auth/protected/producer
 * @desc Get producer data
 * @access Producer role only
 */
router.get(
  '/producer',
  sensitiveEndpointLimiter, // Stricter rate limiting for restricted endpoints
  requireRole(UserRole.PRODUCER),
  siweController.getProducerData
);

export default router;
