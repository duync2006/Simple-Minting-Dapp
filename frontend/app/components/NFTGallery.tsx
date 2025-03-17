'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import { useReadContract } from 'wagmi';
import { SimpleNFTAbi } from '../abi/SimpleNFTAbi';
import { LockSquare, OpenInWindow } from 'iconoir-react'; 

interface NFTGalleryProps {
  address?: `0x${string}`;
}

interface NFTMetadata {
  tokenId: number;
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
  owner: string;
  createdAt: number;
}

interface Transaction {
  hash: string;
  type: string;
  tokenId: number;
  from: string;
  to: string;
  status: string;
  blockNumber: number;
  gasUsed: number;
  timestamp: string;
  contractAddress: string;
}

export default function NFTGallery({ address }: NFTGalleryProps) {
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [transactions, setTransactions] = useState<Record<number, Transaction>>({});
  const [hoveredTx, setHoveredTx] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;

  // Get balance of user
  const { data: balance } = useReadContract({
    address: contractAddress,
    abi: SimpleNFTAbi,
    functionName: 'balanceOf',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  useEffect(() => {
    const fetchNFTs = async () => {
      if (!address) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await axios.get(`${apiUrl}/metadata?owner=${address}`);
        if (response.data && response.data.status === 'success') {
          setNfts(response.data.data);
          
          // Fetch transaction data for each NFT
          const txData: Record<number, Transaction> = {};
          await Promise.all(response.data.data.map(async (nft: NFTMetadata) => {
            try {
              const txResponse = await axios.get(`${apiUrl}/transactions?tokenId=${nft.tokenId}`);
              if (txResponse.data && txResponse.data.status === 'success' && txResponse.data.data.length > 0) {
                txData[nft.tokenId] = txResponse.data.data[0]; // Assuming the first transaction is the mint
              }
            } catch (error) {
              console.error(`Error fetching transaction for token ${nft.tokenId}:`, error);
            }
          }));
          
          setTransactions(txData);
        } else {
          setError('Failed to fetch NFTs');
        }
      } catch (error) {
        console.error('Error fetching NFTs:', error);
        setError('Error fetching NFTs. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchNFTs();
  }, [address, apiUrl]);

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  // Format date from timestamp
  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  if (!address) {
    return (
      <div className="text-center py-8">
        <LockSquare color="#AAAAAA" strokeWidth={1} width="16em" height="16em" className="mx-auto mb-4" />
        <p className="text-gray-600">Please connect your wallet to view your NFTs</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">Loading your NFTs...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-600">You don't have any NFTs yet</p>
        <p className="text-gray-500 mt-2">Mint some NFTs to see them here!</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-4">
        <p className="text-gray-700">
          You own <span className="font-bold">{balance?.toString() || '0'}</span> NFTs
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {nfts.map((nft) => (
          <div key={nft.tokenId} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
            <div className="h-48 overflow-hidden">
              <img 
                src={nft.image} 
                alt={nft.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/Image-not-found.png';
                }}
              />
            </div>
            
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="text-lg font-semibold text-gray-800">{nft.name}</h3>
                <span className="bg-indigo-100 text-indigo-800 text-xs px-2 py-1 rounded-full">
                  #{nft.tokenId}
                </span>
              </div>
              
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{nft.description}</p>
              
              {/* Transaction Hash Information */}
              {transactions[nft.tokenId] && (
                <div className="mt-2 relative">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Transaction:</h4>
                  <div className="relative flex items-center gap-2">
                    {/* Info/View button */}
                    <OpenInWindow
                      className="p-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                      onClick={() => setHoveredTx(hoveredTx === transactions[nft.tokenId].hash ? null : transactions[nft.tokenId].hash)}
                      aria-label="View transaction details"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </OpenInWindow>
                    
                    {/* Transaction hash */}
                    <span 
                      className="text-blue-500 hover:text-blue-700 text-xs cursor-pointer underline"
                      onClick={() => setHoveredTx(hoveredTx === transactions[nft.tokenId].hash ? null : transactions[nft.tokenId].hash)}
                      title={transactions[nft.tokenId].hash}
                      style={{ wordBreak: 'break-all', display: 'inline-block' }}
                    >
                      {`${transactions[nft.tokenId].hash.substring(0, 30)}
                      ${transactions[nft.tokenId].hash.substring(30)}`}
                    </span>
                    
                    {/* Transaction Details Modal - Styled like WalletModal */}
                    {hoveredTx === transactions[nft.tokenId].hash && (
                      <div 
                        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
                        onClick={() => setHoveredTx(null)}
                      >
                        {/* Modal Container */}
                        <div 
                          className="w-full max-w-md bg-white rounded-xl shadow-2xl relative mx-4 animate-fade-in"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Close button */}
                          <button 
                            onClick={() => setHoveredTx(null)}
                            className="absolute top-4 right-4 p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                            aria-label="Close"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                          
                          {/* Modal Header */}
                          <div className="pt-8 px-6 pb-4 border-b border-gray-200">
                            <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
                          </div>
                          
                          {/* Transaction Content */}
                          <div className="px-6 py-4">
                            <div className="space-y-4">
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Status:</span>
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full inline-block">
                                  {transactions[nft.tokenId].status} (1 Block Confirmation)
                                </span>
                              </div>
                              
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Transaction Hash:</span>
                                <div className="text-blue-500 break-all text-sm">{transactions[nft.tokenId].hash}</div>
                              </div>
                              
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Transaction Action:</span>
                                <div className="text-gray-700">Transfer NFT <span className="font-bold">#{nft.tokenId}</span> To {formatAddress(transactions[nft.tokenId].to)}</div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="font-semibold text-gray-700 block mb-1">From:</span>
                                  <div className="text-gray-600">{formatAddress(transactions[nft.tokenId].from)}</div>
                                </div>
                                
                                <div>
                                  <span className="font-semibold text-gray-700 block mb-1">To:</span>
                                  <div className="text-gray-600">{formatAddress(transactions[nft.tokenId].to)}</div>
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <span className="font-semibold text-gray-700 block mb-1">Block Number:</span>
                                  <div className="text-gray-600">{transactions[nft.tokenId].blockNumber}</div>
                                </div>
                              </div>
                              
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Gas Info:</span>
                                <div className="text-gray-600">{(Number(transactions[nft.tokenId].gasUsed) / 1e9).toFixed(9)} GWEI</div>
                              </div>
                              
                              <div>
                                <span className="font-semibold text-gray-700 block mb-1">Timestamp:</span>
                                <div className="text-gray-600">{formatDate(transactions[nft.tokenId].timestamp)}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {nft.attributes && nft.attributes.length > 0 && (
                <div className="mt-2">
                  <h4 className="text-sm font-medium text-gray-700 mb-1">Attributes:</h4>
                  <div className="flex flex-wrap gap-1">
                    {nft.attributes.map((attr, index) => (
                      <span 
                        key={index} 
                        className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                      >
                        {attr.trait_type}: {attr.value}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}