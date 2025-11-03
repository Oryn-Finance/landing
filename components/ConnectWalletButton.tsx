"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAccount, useDisconnect, useConnect } from "wagmi";
import { useWalletStore } from "../store/walletStore";
import { Wallet, Plus, X, User } from "lucide-react";
import { ConnectWalletModal } from "./ConnectWalletModal";
import Image from "next/image";

interface ConnectWalletButtonProps {
    onOrdersClick?: () => void;
    onWalletsClick?: () => void;
}

export function ConnectWalletButton({ onOrdersClick, onWalletsClick }: ConnectWalletButtonProps = {}) {
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

    const isAnyWalletConnected = (isConnected && evmWallet) || btcWallet?.isConnected || starknetWallet?.isConnected;

    const handleCloseModal = () => {
        setModalOpen(false);
        setLoadingEVM(false);
        setLoadingBTC(false);
        setLoadingStarknet(false);
    };

    const formatAddress = (addr: string) => {
        if (!addr) return "";
        return `${addr.slice(0, 6)}...${addr.slice(-4)}`;
    };

    const handleDisconnect = () => {
        if (isConnected) {
            disconnect();
            disconnectEVM();
        }
        if (btcWallet?.isConnected) {
            setBTCWallet({ address: "", isConnected: false });
        }
        if (starknetWallet?.isConnected) {
            setStarknetWallet({ address: "", isConnected: false });
        }
    };

    return (
        <>
            <div className="flex items-center gap-1 md:gap-2 flex-wrap">
                {isAnyWalletConnected ? (
                    <>
                        {/* Mobile: Wallet button and User profile button */}
                        <div className="md:hidden flex items-center gap-1 md:gap-2">
                            <motion.button
                                onClick={() => onWalletsClick?.()}
                                className="w-7 h-7 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                title="View connected wallets"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Wallet className="w-3.5 h-3.5" />
                            </motion.button>
                            <motion.button
                                onClick={() => onOrdersClick?.()}
                                className="w-7 h-7 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-gray-300"
                                title="View orders"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <User className="w-3.5 h-3.5" />
                            </motion.button>
                        </div>

                        {/* Desktop: Separate Wallet Status Badges */}
                        <div className="hidden md:flex items-center gap-1 md:gap-2 flex-wrap">
                            {/* EVM Wallet Badge */}
                            {isConnected && evmWallet?.isConnected && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-indigo-100 text-indigo-700 rounded-lg text-xs md:text-sm font-medium"
                                >
                                    <Image
                                        src="https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png"
                                        alt="avalanche"
                                        width={20}
                                        height={20}
                                        className="rounded-full md:w-5 md:h-5"
                                    />
                                    <span className="hidden md:inline">EVM: </span>
                                    <span>{formatAddress(evmWallet.address)}</span>
                                </motion.div>
                            )}

                            {/* Bitcoin Wallet Badge */}
                            {btcWallet?.isConnected && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-orange-100 text-orange-700 rounded-lg text-xs md:text-sm font-medium"
                                >
                                    <Image
                                        src="/bitcoin-btc-logo.svg"
                                        alt="bitcoin"
                                        width={20}
                                        height={20}
                                        className="rounded-full md:w-5 md:h-5"
                                    />
                                    <span className="hidden md:inline">BTC: </span>
                                    <span>{formatAddress(btcWallet.address)}</span>
                                </motion.div>
                            )}

                            {/* Starknet Wallet Badge */}
                            {starknetWallet?.isConnected && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-purple-100 text-purple-700 rounded-lg text-xs md:text-sm font-medium"
                                >
                                    <Image
                                        src="https://s2.coinmarketcap.com/static/img/coins/64x64/22691.png"
                                        alt="starknet"
                                        width={20}
                                        height={20}
                                        className="rounded-full md:w-5 md:h-5"
                                    />
                                    <span className="hidden md:inline">Starknet: </span>
                                    <span>{formatAddress(starknetWallet.address)}</span>
                                </motion.div>
                            )}
                        </div>

                        {/* Action Buttons - Desktop only */}
                        <div className="hidden md:flex items-center gap-1 md:gap-2">
                            {/* Only show Add Wallet button if not all wallets connected */}
                            {!(isConnected && evmWallet?.isConnected && btcWallet?.isConnected && starknetWallet?.isConnected) && (
                                <motion.button
                                    onClick={() => setModalOpen(true)}
                                    className="w-7 h-7 md:w-8 md:h-8 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                    title="Connect another wallet"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Plus className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                </motion.button>
                            )}

                            {/* Disconnect Button - Red Circle with X */}
                            <motion.button
                                onClick={handleDisconnect}
                                className="w-7 h-7 md:w-8 md:h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <X className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </motion.button>

                            {/* Profile/Manage Button - Gray Circle with Person */}
                            <motion.button
                                onClick={() => onOrdersClick?.()}
                                className="w-7 h-7 md:w-8 md:h-8 bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 rounded-full flex items-center justify-center transition-colors cursor-pointer border border-gray-300"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <User className="w-3.5 h-3.5 md:w-4 md:h-4" />
                            </motion.button>
                        </div>
                    </>
                ) : (
                    <motion.button
                        onClick={() => setModalOpen(true)}
                        className="flex items-center gap-1.5 md:gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm md:text-base font-medium shadow-lg hover:shadow-xl transition-all cursor-pointer"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                    >
                        <Wallet className="w-3.5 h-3.5 md:w-4 md:h-4" />
                        <span className="hidden md:inline">Connect Wallet</span>
                        <span className="md:hidden">Connect</span>
                    </motion.button>
                )}
            </div>

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
        </>
    );
}
