"use client";

import { useRef, useEffect, useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
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

function getAssetLogo(symbol: string, size: "sm" | "md" | "lg" = "md") {
  const key = symbol.toLowerCase();
  let url: string | undefined;
  if (key === "btc" || key === "bitcoin") url = ASSET_LOGOS.bitcoin;
  else if (key === "usdc") url = ASSET_LOGOS.usdc;
  else if (key === "wbtc") url = ASSET_LOGOS.wbtc;
  else if (key === "avax") url = ASSET_LOGOS.avax;
  else if (key === "strk") url = ASSET_LOGOS.strk;
  const sizeClasses = {
    sm: "w-5 h-5 md:w-6 md:h-6",
    md: "w-8 h-8 md:w-10 md:h-10",
    lg: "w-10 h-10 md:w-14 md:h-14",
  };

  if (url) {
    return (
      <Image
        src={url}
        alt={symbol}
        className={`${sizeClasses[size]} rounded-full object-contain border border-gray-100 shadow-sm`}
        style={{ background: "#fff" }}
        width={80}
        height={80}
        unoptimized
      />
    );
  }
  return (
    <div
      className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center text-xs font-semibold uppercase text-gray-400 border`}
    >
      {symbol.charAt(0)}
    </div>
  );
}

function getChainLogo(chainName: string, size: "sm" | "xs" = "sm") {
  const url = CHAIN_LOGOS[chainName];
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5 md:w-6 md:h-6",
  };

  if (url) {
    return (
      <Image
        src={url}
        alt={chainName}
        className={`${sizeClasses[size]} rounded-full object-contain border-2 border-white shadow-sm`}
        style={{ background: "#fff" }}
        width={20}
        height={20}
        unoptimized
      />
    );
  }
  return (
    <div
      className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-semibold text-gray-500 border-2 border-white`}
    >
      {chainName.charAt(0)}
    </div>
  );
}

export const AssetDropdown: React.FC<{
  type: "from" | "to";
  selectedAsset: AssetOption | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (asset: AssetOption) => void;
}> = ({ type, selectedAsset, isOpen, onToggle, onSelect }) => {
  const [search, setSearch] = useState<string>("");
  const { assets, fromAsset, toAsset } = useAssetsStore();

  const filteredAssets = useMemo(() => {
    let list = (type === "from"
      ? assets.filter((asset) => !toAsset || asset.value !== toAsset.value)
      : assets.filter((asset) => !fromAsset || asset.value !== fromAsset.value)
    ).filter((asset) => {
      const s = search.trim().toLowerCase();
      return (
        !s ||
        asset.asset.symbol.toLowerCase().includes(s) ||
        asset.asset.name.toLowerCase().includes(s) ||
        asset.chainName.toLowerCase().includes(s)
      );
    });
    return list;
  }, [type, assets, fromAsset, toAsset, search]);

  // ref for modal background to allow escape and background close
  const overlayRef = useRef<HTMLDivElement>(null);

  // Escape & click outside to close
  useEffect(() => {
    if (!isOpen) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onToggle();
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onToggle]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    // @ts-ignore
    if (e.target === overlayRef.current) onToggle();
  }, [onToggle]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "";
      };
    }
  }, [isOpen]);

  return (
    <div className="w-full">
      {/* Minimal dropdown button */}
      <button
        onClick={onToggle}
        className={`flex items-center gap-3 transition-all duration-200 rounded-xl cursor-pointer
          ${isOpen ? "scale-[0.98]" : "hover:scale-[1.02]"}
        `}
      >
        {selectedAsset ? (
          <>
            <div className="relative">
              {getAssetLogo(selectedAsset.asset.symbol, "lg")}
              <span className="absolute -bottom-1 -right-1">
                {getChainLogo(selectedAsset.chainName, "sm")}
              </span>
            </div>
            <div className="flex flex-col justify-center">
              <span className="font-semibold text-gray-900 text-lg tracking-tight">
                {selectedAsset.asset.symbol}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {selectedAsset.chainName}
              </span>
            </div>
          </>
        ) : (
          <span className="text-gray-400 text-lg font-medium">
            Select asset
          </span>
        )}
      </button>

      {/* Modal with blur animations */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={overlayRef}
            key="overlay"
            initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
            animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
            exit={{ opacity: 0, backdropFilter: "blur(0px)" }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 cursor-pointer"
            onClick={handleOverlayClick}
          >
            <motion.div
              key="modal"
              initial={{ opacity: 0, scale: 0.95, y: 30, filter: "blur(8px)" }}
              animate={{ opacity: 1, scale: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, scale: 0.95, y: 20, filter: "blur(8px)" }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="relative w-full max-w-xl mx-auto rounded-2xl bg-white backdrop-blur-2xl shadow-2xl border border-white/30 flex flex-col overflow-hidden cursor-default"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/20 backdrop-blur-md bg-white">
                <h2 className="text-lg font-semibold text-gray-900">
                  Choose Asset
                </h2>
                <button
                  onClick={onToggle}
                  className="p-2 rounded-full hover:bg-gray-100 transition cursor-pointer"
                >
                  <svg
                    className="w-5 h-5 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>

              {/* Search */}
              <div className="relative px-6 py-4 border-b border-white/20 bg-white">
                <input
                  type="text"
                  placeholder="Search assets or networks..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full py-3 px-4 rounded-xl bg-gray-100 text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-violet-400 focus:outline-none"
                  autoFocus
                />
                <span className="absolute right-10 top-6 text-gray-400 pointer-events-none">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    viewBox="0 0 24 24"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <path d="M21 21l-4.35-4.35" strokeLinecap="round" />
                  </svg>
                </span>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-2 py-3 custom-scroll bg-white">
                {filteredAssets.length === 0 ? (
                  <div className="h-48 flex items-center justify-center text-gray-400 text-sm font-medium">
                    Nothing found
                  </div>
                ) : (
                  <ul className="w-full flex flex-col gap-1">
                    {filteredAssets.map((asset) => {
                      const isSelected =
                        selectedAsset && selectedAsset.value === asset.value;
                      return (
                        <li key={asset.value}>
                          <button
                            onClick={() => {
                              onSelect(asset);
                              setSearch("");
                              onToggle();
                            }}
                            className={`group w-full flex items-center gap-3 px-5 py-3 rounded-xl transition-all duration-200 cursor-pointer
                              ${
                                isSelected
                                  ? "bg-violet-100/70 border border-violet-300 shadow-sm"
                                  : "hover:bg-gray-100 border border-transparent"
                              }
                            `}
                          >
                            <div className="relative">
                              {getAssetLogo(asset.asset.symbol, "md")}
                              <span className="absolute -bottom-1 -right-1">
                                {getChainLogo(asset.chainName, "xs")}
                              </span>
                            </div>
                            <div className="flex flex-col text-left">
                              <span
                                className={`font-semibold text-gray-900 ${
                                  isSelected ? "text-violet-700" : ""
                                }`}
                              >
                                {asset.asset.symbol}
                              </span>
                              <span className="text-xs text-gray-500">
                                {asset.asset.name}
                              </span>
                              <span className="text-[11px] text-violet-500 font-medium">
                                {asset.chainName}
                              </span>
                            </div>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        .custom-scroll::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: rgba(124, 58, 237, 0.2);
          border-radius: 20px;
        }
      `}</style>
    </div>
  );
};
