"use client";

export const dynamic = "force-dynamic";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Swap from "../../components/Swap";
import { Navbar } from "../../components/Navbar";
import OrdersSidebar from "../../components/OrdersSidebar";
import Prism from "../../components/ui/Prism";

export default function SwapPage() {
  const router = useRouter();
  const [isOrdersSidebarOpen, setIsOrdersSidebarOpen] = useState(false);

  const handleOrdersClick = () => {
    setIsOrdersSidebarOpen(true);
  };

  const handleOrderClick = (orderId: string) => {
    router.push(`/order/${orderId}`);
    setIsOrdersSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#070011] text-white overflow-x-hidden overflow-y-visible">
      {/* Navigation */}
      <Navbar onOrdersClick={handleOrdersClick} />

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
      <div className="relative z-10 min-h-screen flex items-center justify-center overflow-visible">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            duration: 0.3,
            delay: 0.2,
            type: "spring",
            damping: 20,
            stiffness: 250,
          }}
          className="w-fit max-w-2xl overflow-visible"
        >
            <Swap />
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
