"use client";

import { WagmiProvider, createConfig, http, type Config } from "wagmi";
import {
  avalanche,
  avalancheFuji,
  mainnet,
  sepolia,
  arbitrumSepolia,
} from "wagmi/chains";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { StarknetConfig, publicProvider, ready, braavos } from "@starknet-react/core";
import { sepolia as starknetSepolia, mainnet as starknetMainnet } from "@starknet-react/chains";
import { AutoReconnect } from "../AutoReconnect";

// Configure supported chains
const supportedChains = [
  avalanche,
  avalancheFuji,
  mainnet,
  sepolia,
  arbitrumSepolia,
] as const;

// Create query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
    },
  },
});

// Create a minimal config for SSR (no connectors)
const ssrConfig = createConfig({
  chains: supportedChains,
  connectors: [],
  transports: {
    [avalanche.id]: http(),
    [avalancheFuji.id]: http(),
    [mainnet.id]: http(),
    [sepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});

export function WalletProvider({ children }: { children: React.ReactNode }) {
  // Start with SSR config, then upgrade to client config with connectors
  const [config, setConfig] = useState<Config>(ssrConfig);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Only create config with connectors on client side
    if (typeof window !== "undefined") {
      // Dynamically import connectors to prevent SSR initialization
      Promise.all([
        import("wagmi/connectors").then((m) => m.injected),
        import("wagmi/connectors").then((m) => m.metaMask),
      ]).then(([injected, metaMask]) => {
        const clientConfig = createConfig({
  chains: supportedChains,
  connectors: [
    injected(),
            metaMask({
              dappMetadata: {
                name: "Oryn",
              },
            }),
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
    [arbitrumSepolia.id]: http(),
  },
});
        setConfig(clientConfig);
      }).catch((error) => {
        console.error("Failed to initialize wallet connectors:", error);
        // Keep using SSR config if dynamic import fails
      });
    }
  }, []);

  // Starknet connectors - only initialize on client side
  // ready() returns Argent connector, braavos() returns Braavos connector
  const starknetConnectors = mounted ? [ready(), braavos()] : [];

  // Always render WagmiProvider, even with SSR config
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <StarknetConfig
          chains={[starknetSepolia, starknetMainnet]}
          provider={publicProvider()}
          connectors={starknetConnectors}
          autoConnect={true}
        >
          <AutoReconnect />
          {children}
        </StarknetConfig>
      </QueryClientProvider>
    </WagmiProvider>
  );
}