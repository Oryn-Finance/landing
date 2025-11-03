"use client";

import { type AssetOption } from "../store/assetsStore";
import { AssetSelectorModal } from "./AssetSelectorModal";
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
      <Image
        src={url.trim()}
        alt={chainName}
        className={`${sizeClasses[size]} rounded-full object-contain border-2 border-white`}
        style={{ background: "#fff" }}
        width={32}
        height={32}
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
  return (
    <>
      <button
        onClick={onToggle}
        className="flex items-center justify-between gap-2 px-0 py-2 bg-transparent border-0 hover:opacity-80 focus:outline-none transition-opacity cursor-pointer"
      >
        <div className="flex items-center gap-2 md:gap-3 h-12 overflow-hidden">
          {selectedAsset ? (
            <>
              <div className="relative flex items-center shrink-0">
                {getAssetLogo(selectedAsset.asset.symbol, "lg")}
                <div className="absolute -bottom-1 -right-1">
                  {getChainLogo(selectedAsset.chainName, "sm")}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white text-base md:text-lg leading-tight truncate">
                  {selectedAsset.asset.symbol}
                </span>
              </div>
            </>
          ) : (
            <span
              className="relative inline-block font-medium text-base md:text-lg p-2 md:p-[6px] group/select"
              onMouseEnter={(e) => {
                const gradientText = (
                  e.currentTarget as HTMLElement
                ).querySelector(".gradient-text") as HTMLElement;
                if (gradientText) {
                  gradientText.style.clipPath =
                    "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
                }
              }}
              onMouseLeave={(e) => {
                const gradientText = (
                  e.currentTarget as HTMLElement
                ).querySelector(".gradient-text") as HTMLElement;
                if (gradientText) {
                  gradientText.style.clipPath =
                    "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)";
                }
              }}
            >
              <span className="relative z-10 text-gray-400">Select asset</span>
              <span
                className="absolute inset-0 p-2 md:p-[6px] gradient-text"
                style={{
                  clipPath: "polygon(0% 0%, 0% 0%, 0% 0%, 0% 0%)",
                  transition: "clip-path 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
                  background:
                    "linear-gradient(to bottom right, #9333ea, #3b82f6, #9333ea)",
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
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 shrink-0 ${
            isOpen ? "rotate-180" : ""
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

      <AssetSelectorModal
        isOpen={isOpen}
        onClose={onToggle}
        type={type}
        selectedAsset={selectedAsset}
        onSelect={onSelect}
      />
    </>
  );
};
