// import { useState } from 'react';
// import { useToast } from './use-toast';
// import { DocumentInfo } from '@/components/docu-vault/shared/components/DocumentCard';
// import { useRouter } from 'next/navigation';
// import { useRequestVerification, useUpdateDocument } from '@/hooks/use-docu-vault';

// interface DocumentActionsState {
//   showVerificationDialog: boolean;
//   showUpdateDialog: boolean;
//   selectedDocument: DocumentInfo | null;
//   selectedDocumentId: string;
//   isLoading: boolean;
// }

// interface DocumentActionsReturn extends DocumentActionsState {
//   onRequestVerification: (documentId: string, document: DocumentInfo) => void;
//   onUpdateDocument: (documentId: string, document: DocumentInfo) => void;
//   onViewDocument: (documentId: string) => void;
//   closeVerificationDialog: () => void;
//   closeUpdateDialog: () => void;
//   submitVerificationRequest: (issuerAddress: string) => Promise<boolean>;
//   resetState: () => void;
// }

// export function useDocumentActions(): DocumentActionsReturn {
//   const { toast } = useToast();
//   const router = useRouter();
//   const [state, setState] = useState<DocumentActionsState>({
//     showVerificationDialog: false,
//     showUpdateDialog: false,
//     selectedDocument: null,
//     selectedDocumentId: '',
//     isLoading: false,
//   });

//   // Use the requestVerification hook from use-docu-vault
//   const { mutateAsync: requestVerificationMutation } = useRequestVerification();

//   // Use the updateDocument hook from use-docu-vault
//   const { mutateAsync: updateDocumentMutation } = useUpdateDocument();

//   const onRequestVerification = (documentId: string, document: DocumentInfo) => {
//     setState({
//       ...state,
//       showVerificationDialog: true,
//       selectedDocument: document,
//       selectedDocumentId: documentId,
//     });
//   };

//   const onUpdateDocument = (documentId: string, document: DocumentInfo) => {
//     setState({
//       ...state,
//       showUpdateDialog: true,
//       selectedDocument: document,
//       selectedDocumentId: documentId,
//     });
//   };

//   const onViewDocument = (documentId: string) => {
//     router.push(`/docu-vault/document/${documentId}`);
//   };

//   const closeVerificationDialog = () => {
//     setState({
//       ...state,
//       showVerificationDialog: false,
//     });
//   };

//   const closeUpdateDialog = () => {
//     setState({
//       ...state,
//       showUpdateDialog: false,
//     });
//   };

//   const submitVerificationRequest = async (issuerAddress: string): Promise<boolean> => {
//     if (!state.selectedDocumentId) {
//       toast.error('No document selected for verification');
//       return false;
//     }

//     setState({ ...state, isLoading: true });

//     try {
//       // Use the mutation function from the hook to request verification
//       await requestVerificationMutation({
//         documentId: state.selectedDocumentId,
//       });

//       toast.success('Verification request submitted successfully');
//       closeVerificationDialog();
//       return true;
//     } catch (error) {
//       toast.error(error instanceof Error ? error.message : 'Failed to submit verification request');
//       return false;
//     } finally {
//       setState({ ...state, isLoading: false });
//     }
//   };

//   const resetState = () => {
//     setState({
//       showVerificationDialog: false,
//       showUpdateDialog: false,
//       selectedDocument: null,
//       selectedDocumentId: '',
//       isLoading: false,
//     });
//   };

//   return {
//     ...state,
//     onRequestVerification,
//     onUpdateDocument,
//     onViewDocument,
//     closeVerificationDialog,
//     closeUpdateDialog,
//     submitVerificationRequest,
//     resetState,
//   };
// }
