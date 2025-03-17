import mongoose, { Document, Schema } from 'mongoose';

export interface INFT extends Document {
  tokenId: number;              // Unique token ID
  owner: string;                // Owner's Ethereum address
  name: string;                 // NFT name
  description: string;          // NFT description
  image: string;                // NFT image URL
  attributes?: Array<{         // Optional array of attributes
    trait_type: string;
    value: string | number;
  }>;
  createdAt: Date;              // When the NFT was created
  updatedAt: Date;              // When the NFT was last updated
  // contractAddress: string;      // Address of the contract this NFT belongs to
  // mintedBy: string;             // Address of the user who minted this NFT
}

const NFTSchema: Schema = new Schema(
  {
    tokenId: {
      type: Number,
      required: true,
      unique: true,
      index: true
    },
    owner: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      index: true
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 100
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 1000
    },
    image: {
      type: String,
      required: true,
      trim: true
    },
    attributes: [{
      trait_type: {
        type: String,
        required: true
      },
      value: {
        type: Schema.Types.Mixed,
        required: true
      },
      _id: false // Don't create IDs for array elements
    }],
    // contractAddress: {
    //   type: String,
    //   required: true,
    //   lowercase: true,
    //   match: /^0x[a-fA-F0-9]{40}$/,
    //   index: true
    // },
    // mintedBy: {
    //   type: String,
    //   required: true,
    //   lowercase: true,
    //   match: /^0x[a-fA-F0-9]{40}$/
    // }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

// Compound index for faster queries on contract + tokenId
NFTSchema.index({ contractAddress: 1, tokenId: 1 }, { unique: true });

export default mongoose.model<INFT>('NFT', NFTSchema); 