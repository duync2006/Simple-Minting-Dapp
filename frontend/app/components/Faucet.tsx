'use client';

import { useState } from 'react';
import { useWriteContract } from 'wagmi';
import { toast } from 'react-toastify';
import axios from 'axios';
import { waitForTransactionReceipt } from 'wagmi/actions';
import { config } from '../providers/WagmiProvider';

interface FaucetProps {
  address?: `0x${string}`;
  isConnected: boolean;
}

export default function Faucet({ address, isConnected }: FaucetProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
  
  const { writeContractAsync } = useWriteContract();
  
  const handleFaucetRequest = async () => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }
    
    setIsLoading(true);
    setSuccess(false);
    
    try {
      // Call the faucet API endpoint from backend
      toast.info('Faucet request sent! Waiting for confirmation...');
      const response = await axios.post(`${apiUrl}/faucet`, {
        address: address
      });
      
      if (response.data.status !== 'success') {
        throw new Error(response.data.message || 'Failed to request from faucet');
      }

      setSuccess(true);
    } catch (error) {
      console.error('Error requesting from faucet:', error);
      toast.error('Failed to request from faucet. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Please connect your wallet to use the faucet</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-xl shadow-lg p-8 text-center">
      <img 
        src="/ethereum-eth-logo.svg" 
        alt="ETH" 
        className="w-24 h-24 mx-auto mb-6"
        onError={(e) => {
          (e.target as HTMLImageElement).src = 'https://img.icons8.com/fluency/96/ethereum.png';
        }}
      />
      
      <h2 className="text-2xl font-bold text-gray-800 mb-3">Test ETH Faucet</h2>
      
      <p className="text-gray-600 max-w-md mx-auto mb-8">
        Need test ETH for development? Request some from our faucet to use with your connected wallet on our test network.
      </p>
      
      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-6">
          <p className="font-medium">Success! Test ETH has been sent to your wallet.</p>
        </div>
      )}
      
      <button
        onClick={handleFaucetRequest}
        disabled={isLoading}
        className={`inline-flex items-center justify-center py-3 px-8 rounded-lg text-white font-semibold text-base transition-all ${
          isLoading
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md hover:shadow-lg'
        }`}
      >
        {isLoading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processing...
          </>
        ) : (
          'Request Test ETH'
        )}
      </button>
      
      <div className="mt-8 border-t border-gray-200 pt-6 text-left">
        <h3 className="font-semibold text-gray-700 mb-2">How it works:</h3>
        <ol className="list-decimal pl-5 space-y-2 text-gray-600">
          <li>Click the "Request Test ETH" button above</li>
          <li>Confirm the transaction in your wallet</li>
          <li>Wait for the transaction to be confirmed on the blockchain</li>
          <li>Test ETH will be sent to your connected wallet address</li>
        </ol>
        <p className="mt-4 text-sm text-gray-500">
          Note: You can request from the faucet once every 24 hours.
        </p>
      </div>
    </div>
  );
} 