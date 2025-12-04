"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useConnect } from "wagmi";
import { useConnect as useStarknetConnect } from "@starknet-react/core";
import { X, Zap, Wallet } from "lucide-react";
import Image from "next/image";

interface ConnectWalletModalProps {
  open: boolean;
  onClose: () => void;
  onEVMConnect: (connector: any) => void;
  onStarknetConnect: (wallet: any) => void;
  onZcashConnect?: (address: string) => void;
  loadingEVM: boolean;
  loadingStarknet: boolean;
  loadingZcash?: boolean;
}

const WALLET_ICONS: Record<string, string> = {
  metamask: "https://www.pngall.com/wp-content/uploads/17/Metamask-Financial-Services-Logo-PNG-thumb.png",
  core: "https://build.avax.network/images/core.svg",
  keplr: "https://play-lh.googleusercontent.com/q3IAZGlrfKwt-IxX3WWcWJzah56y2RqhESi3Xk8hFarVNnbPtzLSgRDI2JV1681pf2sq5e2lr17ZVD-wzV77IGk",
  leap: "https://play-lh.googleusercontent.com/0BY-XzNk_6R3DS_oNZfRI-x5L2PDgX8BDo7OL8kPDCKaQi0YzXGrYKWaT2lbOkqqGrs=w240-h480-rw",
  coinbase: "https://raw.githubusercontent.com/gist/taycaldwell/2291907115c0bb5589bc346661435007/raw/280eafdc84cb80ed0c60e36b4d0c563f6dca6b3e/cbw.svg",
  rabby: "https://play-lh.googleusercontent.com/voFLXuFxLsIFBHQKmFxUhgAo23RXmO6_esdEb6ebfHQewdMlAfNKq3vAaDh6clJ7Pw",
  phantom: "https://cdn.prod.website-files.com/6410de4b1ee56e7333393b23/66d87fb4733b331acc81216e_Phantom-Icon_Transparent_Purple.png",
  "okx wallet": "https://play-lh.googleusercontent.com/N00SbjLJJrhg4hbdnkk3Llk2oedNNgCU29DvR9cpep7Lr0VkzvBkmLqajWNgFb0d7IOO=w240-h480-rw",
  "unisat wallet": "https://static.images.dropstab.com/images/unisat.png",
  xdefi: "https://moralis.com/wp-content/uploads/web3wiki/1276-xdefi-wallet/63a46c480b012fc7f5436808_Mb-VXGh_QAeZeuXsT43JUNAYIyh3tn1YeRCfQmVdc08.png",
  // Zcash wallets
  unstoppable: "https://play-lh.googleusercontent.com/VQJ7fF4UmjT0WRX0z-LsYLrXGCvMR9OelwUZHHqWXwWzFp0oBrVpLvRhMwqKlY_VGQ=w240-h480",
};

export function ConnectWalletModal({
  open,
  onClose,
  onEVMConnect,
  onStarknetConnect,
  onZcashConnect,
  loadingEVM,
  loadingStarknet,
  loadingZcash,
}: ConnectWalletModalProps) {
  // All hooks must be declared at the top, before any conditional logic
  const { connectors } = useConnect();
  const { connectors: starknetConnectors } = useStarknetConnect();
  const [activeTab, setActiveTab] = useState<"evm" | "starknet" | "zcash">("evm");
  const [mounted, setMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [bottomSheetHeight, setBottomSheetHeight] = useState("50vh");
  const [connectingStarknetId, setConnectingStarknetId] = useState<string | null>(null);
  const [zcashAddress, setZcashAddress] = useState("");

  const handleEVMConnect = async (connector: any) => {
    try {
      await onEVMConnect(connector);
    } catch (error) {
      console.error("Failed to connect EVM wallet:", error);
    }
  };

  const getEVMIcon = (connector: any) => {
    if (!connector?.name) return undefined;
    const name = connector.name.toLowerCase();
    
    // Direct match
    if (WALLET_ICONS[name]) {
      return WALLET_ICONS[name];
    }
    
    // Try to find a partial match (e.g., "Coinbase Wallet" -> "coinbase")
    const matchingKey = Object.keys(WALLET_ICONS).find(key => 
      name.includes(key) || key.includes(name)
    );
    
    return matchingKey ? WALLET_ICONS[matchingKey] : undefined;
  };

  const handleStarknetConnect = async (connector: any) => {
    setConnectingStarknetId(connector.id);
    try {
      await onStarknetConnect(connector);
    } catch (error) {
      console.error("Failed to connect Starknet wallet:", error);
    } finally {
      setConnectingStarknetId(null);
    }
  };

  const getStarknetIcon = (walletName: string) => {
    const name = walletName.toLowerCase();
    return WALLET_ICONS[name];
  };


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
                      ? "bg-[#7A38EB]/20 text-[#B19EEF] border-b-2 border-[#7A38EB]"
                      : "bg-white/5 text-gray-400 border-b-2 border-transparent hover:bg-white/10 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("evm")}
                >
                  EVM
                </button>
                <button
                  className={`flex-1 py-2 rounded-t-lg font-semibold text-xs md:text-sm transition-colors cursor-pointer ${
                    activeTab === "starknet"
                      ? "bg-[#7A38EB]/20 text-[#B19EEF] border-b-2 border-[#7A38EB]"
                      : "bg-white/5 text-gray-400 border-b-2 border-transparent hover:bg-white/10 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("starknet")}
                >
                  Starknet
                </button>
                <button
                  className={`flex-1 py-2 rounded-t-lg font-semibold text-xs md:text-sm transition-colors cursor-pointer ${
                    activeTab === "zcash"
                      ? "bg-[#7A38EB]/20 text-[#B19EEF] border-b-2 border-[#7A38EB]"
                      : "bg-white/5 text-gray-400 border-b-2 border-transparent hover:bg-white/10 hover:text-gray-300"
                  }`}
                  onClick={() => setActiveTab("zcash")}
                >
                  Zcash
                </button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto" onScroll={handleScroll}>
              <div className="p-4 md:p-6 pt-2 md:pt-4">
                {/* EVM Wallets - Only show when EVM tab is active */}
                {activeTab === "evm" && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-3">
                    {connectors
                      .filter((connector) => connector.name.toLowerCase() !== "injected")
                      .map((connector) => {
                      const iconUrl = getEVMIcon(connector);
                      const hasValidIcon = iconUrl && iconUrl.trim().length > 0;
                      return (
                        <motion.button
                          key={connector.uid}
                          onClick={() => handleEVMConnect(connector)}
                          disabled={loadingEVM}
                          className="w-full flex items-center space-x-2 md:space-x-3 p-3 md:p-4 border border-gray-700/40 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                            {hasValidIcon ? (
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
                            <div className="w-5 h-5 border-2 border-[#7A38EB] border-t-transparent rounded-full animate-spin"></div>
                          )}
                        </motion.button>
                      );
                    })}
                  </div>
                )}

                {/* Starknet Wallets - Only show when Starknet tab is active */}
                {activeTab === "starknet" && (
                  <div className="grid grid-cols-1 xs:grid-cols-2 gap-2 md:gap-3">
                    {starknetConnectors && starknetConnectors.length > 0 ? (
                      starknetConnectors.map((connector: any) => {
                        const iconUrl = connector.icon 
                          ? (typeof connector.icon === 'string' ? connector.icon : connector.icon.dark || connector.icon.light)
                          : undefined;
                        const hasValidIcon = iconUrl && typeof iconUrl === 'string' && iconUrl.trim().length > 0;
                        const isConnecting = connectingStarknetId === connector.id;
                        const isAnyConnecting = connectingStarknetId !== null;
                        return (
                          <motion.button
                            key={connector.id}
                            onClick={() => handleStarknetConnect(connector)}
                            disabled={isAnyConnecting}
                            className="w-full flex items-center space-x-2 md:space-x-3 p-3 md:p-4 border border-gray-700/40 rounded-xl hover:bg-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                              {hasValidIcon ? (
                                <Image
                                  src={iconUrl}
                                  alt={connector.name || "Wallet"}
                                  className="w-8 h-8"
                                  width={32}
                                  height={32}
                                />
                              ) : (
                                <span className="w-8 h-8 flex items-center justify-center bg-gray-700 rounded">
                                  <span className="text-lg font-bold text-gray-300">
                                    {(connector.name || "?")[0]}
                                  </span>
                                </span>
                              )}
                            </div>
                            <div className="flex-1 text-left min-w-0">
                              <p className="font-medium text-white text-sm md:text-base truncate">
                                {connector.name || "Starknet Wallet"}
                              </p>
                              <p className="text-xs md:text-sm text-gray-400 truncate">
                                Connect your Starknet wallet
                              </p>
                            </div>
                            {isConnecting && (
                              <div className="w-5 h-5 border-2 border-[#7A38EB] border-t-transparent rounded-full animate-spin"></div>
                            )}
                          </motion.button>
                        );
                      })
                    ) : (
                      <div className="col-span-2 text-center py-8">
                        <Zap className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                        <p className="text-gray-300">
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

                {activeTab === "zcash" && (
                  <div className="space-y-4">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                      <p className="text-sm text-blue-300 mb-2">
                        <strong>🔐 Privacy-First Cryptocurrency</strong>
                      </p>
                      <p className="text-xs text-gray-400">
                        Zcash offers shielded transactions using zero-knowledge proofs. Enter your Zcash address from your wallet to get started.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 xs:grid-cols-2 gap-3">
                      <motion.a
                        href="https://unstoppable.money/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 border border-gray-700/40 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center">
                          <Image
                            src={WALLET_ICONS.unstoppable}
                            alt="Unstoppable Wallet"
                            className="w-8 h-8 rounded-lg"
                            width={32}
                            height={32}
                          />
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-white text-sm">
                            Unstoppable
                          </p>
                          <p className="text-xs text-gray-400">
                            Multi-chain + Shielded ZEC
                          </p>
                        </div>
                      </motion.a>

                      <motion.a
                        href="https://nighthawkwallet.com/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center space-x-3 p-4 border border-gray-700/40 rounded-xl hover:bg-white/5 transition-colors cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#7A38EB]/20">
                          <span className="text-2xl">🦉</span>
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <p className="font-medium text-white text-sm">
                            Nighthawk
                          </p>
                          <p className="text-xs text-gray-400">
                            Privacy-focused Zcash wallet
                          </p>
                        </div>
                      </motion.a>
                    </div>

                    {/* Manual Address Entry */}
                    <div className="bg-gray-800/50 border border-gray-700/40 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Wallet className="w-4 h-4 text-[#7A38EB]" />
                        <p className="text-sm text-gray-300 font-medium">
                          Enter Your Zcash Address
                        </p>
                      </div>
                      <input
                        type="text"
                        value={zcashAddress}
                        onChange={(e) => setZcashAddress(e.target.value)}
                        placeholder="t1... (transparent) or z1... (shielded)"
                        className="w-full px-3 py-2.5 bg-gray-900/50 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-[#7A38EB] mb-3 font-mono"
                      />
                      <button
                        onClick={() => {
                          if (zcashAddress && onZcashConnect) {
                            onZcashConnect(zcashAddress);
                            onClose();
                          }
                        }}
                        disabled={!zcashAddress || loadingZcash}
                        className="w-full px-4 py-2.5 bg-[#7A38EB] hover:bg-[#9333ea] disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg text-sm font-medium transition-colors"
                      >
                        {loadingZcash ? "Connecting..." : "Connect Address"}
                      </button>
                      <p className="text-xs text-gray-500 mt-2 text-center">
                        Copy address from your Zcash wallet
                      </p>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3">
                      <p className="text-xs text-yellow-300">
                        <strong>Note:</strong> WalletConnect for Zcash is not yet supported. Use manual address entry instead.
                      </p>
                    </div>
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