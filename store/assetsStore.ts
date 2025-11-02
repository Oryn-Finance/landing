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
  sendValue: string;
  receiveAmount: string;
  receiveValue: string;
  quote: QuoteResponse | null;
  isLoading: boolean;
  isQuoteLoading: boolean;
  error: string | null;
  quoteDebounceTimer: NodeJS.Timeout | null;
  showHero: boolean;

  fetchAssets: () => Promise<void>;
  setFromAsset: (asset: AssetOption | null) => void;
  setToAsset: (asset: AssetOption | null) => void;
  setsendValue: (amount: string) => void;
  swapAssets: () => void;
  getQuote: () => Promise<void>;
  debouncedGetQuote: () => void;
  clearError: () => void;
  setShowHero: (show: boolean) => void;
  resetSwapState: () => void;
}

function getAssetKeyFromSymbol(symbol: string): string {
  const map: Record<string, string> = {
    btc: "bitcoin",
    avax: "avax",
    usdc: "usdc",
    wbtc: "wbtc",
  };
  return map[symbol.toLowerCase()] || symbol.toLowerCase();
}

function buildBackendAssetValue(chainId: string, asset: Asset): string {
  const mappedChainId = chainId;
  const assetKey = getAssetKeyFromSymbol(asset.symbol);
  return `${mappedChainId}:${assetKey}`;
}

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
      receiveAmount: "",
      sendValue: "",
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

          const baseUrl = API_URLS.QUOTE.endsWith("/")
            ? API_URLS.QUOTE.slice(0, -1)
            : API_URLS.QUOTE;
          const url = `${baseUrl}/chains`;

          const response = await axios.get(url, {
            timeout: 10000,
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
                value: `${chain.id}:${asset.symbol}`,
              });
            });
          });
          set({ assets: flatOptions, isLoading: false });
        } catch (error) {
          console.error("Failed to fetch assets:", error);

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
        const { toAsset, sendValue } = get();
        if (asset && toAsset && sendValue && parseFloat(sendValue) > 0) {
          get().debouncedGetQuote();
        }
      },

      setToAsset: (asset) => {
        set({ toAsset: asset });
        const { fromAsset, sendValue } = get();
        if (fromAsset && asset && sendValue && parseFloat(sendValue) > 0) {
          get().debouncedGetQuote();
        }
      },

      setsendValue: (amount) => {
        if (amount === "" || amount === "0." || amount === ".") {
          const finalValue = amount === "." ? "0." : amount;
          set({ sendValue: finalValue });
          if (amount === "" || amount === "0.") {
            set({
              quote: null,
              receiveAmount: "",
              receiveValue: "",
            });
          }
          return;
        }

        const numAmount = parseFloat(amount);
        if (!isNaN(numAmount) && numAmount >= 0) {
          set({ sendValue: amount });
          const { fromAsset, toAsset } = get();
          if (fromAsset && toAsset && amount && numAmount > 0) {
            get().debouncedGetQuote();
          } else if (numAmount === 0) {
            set({
              quote: null,
              receiveAmount: "",
              receiveValue: "",
            });
          }
        }
      },

      swapAssets: () => {
        const { fromAsset, toAsset, sendValue } = get();
        set({
          fromAsset: toAsset,
          toAsset: fromAsset,
          sendValue: get().receiveAmount,
          receiveAmount: get().sendValue,
          receiveValue: sendValue,
          quote: null,
        });
        if (toAsset && sendValue && parseFloat(sendValue) > 0) {
          get().debouncedGetQuote();
        }
      },

      debouncedGetQuote: debounce(async () => {
        const { fromAsset, toAsset, sendValue } = get();

        if (!fromAsset || !toAsset || !sendValue) {
          set({
            quote: null,
            sendValue: "",
            receiveValue: "",
            isQuoteLoading: false,
          });
          return;
        }

        const numAmount = parseFloat(sendValue);
        if (numAmount <= 0 || isNaN(numAmount)) {
          set({
            quote: null,
            receiveAmount: "",
            receiveValue: "",
            isQuoteLoading: false,
          });
          return;
        }

        try {
          set({ isQuoteLoading: true, error: null });

          const formattedAmount = BigInt(
            numAmount * Math.pow(10, fromAsset.asset.decimals)
          ).toString();

          const fromParam = buildBackendAssetValue(
            fromAsset.chainId,
            fromAsset.asset
          );
          const toParam = buildBackendAssetValue(
            toAsset.chainId,
            toAsset.asset
          );

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
            const quoteResult = response.data.result[0];
            const { sendValue: currentSendValue } = get();
            set({
              quote: response.data,
              receiveAmount: quoteResult.destination.display,
              sendValue: currentSendValue,
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

          const mockReceiveAmount = "";
          const mockReceiveValue = "";
          const { sendValue: currentSendValue } = get();
          set({
            error: "Using demo quote (API unavailable)",
            receiveAmount: mockReceiveAmount,
            sendValue: currentSendValue,
            receiveValue: mockReceiveValue,
            isQuoteLoading: false,
            quote: null,
          });
        }
      }, 500),

      getQuote: async () => {
        const { fromAsset, toAsset, sendValue } = get();

        if (!fromAsset || !toAsset || !sendValue) {
          set({
            quote: null,
            sendValue: "",
            receiveValue: "",
            isQuoteLoading: false,
          });
          return;
        }

        const numAmount = parseFloat(sendValue);
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

          const fromParam = buildBackendAssetValue(
            fromAsset.chainId,
            fromAsset.asset
          );
          const toParam = buildBackendAssetValue(
            toAsset.chainId,
            toAsset.asset
          );

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
            const quoteResult = response.data.result[0];
            const { sendValue: currentSendValue } = get();
            set({
              quote: response.data,
              receiveAmount: quoteResult.destination.display,
              sendValue: currentSendValue,
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

          const mockReceiveAmount = (parseFloat(sendValue) * 114989).toFixed(2);
          const mockReceiveValue = (parseFloat(sendValue) * 111116.62).toFixed(
            2
          );
          const mockSendValue = (parseFloat(sendValue) * 111116.62).toFixed(2);
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
