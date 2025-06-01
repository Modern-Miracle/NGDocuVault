import { useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useIsIssuer } from '@/hooks/use-did-auth';
import { useCreateRecordWithIPFS } from '@/hooks/use-ipfs-mutations';
import { DocumentType } from '@/lib/actions/docu-vault/types';

export interface RegisterDocumentFormData {
  holder: string;
  documentType: DocumentType;
  expirationDate: string;
  issuanceDate: string;
  file: File | null;
  metadata: {
    title: string;
    description: string;
  };
}

export interface UseRegisterDocumentDataReturn {
  isIssuer: boolean;
  isLoadingPermissions: boolean;
  isRegistering: boolean;
  canRegister: boolean;
  registerDocument: (formData: RegisterDocumentFormData) => Promise<void>;
}

export const useRegisterDocumentData = (): UseRegisterDocumentDataReturn => {
  const { address } = useAuth();
  const { data: isIssuer, isLoading: isLoadingPermissions } = useIsIssuer(address as `0x${string}`);
  const { mutateAsync: createRecordWithIPFS, isPending: isRegistering } = useCreateRecordWithIPFS();

  const canRegister = useMemo(() => {
    return !isLoadingPermissions && isIssuer === true;
  }, [isLoadingPermissions, isIssuer]);

  const registerDocument = async (formData: RegisterDocumentFormData) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    if (!formData.file) {
      throw new Error('No file selected');
    }

    if (!formData.holder || !/^0x[a-fA-F0-9]{40}$/i.test(formData.holder)) {
      throw new Error('Invalid holder address');
    }

    // Parse dates to timestamps
    const issuanceTimestamp = formData.issuanceDate
      ? Math.floor(new Date(formData.issuanceDate).getTime() / 1000)
      : Math.floor(Date.now() / 1000);

    const expirationTimestamp = Math.floor(new Date(formData.expirationDate).getTime() / 1000);

    if (expirationTimestamp <= issuanceTimestamp) {
      throw new Error('Expiration date must be after issuance date');
    }

    // Convert file to base64
    const fileBase64 = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(formData.file!);
    });

    // Prepare document data for IPFS - matching the expected format
    const documentData = {
      name: formData.metadata.title || formData.file.name,
      description: formData.metadata.description || `Document of type ${DocumentType[formData.documentType]}`,
      document: {
        documentType: DocumentType[formData.documentType].toLowerCase(),
        content: fileBase64,
        fileName: formData.file.name,
        contentType: formData.file.type,
        fileSize: formData.file.size,
      },
      metadata: {
        documentType: DocumentType[formData.documentType],
        expirationDate: expirationTimestamp,
        issuanceDate: issuanceTimestamp,
      }
    };

    // Use the existing useCreateRecordWithIPFS hook
    const result = await createRecordWithIPFS({
      data: documentData,
      holder: formData.holder as `0x${string}`,
    });

    if (!result || !result.success) {
      throw new Error('Failed to register document');
    }

    return;
  };

  return {
    isIssuer: isIssuer === true,
    isLoadingPermissions,
    isRegistering,
    canRegister,
    registerDocument,
  };
};
