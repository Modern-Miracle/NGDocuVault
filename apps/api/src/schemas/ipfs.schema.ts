import { z } from 'zod';

/**
 * Schema for IPFS CID parameter validation
 */
export const cidSchema = z.object({
  cid: z.string().min(1, 'CID is required')
});

/**
 * Schema for IPFS file upload validation
 */
export const uploadJsonSchema = z
  .record(z.any())
  .refine((data) => Object.keys(data).length > 0, {
    message: 'JSON data cannot be empty'
  });

/**
 * Schema for encrypted file upload metadata
 */
export const metadataSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  documentType: z.string().min(1, { message: 'Document type is required' }),
  owner: z.string().min(1, { message: 'Owner is required' }),
  timestamp: z.number().int().positive(),
  contentHash: z.string().optional(),
  signature: z.string().optional()
});

/**
 * Schema for encrypted file upload request
 */
export const encryptedUploadSchema = z.object({
  document: z.any().nullable(),
  metadata: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      type: z.string().optional()
    })
    .nullable()
});

/**
 * Schema for re-encrypting data with a public key
 */
export const reencryptSchema = z
  .object({
    cid: z.string().min(1, 'CID is required')
  })
  .and(
    z.object({
      publicKey: z.string().min(1, 'Public key is required')
    })
  );

/**
 * Schema for bulk IPFS data retrieval
 */
export const bulkDataSchema = z.object({
  cids: z
    .array(z.string().min(1, 'Each CID must be a non-empty string'))
    .min(1, 'At least one CID must be provided')
});

/**
 * Schema for batch upload request
 */
export const batchUploadSchema = z.object({
  files: z
    .array(
      z.object({
        document: z.any().nullable(),
        metadata: z
          .object({
            name: z.string().optional(),
            description: z.string().optional(),
            type: z.string().optional()
          })
          .nullable()
      })
    )
    .min(1, 'At least one file must be provided')
});

/**
 * Schema for batch delete request
 */
export const batchDeleteSchema = z.object({
  cids: z
    .array(z.string().min(1, 'Each CID must be a non-empty string'))
    .min(1, 'At least one CID must be provided')
});
