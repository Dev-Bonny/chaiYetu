import dotenv from 'dotenv';
dotenv.config();
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import app from './app';
import connectDB from './config/database.config';
import logger from './utils/logger.utils';
import { verifyToken } from './utils/jwt.utils';
import cache from './utils/cache.utils';

const PORT = process.env.PORT || 5000;


// Create HTTP server
const httpServer = createServer(app);

// Initialize Socket.IO
const io = new SocketIOServer(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (process.env.NODE_ENV !== 'production' && /^http:\/\/localhost:\d+$/.test(origin)) {
        return callback(null, true);
      }
      const allowed = process.env.CLIENT_URL || 'http://localhost:3000';
      if (origin === allowed) return callback(null, true);
      callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true
  },
  path: '/socket.io/'
});

// Store connected users
const connectedUsers = new Map();

// Socket.IO middleware for authentication
io.use((socket, next) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error'));
    }

    const decoded = verifyToken(token);
    socket.data.user = decoded;
    next();
  } catch (error) {
    next(new Error('Authentication error'));
  }
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  const user = socket.data.user;
  const userId = user.userId.toString();

  // Add user to connected users map
  connectedUsers.set(userId, {
    socketId: socket.id,
    user,
    connectedAt: new Date()
  });

  logger.info(`User connected: ${userId} (${user.role})`);

  // Join user to their personal room
  socket.join(`user:${userId}`);

  // Join role-based rooms
  socket.join(`role:${user.role}`);

  // Join broadcast room for all users
  socket.join('broadcast');

  // Handle custom events
  socket.on('notification:read', async (data) => {
    // Handle notification read event
    io.to(`user:${userId}`).emit('notification:read', data);
  });

  socket.on('notification:delete', async (data) => {
    // Handle notification delete event
    io.to(`user:${userId}`).emit('notification:delete', data);
  });

  socket.on('disconnect', () => {
    connectedUsers.delete(userId);
    logger.info(`User disconnected: ${userId}`);
  });

  socket.on('error', (error) => {
    logger.error(`Socket error for user ${userId}:`, error);
  });
});

// Make io instance globally available
(global as any).io = io;

// Export helper functions for sending notifications
export const notificationEmitter = {
  sendToUser: (userId: string, event: string, data: any) => {
    io.to(`user:${userId}`).emit(event, data);
  },

  sendToRole: (role: string, event: string, data: any) => {
    io.to(`role:${role}`).emit(event, data);
  },

  sendToAll: (event: string, data: any) => {
    io.to('broadcast').emit(event, data);
  },

  getConnectedUsers: () => {
    return Array.from(connectedUsers.values());
  },

  isUserConnected: (userId: string) => {
    return connectedUsers.has(userId);
  }
};

const startServer = async (): Promise<void> => {
  try {
    // Connect to database
    await connectDB();

    // Test cache functionality


    // Start server
    httpServer.listen(PORT, () => {
      logger.info(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
      logger.info(`WebSocket server ready on port ${PORT}`);
    });

    // Graceful shutdown
    const gracefulShutdown = (signal: string) => {
      logger.info(`Received ${signal}, shutting down gracefully`);

      // Disconnect all Socket.IO connections
      io.disconnectSockets(true);

      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();