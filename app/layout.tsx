import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../components/providers/WalletProvider";

const geistSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title:
    "AVAX Bridge - Move Bitcoin Without Trust | 30-Second Cross-Chain Swaps",
  description:
    "Swap assets between Bitcoin and any EVM chain in 30 seconds. Trustless, secure, and non-custodial cross-chain bridge powered by HTLC atomic swaps. Zero approvals required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} antialiased`}>
        <WalletProvider>{children}</WalletProvider>
      </body>
    </html>
  );
}
