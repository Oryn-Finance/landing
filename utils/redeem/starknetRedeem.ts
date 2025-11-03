/**
 * Starknet HTLC redemption
 * This implementation handles Starknet HTLC claim functionality
 * 
 * Starknet redemption involves:
 * 1. Getting Starknet account from wallet
 * 2. Creating a provider and contract instance
 * 3. Calling the claim_swap function with swap_id and secret
 * 4. Waiting for transaction confirmation
 */

import { RpcProvider, Contract, AccountInterface } from "starknet";
import { trim0x } from "../redeem";
import { starknetHTLC } from "@/abi/starknetEscrow";

export interface StarknetRedeemParams {
  escrowAddress: string;
  swapId: string;
  secret: string;
}

export interface StarknetRedeemResult {
  success: boolean;
  txHash?: string;
  error?: string;
}

/**
 * Convert hex secret string to array of u32 values
 * The secret should be a 32-byte hex string (64 hex chars)
 * which gets converted to 8 u32 values (32 bytes / 4 bytes per u32)
 */
function secretToU32Array(secret: string): number[] {
  // Remove 0x prefix if present
  const hexString = trim0x(secret);

  // Ensure we have a valid 32-byte hex string (64 hex characters)
  if (hexString.length !== 64) {
    throw new Error(`Secret must be 32 bytes (64 hex characters), got ${hexString.length} characters`);
  }

  const u32Array: number[] = [];

  // Convert every 8 hex characters (4 bytes) to a u32 value
  for (let i = 0; i < hexString.length; i += 8) {
    const hexChunk = hexString.slice(i, i + 8);
    const u32Value = parseInt(hexChunk, 16);
    u32Array.push(u32Value);
  }

  return u32Array;
}

/**
 * Get Starknet account from browser wallet
 */
function getStarknetAccount(): AccountInterface | null {
  if (typeof window === "undefined") {
    return null;
  }

  const starknet = (window as any).starknet;
  if (!starknet || !starknet.account) {
    return null;
  }

  return starknet.account;
}

/**
 * Get Starknet provider
 * Uses the network from the connected wallet, or defaults to testnet
 */
function getStarknetProvider(): RpcProvider {
  // Default to Starknet testnet, but can be overridden by wallet
  // The wallet's provider will be used if available
  const providerUrl = process.env.NEXT_PUBLIC_STARKNET_RPC_URL ||
    "https://starknet-sepolia.public.blastapi.io/rpc/v0_8";

  return new RpcProvider({
    nodeUrl: providerUrl,
  });
}

/**
 * Redeem a Starknet HTLC swap
 */
export const starknetRedeem = async (
  params: StarknetRedeemParams
): Promise<StarknetRedeemResult> => {
  const { escrowAddress, swapId, secret } = params;

  try {
    // Get Starknet account from wallet
    const account = getStarknetAccount();
    if (!account) {
      return {
        success: false,
        error: "Starknet wallet not connected. Please connect your wallet first.",
      };
    }

    // Get provider
    const provider = getStarknetProvider();

    // Create contract instance
    const contract = new Contract(
      starknetHTLC,
      escrowAddress,
      provider
    );

    // Connect the contract to the account for transactions
    contract.connect(account);

    // Convert secret from hex string to array of u32
    const secretArray = secretToU32Array(secret);

    // Convert swapId to felt252 (bigint)
    // Remove 0x prefix if present and convert to bigint
    const swapIdFelt = BigInt(swapId.startsWith("0x") ? swapId : `0x${swapId}`);

    // Call claim_swap function
    const result = await contract.claim_swap(swapIdFelt, secretArray);

    // Wait for transaction to be accepted
    await provider.waitForTransaction(result.transaction_hash);

    return {
      success: true,
      txHash: result.transaction_hash,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
};