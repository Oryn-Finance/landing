"use client";

import { useRef } from "react";
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
    "	https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
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
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  if (url) {
    return (
      <Image
        src={url}
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
      className={`${sizeClasses[size]} bg-gray-200 rounded-full flex items-center justify-center text-xs font-medium`}
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
      <img
        src={url}
        alt={chainName}
        className={`${sizeClasses[size]} rounded-full object-contain border-2 border-white`}
        style={{ background: "#fff" }}
      />
    );
  }
  return (
    <div
      className={`${sizeClasses[size]} bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-500 border-2 border-white`}
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
  const dropdownRef = useRef<HTMLDivElement>(null);

  const { assets, fromAsset, toAsset } = useAssetsStore();

  const getFilteredAssets = (assetType: "from" | "to") => {
    if (assetType === "from") {
      return assets.filter(
        (asset) => !toAsset || asset.value !== toAsset.value
      );
    } else {
      return assets.filter(
        (asset) => !fromAsset || asset.value !== fromAsset.value
      );
    }
  };

  return (
    <div className="relative w-fit" ref={dropdownRef}>
      <button
        onClick={onToggle}
        className="flex items-center justify-between gap-2 px-0 py-2 bg-transparent border-0 hover:opacity-80 focus:outline-none transition-opacity cursor-pointer"
      >
        <div className="flex items-center gap-2 md:gap-3 h-12 overflow-hidden">
          {selectedAsset ? (
            <>
              <div className="relative flex items-center flex-shrink-0">
                {getAssetLogo(selectedAsset.asset.symbol, "lg")}
                <div className="absolute -bottom-1 -right-1">
                  {getChainLogo(selectedAsset.chainName, "sm")}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-gray-900 text-base md:text-lg leading-tight truncate">
                  {selectedAsset.asset.symbol}
                </span>
              </div>
            </>
          ) : (
            <span
              className="relative inline-block font-medium text-base md:text-lg p-2 md:p-[6px] group/select"
              onMouseEnter={(e) => {
                const gradientText = (e.currentTarget as HTMLElement).querySelector('.gradient-text') as HTMLElement;
                if (gradientText) {
                  // Reveal diagonally from top-left corner expanding to bottom-right
                  gradientText.style.clipPath = "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
                }
              }}
              onMouseLeave={(e) => {
                const gradientText = (e.currentTarget as HTMLElement).querySelector('.gradient-text') as HTMLElement;
                if (gradientText) {
                  // Hide diagonally collapsing from bottom-right corner to top-left
                  gradientText.style.clipPath = "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)";
                }
              }}
            >
              <span className="relative z-10 text-gray-400">Select asset</span>
              <span
                className="absolute inset-0 p-2 md:p-[6px] gradient-text"
                style={{
                  // Start as a tiny triangle at top-left corner (0% revealed)
                  clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
                  transition: "clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  background: "linear-gradient(to bottom right, #4c1d95, #1e1b4b, #4c1d95)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Select asset
              </span>
            </span>
          )}
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 flex-shrink-0 ${isOpen ? "rotate-180" : ""
            }`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            className="absolute z-20 w-fit min-w-64 max-w-80 mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-72 overflow-y-auto left-0"
          >
            {getFilteredAssets(type).length === 0 ? (
              <div className="p-6 text-center text-gray-400 text-base font-medium">
                <span className="inline-flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-gray-300"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <circle cx="12" cy="12" r="10" strokeWidth="2" />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M12 8v4m0 4h.01"
                    />
                  </svg>
                  No assets available
                </span>
              </div>
            ) : (
              <div className="flex w-full items-center justify-between flex-col gap-2 p-2">
                {getFilteredAssets(type).map((asset) => {
                  const isSelected =
                    selectedAsset && selectedAsset.value === asset.value;
                  return (
                    <button
                      key={asset.value}
                      onClick={() => onSelect(asset)}
                      className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-150 group
                        ${
                          isSelected
                            ? "bg-[#e84142]/5 border-2 border-[#e84142]/70 shadow"
                            : "hover:bg-gray-50 border border-transparent"
                        } focus:outline-none`}
                    >
                      <div className="flex items-center w-full gap-3">
                        {/* Asset logo (bigger) with chain logo (smaller) as badge */}
                        <div className="relative flex items-center flex-shrink-0">
                          {getAssetLogo(asset.asset.symbol, "lg")}
                          <div className="absolute -bottom-1 -right-1">
                            {getChainLogo(asset.chainName, "sm")}
                          </div>
                        </div>
                        {/* Asset symbol and name */}
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="font-semibold text-gray-900 text-base leading-tight truncate">
                            {asset.asset.symbol}
                          </span>
                          <span className="text-xs text-gray-500 font-medium truncate">
                            {asset.asset.name}
                          </span>
                        </div>
                        {/* Selected checkmark */}
                        {isSelected && (
                          <span className="ml-auto flex items-center flex-shrink-0">
                            <svg
                              className="w-5 h-5 text-[#e84142]"
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
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
