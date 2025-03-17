import express, { Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import multer from 'multer';
import { 
  storeMetadata, 
  getMetadata, 
  listMetadata, 
  updateMetadata,
  getMetadataByOwner
} from '../services/metadataService';
import { recordMint } from '../services/mintingStatusService';
import { metadataSchema, NFTMetadata } from '../types/metadata';
import { getBucket } from '../config/gridfs';
import { Readable } from 'stream';
import mongoose from 'mongoose';
import { INFT } from '../models/NFT';
export const metadataRoutes = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     NFTMetadata:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         image:
 *           type: string
 *         attributes:
 *           type: object
 *         contractAddress:
 *           type: string
 *         mintedBy:
 *           type: string
 */ 

// Configure multer for file uploads (in a real app, you would store to cloud storage)
const storage = multer.memoryStorage();
const upload = multer({ 
  storage, 
  limits: { 
    fileSize: 5 * 1024 * 1024, // 5MB limit
    files: 1 
  } 
});

// Rate limit for metadata creation
const createMetadataLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  limit: 10, // 10 metadata creations per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many metadata creations, please try again later.'
  }
});

/**
 * @swagger
 * /api/metadata/{tokenId}:
 *   get:
 *     summary: Get metadata for a specific token ID
 *     tags: [Metadata]
 *     parameters:
 *       - name: tokenId
 *         in: path
 *         required: true
 *         description: The token ID of the NFT
 *         schema:
 *           type: integer
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
 *                   $ref: '#/components/schemas/NFTMetadata'
 *       404:
 *         description: Metadata not found
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
 *                   example: Metadata not found
 */
// Get metadata for a specific token ID
metadataRoutes.get('/:tokenId', async (req: Request, res: Response): Promise<void> => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    
    if (isNaN(tokenId) || tokenId <= 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Invalid token ID' 
      });
      return;
    }
    
    const metadata = await getMetadata(tokenId);
    
    if (!metadata) {
      res.status(404).json({ 
        status: 'error', 
        message: 'Metadata not found' 
      });
      return;
    }
    
    res.status(200).json(metadata);
  } catch (error) {
    console.error('Error getting metadata:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to retrieve metadata' 
    });
  }
});

/**
 * @swagger
 * /api/metadata:
 *   get:
 *     summary: Get all metadata
 *     tags: [Metadata]
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
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/NFTMetadata'
 *       500:
 *         description: Server error
 */
// Get all metadata
metadataRoutes.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const owner = req.query.owner as string | undefined;
    // If owner is provided, filter by owner
    const metadata: INFT[] = owner 
      ? await getMetadataByOwner(owner)
      : await listMetadata();
    
    res.status(200).json({
      status: 'success',
      count: metadata.length,
      data: metadata
    });
  } catch (error) {
    console.error('Error listing metadata:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to list metadata' 
    });
  }
});

/**
 * @swagger
 * /api/metadata:
 *   post:
 *     summary: Create metadata for a new NFT
 *     tags: [Metadata]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               tokenId:
 *                 type: integer
 *                 description: The token ID of the NFT
 *               owner:
 *                 type: string
 *                 description: The owner of the NFT
 *               name:
 *                 type: string
 *                 description: The name of the NFT
 *               description:
 *                 type: string
 *                 description: The description of the NFT
 *               attributes:
 *                 type: object
 *                 description: The attributes of the NFT
 *               image:
 *                 type: file
 *                 format: binary
 *                 description: The image file for the NFT
 *     responses:
 *       201:
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
 *                   $ref: '#/components/schemas/NFTMetadata'
 *       400:
 *         description: Bad request
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
 *                   example: Invalid token ID
 */
// Create metadata for a new NFT
metadataRoutes.post('/', createMetadataLimiter, upload.single('image'), async (req: Request, res: Response): Promise<void> => {
  try {
    // Parse JSON data
    const { tokenId, owner, name, description, attributes } = req.body;
    
    // Validate token ID
    const parsedTokenId = parseInt(tokenId);
    console.log(parsedTokenId)
    if (isNaN(parsedTokenId) || parsedTokenId <= 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Invalid token ID' 
      });
      return;
    }
    
    if (!req.file) {
      res.status(400).json({ status: 'error', message: 'No file uploaded' });
      return;
    }
    
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);
    
    // Upload to GridFS
    const filename = `${Date.now()}-${req.file.originalname}`;
    const uploadStream = getBucket().openUploadStream(filename, {
      contentType: req.file.mimetype,
      metadata: { originalName: req.file.originalname }
    });
    
    const fileId = uploadStream.id;
    readableStream.pipe(uploadStream);
    
    // Check if metadata already exists
    const existing = await getMetadata(parsedTokenId);
    if (existing) {
      res.status(409).json({ 
        status: 'error', 
        message: 'Metadata already exists for this token ID' 
      });
      return;
    }

    // In a real app, you would upload the file to cloud storage
    // and get a URL, but here we'll just use a placeholder
    let imageUrl = 'http://localhost:5000/api/metadata/file/99999999999';
    if (req.file) {
      // Mock image URL (in production, you would upload to cloud storage)
      imageUrl = `http://localhost:5000/api/metadata/file/${fileId}`;
    }
    
    // Create metadata object
    const metadata: NFTMetadata = {
      name: name,
      description: description,
      image: imageUrl,
      attributes: attributes ? JSON.parse(attributes) : undefined
    };
    
    // Validate metadata
    const { error } = metadataSchema.validate(metadata);
    if (error) {
      res.status(400).json({ 
        status: 'error', 
        message: error.message 
      });
      return;
    }
    
    // Store metadata
    const storedMetadata = storeMetadata(parsedTokenId, metadata, owner);
    
    // Record the mint in statistics
    recordMint(parsedTokenId, owner);
    
    res.status(201).json({
      status: 'success',
      data: storedMetadata
    });
  } catch (error) {
    console.error('Error creating metadata:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to create metadata' 
    });
  }
});

/**
 * @swagger
 * /api/metadata/{tokenId}:
 *   patch:
 *     summary: Update metadata for an existing NFT
 *     tags: [Metadata]
 *     parameters:
 *       - name: tokenId
 *         in: path
 *         required: true
 *         description: The token ID of the NFT
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: The name of the NFT
 *               description:
 *                 type: string
 *                 description: The description of the NFT
 *               attributes:
 *                 type: object
 *                 description: The attributes of the NFT
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
 *                   $ref: '#/components/schemas/NFTMetadata'
 *       404:
 *         description: Metadata not found
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
 *                   example: Metadata not found
 */
// Update metadata for an existing NFT
metadataRoutes.patch('/:tokenId', (req: Request, res: Response): void => {
  try {
    const tokenId = parseInt(req.params.tokenId);
    
    if (isNaN(tokenId) || tokenId <= 0) {
      res.status(400).json({ 
        status: 'error', 
        message: 'Invalid token ID' 
      });
      return;
    }
    
    // Get fields to update
    const { name, description, image, attributes } = req.body;
    const updateData: Partial<NFTMetadata> = {};
    
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (image) updateData.image = image;
    if (attributes) updateData.attributes = attributes;
    
    // Update metadata
    const updated = updateMetadata(tokenId, updateData);
    
    if (!updated) {
      res.status(404).json({ 
        status: 'error', 
        message: 'Metadata not found' 
      });
      return;
    }
    
    res.status(200).json({
      status: 'success',
      data: updated
    });
  } catch (error) {
    console.error('Error updating metadata:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Failed to update metadata' 
    });
  }
});

// Get file by ID
metadataRoutes.get('/file/:id', (req: Request, res: Response): void => {
  try {
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    const downloadStream = getBucket().openDownloadStream(fileId);
    
    // Set appropriate headers
    res.set('Cross-Origin-Resource-Policy', 'cross-origin');
    res.set('Access-Control-Allow-Origin', '*');
    
    downloadStream.on('error', () => {
      res.status(404).json({ status: 'error', message: 'File not found' });
      return;
    });
    
    downloadStream.pipe(res);
  } catch (error) {
    console.error('Error retrieving file:', error);
    res.status(500).json({ 
      status: 'error', 
      message: 'Server error' 
    });
  }
}); 