import { WagmiProvider, createConfig, http } from 'wagmi';
import { hardhat, sepolia } from 'wagmi/chains';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ConnectKitProvider, getDefaultConfig } from 'connectkit';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { NETWORK_CONFIG } from '@/lib/config';
import { env } from '@/config/env';
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

// Configure transports for both chains
const getTransports = () => {
  const transports: Record<number, ReturnType<typeof http>> = {};

  // Always include hardhat for local development
  transports[hardhat.id] = http('http://127.0.0.1:8545');

  // Add Sepolia transport if we're in production or have Sepolia RPC URL
  const sepoliaRpcUrl = env.VITE_RPC_URL;
  if (sepoliaRpcUrl && (env.VITE_CHAIN_ID === '11155111' || sepoliaRpcUrl.includes('sepolia'))) {
    transports[sepolia.id] = http(sepoliaRpcUrl);
  } else {
    // Fallback to a public Sepolia RPC
    transports[sepolia.id] = http('https://rpc.sepolia.org');
  }

  return transports;
};

const config = createConfig(
  getDefaultConfig({
    chains: [hardhat, sepolia],
    transports: getTransports(),
    walletConnectProjectId: NETWORK_CONFIG.walletConnectProjectId!,
    appName: 'Docu Vault Secure Sharing',
    appDescription: 'Docu Vault Secure Sharing: A secure way to share documents with your family and friends.',
  })
);

console.log('[Web3Provider] Wagmi config created with chains:', {
  currentChainId: env.VITE_CHAIN_ID,
  hardhatChainId: hardhat.id,
  sepoliaChainId: sepolia.id,
  rpcUrl: env.VITE_RPC_URL,
  transports: Object.keys(getTransports()),
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
