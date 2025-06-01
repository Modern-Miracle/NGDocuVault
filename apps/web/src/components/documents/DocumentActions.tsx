import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { ConsentManagement } from './ConsentManagement';
import { DocumentHistory } from './DocumentHistory';

interface DocumentActionsProps {
  documentId: string;
  issuanceTimestamp: number;
  isVerified: boolean;
  verificationTimestamp?: number;
  onSuccess?: () => void;
}

export function DocumentActions({
  documentId,
  issuanceTimestamp,
  isVerified,
  verificationTimestamp,
  onSuccess,
}: DocumentActionsProps) {
  return (
    <Tabs defaultValue="access" className="w-full">
      <TabsList className="grid w-full max-w-md grid-cols-2">
        <TabsTrigger value="access">Access Management</TabsTrigger>
        <TabsTrigger value="history">Document History</TabsTrigger>
      </TabsList>
      <TabsContent value="access" className="pt-4">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Manage Document Access</h3>
          </CardHeader>
          <CardContent>
            <ConsentManagement documentId={documentId} onSuccess={onSuccess} />
          </CardContent>
        </Card>
      </TabsContent>
      <TabsContent value="history" className="pt-4">
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold">Document History</h3>
          </CardHeader>
          <CardContent>
            <DocumentHistory
              issuanceTimestamp={issuanceTimestamp}
              isVerified={isVerified}
              verificationTimestamp={verificationTimestamp}
            />
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
