'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useWalletClient, usePublicClient } from 'wagmi';
import { type WalletClient, type PublicClient, type Account } from 'viem';
import { DocuVaultABI } from '@docu/abi';
import { useToast } from './use-toast';
import {
  generateDocumentId,
  getConsentStatus,
  getDocumentInfo,
  getDocuments,
  isDocumentExpired,
  isIssuerActive,
  getOwner,
  isPaused,
  getShareRequest,
  supportsInterface,
  verifyCid,
  getMultipleDocumentInfo,
} from '@/lib/actions/docu-vault/query';
import {
  prepareRegisterDocument,
  prepareRegisterDocuments,
  prepareUpdateDocument,
  prepareVerifyDocument,
  prepareVerifyDocuments,
  prepareGiveConsent,
  prepareRevokeConsent,
  prepareRequestShare,
  prepareShareDocument,
  prepareRequestVerification,
  prepareRegisterIssuer,
  prepareActivateIssuer,
  prepareDeactivateIssuer,
  prepareAddAdmin,
  prepareRemoveAdmin,
  prepareGrantRole,
  prepareRevokeRole,
  prepareTransferOwnership,
  prepareRenounceOwnership,
  preparePause,
  prepareUnpause,
  prepareRegisterVerifier,
  prepareRegisterHolder,
} from '@/lib/actions/docu-vault/mutation';
import type {
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
} from '@/lib/actions/docu-vault/types';
import type { TransactionPreparation } from '@/lib/actions/docu-vault/mutation';
import { CONTRACTS } from '@/config/contract';
import { DID_AUTH_KEYS } from './use-did-auth';
import { getAdminRole } from '@/lib/actions/did-auth';

/**
 * Configuration for the DID Registry contract
 */
type ContractConfig = {
  contractAddress: `0x${string}`;
  chainId: number;
  rpcUrl: string;
};

// Default configuration
const defaultConfig: ContractConfig = {
  contractAddress: CONTRACTS.DocuVault as `0x${string}`,
  chainId: parseInt(import.meta.env.VITE_CHAIN_ID || '31337'),
  rpcUrl: import.meta.env.VITE_RPC_URL || 'http://localhost:8545',
};

/**
 * Type for transaction response
 */
type TransactionResponse = {
  success: boolean;
  hash?: `0x${string}`;
  error?: string;
};

/**
 * Process a transaction with the wallet client
 */
const executeTransaction = async (
  walletClient: WalletClient,
  publicClient: PublicClient,
  transaction: TransactionPreparation,
  account: Account
): Promise<TransactionResponse> => {
  try {
    if (!transaction.success || !transaction.transaction) {
      throw new Error(transaction.error || 'Invalid transaction preparation');
    }

    const { request } = await publicClient.simulateContract({
      address: defaultConfig.contractAddress,
      abi: DocuVaultABI,
      functionName: transaction.transaction.functionName,
      args: transaction.transaction.args,
      account: account.address,
    });

    // Execute the transaction
    const hash = await walletClient.writeContract(request);

    return {
      success: true,
      hash,
    };
  } catch (error) {
    console.error('Error executing transaction:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown transaction error',
    };
  }
};

/**
 * Query keys for document vault
 */
export const DOCU_VAULT_KEYS = {
  all: ['docuVault'] as const,
  document: {
    info: (documentId?: string) => [...DOCU_VAULT_KEYS.all, 'document', 'info', documentId] as const,
    consent: (documentId?: string, requester?: string) =>
      [...DOCU_VAULT_KEYS.all, 'document', 'consent', documentId, requester] as const,
    expired: (documentId?: string) => [...DOCU_VAULT_KEYS.all, 'document', 'expired', documentId] as const,
    verified: (documentId?: string) => [...DOCU_VAULT_KEYS.all, 'document', 'verified', documentId] as const,
    shareRequest: (documentId?: string, requester?: string) =>
      [...DOCU_VAULT_KEYS.all, 'document', 'shareRequest', documentId, requester] as const,
  },
  holder: {
    documents: (holder?: string) => [...DOCU_VAULT_KEYS.all, 'holder', 'documents', holder] as const,
  },
  issuer: {
    active: (issuer?: string) => [...DOCU_VAULT_KEYS.all, 'issuer', 'active', issuer] as const,
  },

  contract: {
    owner: () => [...DOCU_VAULT_KEYS.all, 'contract', 'owner'] as const,
    paused: () => [...DOCU_VAULT_KEYS.all, 'contract', 'paused'] as const,
    interface: (interfaceId?: string) => [...DOCU_VAULT_KEYS.all, 'contract', 'interface', interfaceId] as const,
  },
  cid: {
    verify: (contentHash?: string, holder?: string, cid?: string, documentId?: string) =>
      [...DOCU_VAULT_KEYS.all, 'cid', 'verify', contentHash, holder, cid, documentId] as const,
  },
  documentId: {
    generate: (contentHash?: string, holder?: string, cid?: string) =>
      [...DOCU_VAULT_KEYS.all, 'documentId', 'generate', contentHash, holder, cid] as const,
  },
  multiDocuments: {
    info: (documentIds?: string[]) =>
      [...DOCU_VAULT_KEYS.all, 'multiDocuments', 'info', documentIds?.join(',')] as const,
  },
} as const;

/**
 * Document information from the contract
 */
export interface DocumentInfo {
  documentId: `0x${string}`;
  contentHash: `0x${string}`;
  cid?: string;
  holder: `0x${string}`;
  issuer: `0x${string}`;
  documentType: bigint;
  issuanceTimestamp: bigint;
  expirationTimestamp: bigint;
  isVerified: boolean;
  verifier?: `0x${string}`;
  verificationTimestamp: bigint;
  metadata?: string;
}

/**
 * Hook to get document information
 * @param documentId - Document ID
 */
export function useDocumentInfo(documentId: string) {
  const { toast } = useToast();

  return useQuery({
    queryKey: DOCU_VAULT_KEYS.document.info(documentId),
    queryFn: () => getDocumentInfo(documentId!),
    enabled: !!documentId,
    throwOnError: (error) => {
      toast.error('Failed to get document information', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      return false;
    },
  });
}

/**
 * Hook to check if user has given consent for a document to a requester
 * @param documentId - Document ID
 * @param requester - Address of the requester
 */
export function useConsentStatus(documentId: string, requester: string) {
  const { toast } = useToast();

  return useQuery({
    queryKey: DOCU_VAULT_KEYS.document.consent(documentId, requester),
    queryFn: () => getConsentStatus(documentId!, requester!),
    enabled: !!documentId && !!requester,
    throwOnError: (error) => {
      toast.error('Failed to check consent status', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
      return false;
    },
  });
}

/**
 * Hook to check if a document is expired
 * @param documentId - Document ID
 * @param config - Optional contract configuration
 */
export function useIsDocumentExpired(documentId?: string) {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.document.expired(documentId),
    queryFn: async () => {
      if (!documentId) {
        return Promise.reject(new Error('Document ID is required'));
      }
      return await isDocumentExpired(documentId);
    },
    enabled: !!documentId,
  });
}

/**
 * Hook to get documents for a holder
 * @param holder - Holder address
 * @param config - Optional contract configuration
 */
export function useHolderDocuments(holder?: `0x${string}`) {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.holder.documents(holder),
    queryFn: async () => {
      if (!holder || holder === '0x0' || holder === '0x0000000000000000000000000000000000000000') {
        return { documentIds: [] };
      }
      return await getDocuments(holder);
    },
    enabled: !!holder && holder !== '0x0' && holder !== '0x0000000000000000000000000000000000000000',
  });
}

/**
 * Hook to check if an issuer is active
 * @param issuer - Issuer address
 * @param config - Optional contract configuration
 */
export function useIsIssuerActive(issuer?: string) {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.issuer.active(issuer),
    queryFn: async () => {
      if (!issuer) {
        return Promise.reject(new Error('Issuer address is required'));
      }
      return await isIssuerActive(issuer);
    },
    enabled: !!issuer,
  });
}

/**
 * Hook to get contract owner
 * @param config - Optional contract configuration
 */
export function useContractOwner() {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.contract.owner(),
    queryFn: () => getOwner(),
  });
}

/**
 * Hook to check if contract is paused
 * @param config - Optional contract configuration
 */
export function useIsPaused() {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.contract.paused(),
    queryFn: () => isPaused(),
  });
}

/**
 * Hook to get share request information
 * @param documentId - Document ID
 * @param requester - Requester address
 * @param config - Optional contract configuration
 */
export function useShareRequest(documentId?: string, requester?: string) {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.document.shareRequest(documentId, requester),
    queryFn: async () => {
      if (!documentId || !requester) {
        return Promise.reject(new Error('Document ID and requester are required'));
      }
      return await getShareRequest(documentId, requester);
    },
    enabled: !!documentId && !!requester,
  });
}

/**
 * Hook to verify CID
 * @param contentHash - Content hash
 * @param holder - Holder address
 * @param cid - Content ID
 * @param documentId - Document ID
 * @param config - Optional contract configuration
 */
export function useVerifyCid(contentHash?: string, holder?: string, cid?: string, documentId?: string) {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.cid.verify(contentHash, holder, cid, documentId),
    queryFn: async () => {
      if (!contentHash || !holder || !cid || !documentId) {
        return Promise.reject(new Error('Content hash, holder, CID, and document ID are required'));
      }
      return await verifyCid(contentHash, holder, cid, documentId);
    },
    enabled: !!contentHash && !!holder && !!cid && !!documentId,
  });
}

/**
 * Hook to generate document ID
 * @param contentHash - Content hash
 * @param holder - Holder address
 * @param cid - Content ID
 * @param config - Optional contract configuration
 */
export function useGenerateDocumentId(contentHash: string, holder: string, cid: string) {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.documentId.generate(contentHash, holder, cid),
    queryFn: async () => {
      if (!contentHash || !holder || !cid) {
        return Promise.reject(new Error('Content hash, holder, and CID are required'));
      }
      return await generateDocumentId(contentHash, holder, cid);
    },
    enabled: !!contentHash && !!holder && !!cid,
  });
}

/**
 * Hook to check if interface is supported
 * @param interfaceId - Interface ID
 * @param config - Optional contract configuration
 */
export function useSupportsInterface(interfaceId?: string) {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.contract.interface(interfaceId),
    queryFn: async () => {
      if (!interfaceId) {
        return Promise.reject(new Error('Interface ID is required'));
      }
      return await supportsInterface(interfaceId);
    },
    enabled: !!interfaceId,
  });
}

/**
 * Hook to get multiple document info
 * @param documentIds - Document IDs
 * @param config - Optional contract configuration
 */
export function useMultipleDocumentInfo(documentIds?: string[]) {
  return useQuery({
    queryKey: DOCU_VAULT_KEYS.multiDocuments.info(documentIds),
    queryFn: async () => {
      if (!documentIds || documentIds.length === 0) {
        return Promise.reject(new Error('Document IDs are required'));
      }
      return await getMultipleDocumentInfo(documentIds);
    },
    enabled: !!documentIds && documentIds.length > 0,
  });
}

/**
 * Hook to register a document
 */
export function useRegisterDocument() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: RegisterDocumentInput) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      try {
        const account = walletClient.account;

        if (!account) {
          throw new Error('No account found in wallet client');
        }

        const preparation = await prepareRegisterDocument(input);

        return executeTransaction(walletClient, publicClient, preparation, account);
      } catch (error) {
        console.error('Error preparing transaction:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Calculate the documentId that would be created
        generateDocumentId(
          variables.contentHash as `0x${string}`,
          variables.holder as `0x${string}`,
          variables.cid || ''
        ).then((response) => {
          // Invalidate relevant queries
          queryClient.invalidateQueries({ queryKey: DOCU_VAULT_KEYS.document.info(response.documentId) });
          queryClient.invalidateQueries({
            queryKey: DOCU_VAULT_KEYS.holder.documents(variables.holder as string),
          });

          // Show success toast
          toast.success('Document registered successfully', {
            description: `Document ${response.documentId.slice(0, 10)}... has been registered`,
          });
        });
      } else if (result.error) {
        toast.error('Failed to register document', {
          description: result.error,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to register document', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

/**
 * Hook to register multiple documents
 * @param config - Optional contract configuration
 */
export function useRegisterDocuments() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: RegisterDocumentsInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRegisterDocuments(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate holder documents for all holders in the batch
        variables.holders.forEach((holder) => {
          queryClient.invalidateQueries({
            queryKey: DOCU_VAULT_KEYS.holder.documents(holder),
          });
        });
      }
    },
  });
}

/**
 * Hook to update a document
 * @param config - Optional contract configuration
 */
export function useUpdateDocument() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: UpdateDocumentInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareUpdateDocument(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.info(variables.oldDocumentId),
        });
      }
    },
  });
}

/**
 * Hook to verify a document
 */
export function useVerifyDocument() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (input: VerifyDocumentInput) => {
      if (!walletClient || !publicClient) {
        throw new Error('Wallet not connected');
      }

      try {
        const account = walletClient.account;
        if (!account) {
          throw new Error('No account found in wallet client');
        }

        const preparation = await prepareVerifyDocument(input);
        return executeTransaction(walletClient, publicClient, preparation, account);
      } catch (error) {
        console.error('Error preparing transaction:', error);
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: DOCU_VAULT_KEYS.document.info(variables.documentId) });

        // Show success toast
        toast.success('Document verified successfully', {
          description: `Document ${variables.documentId.slice(0, 10)}... has been verified`,
        });
      } else if (result.error) {
        toast.error('Failed to verify document', {
          description: result.error,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to verify document', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

/**
 * Hook to verify multiple documents
 * @param config - Optional contract configuration
 */
export function useVerifyDocuments() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: VerifyDocumentsInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareVerifyDocuments(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries for each document
        variables.documentIds.forEach((documentId) => {
          queryClient.invalidateQueries({
            queryKey: DOCU_VAULT_KEYS.document.info(documentId),
          });
          queryClient.invalidateQueries({
            queryKey: DOCU_VAULT_KEYS.document.verified(documentId),
          });
        });

        // Invalidate multi-document query if it exists
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.multiDocuments.info(variables.documentIds),
        });
      }
    },
  });
}

/**
 * Hook to give consent for document sharing
 * @param config - Optional contract configuration
 */
export function useGiveConsent() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: GiveConsentInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareGiveConsent(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.consent(variables.documentId, variables.requester),
        });
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.shareRequest(variables.documentId, variables.requester),
        });
      }
    },
  });
}

/**
 * Hook to revoke consent
 * @param config - Optional contract configuration
 */
export function useRevokeConsent() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: RevokeConsentInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRevokeConsent(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.consent(variables.documentId, variables.requester),
        });
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.shareRequest(variables.documentId, variables.requester),
        });
      }
    },
  });
}

/**
 * Hook to request share
 * @param config - Optional contract configuration
 */
export function useRequestShare() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: RequestShareInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRequestShare(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.shareRequest(variables.documentId, variables.requester),
        });
      }
    },
  });
}

/**
 * Hook to share document
 * @param config - Optional contract configuration
 */
export function useShareDocument() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: ShareDocumentInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareShareDocument(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.consent(variables.documentId, variables.requester),
        });
      }
    },
  });
}

/**
 * Hook to request verification of a document
 */
export function useRequestVerification() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (params: RequestVerificationInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRequestVerification(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (result, variables) => {
      if (result.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.document.info(variables.documentId),
        });

        toast.success('Verification request sent successfully', {
          description: `Verification requested for document ${variables.documentId.slice(0, 10)}...`,
        });
      } else if (result.error) {
        toast.error('Failed to request verification', {
          description: result.error,
        });
      }
    },
    onError: (error) => {
      toast.error('Failed to request verification', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}

/**
 * Hook to register verifier
 * @param config - Optional contract configuration
 */
export function useRegisterVerifier() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: VerifierManagementInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRegisterVerifier(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DID_AUTH_KEYS.role.isVerifier(variables.verifierAddr),
        });
        queryClient.invalidateQueries({
          queryKey: DID_AUTH_KEYS.role.isVerifier(variables.verifierAddr),
        });
      }
    },
  });
}

/**
 * Hook to register holder (user)
 * @param config - Optional contract configuration
 */
export function useRegisterHolder() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async () => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRegisterHolder();

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success && walletClient?.account?.address) {
        // Invalidate relevant queries for the connected user
        queryClient.invalidateQueries({
          queryKey: DID_AUTH_KEYS.role.isHolder(walletClient.account.address),
        });
      }
    },
  });
}

/**
 * Hook to register issuer
 * @param config - Optional contract configuration
 */
export function useRegisterIssuer() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: IssuerManagementInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRegisterIssuer(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DID_AUTH_KEYS.role.isIssuer(variables.issuerAddr),
        });
        queryClient.invalidateQueries({
          queryKey: DID_AUTH_KEYS.role.isIssuer(variables.issuerAddr),
        });
      }
    },
  });
}

/**
 * Hook to activate issuer
 * @param config - Optional contract configuration
 */
export function useActivateIssuer() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: IssuerManagementInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareActivateIssuer(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        queryClient.invalidateQueries({
          queryKey: DID_AUTH_KEYS.role.isIssuer(variables.issuerAddr),
        });
      }
    },
  });
}

/**
 * Hook to deactivate issuer
 * @param config - Optional contract configuration
 */
export function useDeactivateIssuer() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: IssuerManagementInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareDeactivateIssuer(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate relevant queries
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.issuer.active(variables.issuerAddr),
        });
      }
    },
  });
}

/**
 * Hook to add an admin
 * @param config - Optional contract configuration
 */
export function useAddAdmin() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: AdminManagementInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareAddAdmin(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: async (data, variables) => {
      if (data.success) {
        try {
          // Get the admin role to invalidate role checks
          const { role } = await getAdminRole();

          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: DID_AUTH_KEYS.role.check(role, variables.adminAddr),
          });
          queryClient.invalidateQueries({
            queryKey: DID_AUTH_KEYS.role.isAdmin(variables.adminAddr),
          });
        } catch (error) {
          console.error('Error invalidating queries after adding admin:', error);
        }
      }
    },
  });
}

/**
 * Hook to remove an admin
 * @param config - Optional contract configuration
 */
export function useRemoveAdmin() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: AdminManagementInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRemoveAdmin(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: async (data, variables) => {
      if (data.success) {
        try {
          // Get the admin role to invalidate role checks
          const { role } = await getAdminRole();

          // Invalidate relevant queries
          queryClient.invalidateQueries({
            queryKey: DID_AUTH_KEYS.role.check(role, variables.adminAddr),
          });
          queryClient.invalidateQueries({
            queryKey: DID_AUTH_KEYS.role.isAdmin(variables.adminAddr),
          });
        } catch (error) {
          console.error('Error invalidating queries after removing admin:', error);
        }
      }
    },
  });
}

/**
 * Hook to grant a role
 * @param config - Optional contract configuration
 */
export function useGrantRole() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: RoleManagementInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareGrantRole(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate role check query
        queryClient.invalidateQueries({
          queryKey: DID_AUTH_KEYS.role.check(variables.role, variables.account),
        });

        // Invalidate role-specific queries based on the role
        const adminRoleKey = DID_AUTH_KEYS.role.isAdmin(variables.account);
        const issuerRoleKey = DID_AUTH_KEYS.role.isIssuer(variables.account);
        const verifierRoleKey = DID_AUTH_KEYS.role.isVerifier(variables.account);

        // Invalidate all role-specific queries since we don't know which role was granted
        queryClient.invalidateQueries({ queryKey: adminRoleKey });
        queryClient.invalidateQueries({ queryKey: issuerRoleKey });
        queryClient.invalidateQueries({ queryKey: verifierRoleKey });
      }
    },
  });
}

/**
 * Hook to revoke a role
 * @param config - Optional contract configuration
 */
export function useRevokeRole() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: RoleManagementInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRevokeRole(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data, variables) => {
      if (data.success) {
        // Invalidate role check query
        queryClient.invalidateQueries({
          queryKey: DID_AUTH_KEYS.role.check(variables.role, variables.account),
        });

        // Invalidate role-specific queries based on the role
        const adminRoleKey = DID_AUTH_KEYS.role.isAdmin(variables.account);
        const issuerRoleKey = DID_AUTH_KEYS.role.isIssuer(variables.account);
        const verifierRoleKey = DID_AUTH_KEYS.role.isVerifier(variables.account);

        // Invalidate all role-specific queries since we don't know which role was revoked
        queryClient.invalidateQueries({ queryKey: adminRoleKey });
        queryClient.invalidateQueries({ queryKey: issuerRoleKey });
        queryClient.invalidateQueries({ queryKey: verifierRoleKey });
      }
    },
  });
}

/**
 * Hook to renounce a role
 * @param config - Optional contract configuration
 */
export function useRenounceRole() {
  // This is essentially the same as revokeRole but called by the role holder
  return useRevokeRole();
}

/**
 * Hook to transfer ownership
 * @param config - Optional contract configuration
 */
export function useTransferOwnership() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async (params: OwnershipInput) => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareTransferOwnership(params);

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate owner query
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.contract.owner(),
        });
      }
    },
  });
}

/**
 * Hook to renounce ownership
 * @param config - Optional contract configuration
 */
export function useRenounceOwnership() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async () => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareRenounceOwnership();

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate owner query
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.contract.owner(),
        });
      }
    },
  });
}

/**
 * Hook to pause the contract
 * @param config - Optional contract configuration
 */
export function usePauseContract() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;

  return useMutation({
    mutationFn: async () => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await preparePause();

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate paused state query
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.contract.paused(),
        });
      }
    },
  });
}

/**
 * Hook to unpause the contract
 * @param config - Optional contract configuration
 */
export function useUnpauseContract() {
  const queryClient = useQueryClient();
  const { data: walletClient } = useWalletClient();
  const publicClient = usePublicClient() as PublicClient;
  const { toast } = useToast();

  return useMutation({
    mutationFn: async () => {
      if (!walletClient?.account || !publicClient) {
        throw new Error('Wallet or public client not connected');
      }

      // Prepare transaction on the server
      const preparation = await prepareUnpause();

      if (!preparation.success || !preparation.transaction) {
        throw new Error(preparation.error || 'Failed to prepare transaction');
      }

      // Execute transaction on the client
      return executeTransaction(walletClient, publicClient, preparation, walletClient.account);
    },
    onSuccess: (data) => {
      if (data.success) {
        // Invalidate paused state query
        queryClient.invalidateQueries({
          queryKey: DOCU_VAULT_KEYS.contract.paused(),
        });
      }
    },

    onError: (error) => {
      toast.error('Failed to unpause contract', {
        description: error instanceof Error ? error.message : 'Unknown error occurred',
      });
    },
  });
}
