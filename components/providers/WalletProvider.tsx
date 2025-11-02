"use client";

import { WagmiProvider, createConfig, http } from "wagmi";
import { avalanche, avalancheFuji, mainnet, sepolia } from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { injected, metaMask } from "wagmi/connectors";

// Configure supported chains
const supportedChains = [avalanche, avalancheFuji, mainnet, sepolia] as const;

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Create wagmi config
const config = createConfig({
  chains: supportedChains,
  connectors: [
    injected(),
    metaMask(),
    // WalletConnect removed - add back when you have a project ID
    // walletConnect({
    //   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "",
    // }),
  ],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
  },
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}

