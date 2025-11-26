import Match from '../models/match.model.js';
import User from '../models/user.model.js';
import { getIO } from '../config/socket.js';

/**
 * Socket Event Handlers for Real-Time Match System
 * Manages live match rooms, score updates, and status broadcasts
 */

/**
 * Initialize all match-related socket events
 * @param {Object} io - Socket.io server instance
 */
export const initializeMatchSockets = (io) => {
  io.on('connection', (socket) => {
    console.log(`🎮 Match socket connected: ${socket.id}`);

    /**
     * EVENT: createRoom
     * Organizer creates a match room
     * Payload: { matchId, competitionId, organizerId }
     */
    socket.on('createRoom', async (data) => {
      try {
        const { matchId } = data;
        
        const match = await Match.findById(matchId).populate('players', 'name email');
        
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        // Join the room
        socket.join(match.roomId);
        
        console.log(`🏁 Room created: ${match.roomId} by ${socket.id}`);
        
        // Send confirmation to organizer
        socket.emit('roomCreated', {
          success: true,
          roomId: match.roomId,
          match: match,
        });

        // Notify all clients in room
        io.to(match.roomId).emit('roomUpdate', {
          message: 'Match room is ready',
          match: match,
        });
      } catch (error) {
        console.error('Error creating room:', error);
        socket.emit('error', { message: 'Failed to create room', error: error.message });
      }
    });

    /**
     * EVENT: joinRoom
     * Players join an existing match room
     * Payload: { matchId, userId, userName }
     */
    socket.on('joinRoom', async (data) => {
      try {
        const { matchId, userId, userName } = data;
        
        const match = await Match.findById(matchId)
          .populate('players', 'name email stats')
          .populate('organizerId', 'name email');
        
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        // Verify user is a participant
        const isParticipant = match.players.some(
          (player) => player._id.toString() === userId.toString()
        );
        const isOrganizer = match.organizerId._id.toString() === userId.toString();

        if (!isParticipant && !isOrganizer) {
          socket.emit('error', { message: 'You are not authorized to join this match' });
          return;
        }

        // Join the room
        socket.join(match.roomId);
        
        console.log(`👤 ${userName} (${userId}) joined room: ${match.roomId}`);
        
        // Send current match state to the joining client
        socket.emit('joinedRoom', {
          success: true,
          roomId: match.roomId,
          match: match,
          isOrganizer: isOrganizer,
        });

        // Notify others in the room
        socket.to(match.roomId).emit('playerJoined', {
          userId,
          userName,
          message: `${userName} joined the match`,
        });

        // Broadcast updated room size
        const room = io.sockets.adapter.rooms.get(match.roomId);
        io.to(match.roomId).emit('roomSizeUpdate', {
          count: room ? room.size : 0,
        });
      } catch (error) {
        console.error('Error joining room:', error);
        socket.emit('error', { message: 'Failed to join room', error: error.message });
      }
    });

    /**
     * EVENT: leaveRoom
     * User leaves a match room
     * Payload: { matchId, roomId, userId, userName }
     */
    socket.on('leaveRoom', async (data) => {
      try {
        const { roomId, userId, userName } = data;
        
        socket.leave(roomId);
        
        console.log(`👋 ${userName} left room: ${roomId}`);
        
        // Notify others
        socket.to(roomId).emit('playerLeft', {
          userId,
          userName,
          message: `${userName} left the match`,
        });

        // Update room size
        const room = io.sockets.adapter.rooms.get(roomId);
        io.to(roomId).emit('roomSizeUpdate', {
          count: room ? room.size : 0,
        });
      } catch (error) {
        console.error('Error leaving room:', error);
      }
    });

    /**
     * EVENT: scoreUpdate
     * Organizer updates a player's score
     * Payload: { matchId, playerId, score }
     */
    socket.on('scoreUpdate', async (data) => {
      try {
        const { matchId, playerId, score } = data;
        
        const match = await Match.findById(matchId)
          .populate('players', 'name email stats');
        
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        // Update score in database
        await match.updateScore(playerId, score);
        
        // Get updated leaderboard
        const leaderboard = match.getLeaderboard();
        
        console.log(`📊 Score updated for ${playerId}: ${score} in match ${matchId}`);
        
        // Broadcast to all in room
        io.to(match.roomId).emit('scoreUpdated', {
          matchId,
          playerId,
          score,
          leaderboard,
          scores: Object.fromEntries(match.scores),
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error updating score:', error);
        socket.emit('error', { message: 'Failed to update score', error: error.message });
      }
    });

    /**
     * EVENT: matchStatus
     * Update match status (starting, ongoing, etc.)
     * Payload: { matchId, status }
     */
    socket.on('matchStatus', async (data) => {
      try {
        const { matchId, status } = data;
        
        const match = await Match.findById(matchId);
        
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        // Update status
        match.status = status;
        
        if (status === 'ongoing' && !match.startedAt) {
          match.startedAt = new Date();
        }
        
        await match.save();
        
        console.log(`🎯 Match ${matchId} status changed to: ${status}`);
        
        // Broadcast to all in room
        io.to(match.roomId).emit('statusChanged', {
          matchId,
          status,
          startedAt: match.startedAt,
          message: `Match status: ${status}`,
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error updating match status:', error);
        socket.emit('error', { message: 'Failed to update status', error: error.message });
      }
    });

    /**
     * EVENT: startMatch
     * Organizer starts the match
     * Payload: { matchId }
     */
    socket.on('startMatch', async (data) => {
      try {
        const { matchId } = data;
        
        const match = await Match.findById(matchId)
          .populate('players', 'name email');
        
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        // Start the match
        await match.startMatch();
        
        console.log(`🚀 Match ${matchId} started!`);
        
        // Broadcast to all in room
        io.to(match.roomId).emit('matchStarted', {
          matchId,
          startedAt: match.startedAt,
          status: match.status,
          message: '🎮 Match has started! Good luck!',
          timestamp: new Date(),
        });
      } catch (error) {
        console.error('Error starting match:', error);
        socket.emit('error', { message: 'Failed to start match', error: error.message });
      }
    });

    /**
     * EVENT: endMatch
     * Organizer ends the match and finalizes results
     * Payload: { matchId }
     */
    socket.on('endMatch', async (data) => {
      try {
        const { matchId } = data;
        
        const match = await Match.findById(matchId)
          .populate('players', 'name email stats');
        
        if (!match) {
          socket.emit('error', { message: 'Match not found' });
          return;
        }

        // End the match
        await match.endMatch();
        
        // Get final leaderboard
        const leaderboard = match.getLeaderboard();
        
        // Update player stats
        const updatePromises = [];
        for (const [playerId, score] of match.scores) {
          const user = await User.findById(playerId);
          if (user) {
            const isWinner = match.winner && match.winner.toString() === playerId.toString();
            updatePromises.push(user.updateMatchStats(score, isWinner));
          }
        }
        await Promise.all(updatePromises);
        
        console.log(`🏁 Match ${matchId} ended! Winner: ${match.winner}`);
        
        // Broadcast final results to all in room
        io.to(match.roomId).emit('matchEnded', {
          matchId,
          endedAt: match.endedAt,
          winner: match.winner,
          leaderboard,
          scores: Object.fromEntries(match.scores),
          duration: match.durationMinutes,
          message: '🏁 Match completed!',
          timestamp: new Date(),
        });

        // Close the room after 30 seconds
        setTimeout(() => {
          io.to(match.roomId).emit('roomClosing', {
            message: 'Match room will close in 10 seconds...',
          });
          
          setTimeout(() => {
            io.in(match.roomId).disconnectSockets(true);
            console.log(`🔒 Room ${match.roomId} closed`);
          }, 10000);
        }, 30000);
      } catch (error) {
        console.error('Error ending match:', error);
        socket.emit('error', { message: 'Failed to end match', error: error.message });
      }
    });

    /**
     * EVENT: sendMessage
     * Send chat message in match room
     * Payload: { roomId, userId, userName, message }
     */
    socket.on('sendMessage', (data) => {
      const { roomId, userId, userName, message } = data;
      
      io.to(roomId).emit('newMessage', {
        userId,
        userName,
        message,
        timestamp: new Date(),
      });
    });

    /**
     * Handle disconnection
     */
    socket.on('disconnect', () => {
      console.log(`🔌 Match socket disconnected: ${socket.id}`);
    });
  });
};

export default initializeMatchSockets;
