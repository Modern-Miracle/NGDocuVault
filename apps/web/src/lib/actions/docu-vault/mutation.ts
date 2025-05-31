import { DocuVaultABI } from '@docu/abi';
import {
  RegisterDocumentInput,
  RegisterDocumentsInput,
  UpdateDocumentInput,
  VerifyDocumentInput,
  VerifyDocumentsInput,
  GiveConsentInput,
  ShareDocumentInput,
  RequestVerificationInput,
  RequestShareInput,
  RevokeConsentInput,
  RoleManagementInput,
  IssuerManagementInput,
  AdminManagementInput,
  OwnershipInput,
  VerifierManagementInput,
} from './types';
import {
  registerDocumentSchema,
  registerDocumentsSchema,
  updateDocumentSchema,
  verifyDocumentSchema,
  verifyDocumentsSchema,
  giveConsentSchema,
  shareDocumentSchema,
  requestVerificationSchema,
  requestShareSchema,
  revokeConsentSchema,
  roleManagementSchema,
  issuerManagementSchema,
  adminManagementSchema,
  ownershipSchema,
  verifierManagementSchema,
} from './schema';
import { ZodError, ZodFormattedError } from 'zod';
import { CONTRACTS } from '@/config/contract';
import { parseDocuVaultError } from './error-parser';
import { env } from '@/config/env';

/**
 * Configuration for the DocuVault contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration - should be overridden in production
const defaultConfig: ContractConfig = {
  contractAddress: CONTRACTS.DocuVault as `0x${string}`,
  chainId: Number(env.VITE_CHAIN_ID),
  rpcUrl: env.VITE_RPC_URL,
};

/**
 * Type for prepared transaction
 */
export type PreparedTransaction = {
  contractAddress: `0x${string}`;
  abi: typeof DocuVaultABI;
  functionName: string;
  args: unknown[];
};

/**
 * Type for transaction preparation response
 */
export type TransactionPreparation = {
  success: boolean;
  error?: string;
  transaction?: PreparedTransaction;
};

/**
 * Format Zod validation errors into a readable string
 * @param error - The Zod error object
 * @returns A formatted error message
 */
function formatZodError(error: ZodError): string {
  const formatted = error.format();

  const extractErrorMessage = (value: ZodFormattedError<unknown, string> | unknown): string => {
    if (!value) return '';

    // Handle array of strings
    if (Array.isArray(value)) return value.join(', ');

    // Handle object with _errors property
    if (typeof value === 'object' && '_errors' in value) {
      return (value as { _errors: string[] })._errors.join(', ');
    }

    // Return empty string for other cases
    return '';
  };

  const errorMessages = Object.entries(formatted)
    .filter(([key]) => key !== '_errors')
    .map(([key, value]) => {
      const errorMsg = extractErrorMessage(value);
      return errorMsg ? `${key}: ${errorMsg}` : '';
    })
    .filter(Boolean)
    .join('; ');

  return errorMessages || error.message;
}

/**
 * Prepare a transaction to register a new document
 * @param input - Document registration input
 * @returns Prepared transaction
 */
export async function prepareRegisterDocument(input: RegisterDocumentInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = registerDocumentSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'registerDocument',
        args: [
          validatedData.contentHash,
          validatedData.cid,
          validatedData.holder,
          validatedData.issuanceDate,
          validatedData.expirationDate,
          validatedData.documentType,
        ],
      },
    };
  } catch (error) {
    console.error('Error preparing register document transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to register multiple documents
 * @param input - Batch document registration input
 * @returns Prepared transaction
 */
export async function prepareRegisterDocuments(input: RegisterDocumentsInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = registerDocumentsSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'registerDocuments',
        args: [
          validatedData.contentHashes,
          validatedData.cids,
          validatedData.holders,
          validatedData.issuanceDates,
          validatedData.expirationDates,
          validatedData.documentTypes,
        ],
      },
    };
  } catch (error) {
    console.error('Error preparing register documents transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to update a document
 * @param input - Document update input
 * @returns Prepared transaction
 */
export async function prepareUpdateDocument(input: UpdateDocumentInput): Promise<TransactionPreparation> {
  try {
    const result = updateDocumentSchema.safeParse(input);

    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'updateDocument',
        args: [
          validatedData.oldDocumentId,
          validatedData.contentHash,
          validatedData.cid,
          validatedData.expirationDate,
          validatedData.documentType,
        ],
      },
    };
  } catch (error) {
    console.error('Error preparing update document transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to verify a document
 * @param input - Document verification input
 * @returns Prepared transaction
 */
export async function prepareVerifyDocument(input: VerifyDocumentInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = verifyDocumentSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'verifyDocument',
        args: [validatedData.documentId],
      },
    };
  } catch (error) {
    console.error('Error preparing verify document transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to batch verify documents
 * @param input - Batch document verification input
 * @returns Prepared transaction
 */
export async function prepareVerifyDocuments(input: VerifyDocumentsInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = verifyDocumentsSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'verifyDocuments',
        args: [validatedData.documentIds],
      },
    };
  } catch (error) {
    console.error('Error preparing verify documents transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to give consent for document sharing
 * @param input - Consent input
 * @returns Prepared transaction
 */
export async function prepareGiveConsent(input: GiveConsentInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = giveConsentSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'giveConsent',
        args: [validatedData.documentId, validatedData.requester, validatedData.consent, validatedData.validUntil],
      },
    };
  } catch (error) {
    console.error('Error preparing give consent transaction:', error);
    const parsedError = parseDocuVaultError(error);

    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to revoke consent for document sharing
 * @param input - Revoke consent input
 * @returns Prepared transaction
 */
export async function prepareRevokeConsent(input: RevokeConsentInput): Promise<TransactionPreparation> {
  try {
    const result = revokeConsentSchema.safeParse(input);

    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'revokeConsent',
        args: [validatedData.documentId, validatedData.requester],
      },
    };
  } catch (error) {
    console.error('Error preparing revoke consent transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to request document sharing
 * @param input - Request share input
 * @returns Prepared transaction
 */
export async function prepareRequestShare(input: RequestShareInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = requestShareSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'requestShare',
        args: [validatedData.documentId, validatedData.requester],
      },
    };
  } catch (error) {
    console.error('Error preparing request share transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to share a document
 * @param input - Share document input
 * @returns Prepared transaction
 */
export async function prepareShareDocument(input: ShareDocumentInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = shareDocumentSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'shareDocument',
        args: [validatedData.documentId, validatedData.requester],
      },
    };
  } catch (error) {
    console.error('Error preparing share document transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to request document verification
 * @param input - Request verification input
 * @returns Prepared transaction
 */
export async function prepareRequestVerification(input: RequestVerificationInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = requestVerificationSchema.safeParse(input);

    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'requestVerification',
        args: [validatedData.documentId],
      },
    };
  } catch (error) {
    console.error('Error preparing request verification transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to register an issuer
 * @param input - Issuer management input
 * @returns Prepared transaction
 */
export async function prepareRegisterIssuer(input: IssuerManagementInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = issuerManagementSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'registerIssuer',
        args: [validatedData.issuerAddr],
      },
    };
  } catch (error) {
    console.error('Error preparing register issuer transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to register a verifier
 * @param input - Verifier management input
 * @returns Prepared transaction
 */
export async function prepareRegisterVerifier(input: VerifierManagementInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = verifierManagementSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'addVerifier',
        args: [validatedData.verifierAddr],
      },
    };
  } catch (error) {
    console.error('Error preparing register verifier transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to register a holder (user)
 * @returns Prepared transaction
 */
export async function prepareRegisterHolder(): Promise<TransactionPreparation> {
  try {
    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'registerUser',
        args: [],
      },
    };
  } catch (error) {
    console.error('Error preparing register holder transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to activate an issuer
 * @param input - Issuer management input
 * @returns Prepared transaction
 */
export async function prepareActivateIssuer(input: IssuerManagementInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = issuerManagementSchema.safeParse(input);

    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'activateIssuer',
        args: [validatedData.issuerAddr],
      },
    };
  } catch (error) {
    console.error('Error preparing activate issuer transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to deactivate an issuer
 * @param input - Issuer management input
 * @returns Prepared transaction
 */
export async function prepareDeactivateIssuer(input: IssuerManagementInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = issuerManagementSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'deactivateIssuer',
        args: [validatedData.issuerAddr],
      },
    };
  } catch (error) {
    console.error('Error preparing deactivate issuer transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to add an admin
 * @param input - Admin management input
 * @returns Prepared transaction
 */
export async function prepareAddAdmin(input: AdminManagementInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = adminManagementSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'addAdmin',
        args: [validatedData.adminAddr],
      },
    };
  } catch (error) {
    console.error('Error preparing add admin transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to remove an admin
 * @param input - Admin management input
 * @returns Prepared transaction
 */
export async function prepareRemoveAdmin(input: AdminManagementInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = adminManagementSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'removeAdmin',
        args: [validatedData.adminAddr],
      },
    };
  } catch (error) {
    console.error('Error preparing remove admin transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to grant a role
 * @param input - Role management input
 * @returns Prepared transaction
 */
export async function prepareGrantRole(input: RoleManagementInput): Promise<TransactionPreparation> {
  try {
    const result = roleManagementSchema.safeParse(input);

    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'grantRole',
        args: [validatedData.role, validatedData.account],
      },
    };
  } catch (error) {
    console.error('Error preparing grant role transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to revoke a role
 * @param input - Role management input
 * @returns Prepared transaction
 */
export async function prepareRevokeRole(input: RoleManagementInput): Promise<TransactionPreparation> {
  try {
    const result = roleManagementSchema.safeParse(input);

    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'revokeRole',
        args: [validatedData.role, validatedData.account],
      },
    };
  } catch (error) {
    console.error('Error preparing revoke role transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to renounce a role
 * @param input - Role management input
 * @returns Prepared transaction
 */
export async function prepareRenounceRole(input: RoleManagementInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = roleManagementSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'renounceRole',
        args: [validatedData.role, validatedData.account],
      },
    };
  } catch (error) {
    console.error('Error preparing renounce role transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to transfer ownership
 * @param input - Ownership input
 * @returns Prepared transaction
 */
export async function prepareTransferOwnership(input: OwnershipInput): Promise<TransactionPreparation> {
  try {
    // Validate input using Zod schema
    const result = ownershipSchema.safeParse(input);
    if (!result.success) {
      throw new Error(formatZodError(result.error));
    }

    const validatedData = result.data;

    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'transferOwnership',
        args: [validatedData.newOwner],
      },
    };
  } catch (error) {
    console.error('Error preparing transfer ownership transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to renounce ownership
 * @returns Prepared transaction
 */
export async function prepareRenounceOwnership(): Promise<TransactionPreparation> {
  try {
    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'renounceOwnership',
        args: [],
      },
    };
  } catch (error) {
    console.error('Error preparing renounce ownership transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to pause the contract
 * @returns Prepared transaction
 */
export async function preparePause(): Promise<TransactionPreparation> {
  try {
    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'pause',
        args: [],
      },
    };
  } catch (error) {
    console.error('Error preparing pause transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}

/**
 * Prepare a transaction to unpause the contract
 * @returns Prepared transaction
 */
export async function prepareUnpause(): Promise<TransactionPreparation> {
  try {
    return {
      success: true,
      transaction: {
        contractAddress: defaultConfig.contractAddress,
        abi: DocuVaultABI,
        functionName: 'unpause',
        args: [],
      },
    };
  } catch (error) {
    console.error('Error preparing unpause transaction:', error);
    const parsedError = parseDocuVaultError(error);
    return {
      success: false,
      error: parsedError ? parsedError.message : String(error),
    };
  }
}
