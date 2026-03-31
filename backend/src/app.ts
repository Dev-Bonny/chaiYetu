import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';

// Routes
import authRoutes from './api/v1/routes/auth.routes';
import userRoutes from './api/v1/routes/user.routes';
import collectionRoutes from './api/v1/routes/collection.routes';
import paymentRoutes from './api/v1/routes/payment.routes';
import predictionRoutes from './api/v1/routes/prediction.routes';
import farmerRoutes from './api/v1/routes/farmer.routes';

// Middleware
import errorMiddleware from './api/v1/middlewares/error.middleware';
import { rateLimiter } from './api/v1/middlewares/rateLimiter.middleware';

dotenv.config();

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. mobile apps, curl)
    if (!origin) return callback(null, true);
    // In development, allow any localhost port
    if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
      return callback(null, true);
    }
    // In production, use CLIENT_URL
    const allowed = process.env.CLIENT_URL || 'http://localhost:3000';
    if (origin === allowed) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true
}));

// Rate limiting
app.use(rateLimiter);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging
app.use(morgan('combined'));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/users', userRoutes);
app.use('/api/v1/collections', collectionRoutes);
app.use('/api/v1/payments', paymentRoutes);
app.use('/api/v1/predictions', predictionRoutes);
app.use('/api/v1/farmers', farmerRoutes);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

// Error middleware
app.use(errorMiddleware);

export default app;