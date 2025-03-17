'use client';

import { truncateAddress } from '../utils/helpers';
import { Button } from "@material-tailwind/react";
import { EthereumCircle } from 'iconoir-react';

interface HeaderProps {
  isConnected: boolean;
  address?: `0x${string}`;
  onConnect: () => void; 
  onDisconnect: () => void;
}

export default function Header({ isConnected, address, onConnect, onDisconnect }: HeaderProps) {
  return (
    <header className="bg-white/90 backdrop-blur-sm shadow-sm py-4 px-6 sticky top-0 z-40">
      <div className="container mx-auto flex justify-between items-center">
        {/* Logo and title on the left */}
        <div className="flex items-center">
          <h1 className="text-xl font-bold text-indigo-700">NFT Minting dApp</h1>
        </div>
        
        {/* Wallet connection on the right */}
        <div>
          {isConnected && address ? (
            <div className="flex items-center gap-3">
              <span className="bg-gray-100 text-gray-800 px-4 py-2 rounded-full text-sm border border-gray-200">
                {truncateAddress(address)}
              </span>
              <button
                onClick={onDisconnect}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm transition-all duration-200 hover:shadow-lg"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white px-5 py-2.5 rounded-lg font-medium shadow-md hover:shadow-lg transition-all duration-200"
            >
              <EthereumCircle 
                className="h-5 w-5" 
              />
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
} 