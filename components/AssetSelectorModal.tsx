"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X, Search } from "lucide-react";
import { useAssetsStore, type AssetOption } from "../store/assetsStore";
import Image from "next/image";

const ASSET_LOGOS: Record<string, string> = {
  wbtc: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
  avax: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  usdc: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
  bitcoin: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  strk: "https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
};

const CHAIN_LOGOS: Record<string, string> = {
  "Arbitrum Sepolia":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
  "Avalanche Testnet":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  "Bitcoin Testnet":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  "Starknet Sepolia":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
  Avalanche: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  Bitcoin: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  Starknet: "https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
};

interface AssetSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: "from" | "to";
  selectedAsset: AssetOption | null;
  onSelect: (asset: AssetOption) => void;
}

function getAssetLogo(symbol: string, size: "sm" | "md" | "lg" = "md") {
  const key = symbol.toLowerCase();
  let url: string | undefined;
  if (key === "btc" || key === "bitcoin") url = ASSET_LOGOS.bitcoin;
  else if (key === "usdc") url = ASSET_LOGOS.usdc;
  else if (key === "wbtc") url = ASSET_LOGOS.wbtc;
  else if (key === "avax") url = ASSET_LOGOS.avax;
  else if (key === "strk") url = ASSET_LOGOS.strk;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  if (url) {
    return (
      <Image
        src={url.trim()}
        alt={symbol}
        className={`${sizeClasses[size]} rounded-full object-contain`}
        style={{ background: "#fff" }}
        width={200}
        height={200}
      />
    );
  }
  return (
    <div
      className={`${sizeClasses[size]} bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-300`}
    >
      {symbol.charAt(0)}
    </div>
  );
}

function getChainLogo(chainName: string, size: "sm" | "xs" = "sm") {
  const url = CHAIN_LOGOS[chainName];
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
  };

  if (url) {
    return (
      <Image
        src={url.trim()}
        alt={chainName}
        className={`${sizeClasses[size]} rounded-full object-contain border-2 border-gray-700`}
        style={{ background: "#fff" }}
        width={32}
        height={32}
      />
    );
  }
  return (
    <div
      className={`${sizeClasses[size]} bg-gray-700 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-300 border-2 border-gray-600`}
    >
      {chainName.charAt(0)}
    </div>
  );
}

export function AssetSelectorModal({
  isOpen,
  onClose,
  type,
  selectedAsset,
  onSelect,
}: AssetSelectorModalProps) {
  const { assets, fromAsset, toAsset } = useAssetsStore();
  const [selectedChain, setSelectedChain] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get unique chains from available assets
  const availableChains = useMemo(() => {
    const chains = new Set<string>();
    assets.forEach((asset) => {
      chains.add(asset.chainName);
    });
    return Array.from(chains).sort();
  }, [assets]);

  // Get filtered assets based on type, chain filter, and search
  const getFilteredAssets = useMemo(() => {
    let filtered = assets;

    // Filter by type (exclude already selected asset in opposite field)
    if (type === "from") {
      filtered = filtered.filter(
        (asset) => !toAsset || asset.value !== toAsset.value
      );
    } else {
      filtered = filtered.filter(
        (asset) => !fromAsset || asset.value !== fromAsset.value
      );
    }

    // Filter by selected chain
    if (selectedChain) {
      filtered = filtered.filter((asset) => asset.chainName === selectedChain);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (asset) =>
          asset.asset.symbol.toLowerCase().includes(query) ||
          asset.asset.name.toLowerCase().includes(query) ||
          asset.chainName.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [assets, type, toAsset, fromAsset, selectedChain, searchQuery]);

  const handleClose = useCallback(() => {
    setSelectedChain(null);
    setSearchQuery("");
    onClose();
  }, [onClose]);

  const handleSelect = (asset: AssetOption) => {
    onSelect(asset);
    setSelectedChain(null);
    setSearchQuery("");
    onClose();
  };

  // Close modal on Escape key and lock body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      // Lock body scroll
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Unlock body scroll
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [isOpen, handleClose]);

  if (!isOpen) return null;

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-black/40 z-50 flex items-center justify-center p-4"
            onClick={handleClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#070011]/95 backdrop-blur-xl border border-gray-700/40 shadow-xl rounded-2xl max-w-2xl w-full max-h-[80vh] flex flex-col z-50"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700/40 shrink-0">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                Select {type === "from" ? "Source" : "Destination"} Asset
              </h2>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search Bar */}
            <div className="p-4 md:p-6 border-b border-gray-700/40 shrink-0">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by asset or chain..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-gray-700/40 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/60 focus:bg-white/10 transition-colors"
                />
              </div>
            </div>

            {/* Chain Filter */}
            <div className="px-4 md:px-6 pt-4 border-b border-gray-700/40 shrink-0 pb-4">
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedChain(null)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedChain === null
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      : "bg-white/5 text-gray-400 border border-gray-700/40 hover:bg-white/10 hover:text-gray-300"
                  }`}
                >
                  All Chains
                </button>
                {availableChains.map((chain) => (
                  <button
                    key={chain}
                    onClick={() => setSelectedChain(chain)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                      selectedChain === chain
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : "bg-white/5 text-gray-400 border border-gray-700/40 hover:bg-white/10 hover:text-gray-300"
                    }`}
                  >
                    {getChainLogo(chain, "xs")}
                    <span>{chain}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Assets List - Scrollable */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6">
              {getFilteredAssets.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="w-8 h-8 text-gray-500" />
                  </div>
                  <p className="text-gray-300 text-base font-medium mb-1">
                    No assets found
                  </p>
                  <p className="text-gray-500 text-sm">
                    Try adjusting your filters or search query
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-2">
                  {getFilteredAssets.map((asset) => {
                    const isSelected =
                      selectedAsset && selectedAsset.value === asset.value;
                    return (
                      <motion.button
                        key={asset.value}
                        whileHover={{ scale: 1.01 }}
                        whileTap={{ scale: 0.99 }}
                        onClick={() => handleSelect(asset)}
                        className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                          isSelected
                            ? "bg-purple-500/20 border-2 border-purple-500/70"
                            : "bg-white/5 border border-gray-700/40 hover:bg-white/10 hover:border-purple-500/40"
                        } focus:outline-none`}
                      >
                        <div className="flex items-center w-full gap-3">
                          {/* Asset logo with chain badge */}
                          <div className="relative flex items-center shrink-0">
                            {getAssetLogo(asset.asset.symbol, "lg")}
                            <div className="absolute -bottom-1 -right-1">
                              {getChainLogo(asset.chainName, "sm")}
                            </div>
                          </div>
                          {/* Asset info */}
                          <div className="flex flex-col min-w-0 flex-1 text-left">
                            <span className="font-semibold text-white text-base leading-tight truncate">
                              {asset.asset.symbol}
                            </span>
                            <span className="text-xs text-gray-400 font-medium truncate">
                              {asset.asset.name} • {asset.chainName}
                            </span>
                          </div>
                          {/* Selected checkmark */}
                          {isSelected && (
                            <span className="ml-auto flex items-center shrink-0">
                              <svg
                                className="w-5 h-5 text-purple-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </span>
                          )}
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
