import { cn } from '@/lib/utils';

interface UploadProgressProps {
  progress: number;
}

export function UploadProgress({ progress }: UploadProgressProps) {
  return (
    <div className="mt-4">
      <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full bg-primary transition-all duration-300 ease-in-out', `w-[${progress}%]`)}></div>
      </div>
      <p className="text-sm text-muted-foreground mt-1">
        {progress < 100 ? `Uploading document... ${progress}%` : 'Document uploaded successfully!'}
      </p>
    </div>
  );
}
