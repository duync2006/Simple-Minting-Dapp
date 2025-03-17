import request from 'supertest';
import express from 'express';
import { metadataRoutes } from '../routes/metadata';
import * as metadataService from '../services/metadataService';
import * as mintingStatusService from '../services/mintingStatusService';

// Create a test app
const app = express();
app.use(express.json());
app.use('/api/metadata', metadataRoutes);

describe('Metadata Routes', () => {
  // Reset services before each test
  beforeEach(() => {
    // Clear any mocked implementations
    jest.restoreAllMocks();
  });

  describe('GET /api/metadata/:tokenId', () => {
    it('should return metadata for a valid token ID', async () => {
      const mockMetadata = {
        tokenId: 1,
        name: 'Test NFT',
        description: 'Test Description',
        image: 'https://example.com/image.jpg',
        owner: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now()
      };
      
      // Mock the getMetadata service function
      jest.spyOn(metadataService, 'getMetadata').mockReturnValue(mockMetadata);
      
      const response = await request(app).get('/api/metadata/1');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockMetadata);
    });
    
    it('should return 404 for non-existent token ID', async () => {
      // Mock the getMetadata service function to return null
      jest.spyOn(metadataService, 'getMetadata').mockReturnValue(null);
      
      const response = await request(app).get('/api/metadata/999');
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Metadata not found');
    });
    
    it('should return 400 for invalid token ID', async () => {
      const response = await request(app).get('/api/metadata/invalid');
      
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Invalid token ID');
    });
  });
  
  describe('GET /api/metadata', () => {
    it('should return all metadata', async () => {
      const mockMetadataList = [
        {
          tokenId: 1,
          name: 'Test NFT 1',
          description: 'Test Description 1',
          image: 'https://example.com/image1.jpg',
          owner: '0x1234567890123456789012345678901234567890',
          createdAt: Date.now()
        },
        {
          tokenId: 2,
          name: 'Test NFT 2',
          description: 'Test Description 2',
          image: 'https://example.com/image2.jpg',
          owner: '0x1234567890123456789012345678901234567890',
          createdAt: Date.now()
        }
      ];
      
      // Mock the listMetadata service function
      jest.spyOn(metadataService, 'listMetadata').mockReturnValue(mockMetadataList);
      
      const response = await request(app).get('/api/metadata');
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('count', 2);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(2);
    });
    
    it('should filter metadata by owner', async () => {
      const owner = '0x1234567890123456789012345678901234567890';
      const mockMetadataList = [
        {
          tokenId: 1,
          name: 'Test NFT 1',
          description: 'Test Description 1',
          image: 'https://example.com/image1.jpg',
          owner,
          createdAt: Date.now()
        }
      ];
      
      // Mock the getMetadataByOwner service function
      jest.spyOn(metadataService, 'getMetadataByOwner').mockReturnValue(mockMetadataList);
      
      const response = await request(app).get(`/api/metadata?owner=${owner}`);
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('count', 1);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].owner).toBe(owner);
    });
  });
  
  describe('POST /api/metadata', () => {
    it('should create new metadata', async () => {
      const tokenId = 3;
      const owner = '0x1234567890123456789012345678901234567890';
      const newMetadata = {
        name: 'New NFT',
        description: 'New Description',
        image: 'https://example.com/newimage.jpg'
      };
      
      const mockStoredMetadata = {
        ...newMetadata,
        tokenId,
        owner,
        createdAt: Date.now()
      };
      
      // Mock the getMetadata service function to return null (no existing metadata)
      jest.spyOn(metadataService, 'getMetadata').mockReturnValue(null);
      
      // Mock the storeMetadata service function
      jest.spyOn(metadataService, 'storeMetadata').mockReturnValue(mockStoredMetadata);
      
      // Mock the recordMint service function
      jest.spyOn(mintingStatusService, 'recordMint').mockImplementation(jest.fn());
      
      const response = await request(app)
        .post('/api/metadata')
        .send({
          tokenId,
          owner,
          ...newMetadata
        });
      
      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.tokenId).toBe(tokenId);
      expect(response.body.data.owner).toBe(owner);
      expect(response.body.data.name).toBe(newMetadata.name);
    });
    
    it('should return 409 if metadata already exists', async () => {
      const tokenId = 1;
      const owner = '0x1234567890123456789012345678901234567890';
      const existingMetadata = {
        tokenId,
        name: 'Existing NFT',
        description: 'Existing Description',
        image: 'https://example.com/image.jpg',
        owner,
        createdAt: Date.now()
      };
      
      // Mock the getMetadata service function to return existing metadata
      jest.spyOn(metadataService, 'getMetadata').mockReturnValue(existingMetadata);
      
      const response = await request(app)
        .post('/api/metadata')
        .send({
          tokenId,
          owner,
          name: 'New NFT',
          description: 'New Description',
          image: 'https://example.com/newimage.jpg'
        });
      
      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Metadata already exists for this token ID');
    });
  });
  
  describe('PATCH /api/metadata/:tokenId', () => {
    it('should update existing metadata', async () => {
      const tokenId = 1;
      const existingMetadata = {
        tokenId,
        name: 'Existing NFT',
        description: 'Existing Description',
        image: 'https://example.com/image.jpg',
        owner: '0x1234567890123456789012345678901234567890',
        createdAt: Date.now()
      };
      
      const updatedMetadata = {
        ...existingMetadata,
        name: 'Updated NFT',
        description: 'Updated Description'
      };
      
      // Mock the updateMetadata service function
      jest.spyOn(metadataService, 'updateMetadata').mockReturnValue(updatedMetadata);
      
      const response = await request(app)
        .patch(`/api/metadata/${tokenId}`)
        .send({
          name: 'Updated NFT',
          description: 'Updated Description'
        });
      
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('status', 'success');
      expect(response.body).toHaveProperty('data');
      expect(response.body.data.name).toBe('Updated NFT');
      expect(response.body.data.description).toBe('Updated Description');
    });
    
    it('should return 404 if metadata does not exist', async () => {
      // Mock the updateMetadata service function to return null
      jest.spyOn(metadataService, 'updateMetadata').mockReturnValue(null);
      
      const response = await request(app)
        .patch('/api/metadata/999')
        .send({
          name: 'Updated NFT'
        });
      
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty('status', 'error');
      expect(response.body).toHaveProperty('message', 'Metadata not found');
    });
  });
}); 