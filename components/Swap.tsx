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
    sendAmount,
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
  } = useAssetsStore();

  const [isDropdownOpen, setIsDropdownOpen] = useState<"from" | "to" | null>(
    null
  );

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

  return (
    <div className="mx-auto p-6 max-w-2xl w-full overflow-x-hidden md:overflow-x-visible">
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
            <label className="block text-2xl font-medium text-gray-700 mb-2">
              You Pay
            </label>
            <div className="w-full justify-between gap-2 flex items-center flex-wrap md:flex-nowrap">
              <div className="w-full md:flex-1 min-w-0">
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
              <div className="relative w-full md:w-2/5 min-w-0">
                <input
                  type="text"
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="0.0"
                  value={sendAmount}
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
                    setSendAmount(value);
                  }}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e84142]/70 focus:border-transparent"
                  disabled={!fromAsset}
                  autoComplete="off"
                />
                {sendValue && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {isQuoteLoading && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="text-xs text-gray-500 font-medium">
                      $
                      {parseFloat(sendValue).toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                )}
                {!sendValue && isQuoteLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
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
            <label className="block text-2xl font-medium text-gray-700 mb-2">
              You Receive
            </label>
            <div className="w-full flex items-center justify-between gap-2 flex-wrap md:flex-nowrap">
              <div className="w-full md:flex-1 min-w-0">
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
              <div className="relative w-full md:w-2/5 min-w-0">
                <input
                  type="number"
                  placeholder="0.0"
                  value={receiveAmount}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
                  disabled={!toAsset}
                />
                {receiveValue && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
                    {isQuoteLoading && (
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    <span className="text-xs text-gray-500 font-medium">
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
              sendAmount && (
                <>
                  {/* Fee in Bips */}
                  <div className="flex items-center justify-between py-2 border-b border-gray-100">
                    <span className="text-sm text-gray-600">Fee (Bips)</span>
                    <span className="text-sm font-medium text-gray-900">
                      {quote.result[0].feeBips} bips
                    </span>
                  </div>

                  {/* Fee in Input Asset */}
                  {parseFloat(sendAmount) > 0 && (
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-600">
                        Fee ({fromAsset.asset.symbol})
                      </span>
                      <span className="text-sm font-medium text-gray-900">
                        {(
                          (parseFloat(sendAmount) * quote.result[0].feeBips) /
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
                  {parseFloat(sendAmount) > 0 && receiveAmount && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-gray-600">Rate</span>
                      <span className="text-sm font-medium text-gray-900">
                        1 {fromAsset.asset.symbol} ={" "}
                        {(
                          parseFloat(receiveAmount) / parseFloat(sendAmount)
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
          !fromAsset || !toAsset || !sendAmount || isLoading || isQuoteLoading
        }
        isLoading={isLoading}
        loadingText={
          isLoading
            ? "Loading Assets..."
            : isQuoteLoading
            ? "Getting Quote..."
            : "Processing..."
        }
        confirmText="Confirm Swap"
        className="translate-x-6 max-w-xl"
        onConfirm={() => {
          // Handle swap confirmation here
          console.log("Swap confirmed:", {
            fromAsset,
            toAsset,
            sendAmount,
            receiveAmount,
          });
          // TODO: Implement actual swap logic
        }}
      />
    </div>
  );
};

export default Swap;
