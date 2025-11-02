"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { useWalletStore } from "../store/walletStore";
import { Wallet, LogOut, ChevronDown, CheckCircle2 } from "lucide-react";

export function WalletConnect() {
  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { connectors, connect, isPending } = useConnect();
  const { setEVMWallet, disconnectEVM, evmWallet } = useWalletStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Sync wagmi state with our store
  useEffect(() => {
    if (isConnected && address) {
      setEVMWallet({
        address,
        chainId: chainId || 0,
        isConnected: true,
      });
    } else {
      disconnectEVM();
    }
  }, [isConnected, address, chainId, setEVMWallet, disconnectEVM]);

  const handleConnect = async (connector: (typeof connectors)[0]) => {
    try {
      connect({ connector });
      setIsDropdownOpen(false);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    disconnectEVM();
    setIsDropdownOpen(false);
  };

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (isConnected && address) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Wallet className="w-4 h-4" />
          <span className="hidden sm:inline">{formatAddress(address)}</span>
          <span className="sm:hidden">{formatAddress(address)}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              isDropdownOpen ? "rotate-180" : ""
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {isDropdownOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2 }}
              className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
            >
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                    <Wallet className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatAddress(address)}
                    </p>
                    <p className="text-xs text-gray-500">EVM Wallet</p>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                </div>
              </div>
              <button
                onClick={handleDisconnect}
                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Disconnect Wallet
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        disabled={isPending}
      >
        <Wallet className="w-4 h-4" />
        {isPending ? "Connecting..." : "Connect Wallet"}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${
            isDropdownOpen ? "rotate-180" : ""
          }`}
        />
      </motion.button>

      <AnimatePresence>
        {isDropdownOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
          >
            <div className="p-2">
              <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                Connect Wallet
              </p>
              {connectors.map((connector) => (
                <button
                  key={connector.id}
                  onClick={() => handleConnect(connector)}
                  disabled={isPending}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                    <Wallet className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">
                      {connector.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {connector.id === "metaMask" && "MetaMask"}
                      {connector.id === "injected" && "Browser Wallet"}
                      {connector.id === "walletConnect" && "WalletConnect"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

