import { Router } from 'express';
import { validateRequest } from '../../middleware/validation.middleware';
import { SiweController } from '../../controllers/siwe.controller';
import { z } from 'zod';
import { ethers } from 'ethers';

const router: Router = Router();
const siweController = new SiweController();

/**
 * @route POST /api/v1/auth/dev/clear-rate-limits
 * @desc Clear rate limiting for development/testing
 */
router.post(
  '/clear-rate-limits',
  validateRequest(
    z.object({
      address: z
        .string()
        .trim()
        .refine((val) => ethers.isAddress(val), {
          message: 'Invalid Ethereum address format'
        })
    })
  ),
  siweController.clearRateLimits
);

/**
 * @route POST /api/v1/auth/dev/reset-challenge
 * @desc Reset a challenge's used status
 */
router.post(
  '/reset-challenge',
  validateRequest(
    z
      .object({
        address: z.string().trim().optional(),
        challengeId: z.string().optional()
      })
      .refine((data) => data.address || data.challengeId, {
        message: 'Either address or challengeId must be provided'
      })
  ),
  siweController.resetChallenge
);

/**
 * @route POST /api/v1/auth/dev/reset-all-challenges
 * @desc Reset ALL challenges for an address
 */
router.post(
  '/reset-all-challenges',
  validateRequest(
    z.object({
      address: z
        .string()
        .trim()
        .refine((val) => ethers.isAddress(val), {
          message: 'Invalid Ethereum address format'
        })
    })
  ),
  siweController.resetAllChallenges
);

export default router;
