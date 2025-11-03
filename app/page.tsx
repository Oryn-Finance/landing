"use client";

import { motion } from "framer-motion";
import { useInView } from "react-intersection-observer";
import Image from "next/image";
import Link from "next/link";
import {
  Zap,
  Shield,
  Clock,
  Lock,
  Rocket,
  ArrowRight,
  CheckCircle2,
  Bitcoin,
  TrendingUp,
  Layers,
  Sparkles,
  Network,
  Coins,
  ShieldCheck,
  Activity,
  Globe2,
} from "lucide-react";
import ColorBends from "@/components/ui/ColorBlends";

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
      className="relative group p-5 rounded-xl bg-white/10 backdrop-blur-sm border border-gray-700/60 hover:border-purple-200/80 hover:bg-white/20 transition-all"
    >
      <motion.div
        className="w-11 h-11 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center mb-4 border border-purple-100/50"
        whileHover={{ rotate: 360, scale: 1.05 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="w-5 h-5 text-[#7A38EB]" />
      </motion.div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-200 leading-relaxed">{description}</p>
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen relative bg-[#070011] text-white overflow-hidden">
      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 bg-[#070011]/70 backdrop-blur-xl border-b border-purple-100/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div className="flex items-center gap-2 cursor-pointer">
              <Image
                src="/Oryn.svg"
                alt="Oryn Logo"
                width={40}
                height={40}
                className="w-10 h-10"
              />
              <Image
                src="/OrynTypo.svg"
                alt="Oryn"
                width={120}
                height={40}
                className="h-8 w-auto"
              />
            </motion.div>
            <div className="flex gap-4 items-center">
              <motion.button
                className="px-4 py-2 text-white hover:text-purple-200 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Source Code
              </motion.button>
              <Link href="/swap">
                <motion.button
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg cursor-pointer"
                  whileHover={{
                    scale: 1.05,
                    boxShadow: "0 0 25px rgba(147, 51, 234, 0.4)",
                  }}
                  whileTap={{ scale: 0.95 }}
                >
                  Launch App
                </motion.button>
              </Link>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="h-screen overflow-hidden absolute w-screen opacity-50">
          {/* <LaserFlow
            falloffStart={2}
            horizontalBeamOffset={0.1}
            verticalBeamOffset={0.0}
            color="#7A38EB"
          /> */}
          <ColorBends
            colors={["#5C85FFFF", "#8a5cff", "#B700FFFF"]}
            rotation={10}
            speed={0.3}
            scale={1}
            frequency={1}
            warpStrength={1}
            mouseInfluence={0.4}
            parallax={0.6}
            noise={0.08}
            transparent
          />
        </div>
        <div className="max-w-7xl mx-auto z-10">
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
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-[#C1BFC4]/10 backdrop-blur-sm border border-[#7A38EB]/60 rounded-full text-white text-xs font-medium tracking-wide"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse" />
                Cross-Chain Bridge Protocol
              </motion.div>

              <motion.h1
                className="text-5xl sm:text-6xl lg:text-7xl font-light leading-[1.1] tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
              >
                <span className="block text-white mb-2">Move Bitcoin</span>
                <span className="block font-medium">Without Trust</span>
              </motion.h1>

              <motion.p
                className="text-xl sm:text-2xl text-gray-200 font-light leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Where Bitcoin moves at{" "}
                <span className="font-medium">Avalanche speed</span>
              </motion.p>

              <motion.p
                className="text-base text-gray-200 leading-relaxed max-w-2xl"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Deposit to your account—no wallet connection or approvals
                needed. Built for the future of DeFi—faster, safer, and more
                decentralized than traditional bridges.
              </motion.p>

              <motion.div
                className="flex items-center justify-center gap-3 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <Link href="/swap">
                  <motion.button
                    className="group relative px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-base font-medium rounded-lg flex items-center justify-center gap-2 overflow-hidden cursor-pointer"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="relative z-10 flex items-center gap-2">
                      Start Swapping
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </span>
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-700 to-blue-700"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  </motion.button>
                </Link>
                <motion.button
                  className="px-8 py-3.5 bg-white/80 backdrop-blur-sm border border-purple-200/60 text-gray-700 text-base font-medium rounded-lg hover:border-purple-300/80 hover:bg-white/80 transition-all cursor-pointer"
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

      {/* Value Proposition */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
              Why Choose <span className="font-medium">AVAX Bridge?</span>
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto font-light">
              The fastest, most secure way to bridge Bitcoin to any EVM chain
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            <FeatureCard
              icon={Zap}
              title="30-Second Swaps"
              description="Complete cross-chain swaps in just 30 seconds, compared to 5-30 minutes with traditional bridges."
              delay={0.1}
            />
            <FeatureCard
              icon={Shield}
              title="Trustless & Secure"
              description="Powered by HTLC atomic swaps. No custodial risks—your keys, your crypto."
              delay={0.2}
            />
            <FeatureCard
              icon={Rocket}
              title="One-Click Swaps"
              description="Deposit-based swaps with no wallet connection or approvals. Simple, fast, and secure."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
              Key Features
            </h2>
            <p className="text-lg text-gray-200 font-light">
              Everything you need for fast, secure cross-chain swaps
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "30-second swaps vs 5-30 minutes for traditional bridges",
              },
              {
                icon: ShieldCheck,
                title: "HTLC Atomic Swaps",
                desc: "Cryptographically secure, trustless transactions guaranteed",
              },
              {
                icon: Globe2,
                title: "Multi-Chain Support",
                desc: "Bridge between Bitcoin and any EVM-compatible chain",
              },
              {
                icon: Lock,
                title: "Non-Custodial",
                desc: "Self-custody design—you control your keys at all times",
              },
              {
                icon: Network,
                title: "Fully Decentralized",
                desc: "No intermediaries, no single point of failure",
              },
              {
                icon: Sparkles,
                title: "No Approvals Needed",
                desc: "Deposit-based model—no wallet approvals or connection requirements",
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

      {/* How It Works */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
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
                <div className="bg-white/10 backdrop-blur-sm border border-gray-700/60 p-6 rounded-xl text-center relative h-full hover:border-purple-200/80 hover:bg-white/20 transition-all">
                  <motion.div
                    className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-full flex items-center justify-center text-white font-medium text-sm shadow-md"
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
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border border-purple-100/50">
                      <step.icon className="w-8 h-8 text-[#7A38EB]" />
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
                    <div className="h-0.5 bg-gradient-to-r from-purple-600 to-blue-600" />
                    <motion.div
                      className="absolute right-0 top-1/2 transform -translate-y-1/2 translate-x-1/2"
                      animate={{ x: [0, 10, 0] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <ArrowRight className="w-5 h-5 text-purple-600" />
                    </motion.div>
                  </motion.div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Supported Chains & Assets */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
              Supported Chains & Assets
            </h2>
            <p className="text-lg text-gray-200 font-light">
              Bridge between the world&apos;s leading blockchain networks
            </p>
          </motion.div>

          <div className="space-y-12">
            {/* Chains */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-xl font-medium text-white mb-6 text-center">
                Supported Chains
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {[
                  "Bitcoin",
                  "Avalanche",
                  "Ethereum",
                  "Polygon",
                  "Arbitrum",
                ].map((chain, index) => (
                  <motion.div
                    key={chain}
                    className="group relative"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -8 }}
                  >
                    <div className="relative px-6 py-3 rounded-lg bg-white/10 backdrop-blur-sm border border-gray-700/60 hover:border-white-900/80 hover:bg-white/20 transition-all">
                      <div className="flex items-center gap-2.5">
                        <motion.div
                          className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500"
                          animate={{ scale: [1, 1.2, 1], opacity: [1, 0.8, 1] }}
                          transition={{
                            duration: 2,
                            repeat: Infinity,
                            delay: index * 0.2,
                          }}
                        />
                        <span className="text-base font-medium text-white">
                          {chain}
                        </span>
                      </div>
                    </div>
                    <motion.div
                      className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 to-blue-500/0 group-hover:from-purple-500/5 group-hover:to-blue-500/5 transition-all pointer-events-none"
                      initial={false}
                    />
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Assets */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <h3 className="text-xl font-medium text-white mb-6 text-center">
                Supported Assets
              </h3>
              <div className="flex flex-wrap justify-center gap-4">
                {["BTC", "USDC", "USDT", "AVAX", "ETH"].map((asset, index) => (
                  <motion.div
                    key={asset}
                    className="group relative"
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.1 }}
                    whileHover={{ y: -4, scale: 1.05 }}
                  >
                    <div className="relative w-28 h-12 rounded-lg bg-white/10 backdrop-blur-sm border border-gray-100/60 hover:border-white/80 hover:bg-white/20 transition-all flex items-center justify-center">
                      <span className="text-lg font-medium text-white">
                        {asset}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Security & Trust */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
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
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-white/5">
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
              className="bg-white/10 backdrop-blur-sm border border-gray-700/60 p-8 rounded-xl"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-medium text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border border-purple-100/50">
                  <Layers className="w-5 h-5 text-[#7A38EB]" />
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
                  <CheckCircle2 className="w-4 h-4 text-[#7A38EB] mt-0.5 shrink-0" />
                  <span>
                    Cryptographically secure: No third-party intermediaries
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7A38EB] mt-0.5 shrink-0" />
                  <span>
                    Time-locked: Automatic refunds if conditions aren&apos;t met
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#7A38EB] mt-0.5 shrink-0" />
                  <span>
                    Secure account model: Deposit and receive directly
                  </span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              className="bg-white/10 backdrop-blur-sm border border-gray-700/60 p-8 rounded-xl"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <h3 className="text-2xl font-medium text-white mb-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border border-purple-100/50">
                  <Network className="w-5 h-5 text-[#7A38EB]" />
                </div>
                Technical Stack
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  "Bitcoin Script",
                  "Solidity Smart Contracts",
                  "Avalanche C-Chain",
                  "UDP Protocol",
                  "HTLC Atomic Swaps",
                  "Optimized Routing",
                ].map((tech, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 bg-white/20 rounded-lg border border-gray-700/50"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500" />
                    <span className="text-xs text-gray-200 font-medium">
                      {tech}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-200 mt-4 leading-relaxed">
                Our architecture combines Bitcoin&apos;s security with EVM chain
                flexibility, enabling seamless cross-chain transactions without
                compromising on decentralization.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Business Model */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
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
            className="mt-12 bg-white/5 border border-purple-200/60 rounded-xl p-8"
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

      {/* Market Opportunity */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-white/5">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-white tracking-tight">
              Market Opportunity
            </h2>
            <p className="text-lg text-gray-200 font-light">
              The cross-chain bridge market is rapidly expanding
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6 mb-12">
            {[
              {
                value: "$50B+",
                label: "Total Value Locked (TVL) in Bridges",
                desc: "Growing market with increasing adoption",
              },
              {
                value: "500K+",
                label: "Daily Bridge Transactions",
                desc: "Massive user base seeking faster alternatives",
              },
              {
                value: "40%",
                label: "Annual Market Growth",
                desc: "Exponential growth in cross-chain activity",
              },
            ].map((metric, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-gray-700/60 p-6 rounded-xl text-center"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-4xl font-medium mb-2">{metric.value}</div>
                <div className="text-base font-medium text-white mb-1">
                  {metric.label}
                </div>
                <div className="text-sm text-gray-200">{metric.desc}</div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="bg-white/10 backdrop-blur-sm border border-gray-700/60 p-8 rounded-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h3 className="text-xl font-medium text-white mb-4">Why Now?</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                {
                  title: "Bitcoin Adoption Rising",
                  desc: "Institutional and retail Bitcoin adoption is at an all-time high. Users need efficient ways to move BTC to DeFi ecosystems.",
                },
                {
                  title: "DeFi on EVM Chains",
                  desc: "Ethereum, Avalanche, and other EVM chains host billions in DeFi TVL. Bridging Bitcoin enables new yield opportunities.",
                },
                {
                  title: "Security Concerns",
                  desc: "Multiple bridge hacks have highlighted the need for trustless, non-custodial solutions like HTLC atomic swaps.",
                },
                {
                  title: "Speed Matters",
                  desc: "Current bridges take 5-30 minutes. Our 30-second swaps address a critical pain point in the market.",
                },
              ].map((point, index) => (
                <div key={index} className="flex gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mt-2 shrink-0" />
                  <div>
                    <div className="font-medium text-white mb-1">
                      {point.title}
                    </div>
                    <div className="text-sm text-gray-300">{point.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
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
                desc: "Quickly move Bitcoin to EVM chains for DeFi opportunities and yield farming",
              },
              {
                icon: Layers,
                title: "Portfolio Diversification",
                desc: "Seamlessly diversify across multiple chains without long waiting times",
              },
              {
                icon: Coins,
                title: "Fast Payments",
                desc: "Use Bitcoin for payments on EVM chains with lightning-fast settlement",
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
                  Everything you need to know about AVAX Bridge
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
                    a: "We support Bitcoin, Avalanche, Ethereum, Polygon, and Arbitrum, with more chains coming soon.",
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
                    <div className="relative pl-7 pb-5 border-b border-gray-200/60 group-hover:border-purple-200 transition-colors">
                      <div className="absolute left-0 top-0.5 w-5 h-5 rounded-full bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center border border-purple-200/60">
                        <CheckCircle2 className="w-3 h-3 text-purple-600" />
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
                          <Bitcoin className="w-12 h-12 text-white" />
                        </div>
                        <motion.div
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400"
                          animate={{ opacity: [0.5, 1, 0.5] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          Bitcoin
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
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="relative overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 rounded-2xl p-10 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20"
              animate={{
                opacity: [0.4, 0.6, 0.4],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <div className="relative z-10">
              <motion.h2 className="text-3xl sm:text-4xl font-light text-white mb-4 tracking-tight">
                Ready to Bridge Bitcoin{" "}
                <span className="font-medium">Without Trust?</span>
              </motion.h2>
              <p className="text-base text-purple-100 mb-8 font-light">
                Join thousands of users swapping assets in 30 seconds
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/swap">
                  <motion.button
                    className="px-8 py-3 bg-white text-purple-600 text-base font-medium rounded-lg cursor-pointer"
                    whileHover={{
                      scale: 1.02,
                      boxShadow: "0 4px 20px rgba(255, 255, 255, 0.3)",
                    }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Launch Bridge App
                  </motion.button>
                </Link>
                <motion.button
                  className="px-8 py-3 bg-transparent text-white text-base font-medium rounded-lg border border-white/60 hover:bg-white/10 transition-colors"
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
      <footer className="relative bg-[#070011]/80 backdrop-blur-sm border-t border-gray-700/40 py-12 px-4 sm:px-6 lg:px-8 z-10">
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
                Move Bitcoin without trust. Fast, secure, non-custodial
                cross-chain swaps.
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
                          className="text-sm text-gray-300 hover:text-purple-400 transition-colors"
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
            className="border-t border-gray-700/50 pt-6 text-center text-sm text-gray-300"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p>&copy; 2024 AVAX Bridge. All rights reserved.</p>
          </motion.div>
        </div>
      </footer>
    </div>
  );
}
