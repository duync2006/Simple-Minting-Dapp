import NodeCache from 'node-cache';
import { MintingStats } from '../types/metadata';
import { NFTContract } from '../config/web3';
import NFTSchema from "../models/NFT"
// In-memory storage for minting statistics
const statsCache = new NodeCache({ stdTTL: 0, checkperiod: 0 }); // No expiration

// // Initialize default stats
const defaultStats: MintingStats = {
  totalSupply: 0, // Will be updated in init function
  maxSupply: 0,   // Will be updated in init function
  totalOwners: 0,
  userMintCounts: {}
};

// // Initialize stats cache
// statsCache.set('mintingStats', defaultStats);

/**
 * Get current minting statistics
 * @returns The current minting statistics
 */
export const getMintingStats = (): MintingStats => {
  const stats = statsCache.get<MintingStats>('mintingStats');
  return stats || defaultStats;
};

// Initialize contract data asynchronously
(async function initContractData() {
  try {
    const defaultStats: MintingStats = {
      totalSupply: 0, // Will be updated in init function
      maxSupply: 0,   // Will be updated in init function
      totalOwners: 0,
      userMintCounts: {}
    };

    const totalSupply = Number(await NFTContract.totalSupply());
    const maxSupply = Number(await NFTContract.maxSupply());
    console.log("totalSupply", totalSupply);
    defaultStats.totalSupply = totalSupply;
    defaultStats.maxSupply = maxSupply;
    defaultStats.totalOwners = await NFTSchema.distinct('owner').countDocuments();
    
    // Transform aggregation result from array to Record<string, number>
    const mintCountsArray = await NFTSchema.aggregate([
      {
        $group: {
          _id: '$owner',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert array of {_id, count} to object with {owner: count}
    defaultStats.userMintCounts = mintCountsArray.reduce((acc, item) => {
      const owner = item._id.toLowerCase();
      acc[owner] = item.count;
      return acc;
    }, {});
    
    statsCache.set('mintingStats', defaultStats);
    console.log('Minting stats initialized from contract:', defaultStats);
  } catch (error) {
    console.error('Failed to initialize contract data:', error);
  }
})();

/**
 * Record a new mint
 * @param tokenId The new token ID
 * @param owner The owner's address
 * @returns Updated minting statistics
 */
export const recordMint = (tokenId: number, owner: string): MintingStats => {
  const stats = getMintingStats();
  const normalizedOwner = owner.toLowerCase();
  
  // Update total supply
  stats.totalSupply += 1;
  
  // Update user mint count
  if (!stats.userMintCounts[normalizedOwner]) {
    stats.userMintCounts[normalizedOwner] = 0;
    stats.totalOwners += 1;
  }
  stats.userMintCounts[normalizedOwner] += 1;

  // Store updated stats
  statsCache.set('mintingStats', stats);
  
  return stats;
};

/**
 * Get mint count for a specific address
 * @param owner The owner's address
 * @returns The number of NFTs minted by the owner
 */
export const getUserMintCount = (owner: string): number => {
  const stats = getMintingStats();
  const normalizedOwner = owner.toLowerCase();
  
  return stats.userMintCounts[normalizedOwner] || 0;
};

/**
 * Set the maximum supply
 * @param maxSupply The new maximum supply
 * @returns Updated minting statistics
 */
export const setMaxSupply = (maxSupply: number): MintingStats => {
  const stats = getMintingStats();
  
  stats.maxSupply = maxSupply;
  
  statsCache.set('mintingStats', stats);
  
  return stats;
};

/**
 * Reset minting statistics
 * @returns Reset minting statistics
 */
export const resetStats = (): MintingStats => {
  const resetStats: MintingStats = {
    totalSupply: 0,
    maxSupply: defaultStats.maxSupply,
    totalOwners: 0,
    userMintCounts: {}
  };
  
  statsCache.set('mintingStats', resetStats);
  
  return resetStats;
}; 