import { createContext, useContext, useState, ReactNode } from 'react';
import { Role } from '../types';

interface SigninFlowContextType {
  role: Role;
  setRole: (role: Role) => void;
  isProcessing: boolean;
  privateKey: string;
  publicKey: string;
  didDocument: string;
  didIdentifier: string;
  didCreated: boolean;
  showDidCreationForm: boolean;
  producerError: string;
  producerTransactionHash: string | null;
  producerIsSuccess: boolean;
  setPrivateKey: (key: string) => void;
  setPublicKey: (key: string) => void;
  setDidDocument: (doc: string) => void;
  setDidIdentifier: (id: string) => void;
  setDidCreated: (created: boolean) => void;
  setShowDidCreationForm: (show: boolean) => void;
  setProducerError: (error: string) => void;
  setProducerTransactionHash: (hash: string | null) => void;
  setProducerIsSuccess: (success: boolean) => void;
  setIsProcessing: (processing: boolean) => void;
  resetSigninFlow: () => void;
}

const SigninFlowContext = createContext<SigninFlowContextType | undefined>(undefined);

export function SigninFlowProvider({ children }: { children: ReactNode }) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [privateKey, setPrivateKey] = useState('');
  const [publicKey, setPublicKey] = useState('');
  const [didDocument, setDidDocument] = useState(JSON.stringify({
    "@context": ["https://www.w3.org/ns/did/v1"],
    "authentication": [],
    "verificationMethod": []
  }, null, 2));
  const [didIdentifier, setDidIdentifier] = useState('');
  const [didCreated, setDidCreated] = useState(false);
  const [showDidCreationForm, setShowDidCreationForm] = useState(false);
  const [producerError, setProducerError] = useState('');
  const [producerTransactionHash, setProducerTransactionHash] = useState<string | null>(null);
  const [producerIsSuccess, setProducerIsSuccess] = useState(false);
  const [role, setRole] = useState<Role>('HOLDER_ROLE' as Role);

  const resetSigninFlow = () => {
    setPrivateKey('');
    setPublicKey('');
    setDidDocument(JSON.stringify({
      "@context": ["https://www.w3.org/ns/did/v1"],
      "authentication": [],
      "verificationMethod": []
    }, null, 2));
    setDidIdentifier('');
    setDidCreated(false);
    setShowDidCreationForm(false);
    setProducerError('');
    setProducerTransactionHash(null);
    setProducerIsSuccess(false);
    setIsProcessing(false);
  };

  return (
    <SigninFlowContext.Provider
      value={{
        isProcessing,
        privateKey,
        publicKey,
        didDocument,
        didIdentifier,
        didCreated,
        showDidCreationForm,
        producerError,
        producerTransactionHash,
        producerIsSuccess,
        setPrivateKey,
        setPublicKey,
        setDidDocument,
        setDidIdentifier,
        setDidCreated,
        setShowDidCreationForm,
        setProducerError,
        setProducerTransactionHash,
        setProducerIsSuccess,
        setIsProcessing,
        resetSigninFlow,
        role,
        setRole,
      }}
    >
      {children}
    </SigninFlowContext.Provider>
  );
}

export function useSigninFlow() {
  const context = useContext(SigninFlowContext);
  if (context === undefined) {
    throw new Error('useSigninFlow must be used within a SigninFlowProvider');
  }
  return context;
}
