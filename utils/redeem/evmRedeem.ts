import { evmHTLCABI } from "../../abi/evmHTLC";
import { with0x, trim0x } from "../redeem";

export interface EvmRedeemParams {
  escrowAddress: string;
  swapId: string;
  secret: string;
  chainId: number;
  writeContract: (config: {
    address: `0x${string}`;
    abi: readonly unknown[];
    functionName: string;
    args: unknown[];
    chainId: number;
  }) => void;
}

/**
 * Redeem an EVM HTLC swap by calling claimSwap
 */
export const evmRedeem = (params: EvmRedeemParams): void => {
  const { escrowAddress, swapId, secret, chainId, writeContract } = params;

  // Ensure addresses have 0x prefix
  const contractAddress = with0x(trim0x(escrowAddress)) as `0x${string}`;
  const swapIdBytes32 = with0x(trim0x(swapId)) as `0x${string}`;

  // Ensure secret is in bytes format (the ABI expects bytes, not bytes32)
  // Remove 0x if present, then add it back for proper hex formatting
  const secretBytes = secret.startsWith("0x") ? secret.slice(2) : secret;
  const secretFormatted = `0x${secretBytes}` as `0x${string}`;

  // Call claimSwap function
  writeContract({
    address: contractAddress,
    abi: evmHTLCABI,
    functionName: "claimSwap",
    args: [swapIdBytes32, secretFormatted],
    chainId,
  });
};

