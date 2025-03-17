import Joi from 'joi';

// NFT metadata interface
export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{
    trait_type: string;
    value: string | number;
  }>;
}

// NFT metadata with token ID
export interface StoredMetadata extends NFTMetadata {
  tokenId: number;
  owner: string;
  createdAt: number;
}

// NFT minting stats
export interface MintingStats {
  totalSupply: number;
  maxSupply: number;
  totalOwners: number;
  userMintCounts: Record<string, number>;
}

// Validation schema for metadata
export const metadataSchema = Joi.object({
  name: Joi.string().min(3).max(100).required()
    .messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 100 characters',
      'any.required': 'Name is required'
    }),
  
  description: Joi.string().min(3).max(1000).required()
    .messages({
      'string.base': 'Description must be a string',
      'string.min': 'Description must be at least 3 characters long',
      'string.max': 'Description cannot exceed 1000 characters',
      'any.required': 'Description is required'
    }),
  
  image: Joi.string().uri().required()
    .messages({
      'string.base': 'Image must be a string',
      'string.uri': 'Image must be a valid URI',
      'any.required': 'Image URL is required'
    }),
  
  attributes: Joi.array().items(
    Joi.object({
      trait_type: Joi.string().required(),
      value: Joi.alternatives().try(
        Joi.string(),
        Joi.number()
      ).required()
    })
  ).optional()
    .messages({
      'array.base': 'Attributes must be an array',
      'object.base': 'Each attribute must be an object'
    })
}); 