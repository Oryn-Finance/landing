"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { useWalletStore } from "../store/walletStore";
import { Wallet, Plus, X, User } from "lucide-react";
import { ConnectWalletModal } from "./ConnectWalletModal";
import Image from "next/image";

interface ConnectWalletButtonProps {
  onOrdersClick?: () => void;
  onWalletsClick?: () => void;
}

export function ConnectWalletButton({
  onOrdersClick,
  onWalletsClick,
}: ConnectWalletButtonProps = {}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingEVM, setLoadingEVM] = useState(false);
  const [loadingStarknet, setLoadingStarknet] = useState(false);

  const { address, isConnected, chainId } = useAccount();
  const { disconnect } = useDisconnect();
  const { connect } = useConnect();
  const {
    evmWallet,
    starknetWallet,
    setEVMWallet,
    setStarknetWallet,
    disconnectEVM,
  } = useWalletStore();

  // Sync wagmi state with our store
  useEffect(() => {
    if (isConnected && address) {
      setEVMWallet({
        address,
        chainId: chainId || 0,
        isConnected: true,
      });
    } else if (!isConnected) {
      disconnectEVM();
    }
  }, [isConnected, address, chainId, setEVMWallet, disconnectEVM]);

  const handleEVMConnect = async (connector: any) => {
    setLoadingEVM(true);
    try {
      connect({ connector });
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to connect EVM wallet:", error);
    } finally {
      setLoadingEVM(false);
    }
  };

  const handleStarknetConnect = async (wallet: any) => {
    setLoadingStarknet(true);
    try {
      if (typeof window !== "undefined") {
        if (
          wallet.id === "argent-x" &&
          typeof (window as any).starknet !== "undefined"
        ) {
          const starknet = (window as any).starknet;
          if (starknet.isArgentX) {
            await starknet.enable();
            if (starknet.account && starknet.account.address) {
              setStarknetWallet({
                address: starknet.account.address,
                isConnected: true,
              });
              setModalOpen(false);
            }
          }
        } else if (
          wallet.id === "braavos" &&
          typeof (window as any).starknet !== "undefined"
        ) {
          const starknet = (window as any).starknet;
          if (starknet.isBraavos) {
            await starknet.enable();
            if (starknet.account && starknet.account.address) {
              setStarknetWallet({
                address: starknet.account.address,
                isConnected: true,
              });
              setModalOpen(false);
            }
          }
        } else if (
          wallet.id === "starknet" &&
          typeof (window as any).starknet !== "undefined"
        ) {
          const starknet = (window as any).starknet;
          await starknet.enable();
          if (starknet.account && starknet.account.address) {
            setStarknetWallet({
              address: starknet.account.address,
              isConnected: true,
            });
            setModalOpen(false);
          }
        }
      }
    } catch (error) {
      console.error("Failed to connect Starknet wallet:", error);
    } finally {
      setLoadingStarknet(false);
    }
  };

  const isAnyWalletConnected =
    (isConnected && evmWallet) || starknetWallet?.isConnected;

  const handleCloseModal = () => {
    setModalOpen(false);
    setLoadingEVM(false);
    setLoadingStarknet(false);
  };

  const formatAddress = (addr: string) => {
    if (!addr) return "";
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
  };

  const handleDisconnect = () => {
    if (isConnected) {
      disconnect();
      disconnectEVM();
    }
    if (starknetWallet?.isConnected) {
      setStarknetWallet({ address: "", isConnected: false });
    }
  };

  return (
    <>
      <div className="flex items-center gap-1 md:gap-2 flex-wrap">
        {isAnyWalletConnected ? (
          <>
            {/* Mobile: Wallet button and User profile button */}
            <div className="md:hidden flex items-center gap-1.5">
              <motion.button
                onClick={() => onWalletsClick?.()}
                className="w-7 h-7 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer border border-purple-500/30"
                title="View connected wallets"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Wallet className="w-3.5 h-3.5" />
              </motion.button>
              <motion.button
                onClick={() => onOrdersClick?.()}
                className="w-7 h-7 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                title="View orders"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <User className="w-3.5 h-3.5" />
              </motion.button>
            </div>

            {/* Desktop: Separate Wallet Status Badges */}
            <div className="hidden md:flex items-center gap-1.5 flex-wrap">
              {/* EVM Wallet Badge */}
              {isConnected && evmWallet?.isConnected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white/5 backdrop-blur-sm border border-blue-500/20 rounded-lg text-xs font-medium text-blue-300/90"
                >
                  <Image
                    src="https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png"
                    alt="evm"
                    width={14}
                    height={14}
                    className="rounded-full"
                  />
                  <span className="font-mono">
                    {formatAddress(evmWallet.address)}
                  </span>
                </motion.div>
              )}

              {/* Starknet Wallet Badge */}
              {starknetWallet?.isConnected && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-1.5 px-2 py-1 bg-white/5 backdrop-blur-sm border border-purple-500/20 rounded-lg text-xs font-medium text-purple-300/90"
                >
                  <Image
                    src="https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png"
                    alt="starknet"
                    width={14}
                    height={14}
                    className="rounded-full"
                  />
                  <span className="font-mono">
                    {formatAddress(starknetWallet.address)}
                  </span>
                </motion.div>
              )}
            </div>

            {/* Action Buttons - Desktop only */}
            <div className="hidden md:flex items-center gap-1.5">
              {/* Only show Add Wallet button if not all wallets connected */}
              {!(
                isConnected &&
                evmWallet?.isConnected &&
                starknetWallet?.isConnected
              ) && (
                <motion.button
                  onClick={() => setModalOpen(true)}
                  className="w-7 h-7 bg-purple-600/80 hover:bg-purple-600 text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer border border-purple-500/30"
                  title="Connect another wallet"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Plus className="w-3.5 h-3.5" />
                </motion.button>
              )}

              {/* Disconnect Button */}
              <motion.button
                onClick={handleDisconnect}
                className="w-7 h-7 bg-white/5 hover:bg-white/10 text-red-400 hover:text-red-300 rounded-lg flex items-center justify-center transition-colors cursor-pointer border border-red-500/20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="Disconnect wallets"
              >
                <X className="w-3.5 h-3.5" />
              </motion.button>

              {/* Profile/Orders Button */}
              <motion.button
                onClick={() => onOrdersClick?.()}
                className="w-7 h-7 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white rounded-lg flex items-center justify-center transition-colors cursor-pointer border border-white/10"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                title="View orders"
              >
                <User className="w-3.5 h-3.5" />
              </motion.button>
            </div>
          </>
        ) : (
          <motion.button
            onClick={() => setModalOpen(true)}
            className="px-5 py-2 bg-gradient-to-r from-purple-600 to-purple-500 text-white rounded-lg text-sm font-medium transition-all cursor-pointer shadow-lg shadow-purple-500/20 hover:shadow-purple-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="hidden sm:inline">Connect Wallet</span>
            <span className="sm:hidden">Connect</span>
          </motion.button>
        )}
      </div>

      <ConnectWalletModal
        open={modalOpen}
        onClose={handleCloseModal}
        onEVMConnect={handleEVMConnect}
        onStarknetConnect={handleStarknetConnect}
        loadingEVM={loadingEVM}
        loadingStarknet={loadingStarknet}
      />
    </>
  );
}
