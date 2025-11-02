"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
      <div className="relative w-full flex items-center flex-col rounded-3xl px-6 gap-2">
        {/* From Asset */}
        <div className="w-full">
          <Image
            src="/toprectangle.png"
            alt="toprectangle"
            className="w-full h-10 -mb-1"
            width={576}
            height={200}
          />
          <div className="bg-white mb-2 w-full rounded-b-[30px] border-b border-x border-gray-100 p-6">
            <label className="block text-2xl font-medium text-gray-700 mb-4">
              You Pay
            </label>
            <div className="w-full flex items-center justify-between gap-3">
              <div className="w-fit">
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
              <div className="relative w-fit">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="0.0"
                  value={sendValue}
                  onChange={(e) => {
                    let value = e.target.value;
                    // If user types just ".", convert to "0."
                    if (value === ".") {
                      value = "0.";
                    }
                    // Remove any non-numeric characters except decimal point
                    value = value.replace(/[^0-9.]/g, "");
                    // Ensure only one decimal point
                    const parts = value.split(".");
                    if (parts.length > 2) {
                      value = parts[0] + "." + parts.slice(1).join("");
                    }
                    setsendValue(value);
                  }}
                  className="text-2xl font-bold text-gray-900 bg-transparent focus:outline-none p-0 w-auto min-w-[80px] text-right"
                  disabled={!fromAsset}
                  autoComplete="off"
                />
                {sendValue && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {isQuoteLoading && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="text-xs text-gray-500 font-medium translate-y-6 translate-x-3">
                      $
                      {parseFloat(sendValue).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {!sendValue && isQuoteLoading && (
                  <div className="absolute right-0 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex -my-2 w-full items-center absolute justify-center z-10 left-0 top-[calc(50%)]">
          <motion.button
            whileHover={{ scale: 1, rotate: 180 }}
            whileTap={{ scale: 0.95 }}
            onClick={swapAssets}
            transition={{ duration: 0.2, ease: "linear" }}
            disabled={!fromAsset || !toAsset}
            className="p-2 rounded-full bg-[#e84142] cursor-pointer hover:bg-[#e84142]/90 text-white transition-colors duration-200"
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

        {/* To Asset */}
        <div className="w-full mb-4">
          <div className="bg-white w-full rounded-[30px] border-t border-x border-gray-100 p-6">
            <label className="block text-2xl font-medium text-gray-700 mb-4">
              You Receive
            </label>
            <div className="w-full flex items-center justify-between gap-3">
              <div className="w-fit">
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
              <div className="relative w-fit">
                <input
                  type="decimal"
                  placeholder="0.0"
                  value={receiveAmount}
                  readOnly
                  className="text-2xl font-bold text-gray-900 bg-transparent focus:outline-none p-0 w-auto min-w-[80px] text-right"
                  disabled={!toAsset}
                />
                {receiveValue && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {isQuoteLoading && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="text-xs text-gray-500 font-medium translate-y-6 translate-x-3">
                      $
                      {parseFloat(receiveValue).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {!receiveValue && isQuoteLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-full mb-4 px-6">
        <div className="bg-white w-full rounded-t-[30px] border-t border-x border-gray-100 p-6">
          <label className="block text-2xl font-medium text-gray-700 mb-3">
            Fees & Rate
          </label>
          <div className="space-y-3">
            {quote?.result?.[0]?.feeBips !== undefined &&
              fromAsset &&
              sendValue && (
                <>
                  {/* Fee in Bips */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Fee (Bips)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {quote.result[0].feeBips} bips
                    </span>
                  </div>

                  {/* Fee in Input Asset */}
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

                  {/* Fee in USD */}
                  {sendValue && (
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

                  {/* Conversion Rate */}
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
                </>
              )}
            {(!quote || !quote.result?.[0]?.feeBips) && (
              <div className="text-sm text-gray-400 text-center py-2">
                Select assets and enter amount to see fees and rate
              </div>
            )}
          </div>
        </div>
        <Image
          src="/bottomrectangle.png"
          alt="bottomrectangle"
          className="w-full h-10 -mt-1"
          height={200}
          width={576}
        />
      </div>

      {/* Bridge Button */}
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
          // Handle swap confirmation here
          console.log("Swap confirmed:", {
            fromAsset,
            toAsset,
            sendValue,
            receiveAmount,
          });
          // TODO: Implement actual swap logic
        }}
      />
    </div>
  );
};

export default Swap;
