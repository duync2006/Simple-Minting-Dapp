'use client';

import { WagmiProvider as Provider, createConfig, http } from 'wagmi';
import { base, mainnet, optimism } from 'wagmi/chains'
import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactNode } from 'react';
import { defineChain } from 'viem'

// Define Hardhat local chain
const hardhatLocal = defineChain({
  id: 31337,
  name: 'Hardhat Local',
  nativeCurrency: {
    decimals: 18,
    name: 'Localhost',
    symbol: 'LOCAL',
  },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },

  testnet: true,
})

// Setup React Query client
const queryClient = new QueryClient();

// Configure Wagmi with supported chains and multiple connectors
const projectId = '<WALLETCONNECT_PROJECT_ID>'

export const config = createConfig({
  chains: [hardhatLocal, mainnet, base],
  connectors: [
    injected(),
    // walletConnect({ projectId }),
    metaMask(),
    safe(),
  ],
  transports: {
    [mainnet.id]: http(),
    [base.id]: http(),
    [hardhatLocal.id]: http('http://127.0.0.1:8545'),
  },
})
export function WagmiProvider({ children }: { children: ReactNode }) {
  return (
    <Provider config={config}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </Provider>
  );
} 