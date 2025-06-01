import React from 'react';
import { DocumentType } from '@/lib/actions/docu-vault/types';

interface FormData {
  holder: string;
  documentType: DocumentType;
  expirationDate: string;
}

interface DocumentFormFieldsProps {
  formData: FormData;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
}

export function DocumentFormFields({ formData, handleInputChange }: DocumentFormFieldsProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
      <div>
        <label htmlFor="holder" className="block text-sm font-medium text-muted-foreground mb-1">
          Holder Address (Ethereum)
        </label>
        <input
          type="text"
          id="holder"
          name="holder"
          value={formData.holder}
          onChange={handleInputChange}
          placeholder="0x..."
          className="bg-muted w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>

      <div>
        <label htmlFor="documentType" className="block text-sm font-medium text-muted-foreground mb-1">
          Document Type
        </label>
        <select
          id="documentType"
          name="documentType"
          value={formData.documentType}
          onChange={handleInputChange}
          className="bg-muted w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        >
          <option value={DocumentType.IDENTITY}>Identity</option>
          <option value={DocumentType.EDUCATION}>Educational</option>
          <option value={DocumentType.FINANCIAL}>Financial</option>
          <option value={DocumentType.MEDICAL}>Medical</option>
          <option value={DocumentType.LEGAL}>Legal</option>
          <option value={DocumentType.PROPERTY}>Property</option>
          <option value={DocumentType.OTHER}>Other</option>
        </select>
      </div>

      <div>
        <label htmlFor="expirationDate" className="block text-sm font-medium text-muted-foreground mb-1">
          Expiration Date
        </label>
        <input
          type="date"
          id="expirationDate"
          name="expirationDate"
          value={formData.expirationDate}
          onChange={handleInputChange}
          className="bg-muted w-full px-3 py-2 border border-input rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          required
        />
      </div>
    </div>
  );
}
