import { useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSocket } from '../context/SocketContext';
import { startMatch as startMatchAPI, endMatch as endMatchAPI, updateMatchScore } from '../services/matchService';

function OrganizerMatchPanel({ match, onUpdate }) {
  const { startMatch: startSocketMatch, endMatch: endSocketMatch, updateScore } = useSocket();
  const [selectedPlayer, setSelectedPlayer] = useState('');
  const [scoreValue, setScoreValue] = useState('');
  const [loading, setLoading] = useState(false);

  const isOrganizer = true; // This component should only render for organizers

  const handleStartMatch = async () => {
    try {
      setLoading(true);
      const response = await startMatchAPI(match._id);
      
      if (response.success) {
        // Emit socket event for real-time update
        startSocketMatch(match._id);
        toast.success('Match started!', { icon: '🎮' });
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Start match error:', err);
      toast.error(err.message || 'Failed to start match');
    } finally {
      setLoading(false);
    }
  };

  const handleEndMatch = async () => {
    const confirmed = window.confirm('Are you sure you want to end this match? This action cannot be undone.');
    
    if (!confirmed) return;

    try {
      setLoading(true);
      const response = await endMatchAPI(match._id);
      
      if (response.success) {
        // Emit socket event for real-time update
        endSocketMatch(match._id);
        toast.success('Match ended! Winner calculated.', { icon: '🏆' });
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('End match error:', err);
      toast.error(err.message || 'Failed to end match');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateScore = async (e) => {
    e.preventDefault();

    if (!selectedPlayer || !scoreValue) {
      toast.error('Please select a player and enter a score');
      return;
    }

    const score = parseInt(scoreValue, 10);
    if (isNaN(score) || score < 0) {
      toast.error('Please enter a valid positive score');
      return;
    }

    try {
      setLoading(true);
      const response = await updateMatchScore(match._id, selectedPlayer, score);
      
      if (response.success) {
        // Emit socket event for real-time update
        updateScore(match._id, selectedPlayer, score);
        toast.success('Score updated!', { icon: '📊' });
        
        // Reset form
        setSelectedPlayer('');
        setScoreValue('');
        
        if (onUpdate) onUpdate();
      }
    } catch (err) {
      console.error('Update score error:', err);
      toast.error(err.message || 'Failed to update score');
    } finally {
      setLoading(false);
    }
  };

  if (!isOrganizer || match.status === 'completed') {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass rounded-2xl border border-cyber-purple-500/30 p-6"
    >
      <h2 className="font-orbitron text-2xl font-bold text-white mb-6 flex items-center gap-2">
        <span>🎮</span> Organizer Controls
      </h2>

      {/* Match Control Buttons */}
      <div className="space-y-4 mb-6">
        {match.status === 'upcoming' && (
          <button
            onClick={handleStartMatch}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-cyber-green-500 to-emerald-600 text-white rounded-lg font-rajdhani font-bold text-lg hover:shadow-lg hover:shadow-cyber-green-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Starting...' : '▶️ Start Match'}
          </button>
        )}

        {match.status === 'ongoing' && (
          <button
            onClick={handleEndMatch}
            disabled={loading}
            className="w-full px-6 py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg font-rajdhani font-bold text-lg hover:shadow-lg hover:shadow-red-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Ending...' : '⏹️ End Match'}
          </button>
        )}
      </div>

      {/* Score Update Form */}
      {match.status === 'ongoing' && (
        <motion.form
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleUpdateScore}
          className="space-y-4"
        >
          <div className="border-t border-cyber-blue-500/30 pt-6">
            <h3 className="font-rajdhani text-lg font-semibold text-white mb-4">
              📊 Update Player Score
            </h3>

            {/* Player Selection */}
            <div className="mb-4">
              <label className="block font-rajdhani text-sm font-semibold text-gray-400 mb-2">
                Select Player
              </label>
              <select
                value={selectedPlayer}
                onChange={(e) => setSelectedPlayer(e.target.value)}
                className="w-full px-4 py-3 glass border border-cyber-blue-500/30 rounded-lg font-rajdhani text-white focus:outline-none focus:border-cyber-blue-500 transition-colors duration-300"
                required
              >
                <option value="" className="bg-dark-surface">Choose a player...</option>
                {match.players?.map((player) => (
                  <option key={player._id} value={player._id} className="bg-dark-surface">
                    {player.name} - Current Score: {match.scores?.get(player._id) || 0}
                  </option>
                ))}
              </select>
            </div>

            {/* Score Input */}
            <div className="mb-4">
              <label className="block font-rajdhani text-sm font-semibold text-gray-400 mb-2">
                New Score
              </label>
              <input
                type="number"
                min="0"
                value={scoreValue}
                onChange={(e) => setScoreValue(e.target.value)}
                placeholder="Enter score..."
                className="w-full px-4 py-3 glass border border-cyber-blue-500/30 rounded-lg font-rajdhani text-white focus:outline-none focus:border-cyber-blue-500 transition-colors duration-300"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading || !selectedPlayer || !scoreValue}
              className="w-full px-6 py-3 bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 text-white rounded-lg font-rajdhani font-bold hover:shadow-lg hover:shadow-cyber-blue-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '⏳ Updating...' : '✅ Update Score'}
            </button>
          </div>
        </motion.form>
      )}

      {/* Status Message */}
      <div className="mt-6 p-4 glass rounded-lg border border-cyber-green-500/30">
        <div className="flex items-center gap-2 text-sm font-rajdhani">
          <span className="text-gray-400">Match Status:</span>
          <span className="font-bold text-cyber-green-500 uppercase">{match.status}</span>
        </div>
        {match.status === 'upcoming' && (
          <p className="text-xs text-gray-400 mt-2">
            💡 Click "Start Match" when all players are ready
          </p>
        )}
        {match.status === 'ongoing' && (
          <p className="text-xs text-gray-400 mt-2">
            💡 Update scores in real-time. Click "End Match" when finished.
          </p>
        )}
      </div>
    </motion.div>
  );
}

export default OrganizerMatchPanel;
