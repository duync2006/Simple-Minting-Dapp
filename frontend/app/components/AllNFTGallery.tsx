'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { OpenInWindow } from 'iconoir-react';

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

export default function AllNFTGallery() {
  const [nfts, setNfts] = useState<NFTMetadata[]>([]);
  const [transactions, setTransactions] = useState<Record<number, Transaction>>({});
  const [hoveredTx, setHoveredTx] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  useEffect(() => {
    fetchNFTs();
    
    // Refresh every 30 seconds
    const interval = setInterval(() => {
      setPage(1); // Reset to first page
      fetchNFTs();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchNFTs = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Get all NFTs without owner filter
      const response = await axios.get(`${apiUrl}/metadata`, {
        params: {
          page,
          limit: 12
        }
      });
      
      if (response.data && response.data.status === 'success') {
        const newNfts = page === 1 ? response.data.data : [...nfts, ...response.data.data];
        setNfts(newNfts);
        
        // Check if there are more NFTs to load
        setHasMore(response.data.pagination?.page < response.data.pagination?.pages);
        
        // Fetch transaction data for each NFT
        const txData: Record<number, Transaction> = {...transactions};
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

  const loadMore = () => {
    setPage(prevPage => prevPage + 1);
    fetchNFTs();
  };

  const formatAddress = (address: string) => {
    return `${address.substring(0, 6)}...${address.substring(address.length - 4)}`;
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  // Handle mouse down event to start dragging
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollContainerRef.current) return;
    
    setIsDragging(true);
    setStartX(e.pageX - scrollContainerRef.current.offsetLeft);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  // Handle mouse move event to scroll while dragging
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !scrollContainerRef.current) return;
    
    e.preventDefault();
    const x = e.pageX - scrollContainerRef.current.offsetLeft;
    const walk = (x - startX) * 2; // Scroll speed multiplier
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  // Handle mouse up and mouse leave events to stop dragging
  const handleDragEnd = () => {
    setIsDragging(false);
  };

  if (isLoading && nfts.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="animate-spin h-10 w-10 text-indigo-500 mx-auto mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="text-gray-600">Loading NFTs collection...</p>
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
        <p className="text-gray-600">No NFTs have been minted yet</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <h2 className="text-xl font-bold text-gray-800 mb-4">All Minted NFTs</h2>
      
      {/* Horizontal scroll section */}
      <div className="relative">
        {/* Main horizontal scrollable container */}
        <div 
          ref={scrollContainerRef}
          className={`overflow-x-auto pb-6 hide-scrollbar ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleDragEnd}
          onMouseLeave={handleDragEnd}
        >
          <div className="flex gap-4 min-w-full">
            {nfts.map((nft) => (
              <div 
                key={nft.tokenId} 
                className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow flex-shrink-0"
                style={{ width: '320px' }} // Fixed width for consistent card size
              >
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
                  
                  {/* Owner information */}
                  <div className="mb-3">
                    <span className="text-sm font-medium text-gray-700">Owner: </span>
                    <span className="text-sm text-gray-600">{formatAddress(nft.owner)}</span>
                  </div>
                  
                  {/* Transaction Hash Information */}
                  {transactions[nft.tokenId] && (
                    <div className="mt-2 relative">
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Transaction:</h4>
                      <div className="relative flex items-center gap-2">
                        <button
                          className="p-1 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-100 transition-colors"
                          onClick={() => setHoveredTx(hoveredTx === transactions[nft.tokenId].hash ? null : transactions[nft.tokenId].hash)}
                          aria-label="View transaction details"
                        >
                          <OpenInWindow className="h-4 w-4" />
                        </button>
                        
                        <span 
                          className="text-blue-500 hover:text-blue-700 text-xs cursor-pointer underline truncate"
                          onClick={() => setHoveredTx(hoveredTx === transactions[nft.tokenId].hash ? null : transactions[nft.tokenId].hash)}
                          title={transactions[nft.tokenId].hash}
                        >
                          {(transactions[nft.tokenId].hash)}
                        </span>
                        
                        {/* Transaction Details Modal */}
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
                        {nft.attributes.slice(0, 3).map((attr, index) => (
                          <span 
                            key={index} 
                            className="bg-gray-100 text-gray-800 text-xs px-2 py-1 rounded"
                          >
                            {attr.trait_type}: {attr.value}
                          </span>
                        ))}
                        {nft.attributes.length > 3 && (
                          <span className="text-xs text-gray-500">+{nft.attributes.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Scroll indicators */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-r from-white via-white to-transparent w-16 h-full"></div>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2">
          <div className="bg-gradient-to-l from-white via-white to-transparent w-16 h-full"></div>
        </div>
      </div>

      {/* Update helper text to indicate dragging */}
      <div className="text-center text-gray-500 text-sm mt-2">
        <span>Click and drag to scroll horizontally ↔️</span>
      </div>
      
      {hasMore && (
        <div className="mt-6 text-center">
          <button
            onClick={loadMore}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-white font-medium transition-colors ${
              isLoading ? 'bg-gray-400' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {isLoading ? 'Loading...' : 'Load More'}
          </button>
        </div>
      )}
    </div>
  );
} 