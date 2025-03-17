import mongoose from 'mongoose';
import { GridFSBucket, Db } from 'mongodb';

let bucket: GridFSBucket;

export const initGridFS = () => {
  bucket = new GridFSBucket(mongoose.connection.db as Db, {
    bucketName: 'uploads'
  });
};

export const getBucket = (): GridFSBucket => {
  if (!bucket) {
    throw new Error('GridFS not initialized');
  }
  return bucket;
}; 