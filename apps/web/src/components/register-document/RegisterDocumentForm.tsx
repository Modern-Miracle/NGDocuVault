import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, FileText, Loader2, User, Calendar as CalendarIcon2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { useRegisterDocument } from './RegisterDocumentProvider';
import { DocumentType } from '@/lib/actions/docu-vault/types';
import { FileDropzone } from './FileDropzone';

export const RegisterDocumentForm: React.FC = () => {
  const { formData, updateFormData, handleFileSelect, removeFile, submitForm, isSubmitting, uploadProgress } =
    useRegisterDocument();

  const documentTypes = [
    { value: DocumentType.IDENTITY, label: 'Identity Document' },
    { value: DocumentType.MEDICAL, label: 'Medical Record' },
    { value: DocumentType.FINANCIAL, label: 'Financial Document' },
    { value: DocumentType.EDUCATION, label: 'Educational Certificate' },
    { value: DocumentType.LEGAL, label: 'Legal Document' },
    { value: DocumentType.PROPERTY, label: 'Property Document' },
    { value: DocumentType.OTHER, label: 'Other' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await submitForm();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Document Details Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Document Information
          </CardTitle>
          <CardDescription>Provide details about the document you're registering</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Document Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Document Title</Label>
            <Input
              id="title"
              placeholder="Enter document title"
              value={formData.metadata.title}
              onChange={(e) =>
                updateFormData({
                  metadata: { ...formData.metadata, title: e.target.value },
                })
              }
              disabled={isSubmitting}
            />
          </div>

          {/* Document Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              placeholder="Enter document description"
              value={formData.metadata.description}
              onChange={(e) =>
                updateFormData({
                  metadata: { ...formData.metadata, description: e.target.value },
                })
              }
              disabled={isSubmitting}
              rows={3}
            />
          </div>

          {/* Document Type */}
          <div className="space-y-2 w-full">
            <Label htmlFor="documentType">Document Type</Label>
            <Select
              value={String(formData.documentType)}
              onValueChange={(value) => updateFormData({ documentType: Number(value) as DocumentType })}
              disabled={isSubmitting}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select document type" />
              </SelectTrigger>
              <SelectContent className="w-full">
                {documentTypes.map((type) => (
                  <SelectItem key={type.value} value={String(type.value)}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Holder Information Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Holder Information
          </CardTitle>
          <CardDescription>Specify who will own this document</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="holder">Holder Address</Label>
            <Input
              id="holder"
              placeholder="0x..."
              value={formData.holder}
              onChange={(e) => updateFormData({ holder: e.target.value })}
              disabled={isSubmitting}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">The Ethereum address of the document holder</p>
          </div>
        </CardContent>
      </Card>

      {/* Dates Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon2 className="h-5 w-5" />
            Document Validity
          </CardTitle>
          <CardDescription>Set the issuance and expiration dates for this document</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Date Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Issuance Date */}
            <div className="space-y-2">
              <Label>Issuance Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.issuanceDate && 'text-muted-foreground'
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.issuanceDate ? (
                      format(new Date(formData.issuanceDate), 'PPP')
                    ) : (
                      <span>Pick issuance date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.issuanceDate ? new Date(formData.issuanceDate) : undefined}
                    onSelect={(date) =>
                      updateFormData({
                        issuanceDate: date ? format(date, 'yyyy-MM-dd') : '',
                      })
                    }
                    disabled={(date) => date > new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <Label>Expiration Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      'w-full justify-start text-left font-normal',
                      !formData.expirationDate && 'text-muted-foreground'
                    )}
                    disabled={isSubmitting}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.expirationDate ? (
                      format(new Date(formData.expirationDate), 'PPP')
                    ) : (
                      <span>Pick expiration date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.expirationDate ? new Date(formData.expirationDate) : undefined}
                    onSelect={(date) =>
                      updateFormData({
                        expirationDate: date ? format(date, 'yyyy-MM-dd') : '',
                      })
                    }
                    disabled={(date) => date <= new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload with Drag & Drop */}
      <FileDropzone
        onFileSelect={handleFileSelect}
        onFileRemove={removeFile}
        selectedFile={formData.file}
        isUploading={isSubmitting}
        uploadProgress={uploadProgress}
      />

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => window.history.back()} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Registering...
            </>
          ) : (
            'Register Document'
          )}
        </Button>
      </div>
    </form>
  );
};
