import { z } from 'zod';
import { ethers } from 'ethers';

/**
 * Schema for validating SIWE nonce request
 */
export const SiweNonceRequestSchema = z.object({
  address: z
    .string()
    .trim()
    .refine((val) => ethers.isAddress(val), {
      message: 'Invalid Ethereum address format'
    }),
  chainId: z
    .string()
    .or(z.number())
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val > 0, {
      message: 'Chain ID must be a positive number'
    })
});

/**
 * Schema for validating SIWE verification request
 */
export const SiweVerifyRequestSchema = z.object({
  message: z.string().min(1, 'Message is required'),
  signature: z.string().min(1, 'Signature is required')
});

/**
 * Schema for validating SIWE message format
 */
export const SiweMessageSchema = z.object({
  domain: z.string().min(1, 'Domain is required'),
  address: z.string().refine((val) => ethers.isAddress(val), {
    message: 'Invalid Ethereum address format'
  }),
  statement: z.string().optional(),
  uri: z.string().url('URI must be a valid URL'),
  version: z.string().min(1, 'Version is required'),
  chainId: z.number().int().positive('Chain ID must be a positive integer'),
  nonce: z.string().min(1, 'Nonce is required'),
  issuedAt: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid issuedAt date format'
  }),
  expirationTime: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid expirationTime date format'
    })
    .optional(),
  notBefore: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid notBefore date format'
    })
    .optional(),
  requestId: z.string().optional(),
  resources: z.array(z.string().url('Resource must be a valid URL')).optional()
});

/**
 * Schema for validating SIWE logout request
 */
export const SiweLogoutRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required').optional()
});

/**
 * Schema for validating SIWE token refresh request
 */
export const SiweRefreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required')
});

/**
 * Schema for validating address-based development operations
 */
export const SiweDevAddressSchema = z.object({
  address: z
    .string()
    .trim()
    .refine((val) => ethers.isAddress(val), {
      message: 'Invalid Ethereum address format'
    })
});

/**
 * Schema for validating challenge reset operations
 */
export const SiweDevChallengeSchema = z.object({
  challengeId: z.string().uuid('Challenge ID must be a valid UUID')
});

/**
 * Type definitions generated from schemas
 */
export type SiweNonceRequest = z.infer<typeof SiweNonceRequestSchema>;
export type SiweVerifyRequest = z.infer<typeof SiweVerifyRequestSchema>;
export type SiweMessageFormat = z.infer<typeof SiweMessageSchema>;
export type SiweLogoutRequest = z.infer<typeof SiweLogoutRequestSchema>;
export type SiweRefreshTokenRequest = z.infer<typeof SiweRefreshTokenSchema>;
export type SiweDevAddressRequest = z.infer<typeof SiweDevAddressSchema>;
export type SiweDevChallengeRequest = z.infer<typeof SiweDevChallengeSchema>;
