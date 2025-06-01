import { useMemo, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { usePublicClient, useWatchContractEvent } from 'wagmi';
import { DocuVaultABI } from '@docu/abi';
import { CONTRACTS } from '@/config/contract';
import { useMultipleDocumentInfo, useConsentStatus } from '@/hooks/use-docu-vault';
import { DocumentType, Consent } from '@/lib/actions/docu-vault/types';
import type { Log } from 'viem';

export interface SharedDocumentInfo {
  documentId: string;
  isVerified: boolean;
  isExpired?: boolean;
  issuer: `0x${string}`;
  holder: `0x${string}`;
  issuanceTimestamp: bigint;
  expirationTimestamp: bigint;
  documentType: DocumentType;
  // Sharing specific fields
  sharedWith: `0x${string}`;
  consentStatus: Consent;
  consentValidUntil: bigint;
  shareTimestamp?: bigint;
}

interface DocumentLogEvent extends Log {
  args: {
    documentId?: string;
    holder?: string;
    requester?: string;
    timestamp?: bigint;
  };
}

export interface UseSharedDocumentsDataReturn {
  sharedWithMe: SharedDocumentInfo[];
  sharedByMe: SharedDocumentInfo[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

export const useSharedDocumentsData = (): UseSharedDocumentsDataReturn => {
  const { address } = useAuth();
  const publicClient = usePublicClient();
  
  const [sharedWithMeIds, setSharedWithMeIds] = useState<Set<string>>(new Set());
  const [sharedByMeIds, setSharedByMeIds] = useState<Set<string>>(new Set());
  const [isLoadingEvents, setIsLoadingEvents] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Watch for documents shared with current user
  useWatchContractEvent({
    address: CONTRACTS.DocuVault as `0x${string}`,
    abi: DocuVaultABI,
    eventName: 'DocumentShared',
    onLogs(logs) {
      logs.forEach((log) => {
        const typedLog = log as DocumentLogEvent;
        if (typedLog.args?.documentId && typedLog.args?.holder) {
          const documentId = String(typedLog.args.documentId);
          const sharedWith = String(typedLog.args.holder) as `0x${string}`;
          
          if (address && sharedWith.toLowerCase() === address.toLowerCase()) {
            setSharedWithMeIds(prev => new Set(prev).add(documentId));
          }
        }
      });
    },
  });

  // Watch for consent granted events
  useWatchContractEvent({
    address: CONTRACTS.DocuVault as `0x${string}`,
    abi: DocuVaultABI,
    eventName: 'ConsentGranted',
    onLogs(logs) {
      logs.forEach((log) => {
        const typedLog = log as DocumentLogEvent;
        if (typedLog.args?.documentId && typedLog.args?.requester) {
          const documentId = String(typedLog.args.documentId);
          const requester = String(typedLog.args.requester) as `0x${string}`;
          
          // If user is the requester, they have access to this document
          if (address && requester.toLowerCase() === address.toLowerCase()) {
            setSharedWithMeIds(prev => new Set(prev).add(documentId));
          }
        }
      });
    },
  });

  // Fetch past events on mount
  useEffect(() => {
    const fetchPastEvents = async () => {
      if (!address || !publicClient) return;

      try {
        setIsLoadingEvents(true);
        setError(null);

        // Get past DocumentShared events where user is the recipient
        const sharedEvents = await publicClient.getContractEvents({
          address: CONTRACTS.DocuVault as `0x${string}`,
          abi: DocuVaultABI,
          eventName: 'DocumentShared',
          fromBlock: 0n,
        });

        // Get past ConsentGranted events where user is the requester
        const consentEvents = await publicClient.getContractEvents({
          address: CONTRACTS.DocuVault as `0x${string}`,
          abi: DocuVaultABI,
          eventName: 'ConsentGranted',
          fromBlock: 0n,
        });

        // Process shared events
        const sharedWithMeSet = new Set<string>();
        const sharedByMeSet = new Set<string>();

        sharedEvents.forEach((event: any) => {
          if (event.args?.documentId && event.args?.holder) {
            const documentId = String(event.args.documentId);
            const sharedWith = String(event.args.holder) as `0x${string}`;
            
            if (sharedWith.toLowerCase() === address.toLowerCase()) {
              sharedWithMeSet.add(documentId);
            }
          }
        });

        consentEvents.forEach((event: any) => {
          if (event.args?.documentId && event.args?.requester) {
            const documentId = String(event.args.documentId);
            const requester = String(event.args.requester) as `0x${string}`;
            
            if (requester.toLowerCase() === address.toLowerCase()) {
              sharedWithMeSet.add(documentId);
            }
          }
        });

        // Get documents shared by the user (they are the holder)
        // We need to check ShareRequested events where user is the holder
        const shareRequestedEvents = await publicClient.getContractEvents({
          address: CONTRACTS.DocuVault as `0x${string}`,
          abi: DocuVaultABI,
          eventName: 'ShareRequested',
          fromBlock: 0n,
        });

        // For each share request, check if there's a corresponding consent granted
        for (const event of shareRequestedEvents as any[]) {
          if (event.args?.documentId) {
            const documentId = String(event.args.documentId);
            // We'll need to get document info to check if current user is the holder
            sharedByMeSet.add(documentId);
          }
        }

        setSharedWithMeIds(sharedWithMeSet);
        setSharedByMeIds(sharedByMeSet);
      } catch (err) {
        console.error('Error fetching past shared document events:', err);
        setError(err instanceof Error ? err : new Error('Failed to load shared documents'));
      } finally {
        setIsLoadingEvents(false);
      }
    };

    fetchPastEvents();
  }, [address, publicClient]);

  // Get document info for all shared documents
  const allDocumentIds = useMemo(() => {
    return Array.from(new Set([...sharedWithMeIds, ...sharedByMeIds]));
  }, [sharedWithMeIds, sharedByMeIds]);

  const {
    data: documentsInfo = [],
    isLoading: loadingInfo,
    error: infoError,
    refetch: refetchInfo,
  } = useMultipleDocumentInfo(allDocumentIds.length > 0 ? allDocumentIds : undefined);

  // Process documents to determine sharing status
  const { sharedWithMe, sharedByMe } = useMemo(() => {
    if (!address || !documentsInfo.length) {
      return { sharedWithMe: [], sharedByMe: [] };
    }

    const withMe: SharedDocumentInfo[] = [];
    const byMe: SharedDocumentInfo[] = [];

    documentsInfo.forEach((doc, index) => {
      if (!doc) return;

      const documentId = allDocumentIds[index];
      const baseDoc = {
        documentId,
        isVerified: doc.isVerified,
        isExpired: doc.isExpired,
        issuer: doc.issuer,
        holder: doc.holder,
        issuanceTimestamp: doc.issuanceDate,
        expirationTimestamp: doc.expirationDate,
        documentType: doc.documentType,
      };

      // Check if document is shared with current user
      if (sharedWithMeIds.has(documentId) && doc.holder.toLowerCase() !== address.toLowerCase()) {
        withMe.push({
          ...baseDoc,
          sharedWith: address as `0x${string}`,
          consentStatus: Consent.GRANTED, // If in sharedWithMeIds, consent was granted
          consentValidUntil: doc.expirationDate, // Default to document expiration
        } as SharedDocumentInfo);
      }

      // Check if document is shared by current user
      if (doc.holder.toLowerCase() === address.toLowerCase() && sharedByMeIds.has(documentId)) {
        byMe.push({
          ...baseDoc,
          sharedWith: address as `0x${string}`, // This will need to be updated with actual requester
          consentStatus: Consent.GRANTED,
          consentValidUntil: doc.expirationDate,
        } as SharedDocumentInfo);
      }
    });

    return { sharedWithMe: withMe, sharedByMe: byMe };
  }, [address, documentsInfo, allDocumentIds, sharedWithMeIds, sharedByMeIds]);

  return {
    sharedWithMe,
    sharedByMe,
    isLoading: isLoadingEvents || loadingInfo,
    error: error || infoError,
    refetch: refetchInfo,
  };
};