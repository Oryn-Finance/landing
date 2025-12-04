"use client";

import { type AssetOption } from "../store/assetsStore";
import Image from "next/image";
import { AssetSelectorModal } from "./AssetSelectorModal";
import { getAssetLogo, getChainLogo } from "@/utils/assetUtils";

export const AssetDropdown: React.FC<{
  type: "from" | "to";
  selectedAsset: AssetOption | null;
  isOpen: boolean;
  onToggle: () => void;
  onSelect: (asset: AssetOption) => void;
}> = ({ type, selectedAsset, isOpen, onToggle, onSelect }) => {
  return (
    <>
      <button
        onClick={onToggle}
        suppressHydrationWarning
        className={`flex items-center gap-3 transition-all duration-200 rounded-xl cursor-pointer py-1
          ${isOpen ? "scale-[0.98]" : "hover:scale-[1.02]"}
        `}
      >
        <div className="flex items-center gap-2 md:gap-3 h-12 overflow-hidden">
          {selectedAsset ? (
            <>
              <div className="relative flex items-center shrink-0">
                {getAssetLogo(selectedAsset.asset.symbol, "md")}
                <div className="absolute -bottom-1 -right-1">
                  {getChainLogo(selectedAsset.chainName, "sm")}
                </div>
              </div>
              <div className="flex flex-col min-w-0">
                <span className="font-semibold text-white text-base md:text-lg leading-tight truncate">
                  {selectedAsset.asset.symbol}
                </span>
              </div>
            </>
          ) : (
            <span
              className="relative inline-block font-medium text-base md:text-lg  group/select"
              onMouseEnter={(e) => {
                const gradientText = (
                  e.currentTarget as HTMLElement
                ).querySelector(".gradient-text") as HTMLElement;
                if (gradientText) {
                  gradientText.style.clipPath =
                    "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)";
                }
              }}
              onMouseLeave={(e) => {
                const gradientText = (
                  e.currentTarget as HTMLElement
                ).querySelector(".gradient-text") as HTMLElement;
                if (gradientText) {
                  gradientText.style.clipPath =
                    "polygon(100% 100%, 100% 100%, 100% 100%, 100% 100%)";
                }
              }}
            >
              <span className="relative z-10 text-gray-400">Select asset</span>
            </span>
          )}
        </div>
        <Image src="/dropdown.svg" alt="Arrow Down" width={12} height={12} className="w-3 h-3 translate-y-[1px] " unoptimized />
      </button>

      <AssetSelectorModal
        isOpen={isOpen}
        onClose={onToggle}
        type={type}
        selectedAsset={selectedAsset}
        onSelect={onSelect}
      />
    </>
  );
};