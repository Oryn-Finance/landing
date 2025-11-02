import { create } from "zustand";
import { persist } from "zustand/middleware";
import axios from "axios";
import { API_URLS } from "../constants/constants";

export type Asset = {
  symbol: string;
  name: string;
  decimals: number;
  cmcId: number;
};

export type Chain = {
  id: string;
  name: string;
  rpcUrl?: string;
  assets: Asset[];
};

export type AssetOption = {
  chainId: string;
  chainName: string;
  asset: Asset;
  value: string;
};

export type QuoteLeg = {
  asset: string;
  amount: string;
  display: string;
  value: string;
};

export type QuoteResult = {
  source: QuoteLeg;
  destination: QuoteLeg;
  feeBips?: number;
};

export type QuoteResponse = {
  status: string;
  result: QuoteResult[];
};

interface AssetsState {
  assets: AssetOption[];
  fromAsset: AssetOption | null;
  toAsset: AssetOption | null;
  sendAmount: string;
  sendValue: string;
  receiveAmount: string;
  receiveValue: string;
  quote: QuoteResponse | null;
  isLoading: boolean;
  isQuoteLoading: boolean;
  error: string | null;
  quoteDebounceTimer: NodeJS.Timeout | null;
  showHero: boolean;

  // Actions
  fetchAssets: () => Promise<void>;
  setFromAsset: (asset: AssetOption | null) => void;
  setToAsset: (asset: AssetOption | null) => void;
  setSendAmount: (amount: string) => void;
  swapAssets: () => void;
  getQuote: () => Promise<void>;
  debouncedGetQuote: () => void;
  clearError: () => void;
  setShowHero: (show: boolean) => void;
  resetSwapState: () => void;
}

// Helper to get the canonical asset key for backend (e.g., 'bitcoin' for BTC, 'avax' for AVAX, etc.)
function getAssetKeyFromSymbol(symbol: string): string {
  // Add mappings as needed
  const map: Record<string, string> = {
    btc: "bitcoin",
    avax: "avax",
    usdc: "usdc",
    wbtc: "wbtc",
  };
  return map[symbol.toLowerCase()] || symbol.toLowerCase();
}

// Helper to map chain ID to backend format
function mapChainIdToBackendFormat(chainId: string): string {
  const chainIdLower = chainId.toLowerCase().trim();

  // If already in correct format, return as-is
  if (chainIdLower === "bitcoin_testnet") {
    return "bitcoin_testnet";
  }

  if (chainIdLower === "arbitrum_sepolia") {
    return "arbitrum_sepolia";
  }

  // Map Bitcoin chain IDs to bitcoin_testnet
  if (chainIdLower === "bitcoin" || chainIdLower.includes("bitcoin testnet")) {
    return "bitcoin_testnet";
  }

  // Map Arbitrum Sepolia variations
  if (chainIdLower.includes("arbitrum") && chainIdLower.includes("sepolia")) {
    return "arbitrum_sepolia";
  }

  // Return as-is for other chains
  return chainId;
}

// Helper to build the correct value for backend param (chainId:assetKey)
function buildBackendAssetValue(chainId: string, asset: Asset): string {
  const mappedChainId = mapChainIdToBackendFormat(chainId);
  const assetKey = getAssetKeyFromSymbol(asset.symbol);
  return `${mappedChainId}:${assetKey}`;
}

// Debounce helper
function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

export const useAssetsStore = create<AssetsState>()(
  persist(
    (set, get) => ({
      assets: [],
      fromAsset: null,
      toAsset: null,
      sendAmount: "",
      sendValue: "",
      receiveAmount: "",
      receiveValue: "",
      quote: null,
      isLoading: false,
      isQuoteLoading: false,
      error: null,
      quoteDebounceTimer: null,
      showHero: false,
      fetchAssets: async () => {
        try {
          set({ isLoading: true, error: null });

          // Construct URL properly (handle trailing slash)
          const baseUrl = API_URLS.QUOTE.endsWith("/")
            ? API_URLS.QUOTE.slice(0, -1)
            : API_URLS.QUOTE;
          const url = `${baseUrl}/chains`;

          const response = await axios.get(url, {
            timeout: 10000, // 10 second timeout
            headers: {
              "Content-Type": "application/json",
            },
          });

          const chains: Chain[] = response.data.result;

          const flatOptions: AssetOption[] = [];
          chains.forEach((chain) => {
            chain.assets.forEach((asset) => {
              flatOptions.push({
                chainId: chain.id,
                chainName: chain.name,
                asset,
                // For dropdown, keep value as chainId:assetSymbol for display, but backend param will be built dynamically
                value: `${chain.id}:${asset.symbol}`,
              });
            });
          });
          set({ assets: flatOptions, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch assets:", error);

          // Provide fallback mock data for landing page demo
          const mockAssets: AssetOption[] = [
            {
              chainId: "bitcoin",
              chainName: "Bitcoin",
              asset: {
                symbol: "BTC",
                name: "Bitcoin",
                decimals: 8,
                cmcId: 1,
              },
              value: "bitcoin:BTC",
            },
            {
              chainId: "avalanche",
              chainName: "Avalanche",
              asset: {
                symbol: "USDC",
                name: "USD Coin",
                decimals: 6,
                cmcId: 3408,
              },
              value: "avalanche:USDC",
            },
            {
              chainId: "avalanche",
              chainName: "Avalanche",
              asset: {
                symbol: "AVAX",
                name: "Avalanche",
                decimals: 18,
                cmcId: 5805,
              },
              value: "avalanche:AVAX",
            },
          ];

          set({
            assets: mockAssets,
            error: "Using demo assets (API unavailable)",
            isLoading: false,
          });
        }
      },

      setFromAsset: (asset) => {
        set({ fromAsset: asset });
        // Auto-fetch quote if both assets are selected and amount is set
        const { toAsset, sendAmount } = get();
        if (asset && toAsset && sendAmount && parseFloat(sendAmount) > 0) {
          get().debouncedGetQuote();
        }
      },

      setToAsset: (asset) => {
        set({ toAsset: asset });
        // Auto-fetch quote if both assets are selected and amount is set
        const { fromAsset, sendAmount } = get();
        if (fromAsset && asset && sendAmount && parseFloat(sendAmount) > 0) {
          get().debouncedGetQuote();
        }
      },

      setSendAmount: (amount) => {
        // Allow empty string
        if (amount === "") {
          set({
            sendAmount: "",
            quote: null,
            receiveAmount: "",
            receiveValue: "",
            sendValue: "",
          });
          return;
        }

        // Allow "0." - user can continue typing decimals
        if (amount === "0.") {
          set({ sendAmount: "0." });
          return;
        }

        // Validate: must be a valid number format with max 6 decimal places
        // Allow: "0", "0.0", "0.00", "1", "1.123456", etc.
        const numericRegex = /^\d+(\.\d{0,6})?$/;
        if (!numericRegex.test(amount)) {
          // Invalid format, don't update (prevent glitches)
          return;
        }

        // Validate numeric input (allows decimals including "0.0", "0.00", etc.)
        const numAmount = parseFloat(amount);
        // Check if it's a valid number (including decimals) and not negative
        if (!isNaN(numAmount) && numAmount >= 0) {
          // Ensure decimal places don't exceed 6
          const parts = amount.split(".");
          let finalAmount = amount;
          if (parts.length === 2 && parts[1].length > 6) {
            finalAmount = parts[0] + "." + parts[1].substring(0, 6);
          }

          // Always set the amount (even if it's "0.0", "0.00", etc.)
          set({ sendAmount: finalAmount });

          // Auto-fetch quote if both assets are selected and amount is valid (greater than 0)
          const { fromAsset, toAsset } = get();
          if (fromAsset && toAsset && finalAmount && numAmount > 0) {
            get().debouncedGetQuote();
          } else {
            // Clear quote if amount is zero or invalid
            // But keep the amount itself so user can continue typing
            set({
              quote: null,
              receiveAmount: "",
              receiveValue: "",
              sendValue: "",
            });
          }
        }
      },

      swapAssets: () => {
        const { fromAsset, toAsset, sendAmount, sendValue, receiveValue } =
          get();
        set({
          fromAsset: toAsset,
          toAsset: fromAsset,
          sendAmount: get().receiveAmount,
          receiveAmount: sendAmount,
          sendValue: receiveValue,
          receiveValue: sendValue,
          quote: null,
        });
        // Auto-fetch quote for the new fromAsset (old toAsset) with current sendAmount
        const newAmount = get().sendAmount;
        if (toAsset && fromAsset && newAmount && parseFloat(newAmount) > 0) {
          // Use the swapped assets - toAsset is now the fromAsset
          get().debouncedGetQuote();
        }
      },

      debouncedGetQuote: debounce(async () => {
        const { fromAsset, toAsset, sendAmount } = get();

        if (!fromAsset || !toAsset || !sendAmount) {
          set({
            quote: null,
            sendValue: "",
            receiveValue: "",
            isQuoteLoading: false,
          });
          return;
        }

        const numAmount = parseFloat(sendAmount);
        if (numAmount <= 0 || isNaN(numAmount)) {
          set({
            quote: null,
            receiveAmount: "",
            sendValue: "",
            receiveValue: "",
            isQuoteLoading: false,
          });
          return;
        }

        try {
          set({ isQuoteLoading: true, error: null });

          // Format amount based on decimals
          const formattedAmount = BigInt(
            numAmount * Math.pow(10, fromAsset.asset.decimals)
          ).toString();

          // Build correct backend param for 'from' and 'to'
          const fromParam = buildBackendAssetValue(
            fromAsset.chainId,
            fromAsset.asset
          );
          const toParam = buildBackendAssetValue(
            toAsset.chainId,
            toAsset.asset
          );

          // Construct URL properly (handle trailing slash)
          const baseUrl = API_URLS.QUOTE.endsWith("/")
            ? API_URLS.QUOTE.slice(0, -1)
            : API_URLS.QUOTE;
          const url = `${baseUrl}/quote?from=${encodeURIComponent(
            fromParam
          )}&to=${encodeURIComponent(toParam)}&amount=${formattedAmount}`;

          const response = await axios.get<QuoteResponse>(url, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (
            response.data.status === "Ok" &&
            Array.isArray(response.data.result) &&
            response.data.result.length > 0
          ) {
            // Use the new quote response format
            const quoteResult = response.data.result[0];
            // Format receiveAmount to max 6 decimal places
            const receiveAmountNum = parseFloat(
              quoteResult.destination.display
            );
            const formattedReceiveAmount = isNaN(receiveAmountNum)
              ? quoteResult.destination.display
              : receiveAmountNum.toFixed(6).replace(/\.?0+$/, "");

            set({
              quote: response.data,
              receiveAmount: formattedReceiveAmount,
              sendValue: quoteResult.source.value,
              receiveValue: quoteResult.destination.value,
              isQuoteLoading: false,
            });
          } else {
            set({
              error: "Failed to get quote",
              isQuoteLoading: false,
              quote: null,
            });
          }
        } catch (error) {
          console.error("Failed to get quote:", error);

          // For landing page demo: provide mock quote if API fails
          // In production, you might want to just set an error state
          const mockReceiveAmount = "";
          const mockReceiveValue = "";
          const mockSendValue = (parseFloat(sendAmount) * 111116.62).toFixed(2);
          set({
            error: "Using demo quote (API unavailable)",
            receiveAmount: mockReceiveAmount,
            sendValue: mockSendValue,
            receiveValue: mockReceiveValue,
            isQuoteLoading: false,
            quote: null,
          });
        }
      }, 500), // 500ms debounce

      getQuote: async () => {
        const { fromAsset, toAsset, sendAmount } = get();

        if (!fromAsset || !toAsset || !sendAmount) {
          set({
            quote: null,
            sendValue: "",
            receiveValue: "",
            isQuoteLoading: false,
          });
          return;
        }

        const numAmount = parseFloat(sendAmount);
        if (numAmount <= 0 || isNaN(numAmount)) {
          set({
            quote: null,
            receiveAmount: "",
            sendValue: "",
            receiveValue: "",
            isQuoteLoading: false,
          });
          return;
        }

        try {
          set({ isQuoteLoading: true, error: null });

          // Format amount based on decimals
          const formattedAmount = (
            numAmount * Math.pow(10, fromAsset.asset.decimals)
          ).toString();

          // Build correct backend param for 'from' and 'to'
          const fromParam = buildBackendAssetValue(
            fromAsset.chainId,
            fromAsset.asset
          );
          const toParam = buildBackendAssetValue(
            toAsset.chainId,
            toAsset.asset
          );

          // Construct URL properly (handle trailing slash)
          const baseUrl = API_URLS.QUOTE.endsWith("/")
            ? API_URLS.QUOTE.slice(0, -1)
            : API_URLS.QUOTE;
          const url = `${baseUrl}/quote?from=${encodeURIComponent(
            fromParam
          )}&to=${encodeURIComponent(toParam)}&amount=${formattedAmount}`;

          const response = await axios.get<QuoteResponse>(url, {
            timeout: 10000,
            headers: {
              "Content-Type": "application/json",
            },
          });

          if (
            response.data.status === "Ok" &&
            Array.isArray(response.data.result) &&
            response.data.result.length > 0
          ) {
            // Use the new quote response format
            const quoteResult = response.data.result[0];
            // Format receiveAmount to max 6 decimal places
            const receiveAmountNum = parseFloat(
              quoteResult.destination.display
            );
            const formattedReceiveAmount = isNaN(receiveAmountNum)
              ? quoteResult.destination.display
              : receiveAmountNum.toFixed(6).replace(/\.?0+$/, "");

            set({
              quote: response.data,
              receiveAmount: formattedReceiveAmount,
              sendValue: quoteResult.source.value,
              receiveValue: quoteResult.destination.value,
              isQuoteLoading: false,
            });
          } else {
            set({
              error: "Failed to get quote",
              isQuoteLoading: false,
              quote: null,
            });
          }
        } catch (error) {
          console.error("Failed to get quote:", error);

          // For landing page demo: provide mock quote if API fails
          // In production, you might want to just set an error state
          const mockReceiveAmount = (parseFloat(sendAmount) * 114989).toFixed(
            2
          );
          const mockReceiveValue = (parseFloat(sendAmount) * 111116.62).toFixed(
            2
          );
          const mockSendValue = (parseFloat(sendAmount) * 111116.62).toFixed(2);
          set({
            error: "Using demo quote (API unavailable)",
            receiveAmount: mockReceiveAmount,
            sendValue: mockSendValue,
            receiveValue: mockReceiveValue,
            isQuoteLoading: false,
            quote: null,
          });
        }
      },

      setShowHero: (show: boolean) => set({ showHero: show }),

      clearError: () => set({ error: null }),

      resetSwapState: () =>
        set({
          fromAsset: null,
          toAsset: null,
          sendValue: "",
          receiveAmount: "",
          quote: null,
          error: null,
        }),
    }),
    {
      name: "assets-store",
      partialize: (state) => ({
        showHero: state.showHero,
      }),
    }
  )
);
