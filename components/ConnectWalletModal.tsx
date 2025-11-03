"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { useWalletStore } from "../store/walletStore";
import { X, Zap } from "lucide-react";
import Image from "next/image";

interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
  onEVMConnect: (connector: any) => void;
  onBTCConnect: (wallet: any) => void;
  onStarknetConnect: (wallet: any) => void;
  loadingEVM: boolean;
  loadingBTC: boolean;
  loadingStarknet: boolean;
}

const WALLET_ICONS: Record<string, string> = {
  metamask: "https://garden-finance.imgix.net/wallets/metamask.svg",
  core: "https://build.avax.network/images/core.svg",
  phantom: "https://garden-finance.imgix.net/wallets/phantomDark.svg",
  "okx wallet": "https://garden-finance.imgix.net/wallets/okx.svg",
  "unisat wallet": "https://garden-finance.imgix.net/wallets/unisat.svg",
  xdefi: "https://garden-finance.imgix.net/wallets/xdefi.svg",
};

export function ConnectWalletModal({
  open,
  onClose,
  onEVMConnect,
  onBTCConnect,
  onStarknetConnect,
  loadingEVM,
  loadingBTC,
  loadingStarknet,
}: ConnectWalletModalProps) {
  const { connectors } = useConnect();
  const [activeTab, setActiveTab] = useState<"evm" | "btc" | "starknet">("evm");

  const handleEVMConnect = async (connector: any) => {
    try {
      await onEVMConnect(connector);
    } catch (error) {
      console.error("Failed to connect EVM wallet:", error);
    }
  };

  const handleBTCConnect = async (wallet: any) => {
    try {
      await onBTCConnect(wallet);
    } catch (error) {
      console.error("Failed to connect BTC wallet:", error);
    }
  };

  const getEVMIcon = (connector: any) => {
    if (!connector?.name) return undefined;
    const key = connector.name.toLowerCase();
    return WALLET_ICONS[key];
  };

  const getBTCIcon = (walletName: string) => {
    const name = walletName.toLowerCase();
    return WALLET_ICONS[name];
  };

  const handleStarknetConnect = async (wallet: any) => {
    try {
      await onStarknetConnect(wallet);
    } catch (error) {
      console.error("Failed to connect Starknet wallet:", error);
    }
  };

  const getStarknetIcon = (walletName: string) => {
    const name = walletName.toLowerCase();
    return WALLET_ICONS[name];
  };

  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState("50vh");

  useEffect(() => {
    setMounted(true);
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 900);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset bottom sheet height when modal closes
  useEffect(() => {
    if (!open && isMobile) {
      setBottomSheetHeight("50vh");
    }
  }, [open, isMobile]);

  // Close modal on Escape key and lock body scroll
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      // Lock body scroll
      const scrollY = window.scrollY;
      document.body.style.position = "fixed";
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = "100%";
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      // Unlock body scroll
      const scrollY = document.body.style.top;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      document.body.style.overflow = "";
      if (scrollY) {
        window.scrollTo(0, parseInt(scrollY || "0") * -1);
      }
    };
  }, [open, onClose]);

  // Handle bottom sheet scroll expansion
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    const target = e.currentTarget;
    const scrollTop = target.scrollTop;

    // Expand when scrolling up to top (within 10px of top)
    if (scrollTop <= 10 && bottomSheetHeight === "50vh") {
      setBottomSheetHeight("90vh");
    }
  };

  if (!open || !mounted) return null;

  // Starknet wallet list
  const starknetWallets = [
    {
      id: "argent-x",
      name: "Argent X",
      description: "Connect your Starknet wallet",
      available:
        typeof window !== "undefined" &&
        typeof (window as any).starknet !== "undefined" &&
        (window as any).starknet?.isArgentX,
    },
    {
      id: "braavos",
      name: "Braavos",
      description: "Connect your Starknet wallet",
      available:
        typeof window !== "undefined" &&
        typeof (window as any).starknet !== "undefined" &&
        (window as any).starknet?.isBraavos,
    },
    {
      id: "starknet",
      name: "Starknet Wallet",
      description: "Connect your Starknet wallet",
      available:
        typeof window !== "undefined" &&
        typeof (window as any).starknet !== "undefined",
    },
  ];

  // Bitcoin wallet list
  const bitcoinWallets = [
    {
      id: "okx-btc",
      name: "OKX Wallet",
      description: "Connect your Bitcoin wallet",
      available:
        typeof window !== "undefined" &&
        typeof (window as any).okxwallet !== "undefined",
    },
    {
      id: "unisat",
      name: "Unisat wallet",
      description: "Connect your Bitcoin wallet",
      available:
        typeof window !== "undefined" &&
        typeof (window as any).unisat !== "undefined",
    },
    {
      id: "xverse",
      name: "Xverse Wallet",
      description: "Connect your Bitcoin wallet",
      available:
        typeof window !== "undefined" &&
        typeof (window as any).XverseProviders !== "undefined",
    },
    {
      id: "hiro",
      name: "Hiro Wallet",
      description: "Connect your Bitcoin wallet",
      available:
        typeof window !== "undefined" &&
        typeof (window as any).btc !== "undefined",
    },
  ];

  const modalContent = (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 backdrop-blur-md bg-black/40 z-50 flex items-end md:items-center justify-center md:p-4"
            onClick={onClose}
          />

          {/* Modal (Desktop) / Bottom Sheet (Mobile) */}
          <motion.div
            initial={{
              y: isMobile ? "100%" : 0,
              scale: isMobile ? 1 : 0.95,
              opacity: 0,
            }}
            animate={{
              y: 0,
              scale: 1,
              opacity: 1,
              height: isMobile ? bottomSheetHeight : "600px",
            }}
            exit={{
              y: isMobile ? "100%" : 0,
              scale: isMobile ? 1 : 0.95,
              opacity: 0,
            }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className={`bg-[#070011]/95 backdrop-blur-xl border border-gray-700/40 shadow-xl overflow-hidden flex flex-col z-50 transition-all duration-300 ${
              isMobile
                ? "fixed bottom-0 left-0 right-0 rounded-t-[24px] rounded-b-none"
                : "fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-2xl max-w-2xl w-full h-[600px]"
            }`}
            onClick={(e) => e.stopPropagation()}
            style={{
              height: isMobile ? bottomSheetHeight : "600px",
              maxHeight: isMobile ? "90vh" : "600px",
            }}
          >
            {/* Mobile drag handle */}
            <div className="md:hidden flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-12 h-1.5 bg-gray-600 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-4 md:p-6 border-b border-gray-700/40 shrink-0">
              <h2 className="text-lg md:text-xl font-semibold text-white">
                Connect Wallet
              </h2>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors cursor-pointer text-gray-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="px-4 md:px-6 pt-2 md:pt-4 shrink-0 border-b border-gray-700/40">
              <div className="flex space-x-2">
                <button
                  className={`flex-1 py-2 rounded-t-lg font-semibold text-xs md:text-sm transition-colors cursor-pointer ${
                    activeTab === "evm"
                      ? "bg-purple-500/20 text-purple-300 border-b-2 border-purple-500"
                      : "bg-white/5 text-gray-400 border-b-2 border-transparent hover:bg-white/10 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("evm")}
                >
                  EVM Wallets
                </button>
                <button
                  className={`flex-1 py-2 rounded-t-lg font-semibold text-xs md:text-sm transition-colors cursor-pointer ${
                    activeTab === "btc"
                      ? "bg-orange-500/20 text-orange-300 border-b-2 border-orange-500"
                      : "bg-white/5 text-gray-400 border-b-2 border-transparent hover:bg-white/10 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("btc")}
                >
                  Bitcoin Wallets
                </button>
                <button
                  className={`flex-1 py-2 rounded-t-lg font-semibold text-xs md:text-sm transition-colors cursor-pointer ${
                    activeTab === "starknet"
                      ? "bg-purple-50 text-purple-700 border-b-2 border-purple-500"
                      : "bg-gray-50 text-gray-600 border-b-2 border-transparent hover:bg-gray-100"
                  }`}
                  onClick={() => setActiveTab("starknet")}
                >
                  Starknet Wallets
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
              <div className="p-4 md:p-6 pt-2 md:pt-4">
                {/* EVM Wallets - Only show when EVM tab is active */}
                {activeTab === "evm" && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-3">
                    {connectors.map((connector) => {
                      const iconUrl = getEVMIcon(connector);
                      return (
                        <motion.button
                          key={connector.uid}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleEVMConnect(connector)}
                          disabled={loadingEVM}
                          className="w-full flex items-center space-x-2 md:space-x-3 p-3 md:p-4 border border-gray-700/40 rounded-xl hover:border-purple-500/60 hover:bg-purple-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                            {iconUrl ? (
                              <Image
                                src={iconUrl}
                                alt={connector.name}
                                className="w-8 h-8"
                                width={32}
                                height={32}
                              />
                            ) : (
                              <span className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded">
                                <span className="text-lg font-bold text-gray-300">
                                  {connector.name?.[0] || "?"}
                                </span>
                              </span>
                            )}
                          </div>
                          <div className="flex-1 text-left min-w-0">
                            <p className="font-medium text-white text-sm md:text-base truncate">
                              {connector.name || "Unknown Wallet"}
                            </p>
                            <p className="text-xs md:text-sm text-gray-400 truncate">
                              Connect your {connector.name || "Unknown Wallet"}
                            </p>
                          </div>
                          {loadingEVM && (
                            <div className="w-5 h-5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Bitcoin Wallets - Only show when Bitcoin tab is active */}
                {activeTab === "btc" && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-3">
                    {bitcoinWallets && bitcoinWallets.length > 0 ? (
                      bitcoinWallets.map((wallet: any, index: number) => {
                        const iconUrl = getBTCIcon(wallet.name);
                        return (
                          <motion.button
                            key={wallet.id || index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleBTCConnect(wallet)}
                            disabled={loadingBTC || !wallet.available}
                            className="w-full flex items-center space-x-2 md:space-x-3 p-3 md:p-4 border border-gray-700/40 rounded-xl hover:border-orange-500/60 hover:bg-orange-500/10 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                              {iconUrl ? (
                                <Image
                                  src={iconUrl}
                                  alt={wallet.name || "Wallet"}
                                  className="w-8 h-8"
                                  width={32}
                                  height={32}
                                />
                              ) : (
                                <span className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded">
                                  <span className="text-lg font-bold text-gray-300">
                                    {(wallet.name || "?")[0]}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-medium text-white text-sm md:text-base truncate">
                                {wallet.name || "Bitcoin Wallet"}
                              </p>
                              <p className="text-xs md:text-sm text-gray-400 truncate">
                                {wallet.description ||
                                  "Connect your Bitcoin wallet"}
                              </p>
                            </div>
                            {loadingBTC && (
                              <div className="w-5 h-5 border-2 border-orange-400 border-t-transparent rounded-full animate-spin"></div>
                            )}
                          </motion.button>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <Zap className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-300">
                          No Bitcoin wallets available
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Make sure you have a Bitcoin wallet extension
                          installed
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Starknet Wallets - Only show when Starknet tab is active */}
                {activeTab === "starknet" && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-3">
                    {starknetWallets && starknetWallets.length > 0 ? (
                      starknetWallets.map((wallet: any, index: number) => {
                        const iconUrl = getStarknetIcon(wallet.name);
                        return (
                          <motion.button
                            key={wallet.id || index}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleStarknetConnect(wallet)}
                            disabled={loadingStarknet || !wallet.available}
                            className="w-full flex items-center space-x-2 md:space-x-3 p-3 md:p-4 border border-gray-200 rounded-xl hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                              {iconUrl ? (
                                <Image
                                  src={iconUrl}
                                  alt={wallet.name || "Wallet"}
                                  className="w-8 h-8"
                                  width={32}
                                  height={32}
                                />
                              ) : (
                                <span className="w-8 h-8 flex items-center justify-center bg-purple-100 rounded">
                                  <span className="text-lg font-bold text-purple-600">
                                    {(wallet.name || "?")[0]}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-medium text-gray-900 text-sm md:text-base truncate">
                                {wallet.name || "Starknet Wallet"}
                              </p>
                              <p className="text-xs md:text-sm text-gray-500 truncate">
                                {wallet.description ||
                                  "Connect your Starknet wallet"}
                              </p>
                            </div>
                            {loadingStarknet && (
                              <div className="w-5 h-5 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                            )}
                          </motion.button>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <Zap className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">
                          No Starknet wallets available
                        </p>
                        <p className="text-sm text-gray-400 mt-1">
                          Make sure you have a Starknet wallet extension
                          installed
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );

  if (!mounted) return null;

  return createPortal(modalContent, document.body);
}
