import { getContract, WalletClient } from "viem";
import { evmHTLCABI } from "../../abi/evmHTLC";
import { with0x } from "../redeem";
import { chainIdToEvmChain, switchOrAddNetwork } from "../networkUtils";

export interface EvmRedeemParams {
  escrowAddress: string;
  swapId: string;
  secret: string;
  chainId: number;
  wallet: WalletClient;
}

/**
 * Redeem an EVM HTLC swap by calling claimSwap
 */
export const evmRedeem = async (params: EvmRedeemParams): Promise<{ success: boolean; txHash: string }> => {
  const { escrowAddress, swapId, secret, wallet, chainId } = params;

  // Ensure addresses have 0x prefix
  const contractAddress = with0x(escrowAddress);
  const swapIdBytes32 = with0x(swapId);

  // Switch or add to the correct network
  const switchResult = await switchOrAddNetwork(chainIdToEvmChain[chainId], wallet);

  if (switchResult.isErr()) {
    throw new Error(`Network switch failed: ${switchResult.error}`);
  }

  const switchedWalletClient = switchResult.value.walletClient;

  const contract = getContract({
    abi: evmHTLCABI,
    address: contractAddress,
    client: switchedWalletClient,
  });
  
  // Ensure secret is in bytes format (the ABI expects bytes, not bytes32)
  const secretFormatted = secret.startsWith("0x") ? secret : `0x${secret}`;

  const result = await contract.write.claimSwap([swapIdBytes32, secretFormatted], {
    account: switchedWalletClient.account,
  });

  return {
    success: true,
    txHash: result,
  };
};
