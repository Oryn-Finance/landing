"use client";

import { useEffect, useState } from "react";
import { useAccount, useConnect, useDisconnect } from "wagmi";
import { useWalletStore } from "../store/walletStore";
import { useStarknetWallet } from "../hooks/useStarknetWallet";

/**
 * Component to handle automatic wallet reconnection on page refresh
 * This ensures that persisted wallet connections are restored
 */
export function AutoReconnect() {
  const { evmWallet, starknetWallet } = useWalletStore();
  const { address, isConnected, chainId, connector } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();
  const { starknetConnectAsync, starknetConnectors, starknetAddress, starknetStatus } = useStarknetWallet();
  const [hasAttemptedReconnect, setHasAttemptedReconnect] = useState(false);

  // Auto-reconnect EVM wallet on mount if we have persisted data
  useEffect(() => {
    // Wait for connectors to be available
    if (connectors.length === 0) return;
    
    // If we already attempted reconnect or wagmi is already connected, skip
    if (hasAttemptedReconnect || isConnected) {
      if (!hasAttemptedReconnect) {
        setHasAttemptedReconnect(true);
      }
      return;
    }

    // Only attempt reconnect if we have persisted wallet data
    if (!evmWallet?.isConnected || !evmWallet.address) {
      setHasAttemptedReconnect(true);
      return;
    }

    // Try to reconnect to the last used connector
    const attemptReconnect = async () => {
      try {
        // Check if MetaMask is available
        if (typeof window !== "undefined" && (window as any).ethereum) {
          // Try MetaMask first
          const metaMaskConnector = connectors.find(
            (c) => c.id === "metaMaskSDK" || c.name?.toLowerCase().includes("metamask")
          );
          
          if (metaMaskConnector) {
            await connect({ connector: metaMaskConnector });
            setHasAttemptedReconnect(true);
            return;
          }
        }

        // Fallback to injected connector
        const injectedConnector = connectors.find((c) => c.id === "injected");
        if (injectedConnector) {
          await connect({ connector: injectedConnector });
        }
      } catch (error) {
        console.error("Failed to auto-reconnect EVM wallet:", error);
        // Don't clear persisted state on error - user might just need to click connect
      } finally {
        setHasAttemptedReconnect(true);
      }
    };

    // Small delay to ensure everything is ready
    const timer = setTimeout(() => {
      attemptReconnect();
    }, 300);

    return () => clearTimeout(timer);
  }, [evmWallet, isConnected, address, connectors, connect, hasAttemptedReconnect]);

  // Auto-reconnect Starknet wallet on mount if we have persisted data
  useEffect(() => {
    if (hasAttemptedReconnect || !starknetWallet?.isConnected) return;

    // If starknet is already connected, we're good
    if (starknetStatus === "connected" && starknetAddress) {
      return;
    }

    // Try to reconnect to the last used Starknet connector
    const attemptReconnect = async () => {
      try {
        // Try Argent first, then Braavos
        const argentConnector = starknetConnectors.find((c) => c.id === "argentX" || c.name?.toLowerCase().includes("argent"));
        const braavosConnector = starknetConnectors.find((c) => c.id === "braavos" || c.name?.toLowerCase().includes("braavos"));

        const connectorToUse = argentConnector || braavosConnector;

        if (connectorToUse) {
          await starknetConnectAsync({ connector: connectorToUse });
        }
      } catch (error) {
        console.error("Failed to auto-reconnect Starknet wallet:", error);
      }
    };

    // Small delay to ensure connectors are ready
    const timer = setTimeout(() => {
      attemptReconnect();
    }, 200);

    return () => clearTimeout(timer);
  }, [starknetWallet, starknetStatus, starknetAddress, starknetConnectors, starknetConnectAsync, hasAttemptedReconnect]);

  return null;
}

