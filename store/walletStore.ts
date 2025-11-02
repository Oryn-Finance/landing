import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WalletType = "evm" | "btc" | null;

export type EVMWalletData = {
  address: string;
  chainId: number;
  isConnected: boolean;
};

export type BTCWalletData = {
  address: string;
  isConnected: boolean;
};

interface WalletState {
  evmWallet: EVMWalletData | null;
  btcWallet: BTCWalletData | null;

  // Actions
  setEVMWallet: (wallet: EVMWalletData | null) => void;
  setBTCWallet: (wallet: BTCWalletData | null) => void;
  disconnectEVM: () => void;
  disconnectBTC: () => void;
  disconnectAll: () => void;
}

export const useWalletStore = create<WalletState>()(
  persist(
    (set) => ({
      evmWallet: null,
      btcWallet: null,

      setEVMWallet: (wallet) => set({ evmWallet: wallet }),
      setBTCWallet: (wallet) => set({ btcWallet: wallet }),
      disconnectEVM: () => set({ evmWallet: null }),
      disconnectBTC: () => set({ btcWallet: null }),
      disconnectAll: () => set({ evmWallet: null, btcWallet: null }),
    }),
    {
      name: "wallet-store",
      partialize: (state) => ({
        evmWallet: state.evmWallet,
        btcWallet: state.btcWallet,
      }),
    }
  )
);

