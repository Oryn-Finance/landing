"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import Swap from "../../components/Swap";
import { Navbar } from "../../components/Navbar";
import OrdersSidebar from "../../components/OrdersSidebar";
import PixelBlast from "@/components/ui/PixelBlast";

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
    <div className="min-h-screen bg-[#070011] text-white overflow-x-hidden">
      {/* Navigation */}
      <Navbar onOrdersClick={handleOrdersClick} />

      <div className="w-screen h-screen absolute inset-0">
        <PixelBlast
          variant="square"
          pixelSize={4}
          color="#B19EEF"
          patternScale={2}
          patternDensity={1}
          pixelSizeJitter={0}
          enableRipples
          rippleSpeed={0.5}
          rippleThickness={0.12}
          rippleIntensityScale={1.5}
          // liquid
          // liquidStrength={0.12}
          // liquidRadius={1.2}
          // liquidWobbleSpeed={5}
          speed={0.6}
          edgeFade={0.25}
        />
      </div>

      {/* Main Content */}
      <div className="relative z-10 min-h-[calc(100vh-56px)] xs:min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] flex items-center justify-center px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-6 md:py-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-fit min-w-xl"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="scale-90 origin-top rounded-4xl bg-white/10 backdrop-blur-lg border border-white/10 py-8 p-6"
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
