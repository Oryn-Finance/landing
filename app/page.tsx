"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { useInView } from "react-intersection-observer";
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
  Wallet,
  Coins,
  ShieldCheck,
  Activity,
  Globe2,
} from "lucide-react";
import Swap from "../components/Swap";

function FloatingParticles() {
  const [particleData, setParticleData] = useState<
    Array<{
      x: number;
      y: number;
      duration: number;
      targetX: number;
      targetY: number;
    }>
  >([]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const particles = Array.from({ length: 15 }).map(() => ({
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        duration: Math.random() * 10 + 10,
        targetX: Math.random() * window.innerWidth,
        targetY: Math.random() * window.innerHeight,
      }));
      setParticleData(particles);
    }
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particleData.map((particle, i) => (
        <motion.div
          key={i}
          className="absolute w-1.5 h-1.5 bg-purple-300 rounded-full opacity-20"
          initial={{
            x: particle.x,
            y: particle.y,
          }}
          animate={{
            y: particle.targetY,
            x: particle.targetX,
            opacity: [0.1, 0.3, 0.1],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function AnimatedGradientOrb() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        className="relative w-[600px] h-[600px]"
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 180, 360],
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
      >
        <motion.div
          className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-200/40 via-pink-200/40 to-blue-200/40 blur-3xl"
          animate={{
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-100/30 to-blue-100/30 blur-2xl" />
      </motion.div>
    </div>
  );
}

function AnimatedNetworkSphere() {
  const [nodeData, setNodeData] = useState<
    Array<{ y: number; duration: number }>
  >([]);

  useEffect(() => {
    const nodes = Array.from({ length: 50 }).map(() => ({
      y: (Math.random() - 0.5) * 100,
      duration: 2 + Math.random() * 2,
    }));
    setNodeData(nodes);
  }, []);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <motion.div
        className="relative w-[400px] h-[400px]"
        animate={{
          rotateY: [0, 360],
          rotateX: [0, 180],
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        style={{
          transformStyle: "preserve-3d",
        }}
      >
        {nodeData.map((node, i) => {
          const angle = (i / nodeData.length) * Math.PI * 2;
          const radius = 150;
          const x = Math.cos(angle) * radius;
          const z = Math.sin(angle) * radius;

          return (
            <motion.div
              key={i}
              className="absolute w-3 h-3 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
              initial={{ x: 0, y: 0, z: 0 }}
              animate={{
                x: x,
                y: node.y,
                z: z,
                scale: [1, 1.5, 1],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: node.duration,
                repeat: Infinity,
                delay: i * 0.1,
              }}
              style={{
                transform: `translate3d(${x}px, ${node.y}px, ${z}px)`,
              }}
            />
          );
        })}
        <motion.div
          className="absolute inset-0 rounded-full border border-purple-400/20"
          animate={{
            opacity: [0.2, 0.5, 0.2],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
          }}
        />
      </motion.div>
    </div>
  );
}

function ScrollIndicator() {
  return (
    <motion.div
      className="absolute bottom-10 left-1/2 transform -translate-x-1/2"
      animate={{
        y: [0, 10, 0],
      }}
      transition={{
        duration: 1.5,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      <div className="w-6 h-10 border-2 border-purple-300/50 rounded-full flex justify-center">
        <motion.div
          className="w-1 h-3 bg-purple-600/50 rounded-full mt-2"
          animate={{
            y: [0, 12, 0],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      </div>
    </motion.div>
  );
}

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
      className="relative group p-5 rounded-xl bg-white/70 backdrop-blur-sm border border-gray-100/60 hover:border-purple-200/80 hover:bg-white/90 transition-all"
    >
      <motion.div
        className="w-11 h-11 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center mb-4 border border-purple-100/50"
        whileHover={{ rotate: 360, scale: 1.05 }}
        transition={{ duration: 0.6 }}
      >
        <Icon className="w-5 h-5 text-purple-600" />
      </motion.div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
    </motion.div>
  );
}

function StatCard({
  value,
  label,
  delay = 0,
}: {
  value: string;
  label: string;
  delay?: number;
}) {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.2,
  });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.6, delay, type: "spring" }}
      className="text-center"
    >
      <motion.div
        className="text-5xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2"
        animate={inView ? { scale: [1, 1.1, 1] } : {}}
        transition={{ duration: 0.6, delay }}
      >
        {value}
      </motion.div>
      <div className="text-gray-600 font-medium">{label}</div>
      <motion.div
        className="w-16 h-0.5 bg-gradient-to-r from-purple-600 to-blue-600 mx-auto mt-4"
        initial={{ width: 0 }}
        animate={inView ? { width: 64 } : {}}
        transition={{ duration: 0.8, delay: delay + 0.2 }}
      />
    </motion.div>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 text-gray-900 overflow-hidden">
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/80 via-pink-50/80 to-blue-50/80" />
        <AnimatedGradientOrb />
        <FloatingParticles />
      </div>

      {/* Navigation */}
      <motion.nav
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 w-full z-50 bg-white/70 backdrop-blur-xl border-b border-purple-100/50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <motion.div
              className="flex items-center gap-2 text-2xl font-bold"
              whileHover={{ scale: 1.05 }}
            >
              <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                <Bitcoin className="w-6 h-6 text-white" />
              </div>
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AVAX Bridge
              </span>
            </motion.div>
            <div className="flex gap-4 items-center">
              <motion.button
                className="px-4 py-2 text-gray-700 hover:text-purple-600 transition-colors font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Source Code
              </motion.button>
              <motion.button
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold shadow-lg"
                whileHover={{
                  scale: 1.05,
                  boxShadow: "0 0 25px rgba(147, 51, 234, 0.4)",
                }}
                whileTap={{ scale: 0.95 }}
              >
                Launch App
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 pt-24 pb-16">
        <div className="max-w-7xl mx-auto z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
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
                className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-50/80 backdrop-blur-sm border border-purple-200/60 rounded-full text-purple-700 text-xs font-medium tracking-wide"
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
                <span className="block text-gray-800 font-light mb-2">
                  Move Bitcoin
                </span>
                <span className="block font-medium bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent">
                  Without Trust
                </span>
              </motion.h1>

              <motion.p
                className="text-xl sm:text-2xl text-gray-600 font-light leading-relaxed"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                Where Bitcoin moves at{" "}
                <span className="font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  Avalanche speed
                </span>
              </motion.p>

              <motion.p
                className="text-base text-gray-500 leading-relaxed max-w-lg"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.5 }}
              >
                Swap assets between Bitcoin and any EVM chain securely in 30
                seconds. Trustless, non-custodial, powered by HTLC atomic swaps.
              </motion.p>

              <motion.div
                className="flex flex-col sm:flex-row gap-3 pt-4"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
              >
                <motion.button
                  className="group relative px-8 py-3.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-base font-medium rounded-lg flex items-center justify-center gap-2 overflow-hidden"
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
                <motion.button
                  className="px-8 py-3.5 bg-white/60 backdrop-blur-sm border border-purple-200/60 text-gray-700 text-base font-medium rounded-lg hover:border-purple-300/80 hover:bg-white/80 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Learn More
                </motion.button>
              </motion.div>
            </motion.div>

            {/* Right Column - Swap Component */}
            <motion.div
              className="relative w-full max-w-md"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {/* Decorative gradient circles */}
              <motion.div
                className="absolute -top-20 -right-20 w-72 h-72 bg-purple-200/30 rounded-full blur-3xl pointer-events-none"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.4, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute -bottom-20 -left-20 w-72 h-72 bg-blue-200/30 rounded-full blur-3xl pointer-events-none"
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.4, 0.3],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.5,
                }}
              />
              <Swap />
            </motion.div>
          </div>
        </div>
        <ScrollIndicator />
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
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
              Why Choose{" "}
              <span className="font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                AVAX Bridge?
              </span>
            </h2>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto font-light">
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
              description="Zero approvals needed. Simple, intuitive interface for seamless cross-chain transactions."
              delay={0.3}
            />
          </div>
        </div>
      </section>

      {/* Key Features */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
              Key Features
            </h2>
            <p className="text-lg text-gray-500 font-light">
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
                title: "Zero Approvals",
                desc: "Streamlined UX—no endless approval requests",
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
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
              How It Works
            </h2>
            <p className="text-lg text-gray-500 font-light">
              Three simple steps to cross-chain freedom
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                step: "1",
                icon: Wallet,
                title: "Connect Wallet",
                desc: "Connect your Bitcoin and EVM wallets in seconds",
              },
              {
                step: "2",
                icon: Coins,
                title: "Select Assets",
                desc: "Choose your source and destination chains and assets",
              },
              {
                step: "3",
                icon: Zap,
                title: "Swap Instantly",
                desc: "Complete your swap in 30 seconds—no waiting, no trust needed",
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
                <div className="bg-white/70 backdrop-blur-sm border border-gray-100/60 p-6 rounded-xl text-center relative h-full hover:border-purple-200/80 hover:bg-white/90 transition-all">
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
                      <step.icon className="w-8 h-8 text-purple-600" />
                    </div>
                  </motion.div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
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
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
              Supported Chains & Assets
            </h2>
            <p className="text-lg text-gray-500 font-light">
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
              <h3 className="text-xl font-medium text-gray-900 mb-6 text-center">
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
                    <div className="relative px-6 py-3 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-100/60 hover:border-purple-200/80 hover:bg-white/90 transition-all">
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
                        <span className="text-base font-medium text-gray-800">
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
              <h3 className="text-xl font-medium text-gray-900 mb-6 text-center">
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
                    <div className="relative w-16 h-16 rounded-lg bg-white/70 backdrop-blur-sm border border-gray-100/60 hover:border-purple-200/80 hover:bg-white/90 transition-all flex items-center justify-center">
                      <span className="text-lg font-medium text-gray-900">
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
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
              Security & Trust
            </h2>
            <p className="text-lg text-gray-500 font-light">
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
                title: "Non-Custodial Design",
                desc: "Your funds never leave your wallet. No third-party custody, no counterparty risk.",
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

      {/* Performance Metrics */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
              Performance Metrics
            </h2>
            <p className="text-lg text-gray-500 font-light">
              Real numbers that matter
            </p>
          </motion.div>

          <div className="grid md:grid-cols-4 gap-5">
            {[
              { value: "30s", label: "Average Swap Time", icon: Clock },
              { value: "99.9%", label: "Success Rate", icon: CheckCircle2 },
              { value: "$0", label: "Custodial Risk", icon: Lock },
              { value: "1", label: "Click to Swap", icon: Rocket },
            ].map((metric, index) => (
              <motion.div
                key={index}
                className="relative group"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.6,
                  delay: index * 0.1,
                  type: "spring",
                }}
                whileHover={{ y: -10 }}
              >
                <div className="relative bg-white/70 backdrop-blur-sm border border-gray-100/60 p-6 rounded-xl text-center h-full hover:border-purple-200/80 hover:bg-white/90 transition-all">
                  <motion.div
                    className="flex justify-center mb-4"
                    whileHover={{ rotate: 360, scale: 1.05 }}
                    transition={{ duration: 0.6 }}
                  >
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-50 to-blue-50 rounded-lg flex items-center justify-center border border-purple-100/50">
                      <metric.icon className="w-6 h-6 text-purple-600" />
                    </div>
                  </motion.div>
                  <motion.div className="text-4xl font-medium bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-1.5">
                    {metric.value}
                  </motion.div>
                  <div className="text-sm text-gray-500 font-medium">
                    {metric.label}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Technology Highlights */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
              Technology Highlights
            </h2>
            <p className="text-lg text-gray-500 font-light">
              Cutting-edge tech stack powering the future of cross-chain swaps
            </p>
          </motion.div>

          <motion.div
            className="bg-white/70 backdrop-blur-sm border border-gray-100/60 p-6 rounded-xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="grid md:grid-cols-2 gap-4">
              {[
                "HTLC (Hash Time-Locked Contracts)",
                "Bitcoin Script Integration",
                "EVM Smart Contracts",
                "Zero-Knowledge Proofs",
                "Optimized Cross-Chain Communication",
                "Non-Custodial Architecture",
              ].map((tech, index) => (
                <motion.div
                  key={index}
                  className="flex items-center p-3 bg-white/50 rounded-lg border border-gray-100/50 hover:border-purple-200/80 hover:bg-white/80 transition-all"
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.01 }}
                >
                  <motion.div
                    className="w-1.5 h-1.5 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 mr-3"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: index * 0.2,
                    }}
                  />
                  <span className="text-sm text-gray-700 font-medium">
                    {tech}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
              Use Cases
            </h2>
            <p className="text-lg text-gray-500 font-light">
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

      {/* Comparison Table */}
      <section className="relative py-24 px-4 sm:px-6 lg:px-8 z-10 bg-white/30">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
              Why Choose AVAX Bridge?
            </h2>
            <p className="text-lg text-gray-500 font-light">
              See how we compare to traditional bridges
            </p>
          </motion.div>

          <motion.div
            className="bg-white/70 backdrop-blur-sm rounded-xl border border-gray-100/60 overflow-hidden"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gradient-to-r from-purple-600 to-blue-600">
                    <th className="px-5 py-3 text-left font-medium text-sm text-white">
                      Feature
                    </th>
                    <th className="px-5 py-3 text-center font-medium text-sm text-white">
                      Traditional Bridges
                    </th>
                    <th className="px-5 py-3 text-center font-medium text-sm text-white">
                      AVAX Bridge
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {[
                    {
                      feature: "Swap Time",
                      traditional: "5-30 minutes",
                      avax: "30 seconds",
                    },
                    {
                      feature: "Custodial Risk",
                      traditional: "Yes",
                      avax: "None",
                    },
                    {
                      feature: "Security Model",
                      traditional: "Multisig/Custody",
                      avax: "HTLC Atomic Swaps",
                    },
                    {
                      feature: "Approvals Needed",
                      traditional: "Multiple",
                      avax: "Zero",
                    },
                    {
                      feature: "Success Rate",
                      traditional: "~95%",
                      avax: "99.9%",
                    },
                    {
                      feature: "Decentralization",
                      traditional: "Centralized",
                      avax: "Fully Decentralized",
                    },
                  ].map((row, index) => (
                    <motion.tr
                      key={index}
                      className={
                        index % 2 === 0 ? "bg-white/40" : "bg-purple-50/20"
                      }
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      whileHover={{
                        backgroundColor: "rgba(147, 51, 234, 0.03)",
                      }}
                    >
                      <td className="px-5 py-3.5 font-medium text-sm text-gray-900">
                        {row.feature}
                      </td>
                      <td className="px-5 py-3.5 text-center text-sm text-gray-600">
                        {row.traditional}
                      </td>
                      <td className="px-5 py-3.5 text-center font-medium text-sm text-purple-600">
                        {row.avax}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
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
                <h2 className="text-4xl sm:text-5xl font-light mb-3 text-gray-900 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-lg text-gray-500 font-light">
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
                    a: "Yes! AVAX Bridge uses HTLC atomic swaps and is fully non-custodial. Your funds never leave your wallet.",
                  },
                  {
                    q: "What chains are supported?",
                    a: "We support Bitcoin, Avalanche, Ethereum, Polygon, and Arbitrum, with more chains coming soon.",
                  },
                  {
                    q: "Do I need multiple approvals?",
                    a: "No! AVAX Bridge requires zero approvals, making the user experience seamless and efficient.",
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
                      <h3 className="text-base font-medium text-gray-900 mb-1.5">
                        {faq.q}
                      </h3>
                      <p className="text-sm text-gray-500 leading-relaxed">
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
                          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-xs font-bold text-gray-400"
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
                      {Array.from({ length: 8 }).map((_, i) => (
                        <motion.div
                          key={i}
                          className="absolute w-2 h-2 rounded-full bg-purple-400"
                          style={{
                            left: `${32 + i * 24}%`,
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
                <motion.button
                  className="px-8 py-3 bg-white text-purple-600 text-base font-medium rounded-lg"
                  whileHover={{
                    scale: 1.02,
                    boxShadow: "0 4px 20px rgba(255, 255, 255, 0.3)",
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  Launch Bridge App
                </motion.button>
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
      <footer className="relative bg-white/50 backdrop-blur-sm border-t border-gray-200/50 py-12 px-4 sm:px-6 lg:px-8 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <motion.div
                className="flex items-center gap-2 text-xl font-medium mb-4"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-9 h-9 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <Bitcoin className="w-5 h-5 text-white" />
                </div>
                <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AVAX Bridge
                </span>
              </motion.div>
              <p className="text-sm text-gray-500 leading-relaxed">
                Move Bitcoin without trust. Fast, secure, non-custodial
                cross-chain swaps.
              </p>
            </div>
            {["Product", "Resources", "Community"].map((category, index) => (
              <div key={index}>
                <h4 className="text-sm font-medium text-gray-900 mb-3">
                  {category}
                </h4>
                <ul className="space-y-2">
                  {["Docs", "Security", "Blog"]
                    .slice(0, 3)
                    .map((link, linkIndex) => (
                      <li key={linkIndex}>
                        <motion.a
                          href="#"
                          className="text-sm text-gray-500 hover:text-purple-600 transition-colors"
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
            className="border-t border-gray-200/60 pt-6 text-center text-sm text-gray-500"
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
