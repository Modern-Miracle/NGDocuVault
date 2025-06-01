import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { 
  Upload, 
  FileText, 
  Image, 
  FileSpreadsheet, 
  File,
  X,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  onFileRemove: () => void;
  selectedFile: File | null;
  isUploading: boolean;
  uploadProgress: number;
  acceptedFileTypes?: Record<string, string[]>;
  maxFileSize?: number; // in bytes
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({
  onFileSelect,
  onFileRemove,
  selectedFile,
  isUploading,
  uploadProgress,
  acceptedFileTypes = {
    'application/pdf': ['.pdf'],
    'application/msword': ['.doc'],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
    'image/jpeg': ['.jpg', '.jpeg'],
    'image/png': ['.png'],
    'text/plain': ['.txt'],
  },
  maxFileSize = 10 * 1024 * 1024, // 10MB default
}) => {
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[], rejectedFiles: Array<{ file: File; errors: Array<{ code: string; message: string }> }>) => {
    setError(null);
    
    if (rejectedFiles.length > 0) {
      const rejection = rejectedFiles[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setError(`File size must be less than ${(maxFileSize / 1024 / 1024).toFixed(0)}MB`);
      } else if (rejection.errors[0]?.code === 'file-invalid-type') {
        setError('Invalid file type. Please upload a supported document format.');
      } else {
        setError('Failed to upload file. Please try again.');
      }
      return;
    }

    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect, maxFileSize]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: acceptedFileTypes,
    maxSize: maxFileSize,
    multiple: false,
    disabled: isUploading,
  });

  const getFileIcon = (file: File) => {
    const type = file.type.toLowerCase();
    if (type.includes('pdf')) return <FileText className="h-8 w-8 text-red-500" />;
    if (type.includes('image')) return <Image className="h-8 w-8 text-blue-500" />;
    if (type.includes('spreadsheet') || type.includes('excel')) return <FileSpreadsheet className="h-8 w-8 text-green-500" />;
    return <File className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (selectedFile) {
    return (
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {getFileIcon(selectedFile)}
              <div>
                <p className="font-medium text-sm">{selectedFile.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatFileSize(selectedFile.size)} • {selectedFile.type || 'Unknown type'}
                </p>
              </div>
            </div>
            {!isUploading && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onFileRemove}
                className="hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {isUploading && uploadProgress < 100 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Uploading to IPFS...</span>
                <span className="font-medium">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {!isUploading && uploadProgress === 100 && (
            <div className="flex items-center gap-2 text-sm text-green-600">
              <CheckCircle className="h-4 w-4" />
              <span>File ready for registration</span>
            </div>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card 
      className={cn(
        "relative overflow-hidden border-2 border-dashed transition-all duration-200",
        isDragActive && !isDragReject && "border-primary bg-primary/5 scale-[1.02]",
        isDragReject && "border-destructive bg-destructive/5",
        error && "border-destructive",
        !isDragActive && !error && "hover:border-primary/50"
      )}
    >
      <div
        {...getRootProps()}
        className={cn(
          "p-8 cursor-pointer relative",
          isUploading && "cursor-not-allowed opacity-50"
        )}
      >
        <input {...getInputProps()} />
        
        {/* Animated background effect when dragging */}
        {isDragActive && !isDragReject && (
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 animate-pulse" />
        )}
        
        <div className="flex flex-col items-center gap-4 text-center relative z-10">
          <div className={cn(
            "p-4 rounded-full transition-all duration-300",
            isDragActive && !isDragReject && "bg-primary/10 scale-110",
            isDragReject && "bg-destructive/10",
            !isDragActive && !isDragReject && "bg-muted"
          )}>
            {isDragReject ? (
              <AlertCircle className="h-10 w-10 text-destructive" />
            ) : (
              <Upload className={cn(
                "h-10 w-10 transition-all duration-300",
                isDragActive ? "text-primary animate-bounce" : "text-muted-foreground"
              )} />
            )}
          </div>

          <div className="space-y-2">
            <p className="text-sm font-medium">
              {isDragActive && !isDragReject
                ? "Drop your document here" 
                : isDragReject
                ? "File type not accepted"
                : "Drag & drop your document here"
              }
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse files
            </p>
          </div>

          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, DOC, DOCX, JPG, PNG, TXT
            </p>
            <p className="text-xs text-muted-foreground">
              Maximum file size: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive animate-in fade-in-0 slide-in-from-bottom-2">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};