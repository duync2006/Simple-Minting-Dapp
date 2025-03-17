import express, { Request, Response } from 'express';
import { 
  getMintingStats, 
  getUserMintCount, 
  setMaxSupply, 
  resetStats 
} from '../services/mintingStatusService';

export const mintingStatusRoutes = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     MintingStats:
 *       type: object
 *       properties:
 *         totalSupply:
 *           type: integer
 *           description: Current total supply of NFTs
 *         maxSupply:
 *           type: integer
 *           description: Maximum supply of NFTs
 *         mintedToday:
 *           type: integer
 *           description: Number of NFTs minted today
 *         userMintCounts:
 *           type: object
 *           description: Number of NFTs minted by each user
 *           properties:
 *             [address]:
 *               type: integer
 *               description: Number of NFTs minted by the user with the given address
 *             totalOwners:
 *               type: integer
 *               description: Total number of unique owners
 */

/**
 * @swagger
 * /api/minting-status:
 *   get:
 *     summary: Get current minting statistics
 *     tags: [Minting]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/MintingStats'
 *       500:
 *         description: Server error
 */

// Get current minting statistics
mintingStatusRoutes.get('/', (req: Request, res: Response): void => {
  try {
    const stats = getMintingStats();
    res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (error) {
    console.error('Error getting minting stats:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to retrieve minting statistics' 
    });
  }
});

/**
 * @swagger
 * /api/minting-status/user/{address}:
 *   get:
 *     summary: Get mint count for a specific address
 *     tags: [Minting]
 *     parameters:
 *       - name: address
 *         in: path
 *         required: true
 *         description: Ethereum address of the user
 *         schema:
 *           type: string
 *           format: eth-address
 *     responses:
 *       200:
 *         description: Successful response
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
 *                     address:
 *                       type: string
 *                     mintCount:
 *                       type: integer
 *       400:
 *         description: Invalid Ethereum address
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: error
 *                 message:
 *                   type: string
 *                   example: Invalid Ethereum address
 */
// Get mint count for a specific address
mintingStatusRoutes.get('/user/:address', (req: Request, res: Response): void => {
  try {
    const { address } = req.params;
    
    // Validate Ethereum address format
    if (!address.match(/^0x[a-fA-F0-9]{40}$/)) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Invalid Ethereum address' 
      });
      return;
    }
    
    const mintCount = getUserMintCount(address);
    
    res.status(200).json({
      status: 'success',
      data: {
        address,
        mintCount
      }
    });
    return;
  } catch (error) {
    console.error('Error getting user mint count:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to retrieve user mint count' 
    });
  }
});


/**
 * @swagger
 * /api/minting-status/max-supply:
 *   put:
 *     summary: Update the maximum supply of NFTs
 *     tags: [Minting]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               maxSupply:
 *                 type: integer
 *                 description: New maximum supply of NFTs
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/MintingStats'
 *       500:
 *         description: Server error
 */
// Update max supply (admin only)
// In a real app, this would require authentication
mintingStatusRoutes.put('/max-supply', (req: Request, res: Response): void => {
  try {
    const { maxSupply } = req.body;
    
    // Validate max supply
    const parsedMaxSupply = parseInt(maxSupply);
    if (isNaN(parsedMaxSupply) || parsedMaxSupply <= 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Invalid max supply value' 
      });
      return;
    }
    
    const stats = setMaxSupply(parsedMaxSupply);
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
    return;
  } catch (error) {
    console.error('Error updating max supply:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update max supply' 
    });
  }
});

/**
 * @swagger
 * /api/minting-status/reset:
 *   post:
 *     summary: Reset minting statistics
 *     tags: [Minting]
 *     responses:
 *       200:
 *         description: Successful response
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data: 
 *                   $ref: '#/components/schemas/MintingStats'
 *       500:
 *         description: Server error
 */
// Reset minting statistics (admin only)
// In a real app, this would require authentication
mintingStatusRoutes.post('/reset', (req: Request, res: Response): void => {
  try {
    const stats = resetStats();
    
    res.status(200).json({
      status: 'success',
      data: stats
    });
    return;
  } catch (error) {
    console.error('Error resetting stats:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to reset minting statistics' 
    });
  }
});