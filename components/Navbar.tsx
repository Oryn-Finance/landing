"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
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
  const pathname = usePathname();
  const isLandingPage = pathname === "/";

  return (
    <>
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed z-50 w-full mx-auto"
      >
        <div
          className={`relative px-6 sm:px-8 lg:px-16 py-2 sm:py-3 lg:py-4 border-b border-[#A1A1A1] ${
            isLandingPage
              ? "bg-black/20 backdrop-blur-xl"
              : "bg-[#000000]/35"
          }`}
        >
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
                  className="h-7 md:h-8 w-auto"
                />
              </motion.div>
            </Link>

            {/* Navigation Links - Center */}
            {!isLandingPage && (
              <div className="hidden lg:flex items-center gap-8 lg:gap-10">
                <Link href="/swap">
                  <motion.button
                    className="text-lg font-medium text-white transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    Swap
                  </motion.button>
                </Link>
                <Link href="/faucet">
                  <motion.button
                    className="text-lg font-medium text-white transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                  >
                    Faucet
                  </motion.button>
                </Link>
              </div>
            )}

            <div className="flex items-center gap-3">
              {isLandingPage ? (
                <>
                  <motion.a
                    href="https://github.com/Oryn-Finance/landing"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="hidden sm:inline">Source Code</span>
                    <span className="sm:hidden">Code</span>
                  </motion.a>
                  <Link href="/swap">
                    <motion.button
                      className="px-5 py-2 text-black rounded-lg text-sm font-semibold transition-all cursor-pointer"
                      style={{
                        background: "linear-gradient(to right, #96DD2C, #E6EF63)",
                        boxShadow: "0 0 40px rgba(201, 255, 128, 0.45)",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to right, #E6EF63, #96DD2C)";
                        e.currentTarget.style.boxShadow =
                          "0 0 55px rgba(201, 255, 128, 0.65)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background =
                          "linear-gradient(to right, #96DD2C, #E6EF63)";
                        e.currentTarget.style.boxShadow =
                          "0 0 40px rgba(201, 255, 128, 0.45)";
                      }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Launch App
                    </motion.button>
                  </Link>
                </>
              ) : (
                <>
                  <motion.button
                    onClick={onOrdersClick}
                    className="px-4 py-2 bg-gray-800/80 hover:bg-gray-800 text-gray-300 hover:text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <span className="hidden sm:inline">Orders</span>
                    <span className="sm:hidden">Orders</span>
                  </motion.button>

                  <ConnectWalletButton
                    onOrdersClick={onOrdersClick}
                    onWalletsClick={() => setWalletSidebarOpen(true)}
                  />
                </>
              )}
            </div>
          </div>
        </div>
      </motion.nav>
      {!isLandingPage && (
        <WalletSidebar
          isOpen={walletSidebarOpen}
          onClose={() => setWalletSidebarOpen(false)}
        />
      )}
    </>
  );
}
