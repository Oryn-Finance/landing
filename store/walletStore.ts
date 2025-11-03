import { DigestKey } from "@/utils/digestKey";
import { create } from "zustand";
import { persist } from "zustand/middleware";

export type WalletType = "evm" | "btc" | "starknet" | null;

export type EVMWalletData = {
  address: string;
  chainId: number;
  isConnected: boolean;
};

export type BTCWalletData = {
  address: string;
  isConnected: boolean;
};

export type StarknetWalletData = {
  address: string;
  isConnected: boolean;
};

interface WalletState {
  evmWallet: EVMWalletData | null;
  btcWallet: BTCWalletData | null;
  starknetWallet: StarknetWalletData | null;

  // Actions
  setEVMWallet: (wallet: EVMWalletData | null) => void;
  setBTCWallet: (wallet: BTCWalletData | null) => void;
  setStarknetWallet: (wallet: StarknetWalletData | null) => void;
  disconnectEVM: () => void;
  disconnectBTC: () => void;
  disconnectStarknet: () => void;
  disconnectAll: () => void;

  digestKey: string | null;
  setDigestKey: (key: string | null) => void;
  getDigestKey: () => string;

}

export const useWalletStore = create<WalletState>()(
  persist(
    (set, get) => ({
      evmWallet: null,
      btcWallet: null,
      starknetWallet: null,

      setEVMWallet: (wallet) => set({ evmWallet: wallet }),
      setBTCWallet: (wallet) => set({ btcWallet: wallet }),
      setStarknetWallet: (wallet) => set({ starknetWallet: wallet }),
      disconnectEVM: () => set({ evmWallet: null }),
      disconnectBTC: () => set({ btcWallet: null }),
      disconnectStarknet: () => set({ starknetWallet: null }),
      disconnectAll: () => set({ evmWallet: null, btcWallet: null, starknetWallet: null }),
      digestKey: null,
      setDigestKey: (key) =>
        set(() => ({
          digestKey: key,
        })),
      getDigestKey: () => {
        const state = get();
        if (state.digestKey) {
          return state.digestKey;
        }
        const newKey = DigestKey.getDigestKey();
        set({ digestKey: newKey });
        return newKey;
      },
    }),
    {
      name: "wallet-store",
      partialize: (state) => ({
        evmWallet: state.evmWallet,
        btcWallet: state.btcWallet,
        starknetWallet: state.starknetWallet,
      }),
    }
  )
);

