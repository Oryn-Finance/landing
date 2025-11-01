"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { AssetDropdown } from "./AssetDropdown";
import SlideToConfirmButton from "./SlideToConfirmButton";
import { useAssetsStore } from "../store/assetsStore";

interface SwapProps {
  onOrderCreated?: (orderId: string) => void;
}

const Swap: React.FC<SwapProps> = () => {
  const {
    fromAsset,
    toAsset,
    sendAmount,
    receiveAmount,
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
    <div className="mx-auto p-6 max-w-2xl min-w-xl w-full">
      <div className="relative w-full flex items-center flex-col rounded-3xl p-6">
        {/* From Asset */}
        <div className="w-full">
          <img
            src="/toprectangle.png"
            alt="toprectangle"
            className="w-full h-10 -mb-1"
          />
          <div className="bg-white mb-2 w-full rounded-b-[30px] border-b border-x border-gray-100 p-6">
            <label className="block text-2xl font-medium text-gray-700 mb-2">
              You Pay
            </label>
            <div className="w-full justify-between gap-2 flex items-center">
              <AssetDropdown
                type="from"
                selectedAsset={fromAsset}
                isOpen={isDropdownOpen === "from"}
                onToggle={() =>
                  setIsDropdownOpen(isDropdownOpen === "from" ? null : "from")
                }
                onSelect={(asset) => handleAssetSelect(asset, "from")}
              />
              <div className="relative w-1/2">
                <input
                  inputMode="decimal"
                  pattern="[0-9]*[.,]?[0-9]*"
                  placeholder="0.0"
                  value={sendAmount}
                  onChange={(e) => setSendAmount(e.target.value)}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#e84142]/70 focus:border-transparent"
                  disabled={!fromAsset}
                  autoComplete="off"
                />
                {isQuoteLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex -my-2 top-48 w-full items-center absolute justify-center z-10">
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
          <div className="bg-white w-full rounded-t-[30px] border-t border-x border-gray-100 p-6">
            <label className="block text-2xl font-medium text-gray-700 mb-2">
              You Receive
            </label>
            <div className="w-full flex items-center justify-between gap-2">
              <AssetDropdown
                type="to"
                selectedAsset={toAsset}
                isOpen={isDropdownOpen === "to"}
                onToggle={() =>
                  setIsDropdownOpen(isDropdownOpen === "to" ? null : "to")
                }
                onSelect={(asset) => handleAssetSelect(asset, "to")}
              />
              <div className="relative w-1/2">
                <input
                  type="number"
                  placeholder="0.0"
                  value={receiveAmount}
                  readOnly
                  className="w-full p-3 border border-gray-200 rounded-lg bg-gray-50 focus:outline-none"
                  disabled={!toAsset}
                />
                {isQuoteLoading && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <img
            src="/bottomrectangle.png"
            alt="bottomrectangle"
            className="w-full h-10 -mt-1"
          />
        </div>
        {/* Bridge Button */}
        <SlideToConfirmButton
          disabled={
            !fromAsset || !toAsset || !sendAmount || isLoading || isQuoteLoading
          }
          isLoading={false}
          loadingText={
            isLoading
              ? "Loading Assets..."
              : isQuoteLoading
              ? "Getting Quote..."
              : "Redirecting..."
          }
          confirmText="Go to App"
          onConfirm={() => {
            // TODO: Replace with actual app URL when ready
            window.location.href = "https://random.url";
          }}
        />
      </div>
    </div>
  );
};

export default Swap;
