"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useWalletStore } from "../store/walletStore";
import { Sparkles, LogOut, ChevronDown, CheckCircle2, AlertCircle } from "lucide-react";

export function StarknetWalletConnect() {
    const { starknetWallet, setStarknetWallet, disconnectStarknet } = useWalletStore();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if Starknet wallets are available
    const isStarknetWalletAvailable = typeof window !== "undefined" &&
        (typeof (window as any).starknet !== "undefined" ||
            typeof (window as any).argentX !== "undefined" ||
            typeof (window as any).braavos !== "undefined");

    const handleConnect = async () => {
        setIsConnecting(true);
        setError(null);

        try {
            if (typeof window !== "undefined") {
                // Try Argent X wallet first
                if (typeof (window as any).starknet !== "undefined" && (window as any).starknet.isArgentX) {
                    const argentX = (window as any).starknet;
                    try {
                        const accounts = await argentX.request({
                            type: "wallet_requestPermissions",
                            params: {
                                starknet: {}
                            }
                        });
                        if (accounts && accounts.length > 0) {
                            setStarknetWallet({
                                address: accounts[0],
                                isConnected: true,
                            });
                            setIsDropdownOpen(false);
                        }
                    } catch (err: any) {
                        setError(err.message || "Failed to connect Argent X wallet");
                    }
                }
                // Try Braavos wallet
                else if (typeof (window as any).starknet !== "undefined" && (window as any).starknet.isBraavos) {
                    const braavos = (window as any).starknet;
                    try {
                        const accounts = await braavos.request({
                            type: "wallet_requestPermissions",
                            params: {
                                starknet: {}
                            }
                        });
                        if (accounts && accounts.length > 0) {
                            setStarknetWallet({
                                address: accounts[0],
                                isConnected: true,
                            });
                            setIsDropdownOpen(false);
                        }
                    } catch (err: any) {
                        setError(err.message || "Failed to connect Braavos wallet");
                    }
                }
                // Try generic starknet wallet
                else if (typeof (window as any).starknet !== "undefined") {
                    const starknet = (window as any).starknet;
                    try {
                        await starknet.enable();
                        if (starknet.account && starknet.account.address) {
                            setStarknetWallet({
                                address: starknet.account.address,
                                isConnected: true,
                            });
                            setIsDropdownOpen(false);
                        }
                    } catch (err: any) {
                        setError(err.message || "Failed to connect Starknet wallet");
                    }
                }
                else {
                    setError("No Starknet wallet detected. Please install Argent X or Braavos wallet.");
                }
            }
        } catch (err: any) {
            setError(err.message || "Failed to connect Starknet wallet");
        } finally {
            setIsConnecting(false);
        }
    };

    const handleDisconnect = () => {
        disconnectStarknet();
        setIsDropdownOpen(false);
    };

    const formatAddress = (addr: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    if (starknetWallet && starknetWallet.isConnected) {
        return (
            <div className="relative">
                <motion.button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <Sparkles className="w-4 h-4" />
                    <span className="hidden sm:inline">{formatAddress(starknetWallet.address)}</span>
                    <span className="sm:hidden">{formatAddress(starknetWallet.address)}</span>
                    <ChevronDown
                        className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                            }`}
                    />
                </motion.button>

                <AnimatePresence>
                    {isDropdownOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -10, scale: 0.98 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -10, scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {formatAddress(starknetWallet.address)}
                                        </p>
                                        <p className="text-xs text-gray-500">Starknet Wallet</p>
                                    </div>
                                    <CheckCircle2 className="w-5 h-5 text-green-500 flex-shrink-0" />
                                </div>
                            </div>
                            <button
                                onClick={handleDisconnect}
                                className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors"
                            >
                                <LogOut className="w-4 h-4" />
                                Disconnect Wallet
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        );
    }

    return (
        <div className="relative">
            <motion.button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                whileHover={{ scale: isConnecting ? 1 : 1.02 }}
                whileTap={{ scale: isConnecting ? 1 : 0.98 }}
                disabled={isConnecting}
            >
                <Sparkles className="w-4 h-4" />
                {isConnecting ? "Connecting..." : "Connect Starknet"}
                <ChevronDown
                    className={`w-4 h-4 transition-transform ${isDropdownOpen ? "rotate-180" : ""
                        }`}
                />
            </motion.button>

            <AnimatePresence>
                {isDropdownOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.98 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.98 }}
                        transition={{ duration: 0.2 }}
                        className="absolute right-0 mt-2 w-64 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden"
                    >
                        <div className="p-2">
                            <p className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                                Connect Starknet Wallet
                            </p>
                            {error && (
                                <div className="mx-2 mb-2 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
                                    <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                                    <p className="text-xs text-red-700">{error}</p>
                                </div>
                            )}
                            <button
                                onClick={handleConnect}
                                disabled={isConnecting}
                                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-50 transition-colors text-left disabled:opacity-50"
                            >
                                <div className="w-8 h-8 bg-gradient-to-r from-purple-100 to-blue-100 rounded-lg flex items-center justify-center">
                                    <Sparkles className="w-4 h-4 text-purple-600" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-900">
                                        {isStarknetWalletAvailable ? "Detected Wallet" : "Install Wallet"}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {isStarknetWalletAvailable
                                            ? "Click to connect"
                                            : "Install Argent X or Braavos"}
                                    </p>
                                </div>
                            </button>
                            {!isStarknetWalletAvailable && (
                                <div className="mt-2 px-3 py-2 text-xs text-gray-600 bg-gray-50 rounded-lg">
                                    <p className="font-medium mb-1">Recommended Wallets:</p>
                                    <ul className="list-disc list-inside space-y-1 text-gray-500">
                                        <li>Argent X</li>
                                        <li>Braavos</li>
                                    </ul>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

