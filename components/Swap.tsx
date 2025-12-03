"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useConnect } from "wagmi";
import { useConnect as useStarknetConnect } from "@starknet-react/core";
import { AssetDropdown } from "./AssetDropdown";
import { useAssetsStore } from "../store/assetsStore";
import { useWalletStore } from "../store/walletStore";
import { useAssetBalance } from "../hooks/useAssetBalance";
import { ConnectWalletModal } from "./ConnectWalletModal";
import { useStarknetWallet } from "../hooks/useStarknetWallet";

interface SwapProps {
  onOrderCreated?: (orderId: string) => void;
}

const Swap: React.FC<SwapProps> = () => {
  const router = useRouter();
  const {
    fromAsset,
    toAsset,
    sendAmount,
    sendValue,
    receiveValue,
    receiveAmount,
    quote,
    isLoading,
    isQuoteLoading,
    fetchAssets,
    setFromAsset,
    setToAsset,
    setSendAmount,
    swapAssets,
    setShowHero,
    createOrder,
  } = useAssetsStore();

  const { evmWallet, starknetWallet, setEVMWallet, setStarknetWallet, disconnectEVM } = useWalletStore();
  const { balance: fromBalance, isLoading: isLoadingFromBalance } = useAssetBalance(fromAsset);
  const { balance: toBalance, isLoading: isLoadingToBalance } = useAssetBalance(toAsset);
  const { connectors, connect } = useConnect();
  const { connectors: starknetConnectors } = useStarknetConnect();
  const { starknetConnectAsync } = useStarknetWallet();

  const [isDropdownOpen, setIsDropdownOpen] = useState<"from" | "to" | null>(
    null
  );
  const [orderError, setOrderError] = useState<string | null>(null);
  const [isCreatingOrder, setIsCreatingOrder] = useState(false);
  const [receiverAddress, setReceiverAddress] = useState<string>("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingEVM, setLoadingEVM] = useState(false);
  const [loadingStarknet, setLoadingStarknet] = useState(false);
  const polygonRef = useRef<SVGSVGElement>(null);
  const polygonImageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    fetchAssets();
    setShowHero(true);
  }, [fetchAssets, setShowHero]);

  const handleAssetSelect = (asset: typeof fromAsset, type: "from" | "to") => {
    if (type === "from") {
      setFromAsset(asset);
    } else {
      setToAsset(asset);
    }
    setIsDropdownOpen(null);
  };

  const isStarknetChain = (chainId: string, chainName: string): boolean => {
    const identifier = `${chainId}${chainName}`.toLowerCase();
    return identifier.includes("starknet") || identifier.includes("stark");
  };

  const isZcash = (asset: typeof fromAsset): boolean => {
    if (!asset) return false;
    const symbol = asset.asset.symbol.toLowerCase();
    const chainName = asset.chainName.toLowerCase();
    return symbol === "zec" || symbol === "zcash" || chainName.includes("zcash");
  };

  const getWalletAddress = (asset: typeof fromAsset): string | null => {
    if (!asset) return null;
    
    if (isZcash(asset)) {
      return null;
    }
    
    const isStark = isStarknetChain(asset.chainId, asset.chainName);
    if (isStark) {
      return starknetWallet?.isConnected ? starknetWallet.address : null;
    } else {
      return evmWallet?.isConnected ? evmWallet.address : null;
    }
  };

  const shouldShowReceiverAddress = (): boolean => {
    if (!fromAsset || !toAsset) return false;
    const fromIsZcash = isZcash(fromAsset);
    const toIsZcash = isZcash(toAsset);
    return fromIsZcash || toIsZcash;
  };

  const handleMaxClick = () => {
    if (fromBalance && fromAsset) {
      setSendAmount(parseFloat(fromBalance).toFixed(6));
    }
  };

  const exceedsBalance = (): boolean => {
    if (!fromBalance || !sendAmount || !fromAsset) return false;
    const balance = parseFloat(fromBalance);
    const amount = parseFloat(sendAmount);
    return amount > balance;
  };

  const getRequiredWallet = (): "evm" | "starknet" | "zcash" | null => {
    if (!fromAsset || !toAsset) return null;
    
    const fromIsZcash = isZcash(fromAsset);
    const toIsZcash = isZcash(toAsset);
    
    if (fromIsZcash && toIsZcash) return null;
    
    if (!fromIsZcash) {
      const isStark = isStarknetChain(fromAsset.chainId, fromAsset.chainName);
      if (isStark && !starknetWallet?.isConnected) return "starknet";
      if (!isStark && !evmWallet?.isConnected) return "evm";
    }
    
    if (!toIsZcash) {
      const isStark = isStarknetChain(toAsset.chainId, toAsset.chainName);
      if (isStark && !starknetWallet?.isConnected) return "starknet";
      if (!isStark && !evmWallet?.isConnected) return "evm";
    }
    
    return null;
  };

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

  const handleStarknetConnect = async (connector: any) => {
    setLoadingStarknet(true);
    try {
      await starknetConnectAsync({ connector });
      setModalOpen(false);
    } catch (error) {
      console.error("Failed to connect Starknet wallet:", error);
    } finally {
      setLoadingStarknet(false);
    }
  };

  const handleConfirm = async () => {
    if (!fromAsset || !toAsset || !sendAmount || !quote) {
      setOrderError("Missing required swap data");
      return;
    }

    if (exceedsBalance()) {
      setOrderError("Insufficient balance. Amount exceeds available balance.");
      return;
    }

    let sourceAddress = getWalletAddress(fromAsset);
    let destinationAddress = getWalletAddress(toAsset);

    if (isZcash(fromAsset) && !sourceAddress) {
      if (!receiverAddress || receiverAddress.trim() === "") {
        setOrderError("Please enter receiver address for Zcash");
        return;
      }
      sourceAddress = receiverAddress;
    }

    if (isZcash(toAsset) && !destinationAddress) {
      if (!receiverAddress || receiverAddress.trim() === "") {
        setOrderError("Please enter receiver address for Zcash");
        return;
      }
      destinationAddress = receiverAddress;
    }

    if (!isZcash(fromAsset) && !sourceAddress) {
      setOrderError(
        `Please connect your ${
          isStarknetChain(fromAsset.chainId, fromAsset.chainName)
            ? "Starknet"
            : "EVM"
        } wallet for the source chain`
      );
      return;
    }

    if (!isZcash(toAsset) && !destinationAddress) {
      setOrderError(
        `Please connect your ${
          isStarknetChain(toAsset.chainId, toAsset.chainName)
            ? "Starknet"
            : "EVM"
        } wallet for the destination chain`
      );
      return;
    }

    if (!sourceAddress || !destinationAddress) {
      setOrderError("Missing wallet addresses");
      return;
    }

    try {
      setIsCreatingOrder(true);
      setOrderError(null);
      const result = await createOrder(sourceAddress, destinationAddress);

      let orderId: string | null = null;

      if (typeof result === "object" && result !== null) {
        const resultObj = result as Record<string, unknown>;
        
        if (
          resultObj.status === "Ok" &&
          resultObj.result &&
          typeof resultObj.result === "object" &&
          resultObj.result !== null
        ) {
          const resultData = resultObj.result as Record<string, unknown>;
          if (typeof resultData.order_id === "string") {
            orderId = resultData.order_id;
          }
        }
        else if (typeof resultObj.order_id === "string") {
          orderId = resultObj.order_id;
        }
        else if (
          resultObj.data &&
          typeof resultObj.data === "object" &&
          resultObj.data !== null
        ) {
          const data = resultObj.data as Record<string, unknown>;
          if (typeof data.order_id === "string") {
            orderId = data.order_id;
          }
        }
      }

      if (orderId) {
        router.push(`/order/${orderId}`);
      } else {
        console.error("Order ID not found in response:", result);
        setOrderError(
          "Order created but could not redirect. Please check your orders."
        );
      }
    } catch (error) {
      console.error("Failed to create order:", error);
      setOrderError(
        error instanceof Error ? error.message : "Failed to create order"
      );
    } finally {
      setIsCreatingOrder(false);
    }
  };

  const getConversionRate = () => {
    if (!fromAsset || !sendAmount || parseFloat(sendAmount) <= 0 || !receiveAmount || !sendValue || !receiveValue) {
      return null;
    }
    
    const usdtRate = parseFloat(receiveValue) / parseFloat(sendAmount);
    const usdValuePerFromAsset = parseFloat(sendValue) / parseFloat(sendAmount);
    
    return {
      fromSymbol: fromAsset.asset.symbol,
      toSymbol: toAsset?.asset.symbol || "",
      usdtRate: usdtRate.toFixed(2),
      usdValue: usdValuePerFromAsset.toFixed(2),
    };
  };

  const conversionRate = getConversionRate();

  return (
    <div className="mx-auto max-w-xl w-full overflow-x-hidden md:overflow-x-visible origin-top">
      <div className="w-full mx-auto flex items-center flex-col rounded-3xl">
        <div className="relative w-full">
          <div 
            className="w-full rounded-[24px] p-4 bg-black/35 border border-[#A1A1A1]">
            <label className="block text-sm font-medium text-white mb-3">
              You Give
            </label>
            
            <div className="w-full flex items-center justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="0"
                  value={sendAmount}
                  suppressHydrationWarning
                  onChange={(e) => {
                    let value = e.target.value;
                    if (value === ".") {
                      setSendAmount("0.");
                      return;
                    }
                    value = value.replace(/[^0-9.]/g, "");
                    if (/^0+$/.test(value) && value.length > 1) {
                      value = "0";
                    }
                    if (
                      value.length > 1 &&
                      value[0] === "0" &&
                      /^\d$/.test(value[1])
                    ) {
                      value = "0";
                    }
                    const parts = value.split(".");
                    if (parts.length > 2) {
                      value = parts[0] + "." + parts.slice(1).join("");
                    }
                    if (parts.length === 2 && parts[1].length > 6) {
                      value = parts[0] + "." + parts[1].substring(0, 6);
                    }
                    setSendAmount(value);
                  }}
                  className="text-2xl md:text-3xl font-bold text-white bg-transparent focus:outline-none p-0 w-full"
                  disabled={!fromAsset}
                  autoComplete="off"
                />
              </div>
              
              <div className="flex-shrink-0">
                <div 
                  className="rounded-xl px-3 border border-white/10"
                >
                  <div className="[&_span]:text-white [&_svg]:text-gray-700">
                    <AssetDropdown
                      type="from"
                      selectedAsset={fromAsset}
                      isOpen={isDropdownOpen === "from"}
                      onToggle={() =>
                        setIsDropdownOpen(
                          isDropdownOpen === "from" ? null : "from"
                        )
                      }
                      onSelect={(asset) => handleAssetSelect(asset, "from")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#A1A1A1] my-3"></div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {sendValue && (
                  <span>
                    ${parseFloat(sendValue).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {fromAsset && (
                  <span className="text-sm text-gray-400">
                    {isLoadingFromBalance ? (
                      <span className="inline-block w-16 h-4 bg-gray-700/50 rounded animate-pulse"></span>
                    ) : fromBalance !== null ? (
                      `${parseFloat(fromBalance).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                        minimumFractionDigits: 0,
                      })} ${fromAsset.asset.symbol}`
                    ) : (
                      ""
                    )}
                  </span>
                )}
                {fromBalance && fromAsset && (
                  <span className="text-sm text-[#A2DF35] cursor-pointer" onClick={handleMaxClick}>
                    MAX
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="relative w-full flex items-center justify-center -my-5 z-10">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={swapAssets}
            transition={{ duration: 0.2 }}
            disabled={!fromAsset || !toAsset}
            className="relative w-12 h-12 flex items-center justify-center pointer-events-auto cursor-pointer disabled:brightness-50 disabled:cursor-not-allowed"
            title="Swap assets"
            // style={{
            //   boxShadow: "0 0 40px rgba(201, 255, 128, 0.45)",
            // }}
            onMouseEnter={(e) => {
              const svg = polygonRef.current;
              if (svg) {
                const stop1 = svg.querySelector('#paint0_linear_10_164 stop:first-child') as SVGStopElement;
                const stop2 = svg.querySelector('#paint0_linear_10_164 stop:last-child') as SVGStopElement;
                if (stop1) stop1.setAttribute('stop-color', '#E6EF63');
                if (stop2) stop2.setAttribute('stop-color', '#96DD2C');
              }
              // e.currentTarget.style.boxShadow = "0 0 55px rgba(201, 255, 128, 0.65)";
            }}
            onMouseLeave={(e) => {
              const svg = polygonRef.current;
              if (svg) {
                const stop1 = svg.querySelector('#paint0_linear_10_164 stop:first-child') as SVGStopElement;
                const stop2 = svg.querySelector('#paint0_linear_10_164 stop:last-child') as SVGStopElement;
                if (stop1) stop1.setAttribute('stop-color', '#96DD2C');
                if (stop2) stop2.setAttribute('stop-color', '#E6EF63');
              }
              // e.currentTarget.style.boxShadow = "0 0 40px rgba(201, 255, 128, 0.45)";
            }}
          >
            <Image src="/polygon.svg" alt="Swap" width={42} height={46} className="absolute inset-0 w-full h-full" unoptimized />
            <Image src="/arrows.svg" alt="Swap" width={24} height={24} className="relative z-10" unoptimized />
          </motion.button>
        </div>

        <div className="relative w-full">
          <div 
            className="w-full rounded-[24px] p-4 bg-[#161F00]/35 border border-[#A1A1A1]">
            <label className="block text-sm font-medium text-white mb-3">
              You Get
            </label>
            
            <div className="w-full flex items-center justify-between gap-3 mb-3">
              <div className="flex-1 min-w-0">
                <input
                  type="text"
                  placeholder="0"
                  value={
                    receiveAmount
                      ? Number(receiveAmount)
                          .toFixed(6)
                          .replace(/\.?0+$/, "") || "0"
                      : ""
                  }
                  readOnly
                  suppressHydrationWarning
                  className="text-2xl md:text-3xl font-bold text-white bg-transparent focus:outline-none p-0 w-full"
                  disabled={!toAsset}
                />
              </div>
              
              <div className="flex-shrink-0">
                <div 
                  className="rounded-xl px-3 border border-white/10"
                >
                  <div className="[&_span]:text-white [&_svg]:text-gray-700">
                    <AssetDropdown
                      type="to"
                      selectedAsset={toAsset}
                      isOpen={isDropdownOpen === "to"}
                      onToggle={() =>
                        setIsDropdownOpen(isDropdownOpen === "to" ? null : "to")
                      }
                      onSelect={(asset) => handleAssetSelect(asset, "to")}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-[#A1A1A1] my-3"></div>

            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-400">
                {receiveValue && (
                  <span>
                    ${parseFloat(receiveValue).toLocaleString(undefined, {
                      maximumFractionDigits: 2,
                    })}
                  </span>
                )}
              </div>
              <div className="text-sm text-gray-400">
                {toAsset && (
                  <span>
                    {isLoadingToBalance ? (
                      <span className="inline-block w-16 h-4 bg-gray-700/50 rounded animate-pulse"></span>
                    ) : toBalance !== null ? (
                      `${parseFloat(toBalance).toLocaleString(undefined, {
                        maximumFractionDigits: 6,
                        minimumFractionDigits: 0,
                      })} ${toAsset.asset.symbol}`
                    ) : (
                      ""
                    )}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {conversionRate && fromAsset && (
          <div className="w-full flex items-center justify-between text-sm text-gray-400 px-2 pt-4">
            <span>
              1 {conversionRate.fromSymbol} = {conversionRate.usdtRate} USDT (${conversionRate.usdValue})
            </span>
            {quote && quote.result?.[0]?.feeBips !== undefined && sendValue && (
              <div className="flex items-center gap-1">
                <Image src="/gas.svg" alt="Fee" width={16} height={16} className="w-4 h-4" unoptimized />
                <span>
                  ${(
                    (parseFloat(sendValue) * (quote.result[0].feeBips || 0)) /
                    10000
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                    minimumFractionDigits: 2,
                  })}
                </span>
              </div>
            )}
          </div>
        )}

        <AnimatePresence>
          {shouldShowReceiverAddress() && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: 10, marginTop: 0 }}
              animate={{ height: "auto", opacity: 1, y: 0, marginTop: 16 }}
              exit={{
                height: 0,
                opacity: 0,
                y: 10,
                marginTop: 0,
                transition: { duration: 0.3, ease: "easeOut" },
              }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 25,
              }}
              className="w-full overflow-hidden"
            >
              <div 
                className="w-full rounded-[24px] p-4 bg-black/35 border border-[#A1A1A1]"
              >
                <label className="block text-sm font-medium text-white mb-3">
                  Receiver Address
                </label>
                <input
                  type="text"
                  placeholder="Enter Zcash address"
                  value={
                    receiverAddress
                      ? receiverAddress
                      : ""
                  }
                  suppressHydrationWarning
                  onChange={(e) => setReceiverAddress(e.target.value)}
                  className="text-lg md:text-xl font-bold text-white bg-transparent focus:outline-none p-0 w-full"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {orderError && (
        <div className="w-full mb-4 p-4 bg-red-900/20 border border-red-500/40 rounded-xl">
          <p className="text-sm text-red-300 font-medium">{orderError}</p>
        </div>
      )}

      <div className="w-full mt-4">
        {(() => {
          const requiredWallet = getRequiredWallet();
          const balanceExceeded = exceedsBalance();
          const isDisabled = 
            !fromAsset ||
            !toAsset ||
            !sendAmount ||
            parseFloat(sendAmount) <= 0 ||
            !quote ||
            !quote.result?.[0] ||
            !receiveAmount ||
            receiveAmount.trim() === "" ||
            isLoading ||
            isQuoteLoading ||
            isCreatingOrder ||
            balanceExceeded ||
            (isZcash(fromAsset) && !receiverAddress.trim() && !getWalletAddress(fromAsset)) ||
            (isZcash(toAsset) && !receiverAddress.trim() && !getWalletAddress(toAsset)) ||
            (!isZcash(fromAsset) && !getWalletAddress(fromAsset)) ||
            (!isZcash(toAsset) && !getWalletAddress(toAsset));

          let buttonText = "Swap";
          if (isLoading) buttonText = "Loading Assets...";
          else if (isQuoteLoading) buttonText = "Getting Quote...";
          else if (isCreatingOrder) buttonText = "Creating Order...";
          else if (requiredWallet && requiredWallet !== "zcash") buttonText = "Connect Wallet";
          else if (balanceExceeded) buttonText = "Insufficient Balance";

          let buttonClassName = "w-full py-4 px-6 rounded-xl font-semibold text-lg transition-all duration-200 flex items-center justify-center gap-2 ";
          if (isLoading || isQuoteLoading || isCreatingOrder) {
            buttonClassName += "bg-[#A2DF35]/50 text-white cursor-wait";
          } else if (requiredWallet && requiredWallet !== "zcash") {
            buttonClassName += "text-black cursor-pointer active:scale-95";
          } else if (balanceExceeded || isDisabled) {
            buttonClassName += "bg-gray-700/50 text-gray-500 cursor-not-allowed";
          } else {
            buttonClassName += "text-black cursor-pointer active:scale-95";
          }

          const isConnectWallet = requiredWallet && requiredWallet !== "zcash";
          const canShowGradient = 
            !isLoading &&
            !isQuoteLoading &&
            !isCreatingOrder &&
            !balanceExceeded &&
            (isConnectWallet || (
              !isDisabled &&
              fromAsset &&
              toAsset &&
              sendAmount &&
              parseFloat(sendAmount) > 0 &&
              quote &&
              quote.result?.[0] &&
              receiveAmount &&
              receiveAmount.trim() !== ""
            ));

          const buttonStyle = canShowGradient
            ? {
                background: "linear-gradient(to right, #96DD2C, #E6EF63)",
                boxShadow: "0 0 40px rgba(201, 255, 128, 0.45)",
              }
            : undefined;

          const handleClick = () => {
            if (requiredWallet && requiredWallet !== "zcash") {
              setModalOpen(true);
            } else if (!isDisabled && !balanceExceeded) {
              handleConfirm();
            }
          };

          return (
            <div className="w-full">
              <button
                onClick={handleClick}
                disabled={requiredWallet && requiredWallet !== "zcash" ? false : (isDisabled || balanceExceeded)}
                className={buttonClassName}
                style={buttonStyle}
                onMouseEnter={(e) => {
                  if (canShowGradient) {
                    e.currentTarget.style.background = "linear-gradient(to right, #E6EF63, #96DD2C)";
                    e.currentTarget.style.boxShadow = "0 0 55px rgba(201, 255, 128, 0.65)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (canShowGradient) {
                    e.currentTarget.style.background = "linear-gradient(to right, #96DD2C, #E6EF63)";
                    e.currentTarget.style.boxShadow = "0 0 40px rgba(201, 255, 128, 0.45)";
                  }
                }}
              >
                {isLoading || isQuoteLoading || isCreatingOrder ? (
                  <>
                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-xl animate-spin"></div>
                    <span>{buttonText}</span>
                  </>
                ) : (
                  buttonText
                )}
              </button>
              {balanceExceeded && (
                <p className="text-sm text-red-400 mt-2 text-center">
                  Amount exceeds available balance
                </p>
              )}
            </div>
          );
        })()}
      </div>

      <ConnectWalletModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onEVMConnect={handleEVMConnect}
        onStarknetConnect={handleStarknetConnect}
        loadingEVM={loadingEVM}
        loadingStarknet={loadingStarknet}
      />
    </div>
  );
};

export default Swap;