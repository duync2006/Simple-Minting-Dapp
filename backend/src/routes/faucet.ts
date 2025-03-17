import express, {Response, Request} from 'express';
import { ethers } from 'ethers';
import rateLimit from 'express-rate-limit';
import { body, validationResult } from 'express-validator';
import dotenv from 'dotenv';
import Transaction from '../models/Transaction';
dotenv.config();

const router = express.Router();

// Rate limiter for faucet requests - one request per 24 hours per IP
const faucetLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  limit: 1, // Limit each IP to 1 request per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'You can only request ETH from the faucet once every 24 hours.'
  }
});

// Get provider and wallet from environment variables
const provider = new ethers.JsonRpcProvider(process.env.RPC_URL || 'http://127.0.0.1:8545');
const faucetPrivateKey = process.env.FAUCET_PRIVATE_KEY;
const faucetWallet = new ethers.Wallet(faucetPrivateKey || '', provider);
const faucetAmount = ethers.parseEther(process.env.FAUCET_AMOUNT || '0.5'); // Default 0.5 ETH

/**
 * @swagger
 * /api/faucet:
 *   post:
 *     summary: Request test ETH from the faucet
 *     description: Sends a small amount of test ETH to the specified wallet address
 *     tags: [Faucet]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - address
 *             properties:
 *               address:
 *                 type: string
 *                 description: The wallet address to receive test ETH
 *     responses:
 *       200:
 *         description: ETH successfully sent
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     txHash:
 *                       type: string
 *                       description: Transaction hash
 *                     amount:
 *                       type: string
 *                       description: Amount of ETH sent
 *       400:
 *         description: Invalid address or validation error
 *       429:
 *         description: Rate limit exceeded
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  faucetLimiter,
  [
    body('address')
      .isString()
      .trim()
      .isLength({ min: 42, max: 42 })
      .matches(/^0x[a-fA-F0-9]{40}$/)
      .withMessage('Valid Ethereum address is required')
  ],
  async (req: Request, res: Response): Promise<void> => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        res.status(400).json({
          status: 'error',
          message: 'Validation error',
          errors: errors.array()
        });
        return;
      }

      const { address } = req.body;

      // Check faucet balance
      const faucetBalance = await provider.getBalance(faucetWallet.address);
      if (faucetBalance < faucetAmount) {
        res.status(500).json({
          status: 'error',
          message: 'Faucet is empty. Please contact the administrator.'
        });
        return;
      }

      // Send ETH to the requested address
      const tx = await faucetWallet.sendTransaction({
        to: address,
        value: faucetAmount
      });

      // Wait for transaction to be mined
      const receipt = await tx.wait();
      
      // Save transaction to database
      await Transaction.create({
        hash: tx.hash,
        from: faucetWallet.address,
        to: address,
        tokenId: ethers.formatEther(faucetAmount),
        type: 'transfer',
        status: 'confirmed',
        timestamp: new Date(),
        contractAddress: process.env.CONTRACT_ADDRESS || ''
      });
      

      res.status(200).json({
        status: 'success',
        data: {
          txHash: tx.hash,
          amount: ethers.formatEther(faucetAmount),
          from: faucetWallet.address,
          to: address
        }
      });
    } catch (error) {
      console.error('Faucet error:', error);
      res.status(500).json({
        status: 'error',
        message: 'Failed to send ETH from faucet',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }
);

export default router;
