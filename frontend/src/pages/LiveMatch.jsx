import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { getMatchById } from '../services/matchService';

function LiveMatch() {
  const { matchId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { socket, isConnected, joinRoom, leaveRoom, on, off } = useSocket();

  const [match, setMatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scores, setScores] = useState({});
  const [status, setStatus] = useState('upcoming');
  const [leaderboard, setLeaderboard] = useState([]);
  const [messages, setMessages] = useState([]);
  const [roomSize, setRoomSize] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Fetch match data on mount
  useEffect(() => {
    fetchMatchData();
  }, [matchId]);

  const fetchMatchData = async () => {
    try {
      setLoading(true);
      const data = await getMatchById(matchId);
      
      if (data.success) {
        setMatch(data.data);
        setScores(Object.fromEntries(data.data.scores || new Map()));
        setStatus(data.data.status);
        setStartTime(data.data.startedAt);
      }
    } catch (err) {
      console.error('Fetch match error:', err);
      toast.error(err.message || 'Failed to load match');
    } finally {
      setLoading(false);
    }
  };

  // Join room when component mounts and socket is connected
  useEffect(() => {
    if (isConnected && user && match) {
      joinRoom(matchId, user._id, user.name);
    }

    return () => {
      if (isConnected && user && match) {
        leaveRoom(match.roomId, user._id, user.name);
      }
    };
  }, [isConnected, user, match, matchId]);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Player joined event
    const handlePlayerJoined = (data) => {
      console.log('Player joined:', data);
      toast.success(`${data.userName} joined the match`);
    };

    // Player left event
    const handlePlayerLeft = (data) => {
      console.log('Player left:', data);
      toast(`${data.userName} left the match`, { icon: '👋' });
    };

    // Room size update
    const handleRoomSizeUpdate = (data) => {
      setRoomSize(data.count);
    };

    // Match started
    const handleMatchStarted = (data) => {
      console.log('Match started:', data);
      setStatus('ongoing');
      setStartTime(data.startedAt);
      toast.success(data.message || 'Match has started!', { icon: '🎮' });
    };

    // Score updated
    const handleScoreUpdated = (data) => {
      console.log('Score updated:', data);
      setScores(data.scores);
      setLeaderboard(data.leaderboard || []);
      toast.success(`Score updated!`, { icon: '📊', duration: 2000 });
    };

    // Status changed
    const handleStatusChanged = (data) => {
      console.log('Status changed:', data);
      setStatus(data.status);
      toast(data.message, { icon: '🎯' });
    };

    // Match ended
    const handleMatchEnded = (data) => {
      console.log('Match ended:', data);
      setStatus('completed');
      setScores(data.scores);
      setLeaderboard(data.leaderboard || []);
      
      // Show winner announcement
      const winnerName = match?.players?.find(p => p._id === data.winner)?.name || 'Unknown';
      toast.success(`🏆 Match ended! Winner: ${winnerName}`, { duration: 5000 });
    };

    // Room closing
    const handleRoomClosing = (data) => {
      toast(data.message, { icon: '⏰', duration: 8000 });
    };

    // Error handling
    const handleError = (error) => {
      console.error('Socket error:', error);
      toast.error(error.message || 'An error occurred');
    };

    // Join confirmation
    const handleJoinedRoom = (data) => {
      console.log('Joined room successfully:', data);
      if (data.match) {
        setMatch(data.match);
        setScores(Object.fromEntries(data.match.scores || new Map()));
        setStatus(data.match.status);
      }
    };

    // Chat messages
    const handleNewMessage = (data) => {
      setMessages((prev) => [...prev, data]);
    };

    // Register event listeners
    on('playerJoined', handlePlayerJoined);
    on('playerLeft', handlePlayerLeft);
    on('roomSizeUpdate', handleRoomSizeUpdate);
    on('matchStarted', handleMatchStarted);
    on('scoreUpdated', handleScoreUpdated);
    on('statusChanged', handleStatusChanged);
    on('matchEnded', handleMatchEnded);
    on('roomClosing', handleRoomClosing);
    on('error', handleError);
    on('joinedRoom', handleJoinedRoom);
    on('newMessage', handleNewMessage);

    // Cleanup
    return () => {
      off('playerJoined', handlePlayerJoined);
      off('playerLeft', handlePlayerLeft);
      off('roomSizeUpdate', handleRoomSizeUpdate);
      off('matchStarted', handleMatchStarted);
      off('scoreUpdated', handleScoreUpdated);
      off('statusChanged', handleStatusChanged);
      off('matchEnded', handleMatchEnded);
      off('roomClosing', handleRoomClosing);
      off('error', handleError);
      off('joinedRoom', handleJoinedRoom);
      off('newMessage', handleNewMessage);
    };
  }, [socket, on, off, match]);

  // Timer for ongoing matches
  useEffect(() => {
    if (status === 'ongoing' && startTime) {
      const interval = setInterval(() => {
        const elapsed = Math.floor((new Date() - new Date(startTime)) / 1000);
        setElapsedTime(elapsed);
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [status, startTime]);

  // Format time helper
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Get status color
  const getStatusColor = (matchStatus) => {
    switch (matchStatus) {
      case 'upcoming':
        return 'text-cyber-blue-500 bg-cyber-blue-500/20 border-cyber-blue-500/50';
      case 'ongoing':
        return 'text-cyber-green-500 bg-cyber-green-500/20 border-cyber-green-500/50 animate-pulse';
      case 'completed':
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
      default:
        return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyber-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="font-rajdhani text-xl text-gray-400">Loading match...</p>
        </div>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="min-h-screen bg-dark-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="font-orbitron text-2xl font-bold text-white mb-4">Match Not Found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 text-white rounded-lg font-rajdhani font-bold"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dark-bg pt-20">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="font-orbitron text-4xl font-black bg-gradient-to-r from-cyber-blue-500 via-cyber-purple-500 to-cyber-pink bg-clip-text text-transparent mb-2">
                🎮 Live Match
              </h1>
              <p className="font-rajdhani text-xl text-gray-400">
                {match.competitionId?.title || 'Competition Match'}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Connection Status */}
              <div className="flex items-center gap-2 px-4 py-2 glass rounded-lg border border-cyber-blue-500/30">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-cyber-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                <span className="font-rajdhani text-sm text-white">
                  {isConnected ? 'Connected' : 'Disconnected'}
                </span>
              </div>

              {/* Room Size */}
              <div className="px-4 py-2 glass rounded-lg border border-cyber-purple-500/30">
                <span className="font-rajdhani text-sm text-gray-400">Online: </span>
                <span className="font-orbitron font-bold text-cyber-purple-500">{roomSize}</span>
              </div>
            </div>
          </div>

          {/* Match Status and Timer */}
          <div className="glass rounded-xl border border-cyber-blue-500/30 p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <span className={`px-4 py-2 rounded-lg text-sm font-rajdhani font-bold uppercase border ${getStatusColor(status)}`}>
                  {status === 'ongoing' && '🔴 '}{status}
                </span>
                
                {status === 'ongoing' && (
                  <div className="flex items-center gap-2">
                    <span className="text-3xl">⏱️</span>
                    <span className="font-orbitron text-3xl font-bold text-cyber-green-500">
                      {formatTime(elapsedTime)}
                    </span>
                  </div>
                )}
              </div>

              <div className="text-right">
                <p className="font-rajdhani text-sm text-gray-400">Match #{match.matchNumber}</p>
                <p className="font-orbitron font-bold text-white">{match.metadata?.gameMode || 'Standard'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Leaderboard */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass rounded-2xl border border-cyber-blue-500/30 p-6"
            >
              <h2 className="font-orbitron text-2xl font-bold text-white mb-6 flex items-center gap-2">
                <span>🏆</span> Leaderboard
              </h2>

              <AnimatePresence mode="popLayout">
                {leaderboard && leaderboard.length > 0 ? (
                  <div className="space-y-3">
                    {leaderboard.map((entry, index) => {
                      const player = match.players?.find(p => p._id === entry.playerId);
                      const isCurrentUser = user?._id === entry.playerId;

                      return (
                        <motion.div
                          key={entry.playerId}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className={`glass rounded-lg border p-4 flex items-center justify-between ${
                            isCurrentUser 
                              ? 'border-cyber-green-500/50 bg-cyber-green-500/10' 
                              : 'border-cyber-blue-500/30'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center font-orbitron font-bold text-lg ${
                              index === 0 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black' :
                              index === 1 ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black' :
                              index === 2 ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-white' :
                              'bg-dark-surface text-gray-400'
                            }`}>
                              {index + 1}
                            </div>
                            
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-rajdhani text-lg font-bold text-white">
                                  {player?.name || 'Unknown Player'}
                                </p>
                                {isCurrentUser && (
                                  <span className="px-2 py-1 bg-cyber-green-500/20 text-cyber-green-500 rounded text-xs font-rajdhani font-bold">
                                    YOU
                                  </span>
                                )}
                              </div>
                              <p className="font-rajdhani text-sm text-gray-400">
                                {player?.email}
                              </p>
                            </div>
                          </div>

                          <div className="text-right">
                            <p className="font-orbitron text-2xl font-bold text-cyber-blue-500">
                              {entry.score}
                            </p>
                            <p className="font-rajdhani text-xs text-gray-400">points</p>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📊</div>
                    <p className="font-rajdhani text-lg text-gray-400">
                      {status === 'upcoming' ? 'Waiting for match to start...' : 'No scores yet'}
                    </p>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>

          {/* Players List */}
          <div className="lg:col-span-1">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="glass rounded-2xl border border-cyber-purple-500/30 p-6"
            >
              <h3 className="font-orbitron text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span>👥</span> Players ({match.players?.length || 0})
              </h3>

              <div className="space-y-2">
                {match.players?.map((player, index) => (
                  <motion.div
                    key={player._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="glass rounded-lg border border-cyber-blue-500/30 p-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 flex items-center justify-center">
                          <span className="font-orbitron text-sm font-bold">
                            {player.name?.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-rajdhani font-semibold text-white text-sm">
                            {player.name}
                          </p>
                          {user?._id === player._id && (
                            <span className="text-xs text-cyber-green-500">(You)</span>
                          )}
                        </div>
                      </div>
                      
                      <span className="font-orbitron font-bold text-cyber-blue-500 text-sm">
                        {scores[player._id] || 0}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Match Info */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
              className="glass rounded-2xl border border-cyber-green-500/30 p-6 mt-6"
            >
              <h3 className="font-orbitron text-xl font-bold text-white mb-4">📋 Match Info</h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-rajdhani text-gray-400">Organizer</span>
                  <span className="font-rajdhani font-semibold text-white">
                    {match.organizerId?.name}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="font-rajdhani text-gray-400">Room ID</span>
                  <span className="font-mono text-xs text-cyber-blue-500">
                    {match.roomId?.substring(0, 12)}...
                  </span>
                </div>

                {match.startedAt && (
                  <div className="flex justify-between items-center">
                    <span className="font-rajdhani text-gray-400">Started At</span>
                    <span className="font-rajdhani text-white">
                      {new Date(match.startedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}

                {match.endedAt && (
                  <div className="flex justify-between items-center">
                    <span className="font-rajdhani text-gray-400">Ended At</span>
                    <span className="font-rajdhani text-white">
                      {new Date(match.endedAt).toLocaleTimeString()}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <button
            onClick={() => navigate('/dashboard')}
            className="px-8 py-3 glass border border-cyber-blue-500/30 rounded-lg font-rajdhani font-bold text-white hover:border-cyber-blue-500 transition-all duration-300"
          >
            ← Back to Dashboard
          </button>
        </motion.div>
      </main>
    </div>
  );
}

export default LiveMatch;
