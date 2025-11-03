import { evmRedeem, EvmRedeemParams } from "./evmRedeem";
import { bitcoinRedeem, BitcoinRedeemParams } from "./bitcoinRedeem";
import { starknetRedeem, StarknetRedeemParams } from "./starknetRedeem";
import { getChainIdFromAsset } from "../redeem";

export type RedeemType = "evm" | "bitcoin" | "starknet";

/**
 * Determine the redeem type based on asset string
 * Asset format: "chain:asset_id" (e.g., "arbitrum_sepolia:wbtc", "bitcoin:btc", "starknet:eth")
 */
export const getRedeemTypeFromAsset = (asset: string): RedeemType => {
  const chainName = asset.split(":")[0].toLowerCase();

  // Check for EVM chains
  const evmChains = [
    "ethereum",
    "ethereum_sepolia",
    "arbitrum",
    "arbitrum_sepolia",
    "avalanche",
    "avalanche_testnet",
    "base",
    "base_sepolia",
    "polygon",
    "optimism",
  ];

  if (evmChains.some((chain) => chainName.includes(chain))) {
    return "evm";
  }

  // Check for Bitcoin
  if (chainName.includes("bitcoin")) {
    return "bitcoin";
  }

  // Check for Starknet
  if (chainName.includes("starknet")) {
    return "starknet";
  }

  // Default to EVM for unknown chains (most common case)
  return "evm";
};

/**
 * Unified redeem interface
 */
export interface UnifiedRedeemParams {
  asset: string;
  escrowAddress: string;
  swapId: string;
  secret: string;
  // EVM specific
  chainId?: number;
  writeContract?: (config: {
    address: `0x${string}`;
    abi: readonly unknown[];
    functionName: string;
    args: unknown[];
    chainId: number;
  }) => void;
  // Bitcoin specific
  htlcAddress?: string;
  recipientAddress?: string;
}

export interface UnifiedRedeemResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Execute the appropriate redeem based on asset type
 */
export const executeRedeem = (
  params: UnifiedRedeemParams
): void | Promise<UnifiedRedeemResult> => {
  const redeemType = getRedeemTypeFromAsset(params.asset);

  switch (redeemType) {
    case "evm": {
      if (!params.chainId || !params.writeContract) {
        throw new Error(
          "chainId and writeContract are required for EVM redeem"
        );
      }

      const chainId =
        params.chainId || getChainIdFromAsset(params.asset) || undefined;
      if (!chainId) {
        throw new Error(`Unable to determine chain ID for asset: ${params.asset}`);
      }

      evmRedeem({
        escrowAddress: params.escrowAddress,
        swapId: params.swapId,
        secret: params.secret,
        chainId,
        writeContract: params.writeContract!,
      });
      return; // EVM redeem is synchronous (triggers wagmi writeContract)
    }

    case "bitcoin": {
      if (!params.htlcAddress || !params.recipientAddress) {
        throw new Error(
          "htlcAddress and recipientAddress are required for Bitcoin redeem"
        );
      }

      return bitcoinRedeem({
        swapId: params.swapId,
        secret: params.secret,
        htlcAddress: params.htlcAddress,
        recipientAddress: params.recipientAddress,
      });
    }

    case "starknet": {
      return starknetRedeem({
        escrowAddress: params.escrowAddress,
        swapId: params.swapId,
        secret: params.secret,
      });
    }

    default: {
      throw new Error(`Unsupported redeem type for asset: ${params.asset}`);
    }
  }
};

// Re-export everything for convenience
export { evmRedeem, bitcoinRedeem, starknetRedeem };
export type { EvmRedeemParams, BitcoinRedeemParams, StarknetRedeemParams };

