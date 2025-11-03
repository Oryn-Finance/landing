"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import axios from "axios";
import QRCodeSVG from "react-qr-code";
import { Navbar } from "../../../components/Navbar";
import { API_URLS } from "../../../constants/constants";
import type { Order, OrderStatus } from "../../../types/order";
import { ArrowLeft, Copy, CheckCircle2, Clock, Loader2 } from "lucide-react";

const STATUS_STEPS: OrderStatus[] = [
  "initiated",
  "awaiting_deposit",
  "deposit_detected",
  "redeeming",
  "complete",
];

const STATUS_LABELS: Record<OrderStatus, string> = {
  initiated: "Initiated",
  awaiting_deposit: "Awaiting Deposit",
  deposit_detected: "Deposit Detected",
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

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;

      setIsLoading(true);
      setError(null);

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

    fetchOrder();
  }, [orderId]);

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(true);
      setTimeout(() => setCopiedAddress(false), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const getCurrentStatus = (): OrderStatus => {
    if (!order) return "initiated";

    // Determine status based on order state
    // This is a simplified version - you may need to adjust based on actual API response
    if (
      order.source_intent.state === "completed" ||
      order.destination_intent.state === "completed"
    ) {
      return "complete";
    }
    if (
      order.source_intent.state === "redeeming" ||
      order.destination_intent.state === "redeeming"
    ) {
      return "redeeming";
    }
    if (
      order.source_intent.transactions.create_tx ||
      order.destination_intent.transactions.create_tx
    ) {
      return "deposit_detected";
    }
    if (
      order.source_intent.deposit_address ||
      order.destination_intent.deposit_address
    ) {
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
                    const isPending = index > currentStatusIndex;

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
                              className={`font-medium ${
                                isCurrent
                                  ? "text-purple-600"
                                  : isCompleted
                                  ? "text-green-600"
                                  : "text-gray-400"
                              }`}
                            >
                              {STATUS_LABELS[status]}
                            </div>
                            {isCurrent && (
                              <div className="text-xs text-gray-500 mt-1">
                                In progress...
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Connector Line */}
                        {index < STATUS_STEPS.length - 1 && (
                          <div
                            className={`absolute left-4 w-0.5 ${
                              isCompleted ? "bg-green-500" : "bg-gray-200"
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
