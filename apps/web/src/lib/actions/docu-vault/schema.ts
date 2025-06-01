import { z } from 'zod';
import { Consent, DocumentType } from './types';

/**
 * Zod schema for Ethereum address validation
 */
export const addressSchema = z
  .string()
  .regex(/^0x[a-fA-F0-9]{40}$/, 'Invalid Ethereum address format')
  .refine((address) => address !== '0x0000000000000000000000000000000000000000', {
    message: 'Zero address is not allowed',
  });

/**
 * Zod schema for bytes32 string validation (document IDs, role IDs, etc.)
 */
export const bytes32Schema = z.string().regex(/^0x[a-fA-F0-9]{64}$/, 'Invalid bytes32 format');

/**
 * Zod schema for CID (Content Identifier) validation
 */
export const cidSchema = z.string().min(1, 'CID is required').max(256, 'CID exceeds maximum length');

/**
 * Zod schema for UNIX timestamp validation
 */
export const timestampSchema = z
  .number()
  .int('Timestamp must be an integer')
  .nonnegative('Timestamp must be non-negative');

/**
 * Zod schema for document type validation
 */
export const documentTypeSchema = z.nativeEnum(DocumentType, {
  errorMap: () => ({ message: 'Invalid document type' }),
});

/**
 * Zod schema for consent status validation
 */
export const consentStatusSchema = z.nativeEnum(Consent, {
  errorMap: () => ({ message: 'Invalid consent status' }),
});

/**
 * Zod schema for future timestamp validation
 */
export const futureTimestampSchema = timestampSchema.refine((timestamp) => timestamp > Math.floor(Date.now() / 1000), {
  message: 'Timestamp must be in the future',
});

/**
 * Schema for register document input
 */
export const registerDocumentSchema = z
  .object({
    contentHash: bytes32Schema,
    cid: cidSchema,
    holder: addressSchema,
    issuanceDate: timestampSchema,
    expirationDate: timestampSchema,
    documentType: documentTypeSchema,
  })
  .refine((data) => data.issuanceDate < data.expirationDate, {
    message: 'Expiration date must be after issuance date',
    path: ['expirationDate'],
  });

/**
 * Schema for register documents input (batch)
 */
export const registerDocumentsSchema = z
  .object({
    contentHashes: z.array(bytes32Schema).min(1, 'At least one document is required'),
    cids: z.array(cidSchema).min(1, 'At least one CID is required'),
    holders: z.array(addressSchema).min(1, 'At least one holder is required'),
    issuanceDates: z.array(timestampSchema).min(1, 'At least one issuance date is required'),
    expirationDates: z.array(timestampSchema).min(1, 'At least one expiration date is required'),
    documentTypes: z.array(documentTypeSchema).min(1, 'At least one document type is required'),
  })
  .refine(
    (data) => {
      const length = data.contentHashes.length;
      return (
        data.cids.length === length &&
        data.holders.length === length &&
        data.issuanceDates.length === length &&
        data.expirationDates.length === length &&
        data.documentTypes.length === length
      );
    },
    {
      message: 'All input arrays must have the same length',
    }
  )
  .refine(
    (data) => {
      for (let i = 0; i < data.issuanceDates.length; i++) {
        // Ensure both values exist before comparing
        const issuanceDate = data.issuanceDates[i];
        const expirationDate = data.expirationDates[i];

        if (issuanceDate !== undefined && expirationDate !== undefined && issuanceDate >= expirationDate) {
          return false;
        }
      }
      return true;
    },
    {
      message: 'All expiration dates must be after their issuance dates',
    }
  );

/**
 * Schema for update document input
 */
export const updateDocumentSchema = z.object({
  oldDocumentId: bytes32Schema,
  contentHash: bytes32Schema,
  cid: cidSchema,
  expirationDate: timestampSchema,
  documentType: documentTypeSchema,
});

/**
 * Schema for verify document input
 */
export const verifyDocumentSchema = z.object({
  documentId: bytes32Schema,
});

/**
 * Schema for verify documents input (batch)
 */
export const verifyDocumentsSchema = z.object({
  documentIds: z.array(bytes32Schema).min(1, 'At least one document ID is required'),
});

/**
 * Schema for giving consent input
 */
export const giveConsentSchema = z
  .object({
    documentId: bytes32Schema,
    requester: addressSchema,
    consent: consentStatusSchema,
    validUntil: timestampSchema,
  })
  .refine((data) => data.validUntil > Math.floor(Date.now() / 1000), {
    message: 'Valid until timestamp must be in the future',
    path: ['validUntil'],
  });

/**
 * Schema for revoking consent input
 */
export const revokeConsentSchema = z.object({
  documentId: bytes32Schema,
  requester: addressSchema,
});

/**
 * Schema for requesting verification input
 */
export const requestVerificationSchema = z.object({
  documentId: bytes32Schema,
});

/**
 * Schema for requesting share input
 */
export const requestShareSchema = z.object({
  documentId: bytes32Schema,
  requester: addressSchema,
});

/**
 * Schema for sharing document input
 */
export const shareDocumentSchema = z.object({
  documentId: bytes32Schema,
  requester: addressSchema,
});

/**
 * Schema for role management input
 */
export const roleManagementSchema = z.object({
  role: bytes32Schema,
  account: addressSchema,
});

/**
 * Schema for issuer management input
 */
export const issuerManagementSchema = z.object({
  issuerAddr: addressSchema,
});

/**
 * Schema for verifier management input
 */
export const verifierManagementSchema = z.object({
  verifierAddr: addressSchema,
});

/**
 * Schema for holder management input
 */
export const holderManagementSchema = z.object({
  userAddr: addressSchema,
});

/**
 * Schema for admin management input
 */
export const adminManagementSchema = z.object({
  adminAddr: addressSchema,
});

/**
 * Schema for ownership management input
 */
export const ownershipSchema = z.object({
  newOwner: addressSchema,
});

/**
 * Schema for checking if an account has a role
 */
export const hasRoleSchema = z.object({
  role: bytes32Schema,
  account: addressSchema,
});

/**
 * Schema for getting the admin role
 */
export const getRoleAdminSchema = z.object({
  role: bytes32Schema,
});

// Schemas for read operations
export const getDocumentSchema = z.object({
  documentId: bytes32Schema,
});

export const getDocumentsSchema = z.object({
  holder: addressSchema,
});

export const getConsentStatusSchema = z.object({
  documentId: bytes32Schema,
  requester: addressSchema,
});

export const isDocumentExpiredSchema = z.object({
  documentId: bytes32Schema,
});

export const isIssuerActiveSchema = z.object({
  issuerAddr: addressSchema,
});

export const generateDocumentIdSchema = z.object({
  contentHash: bytes32Schema,
  holder: addressSchema,
  cid: z.string().min(1, { message: 'CID is required' }),
});

export const verifyCidSchema = z.object({
  contentHash: bytes32Schema,
  holder: addressSchema,
  cid: z.string().min(1, { message: 'CID is required' }),
  documentId: bytes32Schema,
});

export const supportsInterfaceSchema = z.object({
  interfaceId: z.string().regex(/^0x[a-fA-F0-9]{8}$/, {
    message: 'Invalid interface ID format (must be 4 bytes)',
  }),
});

export const getMultipleDocumentInfoSchema = z.object({
  documentIds: z.array(bytes32Schema).min(1, { message: 'At least one document ID is required' }),
});

export const isAddressSchema = z.object({
  address: addressSchema,
});
