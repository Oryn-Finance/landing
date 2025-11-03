"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { X, Clock, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useAccount } from "wagmi";
import { useWalletStore } from "../store/walletStore";
import Image from "next/image";

interface OrdersSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderClick?: (orderId: string) => void;
}

const ASSET_LOGOS: Record<string, string> = {
  wbtc: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
  avax: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  usdc: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
  bitcoin: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
};

function getAssetLogo(symbol: string) {
  const key = symbol.toLowerCase();
  let url: string | undefined;
  if (key === "btc" || key === "bitcoin") url = ASSET_LOGOS.bitcoin;
  else if (key === "usdc") url = ASSET_LOGOS.usdc;
  else if (key === "wbtc") url = ASSET_LOGOS.wbtc;
  else if (key === "avax") url = ASSET_LOGOS.avax;

  if (url) {
    return (
      <Image
        src={url}
        alt={symbol}
        className="w-5 h-5 rounded-full object-contain"
        style={{ background: "#fff" }}
      />
    );
  }
  return (
    <div className="w-5 h-5 bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-300">
      {symbol.charAt(0)}
    </div>
  );
}

const OrdersSidebar: React.FC<OrdersSidebarProps> = ({
  isOpen,
  onClose,
  onOrderClick,
}) => {
  const router = useRouter();
  const { address: evmAddress } = useAccount();
  const { btcWallet } = useWalletStore();

  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<
    Array<{
      id: string;
      sourceAsset?: string;
      destinationAsset?: string;
      sourceAmount?: string;
      destinationAmount?: string;
      status?: string;
      createdAt?: string;
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders (placeholder - you'll need to implement actual API call)
  const fetchOrders = async () => {
    if (!evmAddress && !btcWallet?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      // TODO: Implement actual API call to fetch orders
      // const userAddress = evmAddress || btcWallet.address;
      // const fetchedOrders = await fetchUserOrders(userAddress);
      // setOrders(fetchedOrders);

      // For now, return empty array
      setOrders([]);
    } catch (err) {
      setError("Failed to fetch orders");
      console.error("Error fetching orders:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch orders when sidebar opens and lock body scroll
  useEffect(() => {
    if (isOpen) {
      fetchOrders();
      // Lock body scroll
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    } else {
      // Unlock body scroll
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    }
    return () => {
      // Cleanup on unmount
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, evmAddress, btcWallet?.address]);

  const getAssetSymbol = (assetValue: string) => {
    const parts = assetValue.split(":");
    if (parts.length > 1) {
      return parts[1].toUpperCase();
    }
    return assetValue.toUpperCase();
  };

  const formatAmount = (amount: string, decimals: number = 6) => {
    const num = parseFloat(amount) / Math.pow(10, decimals);
    return num.toFixed(4);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-black/40 z-50"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[85vw] max-w-sm xs:w-80 md:w-96 bg-[#070011]/95 backdrop-blur-xl border-l border-gray-700/40 shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 md:p-4 py-4 md:py-6 border-b border-gray-700/40 shrink-0">
              <h2 className="text-base md:text-lg font-semibold text-white">
                Orders
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchOrders}
                  disabled={isLoading}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-gray-300 hover:text-white"
                  title="Refresh orders"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-full transition-colors cursor-pointer text-gray-300 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-purple-400" />
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-red-300">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{error}</p>
                  <button
                    onClick={fetchOrders}
                    className="mt-2 text-purple-400 hover:text-purple-300 hover:underline cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!isLoading && !error && orders.length === 0 && (
                <div className="text-center py-8 text-gray-400">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>No orders found</p>
                  <p className="text-sm text-gray-500 mt-1">
                    Your swap orders will appear here
                  </p>
                </div>
              )}

              {!isLoading && !error && orders.length > 0 && (
                <div className="space-y-3">
                  {orders.map((order) => (
                    <div
                      key={order.id || Math.random()}
                      className="p-3 rounded-lg border border-gray-700/40 bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                      onClick={() => {
                        if (onOrderClick) {
                          onOrderClick(order.id);
                        } else {
                          // Default behavior: navigate to order page
                          router.push(`/order/${order.id}`);
                          onClose();
                        }
                      }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getAssetLogo(
                            getAssetSymbol(order.sourceAsset || "BTC")
                          )}
                          <ArrowRight className="w-4 h-4 text-gray-500" />
                          {getAssetLogo(
                            getAssetSymbol(order.destinationAsset || "AVAX")
                          )}
                        </div>
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-purple-500/20 text-purple-300 border border-purple-500/30">
                          {order.status || "Pending"}
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        {formatAmount(order.sourceAmount || "0")} →{" "}
                        {formatAmount(order.destinationAmount || "0")}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {order.createdAt
                          ? new Date(order.createdAt).toLocaleDateString()
                          : "Just now"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default OrdersSidebar;
