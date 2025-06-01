'use client';

import React, { ReactNode } from 'react';
import { RainbowKitProvider, darkTheme, lightTheme } from '@rainbow-me/rainbowkit';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, http, createConfig } from 'wagmi';
import { mainnet, sepolia, hardhat } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import '@rainbow-me/rainbowkit/styles.css';

// Configure chains - add any additional chains your app needs to support
const chains = [mainnet, sepolia, hardhat] as const;

// Configure the Wagmi client
const config = createConfig({
  chains,
  transports: {
    [hardhat.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
  connectors: [
    injected({
      target: 'metaMask',
    }),
  ],
});

// Create a React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 60 * 1000, // 1 minute
    },
  },
});

interface RainbowProviderProps {
  children: ReactNode;
  theme?: 'dark' | 'light' | 'auto';
}

export function RainbowProvider({ children, theme = 'light' }: RainbowProviderProps) {
  const selectedTheme =
    theme === 'dark'
      ? darkTheme()
      : theme === 'light'
        ? lightTheme()
        : { lightMode: lightTheme(), darkMode: darkTheme() };

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider theme={selectedTheme}>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default RainbowProvider;
