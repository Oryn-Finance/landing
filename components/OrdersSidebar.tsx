"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Clock, AlertCircle, ArrowRight, RefreshCw } from "lucide-react";
import { useAccount } from "wagmi";
import { useWalletStore } from "../store/walletStore";
import Image from "next/image";
import { API_URLS } from "@/constants/constants";

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
        width={20}
        height={20}
        className="w-5 h-5 rounded-full object-contain"
        style={{ background: "#fff" }}
      />
    );
  }
  return (
    <div className="w-5 h-5 bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium">
      {symbol.charAt(0)}
    </div>
  );
}

// Transform API order format to component format
function transformOrder(apiOrder: any): any {
  const sourceAsset = apiOrder.source_intent?.asset || "";
  const destinationAsset = apiOrder.destination_intent?.asset || "";
  const sourceAmount = apiOrder.source_intent?.amount || "0";
  const destinationAmount = apiOrder.destination_intent?.amount || "0";
  
  // Determine status from intent states
  const sourceState = apiOrder.source_intent?.state || "Created";
  const destState = apiOrder.destination_intent?.state || "Created";
  
  let status = "Pending";
  if (sourceState === "Claimed" || destState === "Claimed") {
    status = "Completed";
  } else if (sourceState === "Cancelled" || destState === "Cancelled") {
    status = "Cancelled";
  } else if (sourceState === "Created" && destState === "Created") {
    status = "Pending";
  }
  
  return {
    id: apiOrder.order_id,
    sourceAsset,
    destinationAsset,
    sourceAmount: typeof sourceAmount === "string" ? sourceAmount : sourceAmount.toString(),
    destinationAmount: typeof destinationAmount === "string" ? destinationAmount : destinationAmount.toString(),
    status,
    createdAt: apiOrder.created_at,
  };
}

// Fetch orders for a user by address as /orders/user/[address]
async function fetchUserOrders(address: string): Promise<any[]> {
  try {
    const response = await fetch(`${API_URLS.ORDERS}/orders/user/${address}`);
    if (!response.ok) {
      throw new Error("Failed to fetch");
    }
    const data = await response.json();
    // Handle paginated response - extract data array
    const orders = data.data || data;
    // Transform API format to component format
    return Array.isArray(orders) ? orders.map(transformOrder) : [];
  } catch (e) {
    // Could choose to log or pass, but let upper code handle error.
    throw e;
  }
}

const OrdersSidebar: React.FC<OrdersSidebarProps> = ({
  isOpen,
  onClose,
  onOrderClick,
}) => {
  const { address: evmAddress } = useAccount();
  const { btcWallet } = useWalletStore();

  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders
  const fetchOrders = async () => {
    if (!evmAddress && !btcWallet?.address) return;

    setIsLoading(true);
    setError(null);

    try {
      const userAddress = evmAddress || btcWallet?.address;
      if (!userAddress) return;

      const fetchedOrders = await fetchUserOrders(userAddress);
      setOrders(fetchedOrders);
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
  }, [isOpen, evmAddress, btcWallet?.address]);

  const getAssetSymbol = (assetValue: string) => {
    const parts = assetValue.split(":");
    if (parts.length > 1) {
      return parts[1].toUpperCase();
    }
    return assetValue.toUpperCase();
  };

  // Get decimals for an asset based on symbol
  const getAssetDecimals = (assetValue: string): number => {
    const symbol = getAssetSymbol(assetValue).toLowerCase();
    // Common token decimals
    if (symbol === "usdc" || symbol === "usdt") return 6;
    if (symbol === "wbtc" || symbol === "btc" || symbol === "bitcoin") return 8;
    if (symbol === "avax" || symbol === "eth") return 18;
    // Default to 6 for most tokens
    return 6;
  };

  const formatAmount = (amount: string | number, assetValue: string = "") => {
    // Handle both string and number amounts
    const num = typeof amount === "string" 
      ? parseFloat(amount) 
      : amount;
    
    // If invalid number, return 0
    if (isNaN(num) || num === 0) return "0.00";
    
    // Get appropriate decimals for the asset
    const decimals = getAssetDecimals(assetValue);
    
    // Amounts from API are in smallest units, so divide by 10^decimals
    const humanReadable = num / Math.pow(10, decimals);
    
    // Format with up to 4 decimal places, but remove trailing zeros
    // For very small amounts, use more precision
    if (humanReadable < 0.0001) {
      return humanReadable.toFixed(6).replace(/\.?0+$/, "");
    }
    if (humanReadable < 1) {
      return humanReadable.toFixed(4).replace(/\.?0+$/, "");
    }
    
    // For larger amounts, show 2-4 decimal places
    return humanReadable.toFixed(4).replace(/\.?0+$/, "") || "0";
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
            className="fixed inset-0 backdrop-blur-md bg-white/10 z-50"
            onClick={onClose}
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-[85vw] max-w-sm xs:w-80 md:w-96 bg-white shadow-xl z-50 overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-3 md:p-4 py-4 md:py-6 border-b shrink-0">
              <h2 className="text-base md:text-lg font-semibold">Orders</h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={fetchOrders}
                  disabled={isLoading}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                  title="Refresh orders"
                >
                  <RefreshCw
                    className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`}
                  />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {isLoading && (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="w-6 h-6 animate-spin text-blue-500" />
                </div>
              )}

              {error && (
                <div className="text-center py-8 text-red-600">
                  <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                  <p>{error}</p>
                  <button
                    onClick={fetchOrders}
                    className="mt-2 text-blue-600 hover:underline cursor-pointer"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!isLoading && !error && orders.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Clock className="w-8 h-8 mx-auto mb-2" />
                  <p>No orders found</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Your swap orders will appear here
                  </p>
                </div>
              )}

              {!isLoading && !error && orders.length > 0 && (
                <div className="space-y-3">
                  {orders.map((order: any) => (
                    <div
                      key={order.id || Math.random()}
                      className="p-3 rounded-lg border border-gray-200 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => onOrderClick?.(order.id)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {getAssetLogo(
                            getAssetSymbol(order.sourceAsset || "BTC")
                          )}
                          <ArrowRight className="w-4 h-4 text-gray-400" />
                          {getAssetLogo(
                            getAssetSymbol(order.destinationAsset || "AVAX")
                          )}
                        </div>
                        <div className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {order.status || "Pending"}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {formatAmount(order.sourceAmount || "0", order.sourceAsset || "")} →{" "}
                        {formatAmount(order.destinationAmount || "0", order.destinationAsset || "")}
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
