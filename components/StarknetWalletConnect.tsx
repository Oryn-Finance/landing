"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletStore } from "../store/walletStore";
import { Sparkles, LogOut, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";
import { connect, disconnect } from "@starknet-io/get-starknet";

export function StarknetWalletConnect() {
  const { starknetWallet, setStarknetWallet, disconnectStarknet } = useWalletStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableWallets, setAvailableWallets] = useState<any[]>([]);

  // Check available wallets on mount
  useEffect(() => {
    const checkWallets = async () => {
      if (typeof window === "undefined") return;
      
      try {
        // Import getStarknet to check for available wallets
        const { getStarknet } = await import("@starknet-io/get-starknet-core");
        const wallets = await getStarknet().getAvailableWallets();
        setAvailableWallets(wallets);
      } catch (err) {
        console.warn("Error checking Starknet wallets:", err);
      }
    };
    
    checkWallets();
  }, []);

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      if (typeof window === "undefined") {
        setError("Wallet connection is only available in the browser");
        return;
      }

      // Use connect function from @starknet-io/get-starknet
      const wallet = await connect({
        modalMode: "alwaysAsk",
        modalTheme: "light",
      });

      if (!wallet) {
        setError("No wallet selected or connection cancelled");
        return;
      }

      // Request accounts from the wallet
      const accounts = await wallet.request({
        type: "wallet_requestAccounts",
      });

      if (accounts && accounts.length > 0) {
        setStarknetWallet({
          address: accounts[0],
          isConnected: true,
        });
        setIsDropdownOpen(false);
      } else {
        setError("Failed to get wallet address. Please try again.");
      }
    } catch (err: any) {
      console.error("Starknet wallet connection error:", err);
      setError(err?.message || "Failed to connect Starknet wallet. Please make sure you have a wallet extension installed.");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnect({ clearLastWallet: true });
      disconnectStarknet();
      setIsDropdownOpen(false);
    } catch (err) {
      console.error("Error disconnecting wallet:", err);
    }
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (starknetWallet && starknetWallet.isConnected) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Sparkles className="w-4 h-4" />
          <span className="hidden sm:inline">{formatAddress(starknetWallet.address)}</span>
          <span className="sm:hidden">{formatAddress(starknetWallet.address)}</span>
          <ChevronDown
            className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
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
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatAddress(starknetWallet.address)}
                    </p>
                    <p className="text-xs text-gray-500">Starknet Wallet</p>
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

  const hasWallets = availableWallets.length > 0;

  return (
    <div className="relative">
      <motion.button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isConnecting ? 1 : 1.02 }}
        whileTap={{ scale: isConnecting ? 1 : 0.98 }}
        disabled={isConnecting}
      >
        <Sparkles className="w-4 h-4" />
        {isConnecting ? "Connecting..." : "Connect Starknet"}
        <ChevronDown
          className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
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
                Connect Starknet Wallet
              </p>
              {error && (
                <div className="mx-2 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-red-700">{error}</p>
                </div>
              )}
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
              >
                <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {hasWallets ? "Detected Wallet" : "Install Wallet"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {hasWallets
                      ? "Click to connect"
                      : "Install Argent X or Braavos"}
                  </p>
                </div>
              </button>
              {!hasWallets && (
                <div className="mt-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-1">Recommended Wallets:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-500">
                    <li>Argent X</li>
                    <li>Braavos</li>
                  </ul>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}