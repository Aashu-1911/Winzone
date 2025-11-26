import dotenv from 'dotenv';
import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { initializeSocket } from './config/socket.js';
import { initializeMatchSockets } from './sockets/matchSocket.js';

// Load environment variables from .env file
dotenv.config();

// Configuration
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

/**
 * Start the Express server with Socket.io
 */
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create HTTP server from Express app
    const server = http.createServer(app);

    // Initialize Socket.io
    const io = initializeSocket(server);

    // Initialize match socket handlers
    initializeMatchSockets(io);

    // Start listening
    server.listen(PORT, () => {
      console.log(`🚀 Server running in ${NODE_ENV} mode on port ${PORT}`);
      console.log(`📍 Server URL: http://localhost:${PORT}`);
      console.log(`🔌 Socket.io ready for real-time connections`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err.message);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err.message);
  process.exit(1);
});

// Start the server
startServer();
