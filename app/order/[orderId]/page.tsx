"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import QRCodeSVG from "react-qr-code";
import { Navbar } from "../../../components/Navbar";
import OrdersSidebar from "../../../components/OrdersSidebar";
import PixelBlast from "@/components/ui/PixelBlast";
import { API_URLS } from "../../../constants/constants";
import type { Order, OrderStatus } from "../../../types/order";
import { Copy, CheckCircle2, Clock, Loader2, ArrowLeft } from "lucide-react";
import {
  useSignMessage,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useSendTransaction,
  useWalletClient,
} from "wagmi";
import { getSecret, type SecretData } from "../../../utils/secretManager";
import { with0x, trim0x, getChainIdFromAsset } from "../../../utils/redeem";
import {
  executeRedeem,
  getRedeemTypeFromAsset,
} from "../../../utils/redeem/index";
import { erc20Abi, type WalletClient } from "viem";
import { useAssetsStore } from "@/store/assetsStore";
import { ExternalLink } from "lucide-react";
import Image from "next/image";

const ASSET_LOGOS: Record<string, string> = {
  wbtc: "https://s2.coinmarketcap.com/static/img/coins/64x64/3717.png",
  avax: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  usdc: "https://s2.coinmarketcap.com/static/img/coins/64x64/3408.png",
  bitcoin: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  strk: "https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
};

const CHAIN_LOGOS: Record<string, string> = {
  "Arbitrum Sepolia":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/11841.png",
  "Avalanche Testnet":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  "Bitcoin Testnet":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  "Starknet Sepolia":
    "https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
  Avalanche: "https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png",
  Bitcoin: "https://s2.coinmarketcap.com/static/img/coins/64x64/1.png",
  Starknet: "https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png",
};

// Explorer URL mapping for different chains
const EXPLORER_URLS: Record<string, (txHash: string) => string> = {
  arbitrum_sepolia: (txHash: string) =>
    `https://sepolia.arbiscan.io/tx/${txHash}`,
  avalanche_testnet: (txHash: string) =>
    `https://testnet.snowtrace.io/tx/${txHash}`,
  ethereum_sepolia: (txHash: string) =>
    `https://sepolia.etherscan.io/tx/${txHash}`,
  base_sepolia: (txHash: string) => `https://sepolia.basescan.org/tx/${txHash}`,
};

function getExplorerUrl(asset: string, txHash: string): string | null {
  const chainName = asset.split(":")[0];
  const explorerFn = EXPLORER_URLS[chainName];
  if (explorerFn) {
    return explorerFn(txHash);
  }
  return null;
}

const STATUS_STEPS: OrderStatus[] = [
  "initiated",
  "awaiting_deposit",
  "deposit_detected",
  "awaiting_redeem",
  "redeeming",
  "complete",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  initiated: "Initiated",
  awaiting_deposit: "Awaiting Deposit",
  deposit_detected: "Deposit Detected",
  awaiting_redeem: "Awaiting Redeem",
  redeeming: "Redeeming",
  complete: "Complete",
};

function getAssetLogo(symbol: string, size: "sm" | "md" | "lg" = "md") {
  const key = symbol.toLowerCase();
  let url: string | undefined;
  if (key === "btc" || key === "bitcoin") url = ASSET_LOGOS.bitcoin;
  else if (key === "usdc") url = ASSET_LOGOS.usdc;
  else if (key === "wbtc") url = ASSET_LOGOS.wbtc;
  else if (key === "avax") url = ASSET_LOGOS.avax;
  else if (key === "strk") url = ASSET_LOGOS.strk;

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-10 h-10",
  };

  if (url) {
    return (
      <Image
        src={url.trim()}
        alt={symbol}
        className={`${sizeClasses[size]} rounded-full object-contain`}
        style={{ background: "#fff" }}
        width={200}
        height={200}
      />
    );
  }
  return (
    <div
      className={`${sizeClasses[size]} bg-gray-700 rounded-full flex items-center justify-center text-xs font-medium text-gray-300`}
    >
      {symbol.charAt(0)}
    </div>
  );
}

function getChainLogo(chainName: string, size: "sm" | "xs" = "sm") {
  const url = CHAIN_LOGOS[chainName];
  const sizeClasses = {
    xs: "w-4 h-4",
    sm: "w-5 h-5",
  };

  if (url) {
    return (
      <Image
        src={url.trim()}
        alt={chainName}
        className={`${sizeClasses[size]} rounded-full object-contain border-2 border-gray-700`}
        style={{ background: "#fff" }}
        width={32}
        height={32}
      />
    );
  }
  return (
    <div
      className={`${sizeClasses[size]} bg-gray-700 rounded-full flex items-center justify-center text-[10px] font-medium text-gray-300 border-2 border-gray-600`}
    >
      {chainName.charAt(0)}
    </div>
  );
}

function getAssetInfo(assetString: string): { chain: string; symbol: string } {
  const parts = assetString.split(":");
  if (parts.length >= 2) {
    const chain = parts[0]
      .replace("_", " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());
    const symbol = parts[1].toUpperCase();
    return { chain, symbol };
  }
  return { chain: "Unknown", symbol: assetString.toUpperCase() };
}

function getAssetDecimals(assetString: string): number {
  const parts = assetString.split(":");
  const symbol = parts[1]?.toLowerCase() || "";

  // Common decimals by symbol
  const decimalsMap: Record<string, number> = {
    btc: 8,
    bitcoin: 8,
    eth: 18,
    ethereum: 18,
    avax: 18,
    usdc: 6,
    usdt: 6,
    wbtc: 8,
    strk: 18,
  };

  return decimalsMap[symbol] || 8;
}

function formatAmount(amount: string, assetString?: string): string {
  const decimals = assetString ? getAssetDecimals(assetString) : 8;
  const num = BigInt(amount);
  const divisor = BigInt(10 ** decimals);
  const whole = num / divisor;
  const remainder = num % divisor;
  if (remainder === BigInt(0)) {
    return whole.toString();
  }
  const decimalStr = remainder.toString().padStart(decimals, "0");
  const trimmed = decimalStr.replace(/0+$/, "");
  return `${whole}.${trimmed}`;
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.orderId as string;

  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);
  const [isOrdersSidebarOpen, setIsOrdersSidebarOpen] = useState(false);
  const pollIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isOrderCompleteRef = useRef(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [secretData, setSecretData] = useState<SecretData | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { data: walletClient } = useWalletClient();
  const { switchChain } = useSwitchChain();
  const { assets } = useAssetsStore();

  // Wagmi hook for writing contract
  const {
    writeContract,
    isPending: isWritingContract,
    data: writeContractData,
    error: writeContractError,
  } = useWriteContract();

  // Wagmi hook for payment transaction (ERC20)
  const {
    writeContract: writePaymentContract,
    isPending: isWritingPayment,
    data: paymentTxHash,
    error: paymentTxError,
  } = useWriteContract();

  // Wagmi hook for native token payment
  const {
    sendTransaction: sendNativeTransaction,
    isPending: isSendingNative,
    data: nativeTxHash,
    error: nativeTxError,
  } = useSendTransaction();

  // Wait for transaction receipt
  const { data: receipt, isLoading: isWaitingForReceipt } =
    useWaitForTransactionReceipt({
      hash: writeContractData,
    });

  // Wait for payment transaction receipt (ERC20)
  const { data: paymentReceipt, isLoading: isWaitingForPaymentReceipt } =
    useWaitForTransactionReceipt({
      hash: paymentTxHash,
    });

  // Wait for native payment transaction receipt
  const { data: nativePaymentReceipt, isLoading: isWaitingForNativeReceipt } =
    useWaitForTransactionReceipt({
      hash: nativeTxHash,
    });

  const fetchOrder = async () => {
    if (!orderId) return;

    try {
      const baseUrl = API_URLS.ORDERS.endsWith("/")
        ? API_URLS.ORDERS.slice(0, -1)
        : API_URLS.ORDERS;
      const url = `${baseUrl}/orders/${orderId}`;

      const response = await axios.get<
        { status: string; result: Order } | { data: Order } | Order
      >(url, {
        timeout: 10000,
        headers: {
          "Content-Type": "application/json",
        },
      });

      // Handle different possible response formats
      let orderData: Order | null = null;

      // Format 1: { status: "Ok", result: Order }
      if (
        "status" in response.data &&
        "result" in response.data &&
        response.data.status === "Ok"
      ) {
        orderData = response.data.result;
      }
      // Format 2: { data: Order }
      else if ("data" in response.data && "order_id" in response.data.data) {
        orderData = response.data.data;
      }
      // Format 3: Direct Order object
      else if ("order_id" in response.data) {
        orderData = response.data as Order;
      }

      if (orderData) {
        setOrder(orderData);
      } else {
        setError("Order not found or invalid response format");
      }
    } catch (err) {
      console.error("Failed to fetch order:", err);
      setError("Failed to load order details");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  // Polling logic
  useEffect(() => {
    if (!order || !orderId) return;

    // Determine if we should continue polling based on order state
    const shouldPoll = (orderData: Order): boolean => {
      // Stop polling if order is completed (check for claim_tx first)
      if (orderData.destination_intent.transactions.claim_tx) {
        return false;
      }

      const sourceState = orderData.source_intent.state?.toLowerCase() || "";
      const destState = orderData.destination_intent.state?.toLowerCase() || "";

      // Stop polling if states indicate completion
      if (
        sourceState === "completed" ||
        destState === "completed" ||
        destState === "claimed"
      ) {
        return false;
      }

      // For awaiting_deposit and deposit_detected: poll until source_intent.transactions.create_tx has a tx hash
      // This applies when source state is "awaiting_deposit" or "deposit_detected", or when we don't have a create_tx yet
      if (
        sourceState === "awaiting_deposit" ||
        sourceState === "deposit_detected" ||
        (!sourceState &&
          orderData.source_intent.deposit_address &&
          !orderData.source_intent.transactions.create_tx)
      ) {
        return !orderData.source_intent.transactions.create_tx;
      }

      // For awaiting_redeem: poll until destination_intent.transactions.create_tx has a tx hash
      // This applies when destination state indicates we're awaiting redeem, or source has create_tx but destination doesn't
      if (
        destState === "awaiting_redeem" ||
        destState === "redeeming" ||
        (orderData.source_intent.transactions.create_tx &&
          !orderData.destination_intent.transactions.create_tx)
      ) {
        return !orderData.destination_intent.transactions.create_tx;
      }

      // Stop polling for completed or other states
      return false;
    };

    if (!shouldPoll(order)) {
      setIsPolling(false);
      return;
    }

    setIsPolling(true);

    // Poll every 3 seconds
    const pollInterval = setInterval(async () => {
      try {
        const baseUrl = API_URLS.ORDERS.endsWith("/")
          ? API_URLS.ORDERS.slice(0, -1)
          : API_URLS.ORDERS;
        const url = `${baseUrl}/orders/${orderId}`;

        const response = await axios.get<
          { status: string; result: Order } | { data: Order } | Order
        >(url, {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        });

        let orderData: Order | null = null;

        if (
          "status" in response.data &&
          "result" in response.data &&
          response.data.status === "Ok"
        ) {
          orderData = response.data.result;
        } else if (
          "data" in response.data &&
          "order_id" in response.data.data
        ) {
          orderData = response.data.data;
        } else if ("order_id" in response.data) {
          orderData = response.data as Order;
        }

        if (orderData) {
          setOrder(orderData);

          // Check if we should stop polling
          if (!shouldPoll(orderData)) {
            clearInterval(pollInterval);
            setIsPolling(false);
          }
        }
      } catch (err) {
        console.error("Failed to poll order:", err);
        // Continue polling on error
      }
    }, 3000); // Poll every 3 seconds

    return () => {
      clearInterval(pollInterval);
      setIsPolling(false);
    };
  }, [order, orderId]);

  // Load secret from localStorage on mount
  useEffect(() => {
    if (orderId) {
      const stored = getSecret(orderId);
      if (stored) {
        setSecretData(stored);
      }
    }
  }, [orderId]);

  const handleGenerateSecret = async () => {
    if (!order || !isConnected || !address) {
      setRedeemError("Please connect your wallet first");
      return;
    }

    setIsGeneratingSecret(true);
    setRedeemError(null);

    try {
      const stored = localStorage.getItem(`order_secret_${orderId}`);
      if (stored) {
        setSecretData(JSON.parse(stored));
      }
    } catch (err) {
      console.error("Failed to generate secret:", err);
      setRedeemError(
        err instanceof Error ? err.message : "Failed to generate secret"
      );
    } finally {
      setIsGeneratingSecret(false);
    }
  };

  // Handle redeem transaction using wagmi hooks
  const handleRedeem = async () => {
    if (!order || !secretData) {
      setRedeemError("Please generate secret first");
      return;
    }

    if (!isConnected) {
      setRedeemError("Please connect your wallet first");
      return;
    }

    // Check if both intents are created
    if (
      !order.source_intent.transactions.create_tx ||
      !order.destination_intent.transactions.create_tx
    ) {
      setRedeemError("Both intents must be created before redeeming");
      return;
    }

    setIsRedeeming(true);
    setRedeemError(null);

    try {
      const destinationAsset = order.destination_intent.asset;
      const redeemType = getRedeemTypeFromAsset(destinationAsset);

      // Handle EVM redeems
      if (redeemType === "evm") {
        const requiredChainId = getChainIdFromAsset(destinationAsset);

        if (!requiredChainId) {
          setRedeemError(`Unsupported chain for asset: ${destinationAsset}`);
          setIsRedeeming(false);
          return;
        }

        // Log swap ID and secret before signing redeem transaction
        console.log("Before signing redeem transaction request:");
        console.log("Swap ID:", order.destination_intent.swap_id);
        console.log("Secret:", secretData.secret);

        // Execute EVM redeem (network switching is handled inside executeRedeem)
        const result = await executeRedeem({
          asset: destinationAsset,
          escrowAddress: order.destination_intent.escrow_address,
          swapId: order.destination_intent.swap_id,
          secret: secretData.secret,
          chainId: requiredChainId,
          wallet: walletClient as unknown as WalletClient,
        });

        if (result && !result.success) {
          setRedeemError(result.error || "Failed to redeem EVM swap");
          setIsRedeeming(false);
        } else if (result && result.success) {
          // Success - refresh order after a delay
          setTimeout(() => fetchOrder(), 2000);
          setIsRedeeming(false);
        }
      } else if (redeemType === "bitcoin") {
        // Log swap ID and secret before signing redeem transaction
        console.log("Before signing redeem transaction request:");
        console.log("Swap ID:", order.destination_intent.swap_id);
        console.log("Secret:", secretData.secret);

        // Execute Bitcoin redeem (async)
        const result = await executeRedeem({
          asset: destinationAsset,
          escrowAddress: order.destination_intent.escrow_address,
          swapId: order.destination_intent.swap_id,
          secret: secretData.secret,
          htlcAddress: order.destination_intent.deposit_address,
          recipientAddress: order.destination_intent.recipient,
          wallet: walletClient as unknown as WalletClient,
        });

        if (result && !result.success) {
          setRedeemError(result.error || "Failed to redeem Bitcoin swap");
          setIsRedeeming(false);
        } else if (result && result.success) {
          // Success - refresh order after a delay
          setTimeout(() => fetchOrder(), 2000);
          setIsRedeeming(false);
        }
      } else if (redeemType === "starknet") {
        // Log swap ID and secret before signing redeem transaction
        console.log("Before signing redeem transaction request:");
        console.log("Swap ID:", order.destination_intent.swap_id);
        console.log("Secret:", secretData.secret);

        // Execute Starknet redeem (async)
        const result = await executeRedeem({
          asset: destinationAsset,
          escrowAddress: order.destination_intent.escrow_address,
          swapId: order.destination_intent.swap_id,
          secret: secretData.secret,
          wallet: walletClient as unknown as WalletClient,
        });

        if (result && !result.success) {
          setRedeemError(result.error || "Failed to redeem Starknet swap");
          setIsRedeeming(false);
        } else if (result && result.success) {
          // Success - refresh order after a delay
          setTimeout(() => fetchOrder(), 2000);
          setIsRedeeming(false);
        }
      } else {
        setRedeemError(
          `Unsupported redeem type for asset: ${destinationAsset}`
        );
        setIsRedeeming(false);
      }
    } catch (err) {
      console.error("Failed to initiate redeem:", err);
      setRedeemError(
        err instanceof Error ? err.message : "Failed to initiate redeem"
      );
      setIsRedeeming(false);
    }
  };

  // Handle transaction receipt
  useEffect(() => {
    if (receipt && receipt.status === "success") {
      // Transaction successful, refresh order
      fetchOrder();
      setIsRedeeming(false);
      // Poll will automatically pick up the new transaction
    } else if (receipt && receipt.status === "reverted") {
      setRedeemError("Transaction reverted. Please try again.");
      setIsRedeeming(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [receipt]);

  // Handle write contract errors
  useEffect(() => {
    if (writeContractError) {
      setRedeemError(
        writeContractError.message || "Failed to send transaction"
      );
      setIsRedeeming(false);
    }
  }, [writeContractError]);

  // Update isRedeeming based on wagmi states
  useEffect(() => {
    setIsRedeeming(isWritingContract || isWaitingForReceipt);
  }, [isWritingContract, isWaitingForReceipt]);

  // Auto-generate secret when deposit is detected
  useEffect(() => {
    if (
      order &&
      order.source_intent.transactions.create_tx && // Deposit detected
      !secretData && // Secret not generated yet
      !isGeneratingSecret && // Not currently generating
      isConnected && // Wallet connected
      address // Has address
    ) {
      handleGenerateSecret();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    order?.source_intent.transactions.create_tx,
    secretData,
    isConnected,
    address,
  ]);

  // Auto-call redeem when both intents are created and secret is generated
  useEffect(() => {
    if (
      order &&
      order.source_intent.transactions.create_tx && // Source intent created
      order.destination_intent.transactions.create_tx && // Destination intent created (BOTH must exist)
      !order.destination_intent.transactions.claim_tx && // Claim not completed yet
      secretData && // Secret generated
      !isRedeeming && // Not currently redeeming
      !writeContractData && // No pending transaction
      isConnected // Wallet connected
    ) {
      // Auto-trigger redeem when both intents are created
      handleRedeem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    order?.source_intent.transactions.create_tx,
    order?.destination_intent.transactions.create_tx,
    order?.destination_intent.transactions.claim_tx,
    secretData,
    isConnected,
    chainId,
  ]);

  // Handle payment transaction
  const handlePayment = async () => {
    if (!order || !isConnected || !address) {
      setPaymentError("Please connect your wallet first");
      return;
    }

    const tokenAddress = order.source_intent.token_address;
    const depositAddress = order.source_intent.deposit_address;
    const amount = order.source_intent.amount;
    const sourceAsset = order.source_intent.asset;
    const requiredChainId = getChainIdFromAsset(sourceAsset);

    if (!requiredChainId) {
      setPaymentError(`Unsupported chain for asset: ${sourceAsset}`);
      return;
    }

    // Switch chain if needed
    if (chainId !== requiredChainId) {
      try {
        await switchChain({ chainId: requiredChainId });
      } catch (switchError) {
        setPaymentError("Failed to switch chain. Please switch manually.");
        return;
      }
    }

    setIsPaying(true);
    setPaymentError(null);

    try {
      // Check if native token (ETH, AVAX, etc.)
      if (!tokenAddress || tokenAddress === "native" || tokenAddress === "") {
        // Send native token
        sendNativeTransaction({
          to: with0x(trim0x(depositAddress)),
          value: BigInt(amount),
          chainId: requiredChainId,
        });
      } else {
        // Send ERC20 token
        writePaymentContract({
          address: with0x(trim0x(tokenAddress)),
          abi: erc20Abi,
          functionName: "transfer",
          args: [with0x(trim0x(depositAddress)), BigInt(amount)],
          chainId: requiredChainId,
        });
      }
    } catch (err) {
      console.error("Failed to send payment:", err);
      setPaymentError(
        err instanceof Error ? err.message : "Failed to send payment"
      );
      setIsPaying(false);
    }
  };

  // Handle payment transaction receipt (ERC20)
  useEffect(() => {
    if (paymentReceipt && paymentReceipt.status === "success") {
      setIsPaying(false);
      setShowPaymentModal(false);
      // Refresh order after payment
      setTimeout(() => fetchOrder(), 2000);
    } else if (paymentReceipt && paymentReceipt.status === "reverted") {
      setPaymentError("Transaction reverted. Please try again.");
      setIsPaying(false);
    }
  }, [paymentReceipt]);

  // Handle native payment transaction receipt
  useEffect(() => {
    if (nativePaymentReceipt && nativePaymentReceipt.status === "success") {
      setIsPaying(false);
      setShowPaymentModal(false);
      // Refresh order after payment
      setTimeout(() => fetchOrder(), 2000);
    } else if (
      nativePaymentReceipt &&
      nativePaymentReceipt.status === "reverted"
    ) {
      setPaymentError("Transaction reverted. Please try again.");
      setIsPaying(false);
    }
  }, [nativePaymentReceipt]);

  // Handle payment transaction errors
  useEffect(() => {
    if (paymentTxError) {
      setPaymentError(paymentTxError.message || "Failed to send transaction");
      setIsPaying(false);
    }
    if (nativeTxError) {
      setPaymentError(nativeTxError.message || "Failed to send transaction");
      setIsPaying(false);
    }
  }, [paymentTxError, nativeTxError]);

  // Update isPaying based on wagmi states
  useEffect(() => {
    setIsPaying(
      isWritingPayment ||
        isSendingNative ||
        isWaitingForPaymentReceipt ||
        isWaitingForNativeReceipt
    );
  }, [
    isWritingPayment,
    isSendingNative,
    isWaitingForPaymentReceipt,
    isWaitingForNativeReceipt,
  ]);

  // Close payment modal when transaction hash is received
  useEffect(() => {
    const txHash = paymentTxHash || nativeTxHash;
    if (txHash && showPaymentModal) {
      setShowPaymentModal(false);
    }
  }, [paymentTxHash, nativeTxHash, showPaymentModal]);

  const copyToClipboard = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(fieldName);
      setTimeout(() => setCopiedAddress(null), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  // Check if deposit is detected (has create_tx)
  const isDepositDetected = Boolean(
    order?.source_intent.transactions.create_tx ||
      order?.destination_intent.transactions.create_tx
  );

  // Check if redeemed (has claim_tx) - this means the swap was successfully completed
  const isRedeemed = Boolean(
    order?.source_intent.transactions.claim_tx ||
      order?.destination_intent.transactions.claim_tx
  );

  // Check if refunded (has cancel_tx) - this means the swap was cancelled/refunded
  const isRefunded = Boolean(
    order?.source_intent.transactions.cancel_tx ||
      order?.destination_intent.transactions.cancel_tx
  );

  // Check if completed/claimed - if redeemed (has claim_tx), it's always completed
  // Only show as completed if redeemed, otherwise check state (but prioritize redeemed)
  const isClaimed = isRedeemed;

  // Get deposit tx hash (create_tx)
  const depositTxHash =
    order?.source_intent.transactions.create_tx ||
    order?.destination_intent.transactions.create_tx ||
    null;

  // Get claim tx hash
  const claimTxHash =
    order?.source_intent.transactions.claim_tx ||
    order?.destination_intent.transactions.claim_tx ||
    null;

  const sourceInfo = order ? getAssetInfo(order.source_intent.asset) : null;
  const destinationInfo = order
    ? getAssetInfo(order.destination_intent.asset)
    : null;

  const sourceDepositAddress = order?.source_intent.deposit_address || "";

  const handleOrderClick = (id: string) => {
    router.push(`/order/${id}`);
    setIsOrdersSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070011] text-white overflow-x-hidden">
      {/* Navigation */}
      <Navbar onOrdersClick={() => setIsOrdersSidebarOpen(true)} />

      {/* PixelBlast Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#B19EEF"
          patternScale={2}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples
          rippleSpeed={0.5}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          liquid
          liquidStrength={0.12}
          liquidRadius={1.2}
          liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
          transparent
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 md:pt-24 min-h-screen flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 md:py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          onClick={() => router.push("/swap")}
          className="fixed top-20 md:top-24 left-4 xs:left-6 sm:left-8 md:left-12 lg:left-16 flex items-center gap-2 px-3 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg text-gray-300 hover:text-white transition-all cursor-pointer z-40"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium hidden sm:inline">
            Back to Swap
          </span>
        </motion.button>

        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl bg-white/5 backdrop-blur-lg border border-white/50 rounded-3xl p-8 text-center"
          >
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300">Loading order details...</p>
          </motion.div>
        )}

        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white/5 backdrop-blur-lg border border-red-500/50 rounded-3xl p-8 text-center"
          >
            <p className="text-red-300 mb-4">{error}</p>
            <button
              onClick={() => router.push("/swap")}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Return to Swap
            </button>
          </motion.div>
        )}

        {order && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="w-full max-w-2xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="w-full max-w-2xl rounded-3xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 space-y-4 mt-4"
            >
              {/* Order Header - From/To Assets */}
              <div className="bg-white/5 backdrop-blur-sm border border-gray-700/40 rounded-[20px] p-4">
                <h1 className="text-lg font-semibold text-white mb-4">
                  Order Details
                </h1>
                <div className="w-full flex items-center justify-between gap-2 md:gap-3">
                  {/* From Asset */}
                  {sourceInfo && (
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0">
                      <div className="relative flex items-center shrink-0">
                        {getAssetLogo(sourceInfo.symbol, "lg")}
                        <div className="absolute -bottom-1 -right-1">
                          {getChainLogo(sourceInfo.chain, "sm")}
                        </div>
                      </div>
                      <div className="flex flex-col min-w-0 flex-1">
                        <span className="font-semibold text-white text-base md:text-lg leading-tight truncate">
                          {sourceInfo.symbol}
                        </span>
                        <span className="text-sm font-medium text-gray-300">
                          {formatAmount(
                            order.source_intent.amount,
                            order.source_intent.asset
                          )}
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Arrow */}
                  <div className="mx-2 shrink-0">
                    <svg
                      className="w-5 h-5 text-gray-400"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 5l7 7-7 7"
                      />
                    </svg>
                  </div>

                  {/* To Asset */}
                  {destinationInfo && (
                    <div className="flex items-center gap-2 md:gap-3 flex-1 min-w-0 justify-end">
                      <div className="flex flex-col min-w-0 flex-1 items-end">
                        <span className="font-semibold text-white text-base md:text-lg leading-tight truncate">
                          {destinationInfo.symbol}
                        </span>
                        <span className="text-sm font-medium text-gray-300">
                          {formatAmount(
                            order.destination_intent.amount,
                            order.destination_intent.asset
                          )}
                        </span>
                      </div>
                      <div className="relative flex items-center shrink-0">
                        {getAssetLogo(destinationInfo.symbol, "lg")}
                        <div className="absolute -bottom-1 -right-1">
                          {getChainLogo(destinationInfo.chain, "sm")}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Deposit Address & QR Code - Only show if deposit not detected */}
              {sourceDepositAddress && !isDepositDetected && (
                <div className="bg-white/5 backdrop-blur-sm border border-gray-700/40 rounded-[20px] p-4">
                  <h2 className="text-base font-semibold text-white mb-3">
                    Deposit Address
                  </h2>
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-mono text-gray-300 break-all flex-1">
                        {sourceDepositAddress}
                      </p>
                      <button
                        onClick={() =>
                          copyToClipboard(sourceDepositAddress, "deposit")
                        }
                        className="shrink-0 p-2 hover:bg-white/5 rounded-lg transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress === "deposit" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex flex-col md:flex-row items-center justify-center gap-4 p-4 bg-white rounded-lg">
                      <div className="flex justify-center">
                        <QRCodeSVG
                          value={sourceDepositAddress}
                          size={140}
                          level="M"
                          className="w-full max-w-[140px]"
                        />
                      </div>
                      <div className="flex flex-col items-stretch gap-2 w-full md:w-auto">
                        {isConnected &&
                          order &&
                          getRedeemTypeFromAsset(order.source_intent.asset) ===
                            "evm" && (
                            <button
                              onClick={handlePayment}
                              disabled={isPaying}
                              className={`px-4 py-2 rounded-lg transition-colors text-white text-sm font-medium ${
                                isPaying
                                  ? "bg-purple-600/50 cursor-not-allowed"
                                  : "bg-purple-600 hover:bg-purple-700"
                              }`}
                            >
                              {isPaying ? (
                                <span className="inline-flex items-center gap-2">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  Processing...
                                </span>
                              ) : (
                                "Send Transaction"
                              )}
                            </button>
                          )}
                        {paymentError && (
                          <div className="text-xs text-red-400 text-center md:text-left">
                            {paymentError}
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      {isConnected
                        ? "Send transaction directly or scan QR code to send deposit"
                        : "Scan QR code or copy the address above to send your deposit"}
                    </p>
                  </div>
                </div>
              )}

              {/* Transaction Hash - Show when deposit is detected */}
              {isDepositDetected && depositTxHash && (
                <div className="bg-white/5 backdrop-blur-sm border border-gray-700/40 rounded-[20px] p-4">
                  <h2 className="text-base font-semibold text-white mb-3">
                    Deposit Transaction
                  </h2>
                  <div className="space-y-3">
                    <div className="bg-white/5 rounded-lg p-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-mono text-gray-300 break-all flex-1">
                        {depositTxHash}
                      </p>
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() =>
                            copyToClipboard(depositTxHash, "deposit_tx")
                          }
                          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                          title="Copy transaction hash"
                        >
                          {copiedAddress === "deposit_tx" ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                        {getExplorerUrl(
                          order.source_intent.asset,
                          depositTxHash
                        ) && (
                          <a
                            href={
                              getExplorerUrl(
                                order.source_intent.asset,
                                depositTxHash
                              ) || "#"
                            }
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                            title="View on explorer"
                          >
                            <ExternalLink className="w-4 h-4 text-purple-400" />
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-gray-300">
                        Deposit transaction confirmed
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Progress Steps - Vertical */}
              <div className="bg-white/5 backdrop-blur-sm border border-gray-700/40 rounded-[20px] p-4">
                <h2 className="text-base font-semibold text-white mb-4">
                  Progress
                </h2>
                <div className="relative space-y-0">
                  {/* Step 1: Order Created - Always completed */}
                  <div className="relative">
                    <div className="flex items-start gap-3 pb-4">
                      <div className="shrink-0 mt-0.5 relative z-10">
                        <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                          <CheckCircle2 className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="text-sm font-medium text-green-400">
                          Order Created
                        </div>
                      </div>
                    </div>
                    <div
                      className="absolute left-3 w-0.5 bg-green-500"
                      style={{ top: "1.5rem", height: "1.5rem" }}
                    />
                  </div>

                  {/* Step 2: Awaiting Deposit / Deposit Detected */}
                  <div className="relative">
                    <div className="flex items-start gap-3 pb-4">
                      <div className="shrink-0 mt-0.5 relative z-10">
                        {isDepositDetected ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white animate-pulse" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`text-sm font-medium ${
                              isDepositDetected
                                ? "text-green-400"
                                : "text-purple-400"
                            }`}
                          >
                            {isDepositDetected
                              ? "Deposit Detected"
                              : "Awaiting Deposit"}
                          </div>
                          {isDepositDetected && depositTxHash && (
                            <button
                              onClick={() =>
                                copyToClipboard(depositTxHash, "deposit_tx")
                              }
                              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                              title="Copy transaction hash"
                            >
                              <span className="font-mono truncate max-w-[100px]">
                                {depositTxHash.slice(0, 6)}...
                                {depositTxHash.slice(-4)}
                              </span>
                              {copiedAddress === "deposit_tx" ? (
                                <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                              ) : (
                                <Copy className="w-3 h-3 shrink-0" />
                              )}
                            </button>
                          )}
                        </div>
                        {!isDepositDetected && (
                          <div className="text-xs text-gray-500 mt-1">
                            In progress...
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={`absolute left-3 w-0.5 ${
                        isDepositDetected ? "bg-green-500" : "bg-gray-700"
                      }`}
                      style={{ top: "1.5rem", height: "1.5rem" }}
                    />
                  </div>

                  {/* Step 3: Awaiting Redeem / Redeemed */}
                  <div className="relative">
                    <div className="flex items-start gap-3 pb-4">
                      <div className="shrink-0 mt-0.5 relative z-10">
                        {isRedeemed ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : isRefunded ? (
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : isDepositDetected ? (
                          <div className="w-6 h-6 rounded-full bg-purple-600 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-white animate-pulse" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex items-center justify-between gap-2">
                          <div
                            className={`text-sm font-medium ${
                              isRedeemed
                                ? "text-green-400"
                                : isRefunded
                                ? "text-orange-400"
                                : isDepositDetected
                                ? "text-purple-400"
                                : "text-gray-500"
                            }`}
                          >
                            {isRedeemed
                              ? "Completed"
                              : isRefunded
                              ? "Refunded"
                              : "Awaiting Redeem"}
                          </div>
                          {isRedeemed && claimTxHash && (
                            <button
                              onClick={() =>
                                copyToClipboard(claimTxHash, "claim_tx")
                              }
                              className="flex items-center gap-1 text-xs text-purple-400 hover:text-purple-300 transition-colors"
                              title="Copy transaction hash"
                            >
                              <span className="font-mono truncate max-w-[100px]">
                                {claimTxHash.slice(0, 6)}...
                                {claimTxHash.slice(-4)}
                              </span>
                              {copiedAddress === "claim_tx" ? (
                                <CheckCircle2 className="w-3 h-3 text-green-400 shrink-0" />
                              ) : (
                                <Copy className="w-3 h-3 shrink-0" />
                              )}
                            </button>
                          )}
                        </div>
                        {!isRedeemed && !isRefunded && isDepositDetected && (
                          <div className="text-xs text-gray-500 mt-1">
                            In progress...
                          </div>
                        )}
                      </div>
                    </div>
                    <div
                      className={`absolute left-3 w-0.5 ${
                        isRedeemed
                          ? "bg-green-500"
                          : isRefunded
                          ? "bg-orange-500"
                          : isDepositDetected
                          ? "bg-gray-700"
                          : "bg-gray-700"
                      }`}
                      style={{ top: "1.5rem", height: "1.5rem" }}
                    />
                  </div>

                  {/* Step 4: Final Status - Completed or Refunded */}
                  <div className="relative">
                    <div className="flex items-start gap-3 pb-4">
                      <div className="shrink-0 mt-0.5 relative z-10">
                        {isRedeemed ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : isRefunded ? (
                          <div className="w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center">
                            <CheckCircle2 className="w-4 h-4 text-white" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center">
                            <div className="w-3 h-3 rounded-full bg-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pt-1">
                        <div
                          className={`text-sm font-medium ${
                            isRedeemed
                              ? "text-green-400"
                              : isRefunded
                              ? "text-orange-400"
                              : "text-gray-500"
                          }`}
                        >
                          {isRedeemed
                            ? "Completed"
                            : isRefunded
                            ? "Refunded"
                            : "Completed / Refunded"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-white/5 backdrop-blur-sm border border-gray-700/40 rounded-[20px] p-4">
                <h2 className="text-base font-semibold text-white mb-3">
                  Order Information
                </h2>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-400">Order ID</span>
                    <span className="text-gray-300 font-mono text-xs">
                      {order.order_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Created</span>
                    <span className="text-gray-300">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-400">Last Updated</span>
                    <span className="text-gray-300">
                      {new Date(order.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </div>

      {/* Orders Sidebar */}
      <OrdersSidebar
        isOpen={isOrdersSidebarOpen}
        onClose={() => setIsOrdersSidebarOpen(false)}
        onOrderClick={handleOrderClick}
      />
    </div>
  );
}
