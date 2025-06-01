import { Button } from '@/components/ui/button';

interface FormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
}

export function FormActions({ isSubmitting, onCancel }: FormActionsProps) {
  return (
    <div className="flex justify-end">
      <Button type="button" variant="outline" onClick={onCancel} className="mr-2 px-4 py-2">
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting} className="px-4 py-2">
        {isSubmitting ? 'Registering...' : 'Register Document'}
      </Button>
    </div>
  );
}
