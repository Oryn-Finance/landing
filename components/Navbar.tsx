"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { ConnectWalletButton } from "./ConnectWalletButton";
import WalletSidebar from "./WalletSidebar";

interface NavbarProps {
  onOrdersClick?: () => void;
}

export function Navbar({ onOrdersClick }: NavbarProps = {}) {
  const [walletSidebarOpen, setWalletSidebarOpen] = useState(false);

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-7xl z-50"
      >
        <div className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl px-4 sm:px-6 lg:px-8">
          {/* Purple glow effect in background */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-purple-500/10 via-purple-500/5 to-transparent pointer-events-none" />

          <div className="relative flex justify-between items-center h-14 md:h-16">
            {/* Brand/Logo - Left */}
            <Link href="/">
              <motion.div
                className="flex items-center gap-1.5 md:gap-2 cursor-pointer"
                whileHover={{ scale: 1.02 }}
              >
                <Image
                  src="/Oryn.svg"
                  alt="Oryn Logo"
                  width={32}
                  height={32}
                  className="w-7 h-7 md:w-8 md:h-8 shrink-0"
                />
                <Image
                  src="/OrynTypo.svg"
                  alt="Oryn"
                  width={100}
                  height={32}
                  className="h-5 md:h-6 w-auto"
                />
              </motion.div>
            </Link>

            {/* Navigation Links - Center */}
            <div className="hidden lg:flex items-center gap-6 xl:gap-8">
              <Link href="/swap">
                <motion.button
                  className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
                  whileHover={{ scale: 1.05 }}
                >
                  Swap
                </motion.button>
              </Link>
            </div>

            {/* Action Buttons - Right */}
            <div className="flex items-center gap-3">
              {/* Log in / View Orders Button */}
              <motion.button
                onClick={onOrdersClick}
                className="px-4 py-2 bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="hidden sm:inline">Orders</span>
                <span className="sm:hidden">Orders</span>
              </motion.button>

              {/* Connect Wallet / Sign Up Button */}
              <ConnectWalletButton
                onOrdersClick={onOrdersClick}
                onWalletsClick={() => setWalletSidebarOpen(true)}
              />
            </div>
          </div>
        </div>
      </motion.nav>
      <WalletSidebar
        isOpen={walletSidebarOpen}
        onClose={() => setWalletSidebarOpen(false)}
      />
    </>
  );
}
