"use client";

export const dynamic = "force-dynamic";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import QRCodeSVG from "react-qr-code";
import { Navbar } from "../../../components/Navbar";
import OrdersSidebar from "../../../components/OrdersSidebar";
import Prism from "@/components/ui/Prism";
import { API_URLS } from "../../../constants/constants";
import type { Order, OrderStatus } from "../../../types/order";
import { CheckCircle2, Loader2, ArrowLeft } from "lucide-react";
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
import Image from "next/image";
import {
  getAssetLogo,
  getChainLogo,
  getAssetInfo,
  formatAmount,
  getExplorerUrl,
} from "@/utils/assetUtils";

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
      if (
        orderData.source_intent.transactions.claim_tx ||
        orderData.destination_intent.transactions.claim_tx
      ) {
        return false;
      }

      const sourceState = orderData.source_intent.state?.toLowerCase() || "";
      const destState = orderData.destination_intent.state?.toLowerCase() || "";

      if (
        sourceState === "completed" ||
        destState === "completed" ||
        destState === "claimed"
      ) {
        return false;
      }

      if (
        sourceState === "awaiting_deposit" ||
        sourceState === "deposit_detected" ||
        (!sourceState &&
          orderData.source_intent.swap_id &&
          !orderData.source_intent.transactions.create_tx)
      ) {
        return !orderData.source_intent.transactions.create_tx;
      }

      const hasDeposit =
        orderData.source_intent.transactions.create_tx ||
        orderData.destination_intent.transactions.create_tx;
      const hasClaim =
        orderData.source_intent.transactions.claim_tx ||
        orderData.destination_intent.transactions.claim_tx;

      if (
        destState === "awaiting_redeem" ||
        destState === "redeeming" ||
        (hasDeposit && !hasClaim)
      ) {
        // Continue polling until we get a claim_tx
        return !hasClaim;
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
          escrowAddress: order.destination_intent.registry_address,
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
          escrowAddress: order.destination_intent.registry_address,
          swapId: order.destination_intent.swap_id,
          secret: secretData.secret,
          htlcAddress: order.destination_intent.swap_id,
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
          escrowAddress: order.destination_intent.registry_address,
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

  // Single function to parse and simplify all error messages
  const parsePaymentError = (error: Error | string | null): string => {
    if (!error) return "An error occurred";

    const errorMessage =
      typeof error === "string" ? error : error.message || error.toString();

    // User rejected transaction
    if (
      errorMessage.toLowerCase().includes("user rejected") ||
      errorMessage.toLowerCase().includes("user denied") ||
      errorMessage.toLowerCase().includes("user cancelled")
    ) {
      return "Transaction cancelled";
    }

    // Chain/network issues
    if (
      errorMessage.toLowerCase().includes("chain") &&
      errorMessage.toLowerCase().includes("undefined")
    ) {
      return "Switch to correct network";
    }

    if (
      errorMessage.toLowerCase().includes("network") ||
      errorMessage.toLowerCase().includes("chain mismatch") ||
      errorMessage.toLowerCase().includes("unsupported chain")
    ) {
      return "Wrong network selected";
    }

    // Insufficient balance
    if (
      errorMessage.toLowerCase().includes("insufficient") ||
      errorMessage.toLowerCase().includes("balance") ||
      errorMessage.toLowerCase().includes("funds")
    ) {
      return "Insufficient balance";
    }

    // Transaction reverted
    if (
      errorMessage.toLowerCase().includes("revert") ||
      errorMessage.toLowerCase().includes("reverted")
    ) {
      return "Transaction failed";
    }

    // Generic wallet errors
    if (
      errorMessage.toLowerCase().includes("wallet") ||
      errorMessage.toLowerCase().includes("metamask")
    ) {
      return "Wallet error. Please try again";
    }

    // Contract errors
    if (errorMessage.toLowerCase().includes("contract")) {
      return "Contract call failed";
    }

    // Timeout errors
    if (errorMessage.toLowerCase().includes("timeout")) {
      return "Request timed out";
    }

    // Extract first meaningful line (max 80 chars)
    const lines = errorMessage
      .split("\n")
      .filter((line) => line.trim().length > 0);
    const firstLine = lines[0] || errorMessage;

    // If error is too long, return generic message
    if (firstLine.length > 80) {
      return "Transaction failed";
    }

    return firstLine.trim();
  };

  // Handle payment transaction
  const handlePayment = async () => {
    if (!order || !isConnected || !address) {
      setPaymentError("Please connect your wallet first");
      return;
    }

    const tokenAddress = order.source_intent.token_address;
    const depositAddress = order.source_intent.swap_id;
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
        const error =
          switchError instanceof Error ? switchError : String(switchError);
        setPaymentError(parsePaymentError(error));
        setIsPaying(false);
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
      const error = err instanceof Error ? err : String(err);
      setPaymentError(parsePaymentError(error));
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
      setPaymentError(parsePaymentError("Transaction reverted"));
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
      setPaymentError(parsePaymentError("Transaction reverted"));
      setIsPaying(false);
    }
  }, [nativePaymentReceipt]);

  // Handle payment transaction errors
  useEffect(() => {
    if (paymentTxError) {
      setPaymentError(parsePaymentError(paymentTxError));
      setIsPaying(false);
    }
    if (nativeTxError) {
      setPaymentError(parsePaymentError(nativeTxError));
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

  const sourceDepositAddress = order?.source_intent.swap_id || "";

  // Helper to find AssetOption from asset string
  const findAssetOption = (assetString: string) => {
    const { assets } = useAssetsStore.getState();
    const parts = assetString.split(":");
    if (parts.length < 2) return null;

    const chainId = parts[0].replace(/_/g, " ");
    const symbol = parts[1].toLowerCase();

    return assets.find(
      (opt) =>
        opt.chainId.toLowerCase().replace(/_/g, " ") === chainId.toLowerCase() &&
        opt.asset.symbol.toLowerCase() === symbol
    ) || null;
  };

  // Get asset options for display
  const sourceAssetOption = order ? findAssetOption(order.source_intent.asset) : null;
  const destinationAssetOption = order ? findAssetOption(order.destination_intent.asset) : null;

  const transactionFees = "";

  const getCurrentStep = (): number => {
    if (!order) return 0;
    if (isRedeemed) return 3;
    if (isDepositDetected) return 2;
    return 1;
  };

  const currentStep = getCurrentStep();

  const handleOrderClick = (id: string) => {
    router.push(`/order/${id}`);
    setIsOrdersSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070011] text-white overflow-x-hidden">
      {/* Navigation */}
      <Navbar onOrdersClick={() => setIsOrdersSidebarOpen(true)} />

      {/* Prism Background */}
      <div className="w-screen h-screen absolute inset-0">
        <Prism
          animationType="rotate"
          timeScale={0.5}
          height={3.5}
          baseWidth={5.5}
          scale={3.6}
          hueShift={0}
          colorFrequency={1}
          noise={0.5}
          glow={1}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 pt-20 md:pt-24 min-h-screen flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 md:py-12">
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
            className="w-full max-w-7xl mx-auto px-4"
          >
                <div className="flex items-center justify-between mb-4 px-4 lg:max-w-[52vw]">
                  <p className="text-2xl text-white">
                    Swap progress...
                  </p>
                  <span className="text-2xl" style={{ background: "linear-gradient(99.72deg, #96DD2C -5.97%, #E6EF63 110.07%)",
                    backgroundClip: "text",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}>
                    #{order.order_id.slice(-3)}
                  </span>
                </div>
            <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="space-y-4"
              >

                <div className="flex items-center justify-between gap-4">
                  <div className="w-full rounded-3xl p-4 bg-black/35 border border-[#A1A1A1]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-4xl font-semibold text-white">
                          {formatAmount(
                            order.source_intent.amount,
                            order.source_intent.asset
                          )}
                        </span>
                        {sourceAssetOption && (
                          <div className="relative flex items-center shrink-0">
                            {getAssetLogo(sourceAssetOption.asset.symbol, "md")}
                            <div className="absolute -bottom-1 -right-1">
                              {getChainLogo(sourceAssetOption.chainName, "sm")}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                      <div className="relative flex items-center justify-center shrink-0">
                        <img
                          src="/polygon.svg"
                          alt="Arrow"
                          className="w-12 h-12"
                          style={{
                            filter: "drop-shadow(0 0 20px rgba(201, 255, 128, 0.4))",
                            transform: "rotate(90deg)",
                          }}
                        />
                        <img
                          src="/rightarrow.svg"
                          alt="Right"
                          className="absolute w-6 h-6"
                        />
                      </div>

                    <div className="w-full rounded-3xl p-4 bg-[#161F00]/35 border border-[#A1A1A1]">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-4xl font-semibold text-white">
                          {formatAmount(
                            order.destination_intent.amount,
                            order.destination_intent.asset
                          )}
                        </span>
                        {destinationAssetOption && (
                          <div className="relative flex items-center shrink-0">
                            {getAssetLogo(destinationAssetOption.asset.symbol, "md")}
                            <div className="absolute -bottom-1 -right-1">
                              {getChainLogo(destinationAssetOption.chainName, "sm")}
                            </div>
                          </div>
                        )}
                      </div>
                  </div>
                </div>

                <div className="p-4 mb-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-base text-white">Transaction fees</span>
                    <span className="text-base text-white font-medium">{transactionFees}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-white">Order Id</span>
                    <div className="flex items-center gap-2">
                      <span className="text-base text-white font-mono">
                        {order.order_id.slice(0, 6)}...{order.order_id.slice(-4)}
                      </span>
                      <button
                        onClick={() => copyToClipboard(order.order_id, "order_id")}
                        className="p-1 transition-colors"
                        title="Copy order ID"
                      >
                        <Image src="/copy.svg" alt="Copy" width={16} height={16} className="w-4 h-4 invert brightness-200 hover:invert-0 hover:brightness-700 hover:scale-110 transition-transform cursor-pointer" unoptimized />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-white">Sender address</span>
                    <button
                      onClick={() => copyToClipboard(order.source_intent.creator, "sender")}
                      className="text-base text-white font-mono underline hover:text-[#A2DF35] transition-colors"
                    >
                      {order.source_intent.creator.slice(0, 6)}...{order.source_intent.creator.slice(-4)}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-white">Recipient address</span>
                    <button
                      onClick={() => copyToClipboard(order.destination_intent.recipient, "recipient")}
                      className="text-base text-white font-mono underline hover:text-[#A2DF35] transition-colors"
                    >
                      {order.destination_intent.recipient.slice(0, 6)}...{order.destination_intent.recipient.slice(-4)}
                    </button>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-base text-white">Created at</span>
                    <span className="text-base text-white">
                      {new Date(order.created_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="w-full rounded-3xl p-6 bg-black/35 border border-[#A1A1A1]">
                  <h2 className="text-base font-semibold text-[#F1FFDB] mb-4">Order status</h2>
                  <div className="relative">
                    <div className="absolute top-6 left-0 right-0 h-0.5">
                      <div 
                        className="absolute h-full bg-none"
                        style={{
                          left: '12.5%',
                          right: '12.5%',
                        }}
                      />
                      {currentStep > 0 && (
                        <motion.div
                          className="absolute h-full"
                          initial={{ width: 0 }}
                          animate={{ 
                            width: currentStep >= 3 
                              ? '75%'
                              : `${(currentStep / 3) * 75}%`
                          }}
                          transition={{ duration: 1.5, ease: "easeInOut" }}
                          style={{
                            left: '12.5%',
                            background: "linear-gradient(99.72deg, #96DD2C -5.97%, #E6EF63 110.07%)"
                          }}
                        />
                      )}
                    </div>

                    {currentStep >= 0 && (
                      <motion.div
                        className="absolute z-30 flex items-center"
                        style={{
                          top: '25px',
                          transform: 'translate(-50%, -50%)',
                        }}
                        initial={{ 
                          left: '12.5%',
                          opacity: 0,
                          scale: 0,
                        }}
                        animate={{ 
                          left: currentStep === 0
                            ? '12.5%'
                            : currentStep === 1 
                            ? '37.5%'
                            : currentStep === 2 
                            ? '62.5%'
                            : '87.5%',
                          opacity: 1,
                          scale: 1,
                        }}
                        transition={{ 
                          left: { duration: 1.5, ease: "easeInOut" },
                          opacity: { duration: 0.3 },
                          scale: {
                            type: "spring",
                            stiffness: 300,
                            damping: 20,
                          }
                        }}
                      >
                        <div className="relative -translate-y-1/2">
                          <div className="relative z-10">
                            <Image
                              src="/star.svg"
                              alt="Active"
                              width={24}
                              height={24}
                              className="w-6 h-6"
                              unoptimized
                            />
                          </div>
                          <div
                            className="absolute left-1/2 top-1/2 pointer-events-none"
                            style={{
                              width: '45px',
                              height: '24px',
                              background: 'linear-gradient(91.58deg, rgba(194, 231, 74, 0) 1.32%, #C2E74A 98.63%)',
                              opacity: 0.4,
                              transform: 'translate(-100%, -50%)',
                              zIndex: 20,
                            }}
                          />
                        </div>
                      </motion.div>
                    )}

                    <div className="relative flex justify-between items-start">
                      {[
                        { label: "Order created", step: 0 },
                        { label: "Detecting deposit", step: 1 },
                        { label: "Redeeming", step: 2 },
                        { label: "Complete", step: 3 },
                      ].map((stepInfo, index) => {
                        const isCompleted = currentStep > stepInfo.step || (stepInfo.step === 0 && currentStep >= 0);
                        const isActive = currentStep === stepInfo.step;

                        return (
                          <div key={index} className="flex flex-col items-center flex-1">
                            <div className="relative w-12 h-12 flex items-center justify-center z-20">
                              {isCompleted && (
                                <motion.div
                                  initial={{ opacity: 0, scale: 0 }}
                                  animate={{ opacity: 1, scale: 1 }}
                                  transition={{ 
                                    duration: 0.5,
                                    delay: index * 0.2,
                                    type: "spring",
                                    stiffness: 200,
                                    damping: 15
                                  }}
                                  className="relative z-10"
                                >
                                  <Image
                                    src="/check_circle.svg"
                                    alt="Completed"
                                    width={24}
                                    height={24}
                                    className="w-6 h-6"
                                    unoptimized
                                  />
                                </motion.div>
                              )}

                              {!isCompleted && !isActive && (
                                <motion.div
                                  initial={{ opacity: 0 }}
                                  animate={{ opacity: 1 }}
                                  transition={{ duration: 0.3 }}
                                  className="w-6 h-6 rounded-full border-2 border-white bg-transparent"
                                />
                              )}
                            </div>
                            <div className="mt-2 text-center">
                              <motion.div
                                initial={{ opacity: 0, y: 5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.1 }}
                                className="text-lg font-medium text-[#F1FFDB]"
                              >
                                {stepInfo.label}
                              </motion.div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="space-y-4"
              >
                <div className="bg-white p-6 rounded-3xl">
                  <h2 className="text-base font-semibold text-black text-center mb-4">
                    Deposit Address / QR Code
                  </h2>
                  <p className="text-sm text-[#B2B1B6] text-center mb-6">
                    Please deposit to the QR code or address. The system will auto-detect your payment and continue the swap.
                  </p>

                  <div className="flex justify-center mb-6">
                    <div className="bg-white p-4 rounded-lg">
                      <QRCodeSVG
                        value={sourceDepositAddress}
                        size={200}
                        level="M"
                      />
                    </div>
                  </div>

                  <div className="rounded-xl p-4 px-6 flex items-center justify-between gap-2 mb-4"
                  style={{ background: "linear-gradient(99.72deg, rgba(150, 221, 44, 0.2) -5.97%, rgba(230, 239, 99, 0.2) 110.07%)" }}>
                    <p className="text-sm font-mono text-black break-all flex-1">
                      {sourceDepositAddress}
                    </p>
                    <button
                      onClick={() => copyToClipboard(sourceDepositAddress, "deposit")}
                      className="shrink-0 transition-colors"
                      title="Copy address"
                    >
                      {copiedAddress === "deposit" ? (
                        <Image src="/check_circle.svg" alt="Copied" width={16} height={16} className="w-4 h-4" unoptimized />
                      ) : (
                        <Image src="/copy.svg" alt="Copy" width={16} height={16} className="w-4 h-4 hover:scale-110 transition-transform cursor-pointer" unoptimized />
                      )}
                    </button>
                  </div>

                  {isConnected &&
                    order &&
                    getRedeemTypeFromAsset(order.source_intent.asset) === "evm" && (
                      <div className="flex flex-col items-stretch gap-2 w-full">
                        <button
                          onClick={handlePayment}
                          disabled={isPaying}
                          className={`px-4 py-2.5 rounded-lg transition-all text-sm font-semibold ${
                            isPaying
                              ? "cursor-not-allowed opacity-70"
                              : "cursor-pointer"
                          }`}
                          style={
                            isPaying
                              ? {
                                  background: "linear-gradient(to right, rgba(150, 221, 44, 0.5), rgba(230, 239, 99, 0.5))",
                                  color: "rgba(0, 0, 0, 0.5)",
                                }
                              : {
                                  background: "linear-gradient(to right, #96DD2C, #E6EF63)",
                                  color: "#000000",
                                  boxShadow: "0 0 20px rgba(201, 255, 128, 0.4)",
                                }
                          }
                          onMouseEnter={(e) => {
                            if (!isPaying) {
                              e.currentTarget.style.background =
                                "linear-gradient(to right, #E6EF63, #96DD2C)";
                              e.currentTarget.style.boxShadow =
                                "0 0 30px rgba(201, 255, 128, 0.6)";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (!isPaying) {
                              e.currentTarget.style.background =
                                "linear-gradient(to right, #96DD2C, #E6EF63)";
                              e.currentTarget.style.boxShadow =
                                "0 0 20px rgba(201, 255, 128, 0.4)";
                            }
                          }}
                        >
                          {isPaying ? (
                            <span className="inline-flex items-center justify-center gap-2">
                              <Loader2 className="w-4 h-4 animate-spin" />
                              Processing...
                            </span>
                          ) : (
                            "Send Transaction"
                          )}
                        </button>
                        {paymentError && (
                          <div className="text-xs text-red-400 text-center">
                            {paymentError}
                          </div>
                        )}
                      </div>
                    )}

                  <p className="text-xs text-[#B2B1B6] text-center mt-4">
                    {isConnected
                      ? "Send transaction directly or scan QR code to send deposit"
                      : "Scan QR code or copy the address above to send your deposit"}
                  </p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </div>

      <OrdersSidebar
        isOpen={isOrdersSidebarOpen}
        onClose={() => setIsOrdersSidebarOpen(false)}
        onOrderClick={handleOrderClick}
      />
    </div>
  );
}
