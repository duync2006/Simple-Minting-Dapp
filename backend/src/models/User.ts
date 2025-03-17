import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  address: string;              // Ethereum wallet address
  username?: string;            // Optional username
  profileImage?: string;        // Optional profile image URL
  bio?: string;                 // Optional user bio
  email?: string;               // Optional email address
  mintCount: number;            // Number of NFTs minted
  createdAt: Date;              // When the user was first registered
  updatedAt: Date;              // When the user was last updated
  nonce?: string;               // For authentication purpose (optional)
}

const UserSchema: Schema = new Schema(
  {
    address: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: /^0x[a-fA-F0-9]{40}$/,
      index: true
    },
    username: {
      type: String,
      trim: true,
      maxlength: 50
    },
    profileImage: {
      type: String,
      trim: true
    },
    bio: {
      type: String,
      trim: true,
      maxlength: 1000
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/
    },
    mintCount: {
      type: Number,
      default: 0,
      min: 0
    }
  },
  {
    timestamps: true, // Adds createdAt and updatedAt
    versionKey: false
  }
);

export default mongoose.model<IUser>('User', UserSchema); 