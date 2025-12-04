import Image from "next/image";
import React from "react";

// Asset logo URLs
export const ASSET_LOGOS: Record<string, string> = {
  wbtc: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
  avax: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  usdc: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
  bitcoin: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  strk: "https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
  zec: "https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png",
  zcash: "https://s2.coinmarketcap.com/static/img/coins/64x64/1437.png",
};

// Chain logo URLs
export const CHAIN_LOGOS: Record<string, string> = {
  "Arbitrum Sepolia":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
  "Avalanche Testnet":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  "Base Sepolia": "https://s2.coinmarketcap.com/static/img/coins/64x64/27716.png",
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
  Polygon: "https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png",
  Arbitrum: "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
};

// Explorer URL mapping for different chains
export const EXPLORER_URLS: Record<string, (txHash: string) => string> = {
  arbitrum_sepolia: (txHash: string) =>
    `https://sepolia.arbiscan.io/tx/${txHash}`,
  avalanche_testnet: (txHash: string) =>
    `https://testnet.snowtrace.io/tx/${txHash}`,
  ethereum_sepolia: (txHash: string) =>
    `https://sepolia.etherscan.io/tx/${txHash}`,
  base_sepolia: (txHash: string) => `https://sepolia.basescan.org/tx/${txHash}`,
};

/**
 * Get explorer URL for a transaction hash based on asset
 */
export function getExplorerUrl(asset: string, txHash: string): string | null {
  const chainName = asset.split(":")[0];
  const explorerFn = EXPLORER_URLS[chainName];
  if (explorerFn) {
    return explorerFn(txHash);
  }
  return null;
}

/**
 * Get asset logo URL by symbol
 */
export function getAssetLogoUrl(symbol: string): string | undefined {
  const key = symbol.toLowerCase();
  if (key === "btc" || key === "bitcoin") return ASSET_LOGOS.bitcoin;
  if (key === "usdc") return ASSET_LOGOS.usdc;
  if (key === "wbtc") return ASSET_LOGOS.wbtc;
  if (key === "avax") return ASSET_LOGOS.avax;
  if (key === "strk") return ASSET_LOGOS.strk;
  if (key === "zcash" || key === "zec") return ASSET_LOGOS.zec;
  if (key === "eth") return CHAIN_LOGOS.Ethereum;
  return undefined;
}

/**
 * Get asset logo component
 */
export function getAssetLogo(
  symbol: string,
  size: "sm" | "md" | "lg" = "md"
): React.ReactNode {
  const url = getAssetLogoUrl(symbol);
  const sizeClasses = {
    sm: "w-5 h-5 md:w-6 md:h-6",
    md: "w-8 h-8 md:w-10 md:h-10",
    lg: "w-10 h-10 md:w-14 md:h-14",
  };

  if (url) {
    return (
      <Image
        src={url.trim()}
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

/**
 * Get chain logo component
 */
export function getChainLogo(
  chainName: string,
  size: "sm" | "xs" | "md" | "lg" = "sm"
): React.ReactNode {
  const url = CHAIN_LOGOS[chainName];
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5 md:w-6 md:h-6",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  if (url) {
    const borderClass =
      size === "md" || size === "lg"
        ? "border-2 border-white/20"
        : "border-2 border-white";
    return (
      <Image
        src={url.trim()}
        alt={chainName}
        className={`${sizeClasses[size]} rounded-full object-contain ${borderClass} shadow-sm`}
        style={{ background: "#fff" }}
        width={size === "lg" ? 48 : 32}
        height={size === "lg" ? 48 : 32}
        unoptimized
      />
    );
  }
  const fontSize =
    size === "lg"
      ? "text-xs"
      : size === "md"
      ? "text-xs"
      : size === "sm"
      ? "text-[10px]"
      : "text-[10px]";
  return (
    <div
      className={`${sizeClasses[size]} bg-gray-700 rounded-full flex items-center justify-center ${fontSize} font-medium text-gray-300 border-2 ${
        size === "md" || size === "lg" ? "border-gray-600" : "border-white"
      }`}
    >
      {chainName.charAt(0)}
    </div>
  );
}

/**
 * Parse asset string to get chain and symbol
 */
export function getAssetInfo(assetString: string): {
  chain: string;
  symbol: string;
} {
  const parts = assetString.split(":");
  if (parts.length >= 2) {
    const chain = parts[0]
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const symbol = parts[1].toUpperCase();
    return { chain, symbol };
  }
  return { chain: "Unknown", symbol: assetString.toUpperCase() };
}

/**
 * Get asset decimals by symbol
 */
export function getAssetDecimals(assetString: string): number {
  const parts = assetString.split(":");
  const symbol = parts[1]?.toLowerCase() || "";

  // Common decimals by symbol
  const decimalsMap: Record<string, number> = {
    btc: 8,
    bitcoin: 8,
    eth: 18,
    ethereum: 18,
    avax: 18,
    usdc: 6,
    usdt: 6,
    wbtc: 8,
    strk: 18,
    zec: 8,
    zcash: 8,
  };

  return decimalsMap[symbol] || 8;
}

/**
 * Format amount from smallest unit to human-readable format
 */
export function formatAmount(amount: string, assetString?: string): string {
  const decimals = assetString ? getAssetDecimals(assetString) : 8;
  const num = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const remainder = num % divisor;
  if (remainder === BigInt(0)) {
    return whole.toString();
  }
  const decimalStr = remainder.toString().padStart(decimals, "0");
  let trimmed = decimalStr.replace(/0+$/, "");
  if (trimmed.length > 4) {
    trimmed = trimmed.substring(0, 4) + "...";
  }
  return `${whole}.${trimmed}`;
}

/**
 * Format amount for display in orders sidebar (handles both string and number)
 */
export function formatAmountForDisplay(
  amount: string | number,
  assetValue: string = ""
): string {
  // Handle both string and number amounts
  const num = typeof amount === "string" ? parseFloat(amount) : amount;

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
}

/**
 * Get asset symbol from asset value string
 */
export function getAssetSymbol(assetValue: string): string {
  const parts = assetValue.split(":");
  if (parts.length > 1) {
    return parts[1].toUpperCase();
  }
  return assetValue.toUpperCase();
}

