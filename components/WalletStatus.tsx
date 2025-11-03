"use client";

import { useWalletStore } from "../store/walletStore";
import { motion } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import { Network } from "lucide-react";

export function WalletStatus() {
  const { evmWallet } = useWalletStore();

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  if (!evmWallet?.isConnected) {
    return null;
  }

  return (
    <div className="flex items-center gap-3">
      {/* EVM Wallet Status */}
      {evmWallet?.isConnected && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-lg"
        >
          <div className="flex items-center gap-1.5">
            <Network className="w-4 h-4 text-blue-600" />
            <span className="text-xs font-medium text-blue-900">
              {formatAddress(evmWallet.address)}
            </span>
          </div>
          <CheckCircle2 className="w-4 h-4 text-green-500" />
        </motion.div>
      )}
    </div>
  );
}
