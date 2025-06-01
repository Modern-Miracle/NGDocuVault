import { getWalletActivity } from '../actions';

interface ActivityItem {
  id: string;
  type: string;
  timestamp: string;
  details: string;
  hash?: string;
  status: 'confirmed' | 'pending' | 'failed';
}

interface WalletActivityContentProps {
  address: string;
  page: number;
  limit: number;
}

/**
 * Server Component for Wallet Activity Content
 * Uses server actions directly for data fetching
 */
export async function WalletActivityContent({ address, page, limit }: WalletActivityContentProps) {
  // Fetch activity data directly from server action
  const activityData = await getWalletActivity<{
    items: ActivityItem[];
    total: number;
  }>(address, page, limit);

  if (!activityData || !activityData.items || activityData.items.length === 0) {
    return <div className="p-4 text-center text-gray-500">No activity found for this wallet</div>;
  }

  const { items, total } = activityData;

  return (
    <div>
      <div className="mb-2 text-sm text-gray-500">
        Showing {(page - 1) * limit + 1} - {Math.min(page * limit, total)} of {total} activities
      </div>

      <div className="divide-y border rounded-lg overflow-hidden">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-white">
            <div className="flex justify-between items-center">
              <div className="font-medium">{item.type}</div>
              <div className="text-sm text-gray-500">{formatDate(item.timestamp)}</div>
            </div>
            <p className="mt-1 text-sm text-gray-600">{item.details}</p>

            <div className="mt-2 flex justify-between items-center">
              {item.hash && <div className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{item.hash}</div>}
              <div className={`px-2 py-0.5 text-xs rounded-full ${getStatusColor(item.status)}`}>{item.status}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Helper function to format date
function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
  }).format(date);
}

// Helper function to get status colors
function getStatusColor(status: string): string {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-800';
    case 'pending':
      return 'bg-yellow-100 text-yellow-800';
    case 'failed':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
