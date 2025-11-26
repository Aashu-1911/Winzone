import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

/**
 * Socket Context for WinZone Real-Time Features
 * Manages WebSocket connection throughout the application
 */

const SocketContext = createContext(null);

/**
 * Custom hook to use Socket Context
 * @returns {Object} - Socket context value with socket instance and helper functions
 */
export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within SocketProvider');
  }
  return context;
};

/**
 * Socket Provider Component
 * Maintains persistent Socket.io connection
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 */
export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);

  useEffect(() => {
    // Initialize Socket.io connection
    const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';
    
    const socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected:', socketInstance.id);
      setIsConnected(true);
      setConnectionError(null);
    });

    socketInstance.on('disconnect', (reason) => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', (error) => {
      console.error('⚠️  Socket connection error:', error);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    socketInstance.on('error', (error) => {
      console.error('⚠️  Socket error:', error);
      setConnectionError(error.message);
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      if (socketInstance) {
        console.log('🔌 Disconnecting socket...');
        socketInstance.disconnect();
      }
    };
  }, []);

  /**
   * Join a match room
   * @param {string} matchId - Match ID to join
   * @param {string} userId - User ID
   * @param {string} userName - User name
   */
  const joinRoom = (matchId, userId, userName) => {
    if (socket && isConnected) {
      socket.emit('joinRoom', { matchId, userId, userName });
      console.log(`🚪 Joining room for match: ${matchId}`);
    }
  };

  /**
   * Leave a match room
   * @param {string} roomId - Room ID to leave
   * @param {string} userId - User ID
   * @param {string} userName - User name
   */
  const leaveRoom = (roomId, userId, userName) => {
    if (socket && isConnected) {
      socket.emit('leaveRoom', { roomId, userId, userName });
      console.log(`👋 Leaving room: ${roomId}`);
    }
  };

  /**
   * Create a match room (organizer only)
   * @param {string} matchId - Match ID
   * @param {string} competitionId - Competition ID
   * @param {string} organizerId - Organizer ID
   */
  const createRoom = (matchId, competitionId, organizerId) => {
    if (socket && isConnected) {
      socket.emit('createRoom', { matchId, competitionId, organizerId });
      console.log(`🏁 Creating room for match: ${matchId}`);
    }
  };

  /**
   * Update player score (organizer only)
   * @param {string} matchId - Match ID
   * @param {string} playerId - Player ID
   * @param {number} score - Player's score
   */
  const updateScore = (matchId, playerId, score) => {
    if (socket && isConnected) {
      socket.emit('scoreUpdate', { matchId, playerId, score });
      console.log(`📊 Updating score for player ${playerId}: ${score}`);
    }
  };

  /**
   * Update match status
   * @param {string} matchId - Match ID
   * @param {string} status - Match status (upcoming, ongoing, completed)
   */
  const updateMatchStatus = (matchId, status) => {
    if (socket && isConnected) {
      socket.emit('matchStatus', { matchId, status });
      console.log(`🎯 Updating match ${matchId} status to: ${status}`);
    }
  };

  /**
   * Start match (organizer only)
   * @param {string} matchId - Match ID
   */
  const startMatch = (matchId) => {
    if (socket && isConnected) {
      socket.emit('startMatch', { matchId });
      console.log(`🚀 Starting match: ${matchId}`);
    }
  };

  /**
   * End match (organizer only)
   * @param {string} matchId - Match ID
   */
  const endMatch = (matchId) => {
    if (socket && isConnected) {
      socket.emit('endMatch', { matchId });
      console.log(`🏁 Ending match: ${matchId}`);
    }
  };

  /**
   * Send chat message in match room
   * @param {string} roomId - Room ID
   * @param {string} userId - User ID
   * @param {string} userName - User name
   * @param {string} message - Chat message
   */
  const sendMessage = (roomId, userId, userName, message) => {
    if (socket && isConnected) {
      socket.emit('sendMessage', { roomId, userId, userName, message });
    }
  };

  /**
   * Subscribe to socket event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler
   */
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);
    }
  };

  /**
   * Unsubscribe from socket event
   * @param {string} event - Event name
   * @param {Function} callback - Event handler to remove
   */
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);
    }
  };

  const value = {
    socket,
    isConnected,
    connectionError,
    // Room management
    joinRoom,
    leaveRoom,
    createRoom,
    // Match actions
    updateScore,
    updateMatchStatus,
    startMatch,
    endMatch,
    // Chat
    sendMessage,
    // Event listeners
    on,
    off,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext;
