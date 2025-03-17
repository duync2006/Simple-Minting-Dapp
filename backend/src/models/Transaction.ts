import mongoose, { Document, Schema } from 'mongoose';

export enum TransactionType {
  MINT = 'mint',
  TRANSFER = 'transfer',
  SALE = 'sale',
  APPROVAL = 'approval'
}

export enum TransactionStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  FAILED = 'failed'
}

export interface ITransaction extends Document {
  hash: string;                 // Transaction hash
  type: TransactionType;        // Type of transaction
  tokenId: number;              // Related token ID
  from: string;                 // Sender address
  to: string;                   // Receiver address
  price?: number;               // Price (if it's a sale)
  status: TransactionStatus;    // Transaction status
  blockNumber?: number;         // Block number when confirmed
  gasUsed?: number;             // Gas used
  timestamp: Date;              // Transaction timestamp
  contractAddress: string;      // Contract address
}

const TransactionSchema: Schema = new Schema(
  {
    hash: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true
    },
    type: {
      type: String,
      required: true,
      enum: Object.values(TransactionType)
    },
    tokenId: {
      type: Number,
      index: true
    },
    from: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      index: true
    },
    to: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      index: true
    },
    price: {
      type: Number,
      min: 0
    },
    status: {
      type: String,
      required: true,
      enum: Object.values(TransactionStatus),
      default: TransactionStatus.PENDING
    },
    blockNumber: {
      type: Number
    },
    gasUsed: {
      type: Number
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now
    },
    contractAddress: {
      type: String,
      required: true,
      lowercase: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      index: true
    }
  },
  {
    timestamps: true,
    versionKey: false
  }
);

export default mongoose.model<ITransaction>('Transaction', TransactionSchema); 