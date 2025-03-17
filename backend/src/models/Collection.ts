import mongoose, { Document, Schema } from 'mongoose';

export interface ICollection extends Document {
  address: string;              // Contract address
  name: string;                 // Collection name
  symbol: string;               // Collection symbol
  description?: string;         // Collection description
  image?: string;               // Collection image/logo
  creator: string;              // Creator's Ethereum address
  totalSupply: number;          // Current total supply
  maxSupply: number;            // Maximum total supply
  createdAt: Date;              // When the collection was created
  updatedAt: Date;              // When the collection was last updated
  isVerified: boolean;          // Whether the collection is verified
  baseURI?: string;             // Base URI for token metadata
}

const CollectionSchema: Schema = new Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true
    },
    symbol: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    image: {
      type: String,
      trim: true
    },
    creator: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/
    },
    totalSupply: {
      type: Number,
      required: true,
      default: 0,
      min: 0
    },
    maxSupply: {
      type: Number,
      required: true,
      min: 0
    },
    isVerified: {
      type: Boolean,
      default: false
    },
    baseURI: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model<ICollection>('Collection', CollectionSchema); 