"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Swap from "../../components/Swap";
import { Navbar } from "../../components/Navbar";
import OrdersSidebar from "../../components/OrdersSidebar";

export default function SwapPage() {
  const [isOrdersSidebarOpen, setIsOrdersSidebarOpen] = useState(false);

  const handleOrdersClick = () => {
    setIsOrdersSidebarOpen(true);
  };

  const handleOrderClick = (orderId: string) => {
    // TODO: Handle order click - maybe open order details modal
    console.log("Order clicked:", orderId);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 overflow-x-hidden">
      {/* Background effects */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80"
          animate={{
            opacity: [0.5, 0.7, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute top-20 right-20 w-96 h-96 bg-purple-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, 50, 0],
            y: [0, 30, 0],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 left-20 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -50, 0],
            y: [0, -30, 0],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>

      {/* Navigation */}
      <Navbar onOrdersClick={handleOrdersClick} />

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-56px)] xs:min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-2xl"
        >
          <div className="text-center mb-4 xs:mb-6 md:mb-8">
            <motion.h1
              className="text-xl xs:text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-light text-gray-900 mb-2 md:mb-3 tracking-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="block mb-1 md:mb-2">Bridge Your Assets</span>
              <span className="font-medium bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                Fast & Secure
              </span>
            </motion.h1>
            <motion.p
              className="text-xs xs:text-sm sm:text-base md:text-lg text-gray-600 font-light px-2"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              Swap assets between Bitcoin and any EVM chain in 30 seconds
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Swap />
          </motion.div>
        </motion.div>
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

