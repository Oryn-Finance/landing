"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AssetDropdown } from "./AssetDropdown";
import SlideToConfirmButton from "./SlideToConfirmButton";
import { useAssetsStore } from "../store/assetsStore";
import Image from "next/image";

interface SwapProps {
  onOrderCreated?: (orderId: string) => void;
}

const Swap: React.FC<SwapProps> = () => {
  const {
    fromAsset,
    toAsset,
    sendValue,
    receiveValue,
    receiveAmount,
    quote,
    isLoading,
    isQuoteLoading,
    fetchAssets,
    setFromAsset,
    setToAsset,
    swapAssets,
    setShowHero,
    resetSwapState,
    setsendValue,
  } = useAssetsStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState<"from" | "to" | null>(
    null
  );

  useEffect(() => {
    resetSwapState();
    fetchAssets();
    setShowHero(true);
  }, [fetchAssets, setShowHero, resetSwapState]);

  const handleAssetSelect = (asset: typeof fromAsset, type: "from" | "to") => {
    if (type === "from") {
      setFromAsset(asset);
    } else {
      setToAsset(asset);
    }
    setIsDropdownOpen(null);
  };

  return (
    <div className="mx-auto p-6 max-w-xl w-full overflow-x-hidden md:overflow-x-visible">
      <div className="w-full mx-auto flex items-center flex-col rounded-3xl gap-2">
        <div className="relative w-full">
          <div className="w-full">
            <Image
              src="/toprectangle.png"
              alt="toprectangle"
              className="w-full h-10 -mb-1"
              width={576}
              height={200}
            />
            <div className="bg-white mb-4 w-full rounded-b-[30px] border-b border-x border-gray-100 p-4 md:p-6">
              <label className="block text-xl md:text-2xl font-medium text-gray-700 mb-3 md:mb-4">
                You Pay
              </label>
              <div className="w-full flex items-center justify-between gap-2 md:gap-3">
                <div className="flex-shrink-0">
                  <AssetDropdown
                    type="from"
                    selectedAsset={fromAsset}
                    isOpen={isDropdownOpen === "from"}
                    onToggle={() =>
                      setIsDropdownOpen(isDropdownOpen === "from" ? null : "from")
                    }
                    onSelect={(asset) => handleAssetSelect(asset, "from")}
                  />
                </div>
                <div className="relative flex-1 flex flex-col items-end gap-1 min-w-0">
                  <input
                    type="text"
                    inputMode="decimal"
                    pattern="[0-9]*[.,]?[0-9]*"
                    placeholder={isQuoteLoading ? "" : "0.0"}
                    value={sendValue}
                    onChange={(e) => {
                      let value = e.target.value;
                      if (value === ".") {
                        value = "0.";
                      }
                      value = value.replace(/[^0-9.]/g, "");
                      if (/^0+$/.test(value) && value.length > 1) {
                        value = "0";
                      }
                      if (value.length > 1 && value[0] === "0" && /^\d$/.test(value[1])) {
                        value = "0";
                      }
                      const parts = value.split(".");
                      if (parts.length > 2) {
                        value = parts[0] + "." + parts.slice(1).join("");
                      }
                      setsendValue(value);
                    }}
                    className="text-xl md:text-2xl font-bold text-gray-900 bg-transparent focus:outline-none p-0 w-full min-w-[60px] text-right"
                    disabled={!fromAsset}
                    autoComplete="off"
                  />
                  {sendValue && !isQuoteLoading && (
                    <span className="text-xs text-gray-500 font-medium">
                      $
                      {parseFloat(sendValue).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="w-full mb-2 relative">
            <div className="absolute left-1/2 transform -translate-x-1/2 -top-6 w-full flex items-center justify-center z-10 pointer-events-none">
              <motion.button
                whileHover={{ scale: 1, rotate: 180 }}
                whileTap={{ scale: 0.95 }}
                onClick={swapAssets}
                transition={{ duration: 0.2, ease: "linear" }}
                disabled={!fromAsset || !toAsset}
                className="p-2 rounded-full bg-[#e84142] cursor-pointer hover:bg-[#e84142]/90 text-white transition-colors duration-200 pointer-events-auto"
                title="Swap assets"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
                  />
                </svg>
              </motion.button>
            </div>
            <div className={`bg-white w-full ${!quote || !sendValue || parseFloat(sendValue) <= 0 ? 'rounded-t-[30px] rounded-b-none' : 'rounded-[30px]'} border-t border-x ${!quote || !sendValue || parseFloat(sendValue) <= 0 ? 'border-b-0' : 'border-b'} border-gray-100 p-4 md:p-6`}>
              <label className="block text-xl md:text-2xl font-medium text-gray-700 mb-3 md:mb-4">
                You Receive
              </label>
              <div className="w-full flex items-center justify-between gap-2 md:gap-3">
                <div className="flex-shrink-0">
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
                <div className="relative flex-1 flex flex-col items-end gap-1 min-w-0">
                  <input
                    type="decimal"
                    placeholder={isQuoteLoading ? "" : "0.0"}
                    value={isQuoteLoading ? "" : receiveAmount}
                    readOnly
                    className="text-xl md:text-2xl font-bold text-gray-900 bg-transparent focus:outline-none p-0 w-full min-w-[60px] text-right"
                    disabled={!toAsset}
                  />
                  {receiveValue && !isQuoteLoading && (
                    <span className="text-xs text-gray-500 font-medium">
                      $
                      {parseFloat(receiveValue).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  )}
                  {isQuoteLoading && (
                    <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  )}
                </div>
              </div>
            </div>
            {(!quote || !sendValue || parseFloat(sendValue) <= 0) && (
              <div className="relative mb-4">
                <Image
                  src="/bottomrectangle.png"
                  alt="bottomrectangle"
                  className="w-full h-10 rounded-b-[30px]"
                  height={200}
                  width={576}
                />
              </div>
            )}
          </div>
        </div>

        <AnimatePresence>
          {quote && quote.result?.[0]?.feeBips !== undefined && fromAsset && sendValue && parseFloat(sendValue) > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0, y: 10 }}
              animate={{ height: "auto", opacity: 1, y: 0 }}
              exit={{ height: 0, opacity: 0, y: 10 }}
              transition={{
                height: { duration: 0.45, ease: [0.32, 0.72, 0, 1] },
                opacity: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
                y: { duration: 0.45, ease: [0.32, 0.72, 0, 1] },
              }}
              className="w-full mb-4 overflow-hidden"
            >
              <div className="bg-white w-full rounded-t-[30px] border-t border-x border-gray-100 p-6">
                <label className="block text-2xl font-medium text-gray-700 mb-3">
                  Fees & Rate
                </label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Fee (Bips)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {quote.result[0].feeBips} bips
                    </span>
                  </div>

                  {parseFloat(sendValue) > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        Fee ({fromAsset.asset.symbol})
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {(
                          (parseFloat(sendValue) * quote.result[0].feeBips) /
                          10000
                        ).toFixed(
                          fromAsset.asset.decimals > 6
                            ? 6
                            : fromAsset.asset.decimals
                        )}{" "}
                        {fromAsset.asset.symbol}
                      </span>
                    </div>
                  )}

                  {parseFloat(sendValue) > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">Fee (USD)</span>
                      <span className="text-sm font-medium text-gray-900">
                        $
                        {(
                          (parseFloat(sendValue) * quote.result[0].feeBips) /
                          10000
                        ).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                          minimumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  )}

                  {parseFloat(sendValue) > 0 && receiveAmount && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Rate</span>
                      <span className="text-sm font-medium text-gray-900">
                        1 {fromAsset.asset.symbol} ={" "}
                        {(
                          parseFloat(receiveAmount) / parseFloat(sendValue)
                        ).toFixed(6)}{" "}
                        {toAsset?.asset.symbol || ""}
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <motion.div
                initial={{ opacity: 0, scaleY: 0 }}
                animate={{
                  opacity: 1,
                  scaleY: 1,
                  transition: {
                    duration: 0.45,
                    ease: [0.32, 0.72, 0, 1],
                  }
                }}
                exit={{
                  opacity: 0,
                  scaleY: 0,
                  transition: {
                    duration: 0.45,
                    ease: [0.32, 0.72, 0, 1],
                  }
                }}
                style={{ originY: 0 }}
              >
                <Image
                  src="/bottomrectangle.png"
                  alt="bottomrectangle"
                  className="w-full h-10 -mt-1"
                  height={200}
                  width={576}
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <SlideToConfirmButton
        disabled={
          !fromAsset ||
          !toAsset ||
          !sendValue ||
          !quote ||
          !receiveAmount ||
          isLoading ||
          isQuoteLoading
        }
        isLoading={isLoading || isQuoteLoading}
        loadingText={
          isLoading
            ? "Loading Assets..."
            : isQuoteLoading
              ? "Getting Quote..."
              : "Processing..."
        }
        confirmText="Confirm Swap"
        onConfirm={() => {
          console.log("Swap confirmed:", {
            fromAsset,
            toAsset,
            sendValue,
            receiveAmount,
          });
        }}
      />
    </div>
  );
};

export default Swap;
