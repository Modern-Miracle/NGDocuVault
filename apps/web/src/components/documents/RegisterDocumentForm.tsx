import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { DocumentType } from '@/lib/actions/docu-vault/types';
import { useCreateRecordWithIPFS } from '@/hooks/use-ipfs-mutations';
import { isAddress } from 'viem';
import { DocumentFormFields } from './DocumentFormFields';
import { FileUploadSection } from './FileUploadSection';
import { UploadProgress } from './UploadProgress';
import { FormActions } from './FormActions';

export function RegisterDocumentForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { mutateAsync: createRecordWithIPFS, isPending } = useCreateRecordWithIPFS();

  const [formData, setFormData] = useState({
    holder: '',
    documentType: DocumentType.OTHER,
    expirationDate: '',
    file: null as File | null,
  });

  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'documentType' ? Number(value) : value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData((prev) => ({
        ...prev,
        file: e.target.files![0],
      }));
      setUploadError(null);
    }
  };

  const removeFile = () => {
    setFormData((prev) => ({
      ...prev,
      file: null,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file) {
      setUploadError('You must select a file to upload');
      return;
    }

    if (!formData.holder || !isAddress(formData.holder)) {
      setUploadError('Invalid holder address');
      return;
    }

    const expirationTime = new Date(formData.expirationDate).getTime() / 1000;
    if (isNaN(expirationTime) || expirationTime <= Date.now() / 1000) {
      setUploadError('Invalid expiration date');
      return;
    }

    try {
      setUploadProgress(10);

      // Convert file to Base64 for the document data
      const fileReader = new FileReader();
      const fileBase64Promise = new Promise<string>((resolve, reject) => {
        fileReader.onload = () => resolve(fileReader.result as string);
        fileReader.onerror = reject;
        fileReader.readAsDataURL(formData.file!);
      });

      const fileBase64 = await fileBase64Promise;
      setUploadProgress(40);

      // Create document data object
      const documentData = {
        name: formData.file.name,
        description: `Document of type ${DocumentType[formData.documentType]}`,
        document: {
          documentType: DocumentType[formData.documentType].toLowerCase(),
          content: fileBase64,
          fileName: formData.file.name,
          contentType: formData.file.type,
          fileSize: formData.file.size,
        },
      };

      setUploadProgress(50);

      // Upload and register document in one step
      const result = await createRecordWithIPFS({
        data: documentData,
        holder: formData.holder as `0x${string}`,
      });

      if (!result || !result.success) {
        throw new Error('Failed to register document');
      }

      setUploadProgress(100);
      toast.success('Document registered successfully!');
      navigate('/documents');
    } catch (error) {
      console.error('Registration error:', error);
      setUploadError(error instanceof Error ? error.message : 'Failed to register document');
      toast.error('Failed to register document');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-6">
      <DocumentFormFields formData={formData} handleInputChange={handleInputChange} />

      <FileUploadSection
        file={formData.file}
        handleFileChange={handleFileChange}
        removeFile={removeFile}
        uploadError={uploadError}
      />

      {isPending && <UploadProgress progress={uploadProgress} />}

      <FormActions isSubmitting={isPending} onCancel={() => navigate('/documents')} />
    </form>
  );
}
