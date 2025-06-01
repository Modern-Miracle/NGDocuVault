import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { CalendarIcon, Loader2 } from 'lucide-react';
import { format, addDays, addMonths } from 'date-fns';
import { cn } from '@/lib/utils';
import { useSharedDocuments } from './SharedDocumentsProvider';

interface ShareRequestDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentId: string;
  requesterAddress: string;
}

export const ShareRequestDialog: React.FC<ShareRequestDialogProps> = ({
  open,
  onOpenChange,
  documentId,
  requesterAddress,
}) => {
  const { grantConsent, processingDocumentId } = useSharedDocuments();
  const [validUntil, setValidUntil] = useState<Date>(addMonths(new Date(), 1));
  const [isGranting, setIsGranting] = useState(false);

  const handleGrant = async () => {
    setIsGranting(true);
    try {
      await grantConsent(documentId, requesterAddress, Math.floor(validUntil.getTime() / 1000));
      onOpenChange(false);
    } finally {
      setIsGranting(false);
    }
  };

  const quickDateOptions = [
    { label: '1 Week', days: 7 },
    { label: '1 Month', days: 30 },
    { label: '3 Months', days: 90 },
    { label: '6 Months', days: 180 },
    { label: '1 Year', days: 365 },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Grant Document Access</DialogTitle>
          <DialogDescription>
            Grant access to this document for the requesting party. Set how long the access should be valid.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Document ID</Label>
            <Input 
              value={`${documentId.slice(0, 8)}...${documentId.slice(-6)}`} 
              disabled 
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Requester Address</Label>
            <Input 
              value={`${requesterAddress.slice(0, 6)}...${requesterAddress.slice(-4)}`} 
              disabled 
              className="font-mono text-sm"
            />
          </div>

          <div className="space-y-2">
            <Label>Access Valid Until</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !validUntil && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {validUntil ? format(validUntil, 'PPP') : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={validUntil}
                  onSelect={(date) => date && setValidUntil(date)}
                  disabled={(date) => date < new Date()}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="flex gap-2 flex-wrap">
            {quickDateOptions.map((option) => (
              <Button
                key={option.label}
                variant="outline"
                size="sm"
                onClick={() => setValidUntil(addDays(new Date(), option.days))}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button 
            onClick={handleGrant} 
            disabled={isGranting || processingDocumentId === documentId}
          >
            {isGranting || processingDocumentId === documentId ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Granting...
              </>
            ) : (
              'Grant Access'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};