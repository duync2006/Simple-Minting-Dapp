import NodeCache from 'node-cache';
import { NFTMetadata, StoredMetadata } from '../types/metadata';
import mongoose from 'mongoose';
import NFT, { INFT } from '../models/NFT';

// In-memory storage for metadata (in a production environment, this would use a database)
const metadataCache = new NodeCache({ stdTTL: 0, checkperiod: 0 }); // No expiration

/**
 * Store NFT metadata with a token ID
 * @param tokenId The token ID
 * @param metadata The NFT metadata
 * @param owner The owner's address
 * @returns The stored metadata
 */
export const storeMetadata = (tokenId: number, metadata: NFTMetadata, owner: string): StoredMetadata => {
  // Create stored metadata object
  const storedMetadata: StoredMetadata = {
    ...metadata,
    tokenId,
    owner,
    createdAt: Date.now()
  };

  // Store in cache
  // metadataCache.set(`metadata:${tokenId}`, storedMetadata);
  // Import NFT model

  // Store metadata in MongoDB
  const nft = new NFT({
    tokenId,
    owner,
    name: metadata.name,
    description: metadata.description,
    image: metadata.image,
    attributes: metadata.attributes,
    contractAddress: process.env.CONTRACT_ADDRESS as `0x${string}`, // Default contract address
    mintedBy: owner // Assuming the owner is the minter
  });

  // Save to MongoDB (async operation)
  nft.save()
    .then(() => {
      console.log(`Metadata for token ID ${tokenId} stored in MongoDB`);
    })
    .catch(error => {
      console.error(`Error storing metadata in MongoDB: ${error.message}`);
    });

  // Also keep in cache for quick access
  // metadataCache.set(`metadata:${tokenId}`, storedMetadata);
  
  return storedMetadata;
};

/**
 * Get metadata for a specific token ID
 * @param tokenId The token ID
 * @returns The metadata or null if not found
 */
export const getMetadata = async (tokenId: number): Promise<INFT | null> => {
  const metadata = await NFT.findOne({ tokenId });
  console.log(metadata);
  return metadata;
};

/**
 * List all stored metadata
 * @returns Array of metadata objects
 */
export const listMetadata = async (): Promise<INFT[]> => {
  // const keys = metadataCache.keys();
  // const metadataList: StoredMetadata[] = [];
  
  // for (const key of keys) {
  //   if (key.startsWith('metadata:')) {
  //     const metadata = metadataCache.get<StoredMetadata>(key);
  //     if (metadata) {
  //       metadataList.push(metadata);
  //     }
  //   }
  // }
  const metadataList = await NFT.find().sort({ tokenId: -1 });
  return metadataList;
};

/**
 * Update metadata for a token ID
 * @param tokenId The token ID
 * @param metadata The updated metadata
 * @returns The updated metadata or null if not found
 */
export const updateMetadata = (tokenId: number, metadata: Partial<NFTMetadata>): StoredMetadata | null => {
  const existing = getMetadata(tokenId);
  
  if (!existing) {
    return null;
  }
  return null;
};

/**
 * Get metadata for tokens owned by a specific address
 * @param owner The owner's address
 * @returns Array of metadata objects
 */
export const getMetadataByOwner = async (owner: string): Promise<INFT[]> => {
  const all = await listMetadata();
  return all.filter(metadata => metadata.owner.toLowerCase() === owner.toLowerCase());
};