"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { useMemo, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { type Chain } from "../store/assetsStore";
import axios from "axios";
import { API_URLS } from "../constants/constants";
import {
  Zap,
  Shield,
  Lock,
  Rocket,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
  Layers,
  Network,
  Coins,
  Activity,
} from "lucide-react";
import Prism from "@/components/ui/Prism";
import { Navbar } from "@/components/Navbar";
import { getChainLogo } from "@/utils/assetUtils";

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  delay?: number;
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5 }}
      className="relative group p-5 rounded-3xl bg-black/35 backdrop-blur-sm border border-[#A1A1A1] hover:border-[#96DD2C]/60 hover:bg-black/50 transition-all"
    >
      <motion.div
        className="w-11 h-11 rounded-lg flex items-center justify-center mb-4"
        style={{
          background: "linear-gradient(99.72deg, rgba(150, 221, 44, 0.2) -5.97%, rgba(230, 239, 99, 0.2) 110.07%)",
          border: "1px solid rgba(150, 221, 44, 0.3)",
        }}
        whileHover={{ rotate: 360, scale: 1.05 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="w-5 h-5 text-[#96DD2C]" />
      </motion.div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-200 leading-relaxed">{description}</p>
    </motion.div>
  );
}


export default function Home() {
  const [chains, setChains] = useState<Chain[]>([]);

  // Fetch chains on mount
  useEffect(() => {
    const fetchChains = async () => {
      try {
        const baseUrl = API_URLS.QUOTE.endsWith("/")
          ? API_URLS.QUOTE.slice(0, -1)
          : API_URLS.QUOTE;
        const url = `${baseUrl}/chains`;

        const response = await axios.get<{ result: Chain[] }>(url, {
          timeout: 10000,
          headers: {
            "Content-Type": "application/json",
          },
        });

        setChains(response.data.result);
      } catch (error) {
        console.error("Failed to fetch chains:", error);
      }
    };

    fetchChains();
  }, []);

  // Get unique chains for display
  const uniqueChains = useMemo(() => {
    return chains.filter(
      (chain, index, self) =>
        index ===
        self.findIndex((c) => c.name.toLowerCase() === chain.name.toLowerCase())
    );
  }, [chains]);

  return (
    <div className="min-h-screen relative bg-[#070011] text-white overflow-x-hidden">
      {/* Navigation */}
      <Navbar />

      {/* Prism Background */}
      <div className="w-screen h-screen fixed inset-0">
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

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16 z-10">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex items-center justify-center gap-12 text-center">
            {/* Left Column - Content */}
            <motion.div
              className="space-y-8"
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-black/35 backdrop-blur-sm border border-[#A1A1A1] rounded-full text-white text-xs font-medium tracking-wide"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-[#96DD2C] animate-pulse" />
                Cross-Chain Bridge Protocol
              </motion.div>

              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="block text-white mb-2">
                  Cross-Chain Bridge
                </span>
                <span className="block font-medium">
                  Without Unlimited Approvals
                </span>
              </motion.h1>

              <motion.p
                className="text-xl sm:text-2xl text-gray-200 font-light leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Bridge assets across chains{" "}
                <span className="font-medium">in 30 seconds</span>
              </motion.p>

              <motion.p
                className="text-base text-gray-200 leading-relaxed max-w-2xl mx-auto"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                No unlimited token approvals. Lower risk than traditional
                bridges. Built for secure, trustless cross-chain swaps—faster
                and safer than approval-based bridges.
              </motion.p>

              <motion.div
                className="flex items-center justify-center gap-3 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/swap">
                  <motion.button
                    className="group relative px-8 py-3.5 text-white text-base font-medium rounded-lg flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
                    style={{
                      background: "linear-gradient(to right, #96DD2C, #E6EF63)",
                      boxShadow: "0 0 40px rgba(201, 255, 128, 0.45)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(to right, #E6EF63, #96DD2C)";
                      e.currentTarget.style.boxShadow = "0 0 55px rgba(201, 255, 128, 0.65)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "linear-gradient(to right, #96DD2C, #E6EF63)";
                      e.currentTarget.style.boxShadow = "0 0 40px rgba(201, 255, 128, 0.45)";
                    }}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 55px rgba(201, 255, 128, 0.65)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center gap-2 text-black font-semibold">
                      Start Swapping
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                  </motion.button>
                </Link>
                <motion.button
                  className="px-8 py-3.5 bg-black/35 backdrop-blur-sm border border-[#A1A1A1] text-white text-base font-medium rounded-lg hover:border-[#96DD2C]/60 hover:bg-black/50 transition-all cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Simple and Secure Wallet Services */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 pt-32">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 md:gap-12 mb-12">
            {/* Title */}
            <motion.h2
              className="text-4xl sm:text-5xl lg:text-6xl font-light text-white leading-tight"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="block">Fast and trustless</span>
              <span 
                className="block"
                style={{
                  background: "linear-gradient(99.72deg, #96DD2C -5.97%, #E6EF63 110.07%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                cross-chain swaps
              </span>
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-base sm:text-lg text-gray-300 font-light leading-relaxed max-w-md md:text-right"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Bridge any EVM asset across chains in 30 seconds. No unlimited
              approvals—lower risk than traditional bridges.
            </motion.p>
          </div>

          {/* Feature Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
            {/* Top Row - 2 Larger Cards */}
            {[
              {
                icon: Zap,
                title: "30-Second Swaps",
                description:
                  "Complete cross-chain swaps in 30 seconds—faster than traditional bridges.",
              },
              {
                icon: Shield,
                title: "HTLC Atomic Swaps",
                description:
                  "Cryptographically secure, trustless transactions. Your keys, your crypto.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="relative group p-6 md:p-8 rounded-3xl bg-black/35 backdrop-blur-sm border border-[#A1A1A1] overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-6">
                    <div 
                      className="w-16 h-16 rounded-xl flex items-center justify-center"
                      style={{
                        background: "linear-gradient(99.72deg, rgba(150, 221, 44, 0.2) -5.97%, rgba(230, 239, 99, 0.2) 110.07%)",
                        border: "1px solid rgba(150, 221, 44, 0.3)",
                      }}
                    >
                      <feature.icon className="w-8 h-8 text-[#96DD2C]" />
                    </div>
                  </div>
                  <h3 className="text-xl md:text-2xl font-medium text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-sm md:text-base text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Row - 3 Smaller Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            {[
              {
                icon: Rocket,
                title: "One-Click Swaps",
                description:
                  "Deposit-based model—no wallet connection or approvals needed.",
              },
              {
                icon: Network,
                title: "Multi-Chain Support",
                description:
                  "Bridge between Avalanche, Ethereum, Polygon, and more.",
              },
              {
                icon: Lock,
                title: "Non-Custodial",
                description:
                  "Self-custody design. You control your keys at all times.",
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="relative group p-6 rounded-3xl bg-black/35 backdrop-blur-sm border border-[#A1A1A1] overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.3 + index * 0.1 }}
              >
                <div className="relative z-10">
                  <div className="flex items-center justify-center mb-4">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center"
                      style={{
                        background: "linear-gradient(99.72deg, rgba(150, 221, 44, 0.2) -5.97%, rgba(230, 239, 99, 0.2) 110.07%)",
                        border: "1px solid rgba(150, 221, 44, 0.3)",
                      }}
                    >
                      <feature.icon className="w-6 h-6 text-[#96DD2C]" />
                    </div>
                  </div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 pt-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-gray-200 font-light">
              Three simple steps to cross-chain freedom
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                icon: Coins,
                title: "Deposit to Account",
                desc: "Deposit your assets into your account—no wallet connection or approvals needed",
              },
              {
                step: "2",
                icon: Zap,
                title: "Select Swap Details",
                desc: "Choose your source and destination chains and assets for instant swapping",
              },
              {
                step: "3",
                icon: Rocket,
                title: "Receive Directly",
                desc: "We send your swapped assets directly to your destination—complete in 30 seconds",
              },
            ].map((step, index) => (
              <motion.div
                key={index}
                className="relative"
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
              >
                <div className="bg-black/35 backdrop-blur-sm border border-[#A1A1A1] p-6 rounded-3xl text-center relative h-full hover:border-[#96DD2C]/60 hover:bg-black/50 transition-all">
                  <motion.div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-black font-medium text-sm shadow-md"
                    style={{
                      background: "linear-gradient(99.72deg, #96DD2C -5.97%, #E6EF63 110.07%)",
                    }}
                    whileHover={{ scale: 1.05, rotate: 360 }}
                    transition={{ duration: 0.6 }}
                  >
                    {step.step}
                  </motion.div>
                  <motion.div
                    className="mt-6 mb-5 flex justify-center"
                    whileHover={{ scale: 1.05, rotate: 5 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div 
                      className="w-16 h-16 rounded-lg flex items-center justify-center"
                      style={{
                        background: "linear-gradient(99.72deg, rgba(150, 221, 44, 0.2) -5.97%, rgba(230, 239, 99, 0.2) 110.07%)",
                        border: "1px solid rgba(150, 221, 44, 0.3)",
                      }}
                    >
                      <step.icon className="w-8 h-8 text-[#96DD2C]" />
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-medium text-white mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-200 leading-relaxed">
                    {step.desc}
                  </p>
                </div>
                {index < 2 && (
                  <motion.div
                    className="hidden md:block absolute top-1/2 right-0 transform translate-x-full -translate-y-1/2 w-16"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                  >
                    <div 
                      className="h-0.5"
                      style={{
                        background: "linear-gradient(99.72deg, #96DD2C -5.97%, #E6EF63 110.07%)",
                      }}
                    />
                    <motion.div
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2"
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5" style={{ color: "#96DD2C" }} />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Chains & Assets */}
      <section className="relative py-32 px-4 sm:px-6 lg:px-8 z-10 overflow-hidden pt-32">

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Asset Icons Carousel */}
          <div className="relative mb-16 overflow-hidden">
            {/* Scrolling icons */}
            <div className="flex items-center justify-center gap-6 md:gap-8">
              {uniqueChains.length > 0 ? (
                uniqueChains.slice(0, 8).map((chain, index) => (
                  <motion.div
                    key={chain.id}
                    className="shrink-0 relative"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/80 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                      {getChainLogo(chain.name, "md")}
                    </div>
                  </motion.div>
                ))
              ) : (
                <>
                  {["ethereum", "avalanche", "bitcoin", "polygon"].map(
                    (asset, index) => (
                      <motion.div
                        key={asset}
                        className="shrink-0 relative"
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: index * 0.1 }}
                      >
                        <div className="relative w-14 h-14 md:w-16 md:h-16 rounded-full bg-black/80 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                          {asset === "ethereum" && (
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 flex items-center justify-center">
                              <span className="text-white font-bold text-xs md:text-sm">
                                E
                              </span>
                            </div>
                          )}
                          {asset === "avalanche" && (
                            <Image
                              src="https://s2.coinmarketcap.com/static/img/coins/64x64/5805.png"
                              alt="avalanche"
                              width={32}
                              height={32}
                              className="w-7 h-7 md:w-8 md:h-8 rounded-full"
                            />
                          )}
                          {asset === "bitcoin" && (
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gray-600 flex items-center justify-center">
                              <span className="text-white font-bold text-xs md:text-sm">
                                B
                              </span>
                            </div>
                          )}
                          {asset === "polygon" && (
                            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-purple-500 flex items-center justify-center">
                              <span className="text-white font-bold text-xs md:text-sm">
                                P
                              </span>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )
                  )}
                </>
              )}
            </div>
          </div>

          {/* Central Icon with Glowing Halo */}
          <div className="flex justify-center mb-12 relative">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              {/* Glowing Halo */}
              <motion.div
                className="absolute inset-0 -m-8 md:-m-12 rounded-full"
                animate={{
                  boxShadow: [
                    "0 0 60px rgba(150, 221, 44, 0.6), 0 0 100px rgba(230, 239, 99, 0.4)",
                    "0 0 80px rgba(150, 221, 44, 0.8), 0 0 120px rgba(230, 239, 99, 0.6)",
                    "0 0 60px rgba(150, 221, 44, 0.6), 0 0 100px rgba(230, 239, 99, 0.4)",
                  ],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#96DD2C]/30 to-[#E6EF63]/30 blur-xl" />
              </motion.div>

              {/* Central Icon */}
              <div className="relative w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-[#96DD2C]/20 to-[#E6EF63]/20 backdrop-blur-sm rounded-2xl border border-[#96DD2C]/30 flex items-center justify-center">
                <Image
                  src={"/OrynGlass2.png"}
                  alt="Oryn"
                  width={128}
                  height={128}
                  className="w-full h-full object-contain mix-blend-screen"
                />
              </div>
            </motion.div>
          </div>

          {/* Text Content */}
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-light text-white mb-4 tracking-tight">
              Bridge across{" "}
              <span
                style={{
                  background: "linear-gradient(99.72deg, #96DD2C -5.97%, #E6EF63 110.07%)",
                  backgroundClip: "text",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                3+ assets
              </span>{" "}
              and chains
            </h2>
            <p className="text-lg md:text-xl text-gray-300 font-light">
              Swap Ethereum, Avalanche, Polygon, and more across any supported
              blockchain. Pick your assets and bridge instantly.
            </p>
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/swap">
              <motion.button
                className="px-8 py-3.5 text-black rounded-lg font-semibold text-base cursor-pointer"
                style={{
                  background: "linear-gradient(to right, #96DD2C, #E6EF63)",
                  boxShadow: "0 0 40px rgba(201, 255, 128, 0.45)",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "linear-gradient(to right, #E6EF63, #96DD2C)";
                  e.currentTarget.style.boxShadow = "0 0 55px rgba(201, 255, 128, 0.65)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "linear-gradient(to right, #96DD2C, #E6EF63)";
                  e.currentTarget.style.boxShadow = "0 0 40px rgba(201, 255, 128, 0.45)";
                }}
                whileHover={{ scale: 1.05, boxShadow: "0 0 55px rgba(201, 255, 128, 0.65)" }}
                whileTap={{ scale: 0.95 }}
              >
                Start Swapping
              </motion.button>
            </Link>
            <motion.button
              className="px-8 py-3.5 bg-black/35 backdrop-blur-sm border border-[#A1A1A1] text-white rounded-lg font-medium text-base cursor-pointer hover:border-[#96DD2C]/60 hover:bg-black/50 transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View Supported Chains
            </motion.button>
          </motion.div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 pt-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
              Security & Trust
            </h2>
            <p className="text-lg text-gray-200 font-light">
              Built on battle-tested cryptographic protocols
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Lock,
                title: "HTLC Atomic Swaps",
                desc: "Hash Time-Locked Contracts ensure atomicity—either the entire swap succeeds or nothing happens.",
              },
              {
                icon: Shield,
                title: "Secure Account Model",
                desc: "Deposit to your account and receive swapped assets directly. Secure, fast, and trustless execution.",
              },
              {
                icon: Activity,
                title: "Security Metrics",
                desc: "99.9% success rate with zero security incidents. Audited and battle-tested.",
              },
            ].map((feature, index) => (
              <FeatureCard
                key={index}
                icon={feature.icon}
                title={feature.title}
                description={feature.desc}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Technology & Architecture */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-black/20 pt-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
              Technology & Architecture
            </h2>
            <p className="text-lg text-gray-200 font-light">
              Built on cryptographic guarantees, not trust
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            <motion.div
              className="bg-black/35 backdrop-blur-sm border border-[#A1A1A1] p-8 rounded-3xl"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-medium text-white mb-4 flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(99.72deg, rgba(150, 221, 44, 0.2) -5.97%, rgba(230, 239, 99, 0.2) 110.07%)",
                    border: "1px solid rgba(150, 221, 44, 0.3)",
                  }}
                >
                  <Layers className="w-5 h-5 text-[#96DD2C]" />
                </div>
                HTLC Atomic Swaps
              </h3>
              <p className="text-gray-200 leading-relaxed mb-4">
                Hash Time-Locked Contracts ensure atomic execution—either the
                entire swap completes or nothing happens. This eliminates
                partial transaction risks and counterparty trust requirements.
              </p>
              <ul className="space-y-2 text-sm text-gray-200">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#96DD2C] mt-0.5 shrink-0" />
                  <span>
                    Cryptographically secure: No third-party intermediaries
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#96DD2C] mt-0.5 shrink-0" />
                  <span>
                    Time-locked: Automatic refunds if conditions aren&apos;t met
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#96DD2C] mt-0.5 shrink-0" />
                  <span>
                    Secure account model: Deposit and receive directly
                  </span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-black/35 backdrop-blur-sm border border-[#A1A1A1] p-8 rounded-3xl"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-medium text-white mb-4 flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{
                    background: "linear-gradient(99.72deg, rgba(150, 221, 44, 0.2) -5.97%, rgba(230, 239, 99, 0.2) 110.07%)",
                    border: "1px solid rgba(150, 221, 44, 0.3)",
                  }}
                >
                  <Network className="w-5 h-5 text-[#96DD2C]" />
                </div>
                Technical Stack
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Solidity Smart Contracts",
                  "Avalanche C-Chain",
                  "EVM Compatible",
                  "HTLC Technology",
                  "Optimized Routing",
                  "Zero Approval System",
                ].map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-black/50 rounded-lg border border-[#A1A1A1]/50"
                  >
                    <div 
                      className="w-1.5 h-1.5 rounded-full"
                      style={{
                        background: "linear-gradient(99.72deg, #96DD2C -5.97%, #E6EF63 110.07%)",
                      }}
                    />
                    <span className="text-xs text-gray-200 font-medium">
                      {tech}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-200 mt-4 leading-relaxed">
                Our architecture uses HTLC technology with EVM compatibility,
                enabling seamless cross-chain transactions without unlimited
                approvals, reducing risk compared to traditional bridges.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 pt-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
              Business Model
            </h2>
            <p className="text-lg text-gray-200 font-light">
              Sustainable revenue streams for long-term growth
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: Coins,
                title: "Transaction Fees",
                desc: "Small, transparent fees (10 bips) per swap transaction. Competitive pricing drives volume while maintaining profitability.",
              },
              {
                icon: TrendingUp,
                title: "Enterprise Partnerships",
                desc: "White-label solutions for DeFi protocols, exchanges, and financial institutions seeking reliable cross-chain infrastructure.",
              },
              {
                icon: Network,
                title: "Protocol Integrations",
                desc: "Revenue sharing from partnerships with major DeFi protocols leveraging our bridge infrastructure for liquidity routing.",
              },
            ].map((model, index) => (
              <FeatureCard
                key={index}
                icon={model.icon}
                title={model.title}
                description={model.desc}
                delay={index * 0.1}
              />
            ))}
          </div>

          <motion.div
            className="mt-12 bg-black/35 border border-[#A1A1A1] rounded-3xl p-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-medium text-white mb-2">
                  Sustainable
                </div>
                <div className="text-sm text-gray-100">
                  Fee-based model ensures long-term viability
                </div>
              </div>
              <div>
                <div className="text-3xl font-medium text-white mb-2">
                  Scalable
                </div>
                <div className="text-sm text-gray-100">
                  Revenue grows with transaction volume
                </div>
              </div>
              <div>
                <div className="text-3xl font-medium text-white mb-2">
                  Transparent
                </div>
                <div className="text-sm text-gray-100">
                  Clear fee structure, no hidden costs
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 pt-32">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
              Use Cases
            </h2>
            <p className="text-lg text-gray-200 font-light">
              Unlock new possibilities with cross-chain swaps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: TrendingUp,
                title: "DeFi Trading",
                desc: "Quickly move assets across EVM chains for DeFi opportunities and yield farming",
              },
              {
                icon: Layers,
                title: "Portfolio Diversification",
                desc: "Seamlessly diversify across multiple chains without long waiting times",
              },
              {
                icon: Coins,
                title: "Fast Payments",
                desc: "Fast cross-chain payments with lightning-fast settlement and no unlimited approvals",
              },
            ].map((useCase, index) => (
              <FeatureCard
                key={index}
                icon={useCase.icon}
                title={useCase.title}
                description={useCase.desc}
                delay={index * 0.1}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-start">
            {/* Left side - FAQ */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                className="mb-10"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-gray-200 font-light">
                  Everything you need to know about Oryn Finance
                </p>
              </motion.div>

              <div className="space-y-5">
                {[
                  {
                    q: "How fast are swaps?",
                    a: "Swaps complete in approximately 30 seconds, compared to 5-30 minutes for traditional bridges.",
                  },
                  {
                    q: "Is my crypto safe?",
                    a: "Yes! Oryn uses HTLC atomic swaps for secure execution. You deposit to your account and receive swapped assets directly—no wallet connection needed.",
                  },
                  {
                    q: "What chains are supported?",
                    a: "We support Avalanche, Ethereum, Polygon, Arbitrum, and more EVM chains, with additional networks coming soon.",
                  },
                  {
                    q: "Do I need to connect my wallet or approve transactions?",
                    a: "No! Simply deposit your assets to your account. No wallet connection or transaction approvals required. We handle the swap and send directly to you.",
                  },
                  {
                    q: "What is HTLC?",
                    a: "Hash Time-Locked Contracts ensure atomicity—your swap either completes fully or doesn&apos;t happen at all, eliminating partial transaction risks.",
                  },
                  {
                    q: "Are there any fees?",
                    a: "Fees are minimal and transparent, covering only the necessary blockchain transaction costs.",
                  },
                ].map((faq, index) => (
                  <motion.div
                    key={index}
                    className="relative group"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                  >
                    <div className="relative pl-7 pb-5 border-b border-[#A1A1A1]/60 group-hover:border-[#96DD2C]/60 transition-colors">
                      <div 
                        className="absolute left-0 top-0.5 w-5 h-5 rounded-full flex items-center justify-center"
                        style={{
                          background: "linear-gradient(99.72deg, rgba(150, 221, 44, 0.2) -5.97%, rgba(230, 239, 99, 0.2) 110.07%)",
                          border: "1px solid rgba(150, 221, 44, 0.3)",
                        }}
                      >
                        <CheckCircle2 className="w-3 h-3 text-[#96DD2C]" />
                      </div>
                      <h3 className="text-base font-medium text-white mb-1.5">
                        {faq.q}
                      </h3>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right side - Illustration */}
            <motion.div
              className="relative h-full min-h-[600px] hidden lg:flex items-center justify-center"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <div className="relative w-full h-full">
                {/* Animated bridge illustration */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <motion.div
                    className="relative"
                    animate={{
                      scale: [1, 1.05, 1],
                      rotate: [0, 2, -2, 0],
                    }}
                    transition={{
                      duration: 6,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  >
                    {/* Bridge structure */}
                    <div className="relative">
                      {/* Left chain */}
                      <motion.div
                        className="absolute -left-32 top-1/2 -translate-y-1/2"
                        animate={{
                          y: [0, -10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                        }}
                      >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center border-4 border-orange-300/30 shadow-2xl shadow-orange-500/30">
                          <Network className="w-12 h-12 text-white" />
                        </div>
                        <motion.div
                          className="absolute -bottom-4 text-nowrap left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Cross-Chain
                        </motion.div>
                      </motion.div>

                      {/* Right chain */}
                      <motion.div
                        className="absolute -right-32 top-1/2 -translate-y-1/2"
                        animate={{
                          y: [0, 10, 0],
                        }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "easeInOut",
                          delay: 0.5,
                        }}
                      >
                        <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center border-4 border-purple-300/30 shadow-2xl shadow-purple-500/30">
                          <Network className="w-12 h-12 text-white" />
                        </div>
                        <motion.div
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400 text-nowrap"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: 0.5,
                          }}
                        >
                          EVM Chains
                        </motion.div>
                      </motion.div>

                      {/* Bridge connection */}
                      <svg
                        className="w-64 h-32"
                        viewBox="0 0 256 128"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <motion.path
                          d="M32 64 Q128 32 224 64"
                          stroke="url(#gradient)"
                          strokeWidth="3"
                          fill="none"
                          strokeLinecap="round"
                          initial={{ pathLength: 0, opacity: 0 }}
                          whileInView={{ pathLength: 1, opacity: 0.6 }}
                          viewport={{ once: true }}
                          transition={{ duration: 2, delay: 0.5 }}
                        />
                        <defs>
                          <linearGradient
                            id="gradient"
                            x1="0%"
                            y1="0%"
                            x2="100%"
                            y2="0%"
                          >
                            <stop
                              offset="0%"
                              stopColor="#9333ea"
                              stopOpacity="1"
                            />
                            <stop
                              offset="100%"
                              stopColor="#3b82f6"
                              stopOpacity="1"
                            />
                          </linearGradient>
                        </defs>
                      </svg>

                      {/* Animated particles flowing */}
                      {Array.from({ length: 4 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full bg-purple-400"
                          style={{
                            left: `${-8 + i * 24}%`,
                            top: "50%",
                          }}
                          animate={{
                            x: [0, 64, 128],
                            y: [0, Math.sin(i) * 20, Math.sin(i * 2) * 15],
                            opacity: [0, 1, 0],
                            scale: [0, 1, 0],
                          }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            delay: i * 0.3,
                            ease: "easeInOut",
                          }}
                        />
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Glow effects */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-purple-600/0 via-purple-600/10 to-blue-600/0 blur-3xl"
                  animate={{
                    opacity: [0.3, 0.6, 0.3],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 pt-32">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative overflow-hidden rounded-3xl p-10 text-center border border-[#A1A1A1]"
            style={{
              background: "linear-gradient(99.72deg, rgba(150, 221, 44, 0.2) -5.97%, rgba(230, 239, 99, 0.2) 110.07%)",
            }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative z-10">
              <motion.h2 className="text-3xl sm:text-4xl font-light text-white mb-4 tracking-tight">
                Ready to Bridge Assets{" "}
                <span className="font-medium">Without Trust?</span>
              </motion.h2>
              <p className="text-base text-gray-200 mb-8 font-light">
                Join thousands of users swapping assets in 30 seconds
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/swap">
                  <motion.button
                    className="px-8 py-3 text-black text-base font-semibold rounded-lg cursor-pointer"
                    style={{
                      background: "linear-gradient(to right, #96DD2C, #E6EF63)",
                      boxShadow: "0 0 40px rgba(201, 255, 128, 0.45)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "linear-gradient(to right, #E6EF63, #96DD2C)";
                      e.currentTarget.style.boxShadow = "0 0 55px rgba(201, 255, 128, 0.65)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "linear-gradient(to right, #96DD2C, #E6EF63)";
                      e.currentTarget.style.boxShadow = "0 0 40px rgba(201, 255, 128, 0.45)";
                    }}
                    whileHover={{ scale: 1.02, boxShadow: "0 0 55px rgba(201, 255, 128, 0.65)" }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Launch Bridge App
                  </motion.button>
                </Link>
                <motion.button
                  className="px-8 py-3 bg-black/35 text-white text-base font-medium rounded-lg border border-[#A1A1A1] hover:border-[#96DD2C]/60 hover:bg-black/50 transition-colors cursor-pointer"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Read Documentation
                </motion.button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative bg-black/35 backdrop-blur-sm border-t border-[#A1A1A1] py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <motion.div
                className="flex items-center gap-2 mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <Image
                  src="/Oryn.svg"
                  alt="Oryn Logo"
                  width={36}
                  height={36}
                  className="w-9 h-9"
                />
                <Image
                  src="/OrynTypo.svg"
                  alt="Oryn"
                  width={100}
                  height={36}
                  className="h-7 w-auto"
                />
              </motion.div>
              <p className="text-sm text-gray-300 leading-relaxed">
                Move assets without unlimited approvals. Fast, secure,
                non-custodial cross-chain swaps.
              </p>
            </div>
            {["Product", "Resources", "Community"].map((category, index) => (
              <div key={index}>
                <h4 className="text-sm font-medium text-white mb-3">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {["Docs", "Security", "Blog"]
                    .slice(0, 3)
                    .map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <motion.a
                          href="#"
                          className="text-sm text-gray-300 hover:text-[#96DD2C] transition-colors"
                          whileHover={{ x: 3 }}
                        >
                          {link}
                        </motion.a>
                      </li>
                    ))}
                </ul>
              </div>
            ))}
          </div>
          <motion.div
            className="border-t border-[#A1A1A1]/50 pt-6 text-center text-sm text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p>&copy; 2025 Oryn Finance. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}