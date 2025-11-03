"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Wallet, LogOut, Plus } from 'lucide-react';
import { useAccount, useDisconnect, useConnect } from 'wagmi';
import { useWalletStore } from '../store/walletStore';
import { ConnectWalletModal } from './ConnectWalletModal';
import Image from 'next/image';

interface WalletSidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function WalletSidebar({ isOpen, onClose }: WalletSidebarProps) {
    const [modalOpen, setModalOpen] = useState(false);
    const [loadingEVM, setLoadingEVM] = useState(false);
    const [loadingBTC, setLoadingBTC] = useState(false);
    const [loadingStarknet, setLoadingStarknet] = useState(false);

    const { address, isConnected, chainId } = useAccount();
    const { disconnect } = useDisconnect();
    const { connectors, connect } = useConnect();
    const { evmWallet, btcWallet, starknetWallet, setEVMWallet, setBTCWallet, setStarknetWallet, disconnectEVM } = useWalletStore();

    // Sync wagmi state with our store
    useEffect(() => {
        if (isConnected && address) {
            setEVMWallet({
                address,
                chainId: chainId || 0,
                isConnected: true,
            });
        } else if (!isConnected) {
            disconnectEVM();
        }
    }, [isConnected, address, chainId, setEVMWallet, disconnectEVM]);

    const handleEVMConnect = async (connector: any) => {
        setLoadingEVM(true);
        try {
            connect({ connector });
            setModalOpen(false);
        } catch (error) {
            console.error("Failed to connect EVM wallet:", error);
        } finally {
            setLoadingEVM(false);
        }
    };

    const handleBTCConnect = async (wallet: any) => {
        setLoadingBTC(true);
        try {
            if (typeof window !== "undefined") {
                if (wallet.id === "unisat" && typeof (window as any).unisat !== "undefined") {
                    const unisat = (window as any).unisat;
                    const accounts = await unisat.requestAccounts();
                    if (accounts && accounts.length > 0) {
                        setBTCWallet({
                            address: accounts[0],
                            isConnected: true,
                        });
                        setModalOpen(false);
                    }
                } else if (wallet.id === "xverse" && typeof (window as any).XverseProviders !== "undefined") {
                    const provider = (window as any).XverseProviders;
                    const accounts = await provider.requestAccounts();
                    if (accounts && accounts.length > 0) {
                        setBTCWallet({
                            address: accounts[0],
                            isConnected: true,
                        });
                        setModalOpen(false);
                    }
                } else if (wallet.id === "hiro" && typeof (window as any).btc !== "undefined") {
                    const hiro = (window as any).btc;
                    const response = await hiro.request("requestAccount");
                    if (response && response.result) {
                        setBTCWallet({
                            address: response.result,
                            isConnected: true,
                        });
                        setModalOpen(false);
                    }
                } else if (wallet.id === "okx-btc" && typeof (window as any).okxwallet !== "undefined") {
                    const okx = (window as any).okxwallet;
                    const accounts = await okx.requestAccounts();
                    if (accounts && accounts.length > 0) {
                        setBTCWallet({
                            address: accounts[0],
                            isConnected: true,
                        });
                        setModalOpen(false);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to connect BTC wallet:", error);
        } finally {
            setLoadingBTC(false);
        }
    };

    const handleStarknetConnect = async (wallet: any) => {
        setLoadingStarknet(true);
        try {
            if (typeof window !== "undefined") {
                if (wallet.id === "argent-x" && typeof (window as any).starknet !== "undefined") {
                    const starknet = (window as any).starknet;
                    if (starknet.isArgentX) {
                        await starknet.enable();
                        if (starknet.account && starknet.account.address) {
                            setStarknetWallet({
                                address: starknet.account.address,
                                isConnected: true,
                            });
                            setModalOpen(false);
                        }
                    }
                } else if (wallet.id === "braavos" && typeof (window as any).starknet !== "undefined") {
                    const starknet = (window as any).starknet;
                    if (starknet.isBraavos) {
                        await starknet.enable();
                        if (starknet.account && starknet.account.address) {
                            setStarknetWallet({
                                address: starknet.account.address,
                                isConnected: true,
                            });
                            setModalOpen(false);
                        }
                    }
                } else if (wallet.id === "starknet" && typeof (window as any).starknet !== "undefined") {
                    const starknet = (window as any).starknet;
                    await starknet.enable();
                    if (starknet.account && starknet.account.address) {
                        setStarknetWallet({
                            address: starknet.account.address,
                            isConnected: true,
                        });
                        setModalOpen(false);
                    }
                }
            }
        } catch (error) {
            console.error("Failed to connect Starknet wallet:", error);
        } finally {
            setLoadingStarknet(false);
        }
    };

    const handleCloseModal = () => {
        setModalOpen(false);
        setLoadingEVM(false);
        setLoadingBTC(false);
        setLoadingStarknet(false);
    };

    // Lock body scroll when sidebar is open
    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = "fixed";
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = "100%";
            document.body.style.overflow = "hidden";
        } else {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            }
        }
        return () => {
            const scrollY = document.body.style.top;
            document.body.style.position = "";
            document.body.style.top = "";
            document.body.style.width = "";
            document.body.style.overflow = "";
            if (scrollY) {
                window.scrollTo(0, parseInt(scrollY || "0") * -1);
            }
        };
    }, [isOpen]);

    const formatAddress = (addr: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
    };

    const handleDisconnectEVM = () => {
        if (isConnected) {
            disconnect();
            disconnectEVM();
        }
    };

    const handleDisconnectBTC = () => {
        setBTCWallet({ address: "", isConnected: false });
    };

    const handleDisconnectStarknet = () => {
        setStarknetWallet({ address: "", isConnected: false });
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 backdrop-blur-md bg-white/10 z-50"
                        onClick={onClose}
                    />

                    {/* Sidebar */}
                    <motion.div
                        initial={{ x: '100%' }}
                        animate={{ x: 0 }}
                        exit={{ x: '100%' }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        className="fixed right-0 top-0 h-full w-[85vw] max-w-sm xs:w-80 md:w-96 bg-white shadow-xl z-50 overflow-hidden flex flex-col"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between p-3 md:p-4 py-4 md:py-6 border-b shrink-0">
                            <h2 className="text-base md:text-lg font-semibold">Connected Wallets</h2>
                            <button
                                onClick={onClose}
                                className="p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="flex-1 overflow-y-auto p-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {/* EVM Wallet */}
                                {isConnected && evmWallet?.isConnected && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-lg border border-indigo-200 bg-indigo-50"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src="https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png"
                                                    alt="avalanche"
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-indigo-900">EVM Wallet</h3>
                                                    <p className="text-xs text-indigo-600">Avalanche Network</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-xs text-indigo-600 mb-1">Address</p>
                                            <p className="text-sm font-mono text-indigo-900 break-all">
                                                {evmWallet.address}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleDisconnectEVM}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Disconnect
                                        </button>
                                    </motion.div>
                                )}

                                {/* Bitcoin Wallet */}
                                {btcWallet?.isConnected && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-lg border border-orange-200 bg-orange-50"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src="/bitcoin-btc-logo.svg"
                                                    alt="bitcoin"
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-orange-900">Bitcoin Wallet</h3>
                                                    <p className="text-xs text-orange-600">Bitcoin Network</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-xs text-orange-600 mb-1">Address</p>
                                            <p className="text-sm font-mono text-orange-900 break-all">
                                                {btcWallet.address}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleDisconnectBTC}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Disconnect
                                        </button>
                                    </motion.div>
                                )}

                                {/* Starknet Wallet */}
                                {starknetWallet?.isConnected && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="p-4 rounded-lg border border-purple-200 bg-purple-50"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <Image
                                                    src="https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png"
                                                    alt="starknet"
                                                    width={32}
                                                    height={32}
                                                    className="rounded-full"
                                                />
                                                <div>
                                                    <h3 className="font-semibold text-purple-900">Starknet Wallet</h3>
                                                    <p className="text-xs text-purple-600">Starknet Network</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mb-3">
                                            <p className="text-xs text-purple-600 mb-1">Address</p>
                                            <p className="text-sm font-mono text-purple-900 break-all">
                                                {starknetWallet.address}
                                            </p>
                                        </div>
                                        <button
                                            onClick={handleDisconnectStarknet}
                                            className="w-full flex items-center justify-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 border border-red-200 rounded-lg transition-colors cursor-pointer text-sm font-medium"
                                        >
                                            <LogOut className="w-4 h-4" />
                                            Disconnect
                                        </button>
                                    </motion.div>
                                )}
                            </div>

                            {/* No wallets connected */}
                            {!isConnected && !evmWallet?.isConnected && !btcWallet?.isConnected && !starknetWallet?.isConnected && (
                                <div className="text-center py-8 text-gray-500">
                                    <Wallet className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                                    <p>No wallets connected</p>
                                    <p className="text-sm text-gray-400 mt-1">
                                        Connect a wallet to get started
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Add Wallet Button at Bottom - Only show if not all connected */}
                        {!(isConnected && evmWallet?.isConnected && btcWallet?.isConnected && starknetWallet?.isConnected) && (
                            <div className="border-t p-4 shrink-0">
                                <motion.button
                                    onClick={() => setModalOpen(true)}
                                    className="group relative w-full flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg overflow-hidden cursor-pointer text-sm font-medium"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    <span className="relative z-10 flex items-center gap-2">
                                        <Plus className="w-4 h-4" />
                                        Connect Wallet
                                    </span>
                                    <motion.div
                                        className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700"
                                        initial={{ opacity: 0 }}
                                        whileHover={{ opacity: 1 }}
                                        transition={{ duration: 0.3 }}
                                    />
                                </motion.button>
                            </div>
                        )}
                    </motion.div>
                </>
            )}

            <ConnectWalletModal
                open={modalOpen}
                onClose={handleCloseModal}
                onEVMConnect={handleEVMConnect}
                onBTCConnect={handleBTCConnect}
                onStarknetConnect={handleStarknetConnect}
                loadingEVM={loadingEVM}
                loadingBTC={loadingBTC}
                loadingStarknet={loadingStarknet}
            />
        </AnimatePresence>
    );
}

