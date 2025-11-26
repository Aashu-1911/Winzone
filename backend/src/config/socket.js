import { Server } from 'socket.io';

/**
 * Socket.io Configuration for WinZone Real-Time Features
 * Handles live match updates, score broadcasting, and room management
 */

let io = null;

/**
 * Initialize Socket.io server
 * @param {Object} httpServer - HTTP server instance from Express
 * @returns {Object} - Socket.io server instance
 */
export const initializeSocket = (httpServer) => {
  io = new Server(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
    // Connection options
    pingTimeout: 60000,
    pingInterval: 25000,
  });

  console.log('✅ Socket.io server initialized');

  // Connection handler
  io.on('connection', (socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      console.log(`❌ Client disconnected: ${socket.id}, Reason: ${reason}`);
    });

    // Handle connection errors
    socket.on('error', (error) => {
      console.error(`⚠️  Socket error: ${socket.id}`, error);
    });
  });

  return io;
};

/**
 * Get Socket.io server instance
 * @returns {Object} - Socket.io server instance
 */
export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io has not been initialized. Call initializeSocket first.');
  }
  return io;
};

/**
 * Emit event to specific room
 * @param {string} roomId - Room identifier
 * @param {string} event - Event name
 * @param {Object} data - Data to send
 */
export const emitToRoom = (roomId, event, data) => {
  if (io) {
    io.to(roomId).emit(event, data);
    console.log(`📡 Emitted '${event}' to room: ${roomId}`);
  }
};

/**
 * Emit event to all connected clients
 * @param {string} event - Event name
 * @param {Object} data - Data to send
 */
export const emitToAll = (event, data) => {
  if (io) {
    io.emit(event, data);
    console.log(`📡 Emitted '${event}' to all clients`);
  }
};

/**
 * Get number of clients in a room
 * @param {string} roomId - Room identifier
 * @returns {number} - Number of clients in room
 */
export const getRoomSize = async (roomId) => {
  if (io) {
    const room = io.sockets.adapter.rooms.get(roomId);
    return room ? room.size : 0;
  }
  return 0;
};

export default {
  initializeSocket,
  getIO,
  emitToRoom,
  emitToAll,
  getRoomSize,
};
