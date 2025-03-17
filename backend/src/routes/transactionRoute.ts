import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import Transaction, { ITransaction, TransactionType, TransactionStatus } from '../models/Transaction';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Transactions
 *   description: Transaction management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     Transaction:
 *       type: object
 *       required:
 *         - hash
 *         - type
 *         - tokenId
 *         - from
 *         - to
 *         - status
 *         - contractAddress
 *       properties:
 *         hash:
 *           type: string
 *           description: Transaction hash
 *         type:
 *           type: string
 *           enum: [mint, transfer, sale, approval]
 *           description: Type of transaction
 *         tokenId:
 *           type: number
 *           description: Related token ID
 *         from:
 *           type: string
 *           description: Sender address
 *         to:
 *           type: string
 *           description: Receiver address
 *         price:
 *           type: number
 *           description: Price (if it's a sale)
 *         status:
 *           type: string
 *           enum: [pending, confirmed, failed]
 *           description: Transaction status
 *         blockNumber:
 *           type: number
 *           description: Block number when confirmed
 *         gasUsed:
 *           type: number
 *           description: Gas used
 *         timestamp:
 *           type: string
 *           format: date-time
 *           description: Transaction timestamp
 *         contractAddress:
 *           type: string
 *           description: Contract address
 */

/**
 * @swagger
 * /api/transactions:
 *   post:
 *     summary: Create a new transaction
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Transaction'
 *     responses:
 *       201:
 *         description: Transaction created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       400:
 *         description: Invalid input data
 *       500:
 *         description: Server error
 */
router.post('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const transaction = new Transaction(req.body);
    const savedTransaction = await transaction.save();
    
    res.status(201).json({
      status: 'success',
      data: savedTransaction
    });
  } catch (error) {
    console.error('Error creating transaction:', error);
    res.status(400).json({
      status: 'error',
      message: error instanceof Error ? error.message : 'Failed to create transaction'
    });
  }
});

/**
 * @swagger
 * /api/transactions:
 *   get:
 *     summary: Get all transactions
 *     tags: [Transactions]
 *     parameters:
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [mint, transfer, sale, approval]
 *         description: Filter by transaction type
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [pending, confirmed, failed]
 *         description: Filter by transaction status
 *       - in: query
 *         name: contractAddress
 *         schema:
 *           type: string
 *         description: Filter by contract address
 *       - in: query
 *         name: tokenId
 *         schema:
 *           type: number
 *         description: Filter by token ID
 *       - in: query
 *         name: address
 *         schema:
 *           type: string
 *         description: Filter by from or to address
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of transactions to return
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *     responses:
 *       200:
 *         description: List of transactions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Transaction'
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: integer
 *                     page:
 *                       type: integer
 *                     pages:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *       500:
 *         description: Server error
 */
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    console.log("helloworld")
    const { 
      type, 
      status, 
      contractAddress, 
      tokenId, 
      address,
      limit = 20, 
      page = 1 
    } = req.query;
    
    const query: any = {};
    
    if (type) query.type = type;
    if (status) query.status = status;
    if (contractAddress) query.contractAddress = contractAddress;
    if (tokenId) query.tokenId = Number(tokenId);
    if (address) {
      query.$or = [
        { from: address },
        { to: address }
      ];
    }
    console.log(query)
    const skip = (Number(page) - 1) * Number(limit);
    
    const [transactions, total] = await Promise.all([
      Transaction.find(query)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Transaction.countDocuments(query)
    ]);
    
    const pages = Math.ceil(total / Number(limit));
    
    res.status(200).json({
      status: 'success',
      data: transactions,
      pagination: {
        total,
        page: Number(page),
        pages,
        limit: Number(limit)
      }
    });
  } catch (error) {
    console.error('Error fetching transactions:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transactions'
    });
  }
});

/**
 * @swagger
 * /api/transactions/{hash}:
 *   get:
 *     summary: Get transaction by hash
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: hash
 *         required: true
 *         schema:
 *           type: string
 *         description: Transaction hash
 *     responses:
 *       200:
 *         description: Transaction details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   $ref: '#/components/schemas/Transaction'
 *       404:
 *         description: Transaction not found
 *       500:
 *         description: Server error
 */
router.get('/:hash', async (req: Request, res: Response): Promise<void> => {
  try {
    const { hash } = req.params;
    const transaction = await Transaction.findOne({ hash });
    
    if (!transaction) {
      res.status(404).json({
        status: 'error',
        message: 'Transaction not found'
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: transaction
    });
  } catch (error) {
    console.error('Error fetching transaction:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch transaction'
    });
  }
});

export default router;
