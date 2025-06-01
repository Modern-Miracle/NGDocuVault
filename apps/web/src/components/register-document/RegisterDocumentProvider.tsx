import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useRegisterDocumentData, type RegisterDocumentFormData } from '@/hooks/use-register-document-data';
import { DocumentType } from '@/lib/actions/docu-vault/types';
import { isAddress } from 'viem';

interface RegisterDocumentContextValue {
  // Permissions
  isIssuer: boolean;
  isLoadingPermissions: boolean;
  canRegister: boolean;

  // Form state
  formData: RegisterDocumentFormData;
  updateFormData: (updates: Partial<RegisterDocumentFormData>) => void;

  // File handling
  handleFileSelect: (file: File) => void;
  removeFile: () => void;

  // Validation
  validateForm: () => { isValid: boolean; errors: string[] };

  // Actions
  submitForm: () => Promise<void>;
  isSubmitting: boolean;

  // Progress
  uploadProgress: number;
}

const RegisterDocumentContext = createContext<RegisterDocumentContextValue | undefined>(undefined);

export const useRegisterDocument = () => {
  const context = useContext(RegisterDocumentContext);
  if (!context) {
    throw new Error('useRegisterDocument must be used within RegisterDocumentProvider');
  }
  return context;
};

interface RegisterDocumentProviderProps {
  children: ReactNode;
}

export const RegisterDocumentProvider: React.FC<RegisterDocumentProviderProps> = ({ children }) => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { isIssuer, isLoadingPermissions, isRegistering, canRegister, registerDocument } = useRegisterDocumentData();

  const [uploadProgress, setUploadProgress] = useState(0);
  const [formData, setFormData] = useState<RegisterDocumentFormData>({
    holder: '',
    documentType: DocumentType.OTHER,
    expirationDate: '',
    issuanceDate: new Date().toISOString().split('T')[0],
    file: null,
    metadata: {
      title: '',
      description: '',
    },
  });

  const updateFormData = useCallback((updates: Partial<RegisterDocumentFormData>) => {
    setFormData((prev) => ({
      ...prev,
      ...updates,
      metadata: updates.metadata ? { ...prev.metadata, ...updates.metadata } : prev.metadata,
    }));
  }, []);

  const handleFileSelect = useCallback((file: File) => {
    setFormData((prev) => ({
      ...prev,
      file,
      metadata: {
        ...prev.metadata,
        title: prev.metadata.title || file.name.replace(/\.[^/.]+$/, ''),
      },
    }));
  }, []);

  const removeFile = useCallback(() => {
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));
  }, []);

  const validateForm = useCallback((): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    if (!formData.file) {
      errors.push('Please select a file to upload');
    }

    if (!formData.holder) {
      errors.push('Holder address is required');
    } else if (!isAddress(formData.holder)) {
      errors.push('Invalid holder address format');
    }

    if (!formData.expirationDate) {
      errors.push('Expiration date is required');
    } else {
      const expiration = new Date(formData.expirationDate);
      const issuance = formData.issuanceDate ? new Date(formData.issuanceDate) : new Date();

      if (expiration <= issuance) {
        errors.push('Expiration date must be after issuance date');
      }

      if (expiration <= new Date()) {
        errors.push('Expiration date must be in the future');
      }
    }

    if (!formData.metadata.title) {
      errors.push('Document title is required');
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }, [formData]);

  const submitForm = useCallback(async () => {
    const validation = validateForm();
    if (!validation.isValid) {
      validation.errors.forEach((error) => {
        toast.error('Validation Error', {
          description: error,
        });
      });
      return;
    }

    try {
      setUploadProgress(10);

      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => Math.min(prev + 10, 90));
      }, 500);

      await registerDocument(formData);

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Success', {
        description: 'Document registered successfully',
      });

      // Navigate to documents page after a short delay
      setTimeout(() => {
        navigate('/documents');
      }, 1000);
    } catch (error) {
      setUploadProgress(0);
      console.error('Registration error:', error);

      const errorMessage = error instanceof Error ? error.message : 'Failed to register document';
      toast.error('Registration Failed', {
        description: errorMessage,
      });
    }
  }, [formData, validateForm, registerDocument, toast, navigate]);

  const value: RegisterDocumentContextValue = {
    isIssuer,
    isLoadingPermissions,
    canRegister,
    formData,
    updateFormData,
    handleFileSelect,
    removeFile,
    validateForm,
    submitForm,
    isSubmitting: isRegistering,
    uploadProgress,
  };

  return <RegisterDocumentContext.Provider value={value}>{children}</RegisterDocumentContext.Provider>;
};
