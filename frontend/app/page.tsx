'use client';

import { useState, useEffect } from 'react';
import { useAccount, useConnect, useDisconnect, useWriteContract, useReadContract } from 'wagmi';
import { toast } from 'react-toastify';
import { parseEther } from 'viem';
import axios from 'axios';
import Header from './components/Header';
import MintForm from './components/MintForm';
import NFTGallery from './components/NFTGallery';
import Faucet from './components/Faucet';
import MintingStatus from './components/MintingStatus';
import WalletModal from './components/WalletModal';
import { SimpleNFTAbi } from './abi/SimpleNFTAbi';
import { Account } from './components/Account'
import { WalletOptions } from './components/WalletOptions'
import { switchChain } from 'wagmi/actions'
import { config } from './providers/WagmiProvider'
import { waitForTransactionReceipt } from 'wagmi/actions'
import TransactionHistory from './components/TransactionHistory';
import AllNFTGallery from './components/AllNFTGallery';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'mint' | 'gallery' | 'faucet' | 'all'>('mint');
  const [mintingStats, setMintingStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);

  const { address, isConnected } = useAccount();

  const { connect, connectors, isPending } = useConnect({
    mutation: {
      onSuccess(data) {
        const addr = data.accounts[0];
        toast.success(`Connected to ${addr.slice(0, 6)}...${addr.slice(-4)}`);
        setIsWalletModalOpen(false);
      },
      onError(error) {
        toast.error(error.message || 'Failed to connect wallet');
      }
    }
  });
  const { disconnect } = useDisconnect({
    mutation: {
      onSuccess() {
        toast.info('Wallet disconnected');
      }
    }
  });
  
  const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS as `0x${string}`;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

  const { writeContractAsync } = useWriteContract();
  
  const { data: maxMintsPerAddress } = useReadContract({
    address: contractAddress,
    abi: SimpleNFTAbi,
    functionName: 'maxMintsPerAddress',
  });

  const { data: userMintCount } = useReadContract({
    address: contractAddress,
    abi: SimpleNFTAbi,
    functionName: 'mintCount',
    args: [address],
    query: {
      enabled: !!address,
    },
  });

  // Fetch minting stats from the backend
  useEffect(() => {
    const fetchMintingStats = async () => {
      try {
        const response = await axios.get(`${apiUrl}/minting-status`);
        if (response.data && response.data.status === 'success') {
          setMintingStats(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching minting stats:', error);
      }
    };

    fetchMintingStats();
    // Refresh stats every 30 seconds
    const interval = setInterval(fetchMintingStats, 30000);
    return () => clearInterval(interval);
  }, [apiUrl]);

  const handleConnectClick = () => {
    setIsWalletModalOpen(true);
  };

  const handleConnect = async (connector: any) => {
    try {
      connect({ connector });
      // After successful connection, switch to Hardhat Local chain (31337)
      if (connector.connected) {
        try {
          // Try to switch to Hardhat Local chain
          await switchChain(config, { chainId: 31337 });
        } catch (switchError: any) {
          // If the chain doesn't exist in the wallet, add it
          if (switchError.code === 4902 || switchError.message?.includes('Unrecognized chain')) {
            try {
              await switchChain(config, {
                chainId: 31337,
                addEthereumChainParameter: {
                  chainName: 'Hardhat Local',
                  nativeCurrency: {
                    name: 'Localhost',
                    symbol: 'LOCAL',
                    decimals: 18,
                  },
                  rpcUrls: ['http://127.0.0.1:8545'],
                  blockExplorerUrls: [],
                }
              });
              toast.success('Switched to Hardhat Local network');
            } catch (addError) {
              console.error('Error adding Hardhat chain to wallet:', addError);
              toast.error('Failed to add Hardhat network to your wallet');
            }
          } else {
            console.error('Error switching chain:', switchError);
            toast.error('Failed to switch to Hardhat network');
          }
        }
      }
    } catch (error) {
      console.error('Error connecting wallet:', error);
      toast.error('Failed to connect wallet. Please try again.');
    }
  };

  const handleDisconnect = () => {
    disconnect();
    
  };

  const handleMint = async (metadata: any): Promise<void> => {
    if (!address || !isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    try {

      // const tokenURI = `${apiUrl}/metadata/${metadataResponse.data.data.tokenId}`;
      // get total supply from minting stats
      const tokenURI = `${apiUrl}/metadata/${ mintingStats ? mintingStats.totalSupply + 1 : 1}`;

      // 2. Call the mint function on the smart contract
      const tx = await writeContractAsync({
        address: contractAddress,
        abi: SimpleNFTAbi,
        functionName: 'mint',
        args: [address, tokenURI],
        chainId: 31337
      });
      
      // Wait for transaction to be confirmed
      const receipt = await waitForTransactionReceipt(
        config,
        { 
          hash: tx,
          chainId: 31337 
        }
      );
      
      if (receipt.status === 'success') {
        console.log('Transaction Receipt: ', receipt);
        // Transaction successful, update metadata in backend
        // Decode the logs to extract the tokenId from the Mint event
        // The Mint event typically has the format: Mint(address to, uint256 tokenId)
        const mintEvent = receipt.logs[0];
        let tokenId: number;
        
        if (mintEvent && mintEvent.topics && mintEvent.topics.length >= 3) {
          // The third topic (index 2) should be the tokenId
          // We need to convert it from hex to a number
          const topicValue = mintEvent.topics[3];
          const tokenIdFromEvent = topicValue ? parseInt(topicValue.toString(), 16) : null;
          console.log('TokenId from event:', tokenIdFromEvent);
          
          // Use the tokenId from the event instead of calculating it
          tokenId = tokenIdFromEvent || (mintingStats ? mintingStats.totalSupply + 1 : 1);
        } else {
          // Fallback to calculated tokenId if we can't extract it from logs
          console.log('Could not extract tokenId from event, using calculated value');
          tokenId = mintingStats ? mintingStats.totalSupply + 1 : 1;
        }
        const formData = new FormData();
      
        // Add metadata fields
        formData.append('name', metadata.name);
        formData.append('description', metadata.description);
        formData.append('owner', address || '');
        formData.append('tokenId', String(tokenId));
        formData.append('attributes', JSON.stringify(metadata.attributes));
        
        // Add the actual file, not the base64 string
        if (metadata.file) {
          formData.append('image', metadata.file);
        }
        const [metadataResponse, transactionResponse] = await Promise.all([
          axios.post(`${apiUrl}/metadata`, formData, {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
          }),
          axios.post(`${apiUrl}/transactions`, {
            hash: receipt.transactionHash,
            type: 'mint',
            tokenId: tokenId,
            from: receipt.from,
            to: receipt.to,
            status: "confirmed",
            contractAddress: contractAddress,
            blockNumber: Number(receipt.blockNumber),
            gasUsed: Number(receipt.gasUsed),
            timestamp: new Date().toISOString(),
          })
        ]);
        
        if (metadataResponse.data && metadataResponse.data.status === 'success') {
          console.log('Metadata updated successfully in backend');
        }
        
        if (metadataResponse.data.status !== 'success') {
          throw new Error('Failed to upload metadata');
        }
        if (transactionResponse.data.status !== 'success') {
          throw new Error('Failed to upload transaction');
        }
      }
      
      toast.success('NFT minted successfully!');
      
      // Switch to gallery tab
      setActiveTab('gallery');
    } catch (error) {
      console.error('Error minting NFT:', error);
      toast.error('Failed to mint NFT. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100">
      <Header 
        isConnected={isConnected} 
        address={address} 
        onConnect={handleConnectClick} 
        onDisconnect={handleDisconnect} 
      />
      {/* Wallet Selection Modal */}
        <WalletModal 
        isOpen={isWalletModalOpen}
        onClose={() => setIsWalletModalOpen(false)}
        connectors={connectors}
        connectWallet={handleConnect}
      />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800">
          Simple NFT Minting dApp
        </h1>
        <MintingStatus stats={mintingStats} />
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex border-b mb-6">
            <button
              className={`px-4 py-2 ${activeTab === 'mint' ? 'border-b-2 border-indigo-500 text-indigo-700' : 'text-gray-500'}`}
              onClick={() => setActiveTab('mint')}
            >
              Mint NFT
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'gallery' ? 'border-b-2 border-indigo-500 text-indigo-700' : 'text-gray-500'}`}
              onClick={() => setActiveTab('gallery')}
            >
              My NFTs
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'faucet' ? 'border-b-2 border-indigo-500 text-indigo-700' : 'text-gray-500'}`}
              onClick={() => setActiveTab('faucet')}
            >
              Faucet
            </button>
            <button
              className={`px-4 py-2 ${activeTab === 'all' ? 'border-b-2 border-indigo-500 text-indigo-700' : 'text-gray-500'}`}
              onClick={() => setActiveTab('all')}
            >
              All NFTs
            </button>
          </div>
          
          {activeTab === 'mint' ? (
            <MintForm 
              onMint={handleMint} 
              isLoading={isLoading} 
              isConnected={isConnected}
              userMintCount={userMintCount as bigint | undefined}
              maxMintsPerAddress={maxMintsPerAddress as bigint | undefined}
            />
          ) : activeTab === 'gallery' ? (
            <NFTGallery address={address} />
          ) : activeTab === 'faucet' ? (
            <Faucet address={address} isConnected={isConnected} />
          ) : (
            <AllNFTGallery />
          )}
        </div>
        <TransactionHistory/>
      </div>
    </main>
  );
}
