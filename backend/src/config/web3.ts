import { ethers } from 'ethers';
import { SimpleNFTAbi } from '../abi/SimpleNFTAbi';
import dotenv from 'dotenv';

dotenv.config();
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL);
const NFTContract = new ethers.Contract(process.env.CONTRACT_ADDRESS as `0x${string}`, SimpleNFTAbi, provider);

export { provider, NFTContract };
