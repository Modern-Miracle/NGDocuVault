import { WagmiProvider, createConfig, http } from 'wagmi';
import { hardhat } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NETWORK_CONFIG } from '@/lib/config';
import { useEffect } from 'react';

console.log('[Web3Provider] Initializing with network config:', {
  rpcUrl: NETWORK_CONFIG.rpcUrl,
  walletConnectProjectId: NETWORK_CONFIG.walletConnectProjectId,
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 0, // Don't retry failed queries
      staleTime: 10 * 60 * 1000, // Consider data fresh for 10 minutes
      gcTime: 15 * 60 * 1000, // Keep data in cache for 15 minutes
      refetchOnWindowFocus: false, // Don't refetch when window gains focus
      refetchInterval: false, // Don't continuously refetch
      networkMode: 'always', // Don't suspend on network errors
    },
  },
});

const config = createConfig(
  getDefaultConfig({
    chains: [hardhat],
    transports: {
      [hardhat.id]: http(NETWORK_CONFIG.rpcUrl),
    },
    walletConnectProjectId: NETWORK_CONFIG.walletConnectProjectId,
    appName: 'Docu Vault Secure Sharing',
    appDescription: 'Docu Vault Secure Sharing: A secure way to share documents with your family and friends.',
  })
);

console.log('[Web3Provider] Wagmi config created with chain:', {
  chainId: hardhat.id,
  chainName: hardhat.name,
});

const Web3Monitor = () => {
  useEffect(() => {
    console.log('[Web3Monitor] Web3Provider mounted');
    return () => {
      console.log('[Web3Monitor] Web3Provider unmounted');
    };
  }, []);

  return null;
};

export const Web3Provider = ({ children }: { children: React.ReactNode }) => {
  console.log('[Web3Provider] Rendering provider');

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <ConnectKitProvider options={{ hideNoWalletCTA: true }}>
          <Web3Monitor />
          {children}
        </ConnectKitProvider>
        <ReactQueryDevtools initialIsOpen={false} />
      </QueryClientProvider>
    </WagmiProvider>
  );
};
