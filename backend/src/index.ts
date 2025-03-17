import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { rateLimit } from 'express-rate-limit';
import { metadataRoutes } from './routes/metadata';
import { mintingStatusRoutes } from './routes/mintingStatus';
import connectDB from './config/database';
// In your app.ts or index.ts
import { initGridFS } from './config/gridfs';
import mongoose from 'mongoose';
import { specs, swaggerUi } from './config/swagger';
import  transactionRoutes  from './routes/transactionRoute';
import faucetRoutes from './routes/faucet';
connectDB();

// After MongoDB connection is established
mongoose.connection.once('open', () => {
  console.log('MongoDB connected');
  initGridFS();
});
// Load environment variables
dotenv.config();

// Connect to MongoDB

// Initialize express app
const app = express();
const PORT = process.env.PORT || 5000;

// Apply middleware
app.use(helmet()); // Security headers
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'], // Allow your localhost frontend origins
  credentials: true,
  exposedHeaders: ['Content-Disposition'] // If you need to expose headers
}));
app.use(express.json()); // Parse JSON bodies
app.use(morgan('dev')); // Logger

// Apply rate limiting
const apiLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // 2 minutes
  limit: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 429,
    message: 'Too many requests, please try again later.'
  }
});
app.use(apiLimiter);

// Swagger setup
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/metadata', metadataRoutes);
app.use('/api/minting-status', mintingStatusRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/faucet', faucetRoutes);
// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Error handling middleware
app.use((err: Error, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app; 