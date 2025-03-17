'use client';

import { useState, useEffect } from 'react';
import { Connector } from 'wagmi';
import Image from 'next/image';
import { WagmiProvider } from 'wagmi';
import { config } from '../providers/WagmiProvider';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';


const queryClient = new QueryClient()

interface WalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  connectors: readonly Connector[];
  connectWallet: (connector: Connector) => void;
}

export default function WalletModal({ isOpen, onClose, connectors, connectWallet }: WalletModalProps) {
  if (!isOpen) return null;
  
  // Helper function to get the appropriate icon for each wallet
  const getWalletIcon = (connector: Connector) => {
    // If connector already has an icon, use it
    if (connector.icon) {
      return connector.icon;
    }
    console.log(connector.id.toLowerCase());
    // Custom icons for specific wallets
    switch(connector.id.toLowerCase()) {
      case 'injected':
        return '/wallets/A_black_image.jpg';
      case 'metamasksdk':
        return '/wallets/MetaMask_Fox.svg.png';
      case 'safe':
        return '/wallets/safe-logo-green.png';
      case 'gnosis':
        return 'https://cryptologos.cc/logos/gnosis-gno-logo.png';
      case 'okxwallet':
        return 'https://pbs.twimg.com/profile_images/1493863686989336584/QgK02fFd_400x400.jpg';
      case 'backpack':
        return 'https://avatars.githubusercontent.com/u/113416283';
      default:
        return '/wallet-icon-default.png'; // Fallback icon
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      {/* Modal Container */}
      <div className="w-full max-w-md bg-white rounded-xl shadow-2xl relative mx-4 animate-fade-in">
        {/* Close button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          aria-label="Close"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        
        {/* Modal Header */}
        <div className="pt-8 px-6 pb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900">Connect Wallet</h2>
          <p className="mt-2 text-sm text-gray-500">Choose your preferred wallet to connect to our dApp</p>
        </div>
        
        {/* Wallet Options */}
        <div className="px-6 pb-6">
          <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
              <div className="space-y-3">
                {connectors.map((connector, index) => (
                  <button
                    key={connector.id}
                    onClick={() => connectWallet(connector)}
                    className="w-full p-4 flex items-center justify-between bg-white hover:bg-gray-50 border border-gray-200 rounded-lg transition-colors"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="flex items-center">
                      <img 
                        src={getWalletIcon(connector)} 
                        width={36}
                        height={36}
                        alt={`${connector.name} icon`}
                        className="object-contain h-9 w-9 mr-4 rounded-full"
                      />
                      <span className="font-semibold text-base text-gray-800">{connector.name}</span>
                    </div>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                    </svg>
                  </button>
                ))}
              </div>
            </QueryClientProvider>
          </WagmiProvider>
        </div>
        
        {/* Footer */}
        <div className="px-6 pb-6 text-center text-xs text-gray-500">
          <p>By connecting your wallet, you agree to our <a href="#" className="text-indigo-600 hover:text-indigo-800">Terms of Service</a> and <a href="#" className="text-indigo-600 hover:text-indigo-800">Privacy Policy</a>.</p>
        </div>
      </div>
    </div>
  );
}