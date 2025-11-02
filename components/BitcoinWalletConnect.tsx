"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletStore } from "../store/walletStore";
import { Bitcoin, LogOut, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

export function BitcoinWalletConnect() {
  const { btcWallet, setBTCWallet, disconnectBTC } = useWalletStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if window.bitcoin is available (for browser Bitcoin wallets)
  const isBitcoinWalletAvailable = typeof window !== "undefined" && 
    (typeof (window as any).bitcoin !== "undefined" || 
     typeof (window as any).unisat !== "undefined");

  const handleConnect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Try to connect to a Bitcoin wallet
      // This is a placeholder - you'll need to implement actual Bitcoin wallet connection
      // Common options: Unisat, Xverse, Hiro, etc.
      
      if (typeof window !== "undefined") {
        // Try Unisat wallet first
        if (typeof (window as any).unisat !== "undefined") {
          const unisat = (window as any).unisat;
          try {
            const accounts = await unisat.requestAccounts();
            if (accounts && accounts.length > 0) {
              setBTCWallet({
                address: accounts[0],
                isConnected: true,
              });
              setIsDropdownOpen(false);
            }
          } catch (err: any) {
            setError(err.message || "Failed to connect Unisat wallet");
          }
        } 
        // Try Xverse wallet
        else if (typeof (window as any).XverseProviders !== "undefined") {
          const provider = (window as any).XverseProviders;
          try {
            const accounts = await provider.requestAccounts();
            if (accounts && accounts.length > 0) {
              setBTCWallet({
                address: accounts[0],
                isConnected: true,
              });
              setIsDropdownOpen(false);
            }
          } catch (err: any) {
            setError(err.message || "Failed to connect Xverse wallet");
          }
        }
        // Try Hiro wallet
        else if (typeof (window as any).btc !== "undefined") {
          const hiro = (window as any).btc;
          try {
            const response = await hiro.request("requestAccount");
            if (response && response.result) {
              setBTCWallet({
                address: response.result,
                isConnected: true,
              });
              setIsDropdownOpen(false);
            }
          } catch (err: any) {
            setError(err.message || "Failed to connect Hiro wallet");
          }
        }
        else {
          // For demo purposes, we'll use a mock address
          // In production, you'd want to show an error or guide users to install a wallet
          setError("No Bitcoin wallet detected. Please install Unisat, Xverse, or Hiro wallet.");
        }
      }
    } catch (err: any) {
      setError(err.message || "Failed to connect Bitcoin wallet");
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectBTC();
    setIsDropdownOpen(false);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (btcWallet && btcWallet.isConnected) {
    return (
      <div className="relative">
        <motion.button
          onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Bitcoin className="w-4 h-4" />
          <span className="hidden sm:inline">{formatAddress(btcWallet.address)}</span>
          <span className="sm:hidden">{formatAddress(btcWallet.address)}</span>
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
                  <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full flex items-center justify-center">
                    <Bitcoin className="w-5 h-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {formatAddress(btcWallet.address)}
                    </p>
                    <p className="text-xs text-gray-500">Bitcoin Wallet</p>
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
        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-yellow-500 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        whileHover={{ scale: isConnecting ? 1 : 1.02 }}
        whileTap={{ scale: isConnecting ? 1 : 0.98 }}
        disabled={isConnecting}
      >
        <Bitcoin className="w-4 h-4" />
        {isConnecting ? "Connecting..." : "Connect Bitcoin"}
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
                Connect Bitcoin Wallet
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
                <div className="w-8 h-8 bg-gradient-to-r from-orange-100 to-yellow-100 rounded-lg flex items-center justify-center">
                  <Bitcoin className="w-4 h-4 text-orange-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {isBitcoinWalletAvailable ? "Detected Wallet" : "Install Wallet"}
                  </p>
                  <p className="text-xs text-gray-500">
                    {isBitcoinWalletAvailable
                      ? "Click to connect"
                      : "Install Unisat, Xverse, or Hiro"}
                  </p>
                </div>
              </button>
              {!isBitcoinWalletAvailable && (
                <div className="mt-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-1">Recommended Wallets:</p>
                  <ul className="list-disc list-inside space-y-1 text-gray-500">
                    <li>Unisat Wallet</li>
                    <li>Xverse Wallet</li>
                    <li>Hiro Wallet</li>
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

