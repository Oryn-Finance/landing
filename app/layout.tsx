import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WalletProvider } from "../components/providers/WalletProvider";

const geistSans = Inter({
  variable: "--font-inter-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Oryn - No Approval Cross-Chain Bridge | Secure Cross-Chain Swaps",
  description:
    "Bridge assets across chains in 30 seconds. No unlimited approvals, no trust required. Secure, non-custodial cross-chain bridge with minimal risk compared to traditional bridges.",
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
