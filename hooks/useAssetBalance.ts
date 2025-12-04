import { type AssetOption } from "../store/assetsStore";
import { useStarknetWallet } from "./useStarknetWallet";
import { useWalletStore } from "../store/walletStore";
import { useEffect, useState, useMemo } from "react";
import { erc20Abi, formatUnits, createPublicClient, http, type Address } from "viem";
import { avalancheFuji, arbitrumSepolia } from "wagmi/chains";
import { RpcProvider, Contract } from "starknet";

const isStarknetChain = (chainId: string, chainName: string): boolean => {
  const identifier = `${chainId}${chainName}`.toLowerCase();
  return identifier.includes("starknet") || identifier.includes("stark");
};

const isNativeToken = (tokenAddress: string | undefined): boolean => {
  if (!tokenAddress) return true;
  return (
    tokenAddress === "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE" ||
    tokenAddress.toLowerCase() === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"
  );
};

export const useAssetBalance = (asset: AssetOption | null) => {
  const { evmWallet, starknetWallet } = useWalletStore();
  const { starknetAccount } = useStarknetWallet();
  const [balance, setBalance] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const walletAddress = useMemo(() => {
    if (!asset) return null;
    if (isStarknetChain(asset.chainId, asset.chainName)) {
      return starknetWallet?.isConnected ? starknetWallet.address : null;
    }
    return evmWallet?.isConnected ? evmWallet.address : null;
  }, [asset, evmWallet, starknetWallet]);

  const isNative = useMemo(() => {
    if (!asset) return false;
    return (
      asset.asset.symbol === "ETH" || 
      asset.asset.symbol === "AVAX" ||
      asset.asset.symbol === "MATIC" ||
      (asset.tokenAddress && isNativeToken(asset.tokenAddress))
    );
  }, [asset]);

  const getChainConfig = (chainName: string) => {
    const chainMap: Record<string, { id: number; rpc: string }> = {
      "Avalanche Testnet": { id: 43113, rpc: avalancheFuji.rpcUrls.default.http[0] },
      "Arbitrum Sepolia": { id: 421614, rpc: arbitrumSepolia.rpcUrls.default.http[0] },
      "Base Sepolia": { id: 84532, rpc: "https://sepolia.base.org" },
    };
    return chainMap[chainName];
  };

  useEffect(() => {
    const fetchEVMBalance = async () => {
      if (!asset || !walletAddress || isStarknetChain(asset.chainId, asset.chainName)) {
        setBalance(null);
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      try {
        const chainConfig = getChainConfig(asset.chainName);
        if (!chainConfig) {
          setBalance(null);
          setIsLoading(false);
          return;
        }

        const publicClient = createPublicClient({
          chain: {
            id: chainConfig.id,
            name: asset.chainName,
            network: asset.chainId,
            nativeCurrency: { name: asset.asset.symbol, symbol: asset.asset.symbol, decimals: asset.asset.decimals },
            rpcUrls: { default: { http: [chainConfig.rpc] } },
          },
          transport: http(chainConfig.rpc),
        });

        let balanceValue: bigint;

        if (isNative) {
          balanceValue = await publicClient.getBalance({
            address: walletAddress as Address,
          });
        } else {
          if (!asset.tokenAddress || !asset.tokenAddress.startsWith("0x")) {
            setBalance(null);
            setIsLoading(false);
            return;
          }

          const result = await publicClient.readContract({
            address: asset.tokenAddress as Address,
            abi: erc20Abi,
            functionName: "balanceOf",
            args: [walletAddress as Address],
          });

          balanceValue = result as bigint;
        }

        const formatted = formatUnits(balanceValue, asset.asset.decimals);
        setBalance(formatted);
      } catch (error) {
        console.error("Failed to fetch EVM balance:", error);
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchEVMBalance();
  }, [asset, walletAddress, isNative]);

  useEffect(() => {
    const fetchStarknetBalance = async () => {
      if (!asset || !isStarknetChain(asset.chainId, asset.chainName) || !starknetAccount || !walletAddress) {
        if (isStarknetChain(asset?.chainId || "", asset?.chainName || "")) {
          setBalance(null);
          setIsLoading(false);
        }
        return;
      }

      setIsLoading(true);
      try {
        const provider = new RpcProvider({
          nodeUrl: "https://starknet-sepolia.public.blastapi.io/rpc/v0_7",
        });

        const erc20ABI = [
          {
            members: [
              {
                name: "low",
                offset: 0,
                type: "felt",
              },
              {
                name: "high",
                offset: 1,
                type: "felt",
              },
            ],
            name: "Uint256",
            size: 2,
            type: "struct",
          },
          {
            inputs: [
              {
                name: "account",
                type: "felt",
              },
            ],
            name: "balanceOf",
            outputs: [
              {
                name: "balance",
                type: "Uint256",
              },
            ],
            stateMutability: "view",
            type: "function",
          },
        ];

        let contractAddress: string;
        
        if (asset.asset.symbol === "STRK" || !asset.tokenAddress || asset.tokenAddress === "primary") {
          contractAddress = "0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7";
        } else if (asset.tokenAddress && asset.tokenAddress.startsWith("0x")) {
          contractAddress = asset.tokenAddress;
        } else {
          setBalance(null);
          setIsLoading(false);
          return;
        }

        const balanceResult = await provider.callContract({
          contractAddress: contractAddress,
          entrypoint: "balanceOf",
          calldata: [walletAddress],
        });
        
        if (balanceResult && Array.isArray(balanceResult) && balanceResult.length >= 2) {
          const low = BigInt(balanceResult[0]);
          const high = BigInt(balanceResult[1] || "0");
          const shift128 = BigInt(2) ** BigInt(128);
          const totalBalance = low + (high * shift128);
          const formatted = formatUnits(totalBalance, asset.asset.decimals);
          setBalance(formatted);
        } else {
          setBalance(null);
        }
      } catch (error) {
        console.error("Failed to fetch Starknet balance:", error);
        setBalance(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStarknetBalance();
  }, [asset, starknetAccount, walletAddress]);

  return {
    balance,
    isLoading,
    hasBalance: balance !== null && parseFloat(balance) > 0,
  };
};

