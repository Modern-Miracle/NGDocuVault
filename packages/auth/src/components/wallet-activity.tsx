'use client';

import React, { useState } from 'react';
import { WalletActivityContent } from './wallet-activity-content';

interface WalletActivityProps {
  address: string;
}

/**
 * Client Component for Wallet Activity
 * This is a client component that implements interactive features like pagination
 * but uses server components for actual data fetching
 */
export function WalletActivity({ address }: WalletActivityProps) {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleNextPage = () => {
    setPage(page + 1);
  };

  const handleLimitChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setLimit(Number(e.target.value));
    setPage(1); // Reset to first page when changing limit
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Wallet Activity</h2>

      {/* Use server component for data fetching */}
      <WalletActivityContent address={address} page={page} limit={limit} />

      <div className="flex items-center justify-between mt-4">
        <div>
          <select
            value={limit}
            onChange={handleLimitChange}
            className="px-2 py-1 border rounded-md text-sm"
            aria-label="Items per page"
          >
            <option value={5}>5 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handlePrevPage}
            disabled={page === 1}
            className="px-3 py-1 bg-gray-100 rounded-md text-sm disabled:opacity-50"
          >
            Previous
          </button>
          <span className="px-3 py-1 text-sm">Page {page}</span>
          <button onClick={handleNextPage} className="px-3 py-1 bg-gray-100 rounded-md text-sm">
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
