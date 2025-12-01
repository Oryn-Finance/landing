import { useAccount, useConnect, useDisconnect } from "@starknet-react/core";
import { useEffect } from "react";

export const useStarknetWallet = () => {
  const {
    connect: starknetConnect,
    connectors,
    connector: activeConnector,
    connectAsync: starknetConnectAsync,
  } = useConnect();
  const { disconnectAsync } = useDisconnect();
  const { address, status, account, chainId } = useAccount();

  // For analytics tracking
  useEffect(() => {
    if (status === "connected" && address && activeConnector) {
      localStorage.setItem(
        "starknetWalletStore",
        JSON.stringify({
          address: address,
          connector: activeConnector.name,
        })
      );
    }
  }, [status, address, activeConnector]);

  return {
    starknetConnect,
    starknetConnectAsync,
    starknetConnectors: connectors,
    starknetConnector: activeConnector,
    starknetDisconnect: disconnectAsync,
    starknetAddress: address,
    starknetStatus: status,
    starknetAccount: account,
    starknetChainId: chainId,
  };
};

