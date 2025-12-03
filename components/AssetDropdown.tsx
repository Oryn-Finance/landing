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
  zec: "https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png",
  zcash: "https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png",
};

const CHAIN_LOGOS: Record<string, string> = {
  "Arbitrum Sepolia":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
  "Avalanche Testnet":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  "Base Sepolia":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/27716.png",
  "Bitcoin Testnet":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  "Starknet Sepolia":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
  "Zcash Testnet":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png",
  Avalanche: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  Base: "https://s2.coinmarketcap.com/static/img/coins/64x64/27716.png",
  Bitcoin: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  Starknet: "https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
  Zcash: "https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png",
  Ethereum: "https://s2.coinmarketcap.com/static/img/coins/64x64/1027.png",
};

function getAssetLogo(symbol: string, size: "sm" | "md" | "lg" = "md") {
  const key = symbol.toLowerCase();
  let url: string | undefined;
  if (key === "btc" || key === "bitcoin") url = ASSET_LOGOS.bitcoin;
  else if (key === "usdc") url = ASSET_LOGOS.usdc;
  else if (key === "wbtc") url = ASSET_LOGOS.wbtc;
  else if (key === "avax") url = ASSET_LOGOS.avax;
  else if (key === "strk") url = ASSET_LOGOS.strk;
  else if (key === "zcash" || key === "zec") url = ASSET_LOGOS.zec;
  else if (key === "eth") url = CHAIN_LOGOS.Ethereum;
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
        src={url.trim()}
        alt={chainName}
        className={`${sizeClasses[size]} rounded-full object-contain border-2 border-white shadow-sm`}
        style={{ background: "#fff" }}
        width={32}
        height={32}
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
  return (
    <>
      <button
        onClick={onToggle}
        suppressHydrationWarning
        className={`flex items-center gap-3 transition-all duration-200 rounded-xl cursor-pointer
          ${isOpen ? "scale-[0.98]" : "hover:scale-[1.02]"}
        `}
      >
        <div className="flex items-center gap-2 md:gap-3 h-12 overflow-hidden">
          {selectedAsset ? (
            <>
              <div className="relative flex items-center shrink-0">
                {getAssetLogo(selectedAsset.asset.symbol, "md")}
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
              className="relative inline-block font-medium text-base md:text-lg  group/select"
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
            </span>
          )}
        </div>
        <Image src="/dropdown.svg" alt="Arrow Down" width={12} height={12} className="w-3 h-3 translate-y-[1px] " unoptimized />
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