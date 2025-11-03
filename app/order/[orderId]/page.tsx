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
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock,
  Loader2,
  Play,
} from "lucide-react";
import {
  useSignMessage,
  useAccount,
  useWriteContract,
  useWaitForTransactionReceipt,
  useSwitchChain,
  useSendTransaction,
} from "wagmi";
import {
  generateSecret,
  prepareSignMessage,
  storeSecret,
  getSecret,
  type SecretData,
} from "../../../utils/secretManager";
import { with0x, trim0x, getChainIdFromAsset } from "../../../utils/redeem";
import {
  executeRedeem,
  getRedeemTypeFromAsset,
} from "../../../utils/redeem/index";
import { erc20Abi } from "viem";
import { ExternalLink } from "lucide-react";

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

function formatAmount(amount: string, decimals: number = 8): string {
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
  const { switchChain } = useSwitchChain();

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
      const sourceState = orderData.source_intent.state?.toLowerCase() || "";
      const destState = orderData.destination_intent.state?.toLowerCase() || "";

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

  // Check if redeemed (has claim_tx or state is redeeming/completed)
  const isRedeemed = Boolean(
    order?.source_intent.transactions.claim_tx ||
      order?.destination_intent.transactions.claim_tx ||
      order?.source_intent.state === "redeeming" ||
      order?.destination_intent.state === "redeeming" ||
      order?.source_intent.state === "completed" ||
      order?.destination_intent.state === "completed"
  );

  // Check if completed/claimed
  const isClaimed = Boolean(
    order?.source_intent.state === "completed" ||
      order?.destination_intent.state === "completed"
  );

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
      <div className="relative z-10 min-h-[calc(100vh-56px)] xs:min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 md:py-12">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-white/50 rounded-3xl p-8 text-center"
          >
            <Loader2 className="w-8 h-8 animate-spin text-purple-400 mx-auto mb-4" />
            <p className="text-gray-300">Loading order details...</p>
          </motion.div>
        )}

        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-2xl bg-white/10 backdrop-blur-lg border border-red-500/50 rounded-3xl p-8 text-center"
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
              className="scale-90 origin-top rounded-3xl bg-white/10 backdrop-blur-lg border border-white/50 p-6 space-y-4"
            >
              {/* Order Header - From/To Assets */}
              <div className="bg-white/10 backdrop-blur-sm border border-gray-700/40 rounded-[30px] p-4">
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
                          {formatAmount(order.source_intent.amount, 8)}
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
                          {formatAmount(order.destination_intent.amount, 8)}
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

              {/* Deposit Address & QR Code */}
              {sourceDepositAddress && (
                <div className="bg-white/10 backdrop-blur-sm border border-gray-700/40 rounded-[30px] p-4">
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
                        className="shrink-0 p-2 hover:bg-white/10 rounded-lg transition-colors"
                        title="Copy address"
                      >
                        {copiedAddress === "deposit" ? (
                          <CheckCircle2 className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4 text-gray-400" />
                        )}
                      </button>
                    </div>
                    <div className="flex justify-center p-4 bg-white/5 rounded-lg">
                      <QRCodeSVG
                        value={sourceDepositAddress}
                        size={180}
                        level="M"
                        className="w-full max-w-[180px]"
                      />
                    </div>
                    <p className="text-xs text-gray-500 text-center">
                      Scan this QR code or copy the address above to send your
                      deposit
                    </p>
                  </div>
                </div>
              )}

              {/* Progress Steps - Vertical */}
              <div className="bg-white/10 backdrop-blur-sm border border-gray-700/40 rounded-[30px] p-4">
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
                                : isDepositDetected
                                ? "text-purple-400"
                                : "text-gray-500"
                            }`}
                          >
                            {isRedeemed ? "Redeemed" : "Awaiting Redeem"}
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
                        {!isRedeemed && isDepositDetected && (
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
                          : isDepositDetected
                          ? "bg-gray-700"
                          : "bg-gray-700"
                      }`}
                      style={{ top: "1.5rem", height: "1.5rem" }}
                    />
                  </div>

                  {/* Step 4: Claimed or Refunded */}
                  <div className="relative">
                    <div className="flex items-start gap-3 pb-4">
                      <div className="shrink-0 mt-0.5 relative z-10">
                        {isClaimed ? (
                          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
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
                            isClaimed ? "text-green-400" : "text-gray-500"
                          }`}
                        >
                          {isClaimed ? "Claimed" : "Claimed / Refunded"}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-white/10 backdrop-blur-sm border border-gray-700/40 rounded-[30px] p-4">
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
