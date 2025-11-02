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
        className="relative z-50 bg-white/70 backdrop-blur-xl border-b border-purple-100/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-14 xs:h-16 md:h-20">
            <Link href="/">
              <motion.div
                className="flex items-center gap-1.5 md:gap-2 cursor-pointer"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src="/Oryn.svg"
                  alt="Oryn Logo"
                  width={40}
                  height={40}
                  className="w-8 h-8 md:w-10 md:h-10 shrink-0"
                />
                <Image
                  src="/OrynTypo.svg"
                  alt="Oryn"
                  width={120}
                  height={40}
                  className="h-6 md:h-8 w-auto"
                />
              </motion.div>
            </Link>
            <div className="flex items-center gap-3">
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
