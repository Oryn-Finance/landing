"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import QRCodeSVG from "react-qr-code";
import { Navbar } from "../../../components/Navbar";
import { API_URLS } from "../../../constants/constants";
import type { Order, OrderStatus } from "../../../types/order";
import { ArrowLeft, Copy, CheckCircle2, Clock, Loader2, Play } from "lucide-react";
import { useSignMessage, useAccount, useWriteContract, useWaitForTransactionReceipt, useSwitchChain } from "wagmi";
import { generateSecret, prepareSignMessage, storeSecret, getSecret, type SecretData } from "../../../utils/secretManager";
import { arbitrumSepolia, avalancheFuji } from "wagmi/chains";
import { AtomicSwapABI, with0x, trim0x, getChainIdFromAsset } from "../../../utils/redeem";

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
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [isGeneratingSecret, setIsGeneratingSecret] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [secretData, setSecretData] = useState<SecretData | null>(null);
  const [redeemError, setRedeemError] = useState<string | null>(null);

  const { address, isConnected, chainId } = useAccount();
  const { signMessageAsync } = useSignMessage();
  const { switchChain } = useSwitchChain();

  // Wagmi hook for writing contract
  const { writeContract, isPending: isWritingContract, data: writeContractData, error: writeContractError } = useWriteContract();

  // Wait for transaction receipt
  const { data: receipt, isLoading: isWaitingForReceipt } = useWaitForTransactionReceipt({
    hash: writeContractData,
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
        (!sourceState && orderData.source_intent.deposit_address && !orderData.source_intent.transactions.create_tx)
      ) {
        return !orderData.source_intent.transactions.create_tx;
      }

      // For awaiting_redeem: poll until destination_intent.transactions.create_tx has a tx hash
      // This applies when destination state indicates we're awaiting redeem, or source has create_tx but destination doesn't
      if (
        destState === "awaiting_redeem" ||
        destState === "redeeming" ||
        (orderData.source_intent.transactions.create_tx && !orderData.destination_intent.transactions.create_tx)
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
        } else if ("data" in response.data && "order_id" in response.data.data) {
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
      // Use commitment_hash as nonce (or order_id if commitment_hash is not suitable)
      const nonce = order.source_intent.commitment_hash || orderId;
      const message = prepareSignMessage(nonce);

      // Sign message with wallet
      const signature = (await signMessageAsync({ message })) as `0x${string}`;

      // Generate secret from signature
      const { secret, secretHash } = await generateSecret(nonce, signature);

      // Store secret data
      const secretDataToStore: SecretData = {
        secret,
        secretHash,
        nonce,
        orderId,
      };

      storeSecret(orderId, secretDataToStore);
      setSecretData(secretDataToStore);
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

    setIsRedeeming(true);
    setRedeemError(null);

    try {
      const destinationAsset = order.destination_intent.asset;
      const requiredChainId = getChainIdFromAsset(destinationAsset);

      if (!requiredChainId) {
        setRedeemError(`Unsupported chain for asset: ${destinationAsset}`);
        setIsRedeeming(false);
        return;
      }

      // Switch chain if needed
      if (chainId !== requiredChainId) {
        try {
          await switchChain({ chainId: requiredChainId });
        } catch (switchError) {
          setRedeemError("Failed to switch chain. Please switch manually.");
          setIsRedeeming(false);
          return;
        }
      }

      // Prepare contract call parameters
      const contractAddress = with0x(trim0x(order.destination_intent.escrow_address));
      const swapId = with0x(trim0x(order.destination_intent.swap_id));

      // Ensure secret is 32 bytes (0x + 64 hex chars)
      const secretBytes = secretData.secret.startsWith("0x") ? secretData.secret.slice(2) : secretData.secret;
      const secret32 = `0x${secretBytes.slice(0, 64).padStart(64, "0")}` as `0x${string}`;

      // Write contract - this will trigger MetaMask popup
      writeContract({
        address: contractAddress,
        abi: AtomicSwapABI,
        functionName: "redeem",
        args: [swapId, secret32],
        chainId: requiredChainId,
      });
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
      setRedeemError(writeContractError.message || "Failed to send transaction");
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
  }, [order?.source_intent.transactions.create_tx, secretData, isConnected, address]);

  // Auto-call redeem when deposit is detected and secret is generated
  useEffect(() => {
    if (
      order &&
      order.source_intent.transactions.create_tx && // Deposit detected
      !order.destination_intent.transactions.create_tx && // Redeem not called yet
      secretData && // Secret generated
      !isRedeeming && // Not currently redeeming
      !writeContractData && // No pending transaction
      isConnected && // Wallet connected
      chainId !== undefined // Chain ID available
    ) {
      // Auto-trigger redeem
      handleRedeem();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    order?.source_intent.transactions.create_tx,
    order?.destination_intent.transactions.create_tx,
    secretData,
    isConnected,
    chainId,
  ]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getCurrentStatus = (orderData?: Order | null): OrderStatus => {
    const orderToCheck = orderData || order;
    if (!orderToCheck) return "initiated";

    // Determine status based on order state
    // Check if order is completed
    if (
      orderToCheck.source_intent.state === "completed" ||
      orderToCheck.destination_intent.state === "completed"
    ) {
      return "complete";
    }

    // Check if deposit has been detected (source create_tx exists)
    if (orderToCheck.source_intent.transactions.create_tx) {
      // If destination transaction exists, we're in redeeming state
      if (orderToCheck.destination_intent.transactions.create_tx) {
        return "redeeming";
      }

      // If we have a transaction hash (user approved transaction in MetaMask)
      // writeContractData only exists AFTER user approves the transaction
      // Only advance to redeeming if we have the hash (user approved)
      if (writeContractData) {
        return "redeeming";
      }

      // Deposit detected but no destination transaction yet
      // If secret is generated but no transaction hash exists yet
      // we're awaiting redeem approval - user needs to approve the MetaMask popup
      // writeContractData only exists AFTER user approves, so if it doesn't exist, we're still awaiting
      if (secretData && !writeContractData) {
        // User hasn't approved yet, still in awaiting_redeem (clock icon)
        return "awaiting_redeem";
      }

      // Deposit detected, but secret not generated yet
      return "deposit_detected";
    }

    // Check if deposit address exists (awaiting deposit)
    if (orderToCheck.source_intent.deposit_address) {
      return "awaiting_deposit";
    }

    return "initiated";
  };

  const currentStatus = getCurrentStatus();
  const currentStatusIndex = STATUS_STEPS.indexOf(currentStatus);
  const depositAddress = order?.source_intent.deposit_address || "";

  const sourceInfo = order ? getAssetInfo(order.source_intent.asset) : null;
  const destinationInfo = order
    ? getAssetInfo(order.destination_intent.asset)
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      <Navbar onOrdersClick={() => router.push("/swap")} />

      <div className="relative z-10 min-h-[calc(100vh-56px)] xs:min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 md:py-12">
        <div className="max-w-3xl mx-auto">
          {/* Back Button */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => router.push("/swap")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm font-medium">Back to Swap</span>
          </motion.button>

          {/* Loading State */}
          {isLoading && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl p-8 text-center"
            >
              <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
              <p className="text-gray-600">Loading order details...</p>
            </motion.div>
          )}

          {/* Error State */}
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 text-center"
            >
              <p className="text-red-600 mb-4">{error}</p>
              <button
                onClick={() => router.push("/swap")}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
              >
                Return to Swap
              </button>
            </motion.div>
          )}

          {/* Order Details */}
          {order && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Order Header - From/To */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h1 className="text-2xl font-semibold text-gray-900 mb-6">
                  Order Details
                </h1>

                <div className="flex items-center justify-between">
                  {/* From */}
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-500 mb-2">From</div>
                    {sourceInfo && (
                      <>
                        <div className="text-lg font-semibold text-gray-900 mb-1">
                          {sourceInfo.symbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          {sourceInfo.chain}
                        </div>
                        <div className="text-sm font-medium text-gray-700 mt-2">
                          {formatAmount(order.source_intent.amount, 8)}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Arrow */}
                  <div className="mx-4">
                    <ArrowLeft className="w-6 h-6 text-gray-400 rotate-180" />
                  </div>

                  {/* To */}
                  <div className="flex-1 text-center">
                    <div className="text-sm text-gray-500 mb-2">To</div>
                    {destinationInfo && (
                      <>
                        <div className="text-lg font-semibold text-gray-900 mb-1">
                          {destinationInfo.symbol}
                        </div>
                        <div className="text-xs text-gray-500">
                          {destinationInfo.chain}
                        </div>
                        <div className="text-sm font-medium text-gray-700 mt-2">
                          {formatAmount(order.destination_intent.amount, 8)}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Deposit Address & QR Code */}
              {depositAddress && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">
                    Deposit Address
                  </h2>
                  <div className="space-y-4">
                    {/* Address */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-mono text-gray-700 break-all">
                          {depositAddress}
                        </p>
                        <button
                          onClick={() => copyToClipboard(depositAddress)}
                          className="flex-shrink-0 p-2 hover:bg-gray-200 rounded-lg transition-colors"
                          title="Copy address"
                        >
                          {copiedAddress ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600" />
                          ) : (
                            <Copy className="w-5 h-5 text-gray-600" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* QR Code */}
                    <div className="flex justify-center p-4 bg-white rounded-lg border border-gray-200">
                      <QRCodeSVG
                        value={depositAddress}
                        size={200}
                        level="M"
                        className="w-full max-w-[200px]"
                      />
                    </div>

                    <p className="text-xs text-gray-500 text-center">
                      Scan this QR code or copy the address above to send your
                      deposit
                    </p>
                  </div>
                </div>
              )}

              {/* Status Progress */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-6">
                  Status
                </h2>

                <div className="relative space-y-0">
                  {STATUS_STEPS.map((status, index) => {
                    const isCompleted = index < currentStatusIndex;
                    const isCurrent = index === currentStatusIndex;

                    return (
                      <div key={status} className="relative">
                        <div className="flex items-start gap-4 pb-6">
                          {/* Status Icon */}
                          <div className="shrink-0 mt-0.5 relative z-10">
                            {isCompleted ? (
                              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                                <CheckCircle2 className="w-5 h-5 text-white" />
                              </div>
                            ) : isCurrent ? (
                              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
                                <Clock className="w-5 h-5 text-white animate-pulse" />
                              </div>
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                                <div className="w-4 h-4 rounded-full bg-gray-400" />
                              </div>
                            )}
                          </div>

                          {/* Status Label */}
                          <div className="flex-1 pt-1">
                            <div
                              className={`font-medium ${isCurrent
                                ? "text-purple-600"
                                : isCompleted
                                  ? "text-green-600"
                                  : "text-gray-400"
                                }`}
                            >
                              {STATUS_LABELS[status]}
                            </div>
                            {isCurrent && (
                              <div className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                {isPolling && (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                )}
                                In progress...
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Connector Line */}
                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={`absolute left-4 w-0.5 ${isCompleted ? "bg-green-500" : "bg-gray-200"
                              }`}
                            style={{ top: "2rem", height: "2.5rem" }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Order Info */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">
                  Order Information
                </h2>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Order ID</span>
                    <span className="text-gray-900 font-mono text-xs">
                      {order.order_id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Created</span>
                    <span className="text-gray-900">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Updated</span>
                    <span className="text-gray-900">
                      {new Date(order.updated_at).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
