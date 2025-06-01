import React from 'react';
import { Upload, FileCheck, X, AlertTriangle } from 'lucide-react';

interface FileUploadSectionProps {
  file: File | null;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  removeFile: () => void;
  uploadError: string | null;
}

export function FileUploadSection({ file, handleFileChange, removeFile, uploadError }: FileUploadSectionProps) {
  return (
    <div className="border-t border-border pt-6">
      <label className="block text-sm font-medium text-muted-foreground mb-2">Document File</label>

      {!file ? (
        <div className="border-2 border-dashed border-input rounded-lg p-6 flex flex-col items-center">
          <Upload className="h-10 w-10 text-muted-foreground mb-2" />
          <p className="text-sm text-muted-foreground mb-2">Drag and drop your file here, or click to browse</p>
          <input type="file" id="file" name="file" onChange={handleFileChange} className="hidden" />
          <label
            htmlFor="file"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md cursor-pointer hover:bg-primary/90"
          >
            Select File
          </label>
        </div>
      ) : (
        <div className="border rounded-lg p-4 bg-muted">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileCheck className="h-6 w-6 text-chart-3 mr-2" />
              <span className="font-medium">{file.name}</span>
            </div>
            <button
              type="button"
              onClick={removeFile}
              className="text-muted-foreground hover:text-destructive p-1 rounded-full"
              title="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-2 text-xs text-muted-foreground">{(file.size / (1024 * 1024)).toFixed(2)} MB</div>
        </div>
      )}

      {uploadError && (
        <div className="mt-2 flex items-center text-destructive text-sm">
          <AlertTriangle className="h-4 w-4 mr-1" />
          {uploadError}
        </div>
      )}
    </div>
  );
}
