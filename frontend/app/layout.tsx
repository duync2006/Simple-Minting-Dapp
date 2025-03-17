import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { WagmiProvider } from './providers/WagmiProvider';
import { ToastProvider } from './providers/ToastProvider';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NFT Minting dApp",
  description: "A simple dApp that allows users to mint NFTs with metadata",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <WagmiProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </WagmiProvider>
      </body>
    </html>
  );
}
