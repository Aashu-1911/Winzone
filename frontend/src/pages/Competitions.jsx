import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getAllCompetitions } from '../services/competitionService';
import TournamentRegistrationModal from '../components/TournamentRegistrationModal';

function Competitions() {
  const navigate = useNavigate();
  const { user, fetchCurrentUser } = useAuth();

  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // all, upcoming, ongoing
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGame, setSelectedGame] = useState('all');
  const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  // Fetch all competitions on mount
  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const data = await getAllCompetitions();
      
      if (data.success && Array.isArray(data.data)) {
        setCompetitions(data.data);
      }
    } catch (err) {
      console.error('Fetch competitions error:', err);
      toast.error(err.message || 'Failed to fetch competitions');
    } finally {
      setLoading(false);
    }
  };

  // Filter competitions
  const getFilteredCompetitions = () => {
    let filtered = competitions;

    // Filter by status
    if (filter === 'all') {
      filtered = filtered.filter(comp => comp.status !== 'completed' && comp.status !== 'cancelled');
    } else {
      filtered = filtered.filter(comp => comp.status === filter);
    }

    // Filter by game type
    if (selectedGame !== 'all') {
      filtered = filtered.filter(comp => comp.gameType === selectedGame);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(comp => 
        comp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        comp.gameType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const filteredCompetitions = getFilteredCompetitions();

  // Get unique game types
  const gameTypes = ['all', ...new Set(competitions.map(comp => comp.gameType))];

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-cyber-blue-500/20 text-cyber-blue-500 border-cyber-blue-500/50';
      case 'ongoing':
        return 'bg-cyber-green-500/20 text-cyber-green-500 border-cyber-green-500/50';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
      default:
        return 'bg-cyber-purple-500/20 text-cyber-purple-500 border-cyber-purple-500/50';
    }
  };

  // Handle competition registration
  const handleRegister = async (competition) => {
    if (!user) {
      toast.error('Please login to register for competitions');
      navigate('/login');
      return;
    }

    if (user.role !== 'player') {
      toast.error('Only players can register for competitions');
      return;
    }

    // Open registration modal
    setSelectedCompetition(competition);
    setIsRegistrationModalOpen(true);
  };

  const handleRegistrationSuccess = async () => {
    // Close modal
    setIsRegistrationModalOpen(false);
    setSelectedCompetition(null);
    
    // Refresh user data to update wallet balance
    await fetchCurrentUser();
    
    // Refresh competitions to show updated participant count
    await fetchCompetitions();
  };

  return (
    <div className="min-h-screen bg-dark-bg pt-20">
      <main className="container mx-auto px-4 py-8">
        {/* Page Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="font-orbitron text-5xl font-black bg-gradient-to-r from-cyber-blue-500 via-cyber-purple-500 to-cyber-pink bg-clip-text text-transparent mb-4">
            🎮 Live Competitions
          </h1>
          <p className="font-rajdhani text-xl text-gray-400">
            Browse and register for tournaments happening now!
          </p>
        </motion.div>

        {/* Filters Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl border border-cyber-blue-500/30 p-6 mb-8"
        >
          {/* Search Bar */}
          <div className="mb-6">
            <input
              type="text"
              placeholder="🔍 Search competitions by name, description, or game..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 bg-dark-surface border border-cyber-blue-500/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue-500 transition-colors"
            />
          </div>

          {/* Status Filters */}
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="font-rajdhani font-semibold text-gray-400">Status:</span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('all')}
              className={`px-4 py-2 rounded-lg font-rajdhani font-semibold transition-all duration-300 ${
                filter === 'all'
                  ? 'bg-cyber-blue-500 text-white shadow-neon-blue'
                  : 'glass border border-cyber-blue-500/30 text-gray-400 hover:text-white'
              }`}
            >
              All
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('upcoming')}
              className={`px-4 py-2 rounded-lg font-rajdhani font-semibold transition-all duration-300 ${
                filter === 'upcoming'
                  ? 'bg-cyber-blue-500 text-white shadow-neon-blue'
                  : 'glass border border-cyber-blue-500/30 text-gray-400 hover:text-white'
              }`}
            >
              Upcoming
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setFilter('ongoing')}
              className={`px-4 py-2 rounded-lg font-rajdhani font-semibold transition-all duration-300 ${
                filter === 'ongoing'
                  ? 'bg-cyber-green-500 text-white shadow-neon-green'
                  : 'glass border border-cyber-green-500/30 text-gray-400 hover:text-white'
              }`}
            >
              🔴 Live Now
            </motion.button>
          </div>

          {/* Game Type Filters */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-rajdhani font-semibold text-gray-400">Game:</span>
            {gameTypes.map((game) => (
              <motion.button
                key={game}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setSelectedGame(game)}
                className={`px-4 py-2 rounded-lg font-rajdhani font-semibold transition-all duration-300 capitalize ${
                  selectedGame === game
                    ? 'bg-cyber-purple-500 text-white shadow-neon-purple'
                    : 'glass border border-cyber-purple-500/30 text-gray-400 hover:text-white'
                }`}
              >
                {game}
              </motion.button>
            ))}
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-cyber-blue-500/20">
            <p className="font-rajdhani text-gray-400">
              Showing <span className="text-cyber-green-500 font-bold">{filteredCompetitions.length}</span> competition{filteredCompetitions.length !== 1 ? 's' : ''}
            </p>
          </div>
        </motion.div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyber-blue-500 border-t-transparent mx-auto mb-4"></div>
              <p className="font-rajdhani text-xl text-gray-400">Loading competitions...</p>
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredCompetitions.length === 0 && (
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="glass rounded-2xl border border-cyber-blue-500/30 p-12 text-center"
          >
            <div className="text-6xl mb-4 animate-float">🎮</div>
            <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
              No competitions found
            </h3>
            <p className="font-rajdhani text-gray-400 mb-6">
              {searchTerm || selectedGame !== 'all' 
                ? 'Try adjusting your filters or search term' 
                : 'Check back later for new tournaments!'}
            </p>
            {(searchTerm || selectedGame !== 'all') && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSearchTerm('');
                  setSelectedGame('all');
                  setFilter('all');
                }}
                className="px-6 py-3 bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 text-white rounded-lg font-rajdhani font-bold shadow-neon-blue"
              >
                Clear Filters
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Competitions Grid */}
        {!loading && filteredCompetitions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCompetitions.map((competition, index) => {
              const isRegistered = competition.participants?.some(
                (participant) => participant._id === user?._id || participant === user?._id
              );
              const isFull = competition.participants?.length >= competition.maxPlayers;
              
              return (
              <motion.div
                key={competition._id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -5 }}
                className={`glass border rounded-xl p-6 hover:border-cyber-blue-500 transition-all duration-300 ${
                  isRegistered ? 'border-cyber-green-500/50 bg-cyber-green-500/5' : 'border-cyber-blue-500/30'
                }`}
              >
                {/* Competition Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-orbitron text-xl font-bold text-white line-clamp-1">
                        {competition.title}
                      </h4>
                      {isRegistered && (
                        <span className="px-2 py-1 bg-cyber-green-500/20 text-cyber-green-500 rounded text-xs font-rajdhani font-bold">
                          ✓ JOINED
                        </span>
                      )}
                    </div>
                    <p className="font-rajdhani text-sm text-gray-400 mb-2">
                      by {competition.organizerId?.name || 'Unknown'}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-lg text-xs font-rajdhani font-bold uppercase border ${getStatusColor(
                      competition.status
                    )}`}
                  >
                    {competition.status}
                  </span>
                </div>

                {/* Game Type Badge */}
                <div className="mb-4">
                  <span className="px-3 py-1 bg-cyber-purple-500/20 text-cyber-purple-500 rounded-lg text-sm font-rajdhani font-semibold">
                    🎮 {competition.gameType}
                  </span>
                </div>

                {/* Competition Details */}
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-rajdhani text-gray-400">Entry Fee</span>
                    <span className="font-orbitron font-bold text-cyber-green-500">
                      ₹{competition.entryFee}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-rajdhani text-gray-400">Prize Pool</span>
                    <span className="font-orbitron font-bold text-cyber-blue-500">
                      ₹{competition.prizePool}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-rajdhani text-gray-400">Players</span>
                    <span className={`font-rajdhani font-semibold ${isFull ? 'text-red-500' : 'text-white'}`}>
                      {competition.participants?.length || 0}/{competition.maxPlayers}
                      {isFull && ' (FULL)'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-rajdhani text-gray-400">Start Time</span>
                    <span className="font-rajdhani text-white text-xs">
                      {formatDate(competition.startTime)}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <p className="font-rajdhani text-sm text-gray-400 mb-4 line-clamp-2">
                  {competition.description}
                </p>

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {user?.role === 'player' && (
                    <motion.button
                      whileHover={{ scale: isRegistered || competition.status !== 'upcoming' || isFull ? 1 : 1.02 }}
                      whileTap={{ scale: isRegistered || competition.status !== 'upcoming' || isFull ? 1 : 0.98 }}
                      onClick={() => !isRegistered && competition.status === 'upcoming' && !isFull && handleRegister(competition)}
                      disabled={isRegistered || competition.status !== 'upcoming' || isFull}
                      className={`flex-1 py-2 rounded-lg font-rajdhani font-bold transition-all duration-300 ${
                        isRegistered
                          ? 'bg-cyber-green-500/20 text-cyber-green-500 border border-cyber-green-500/50 cursor-default'
                          : competition.status === 'upcoming' && !isFull
                          ? 'bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 text-white shadow-neon-green hover:shadow-neon-blue cursor-pointer'
                          : 'bg-gray-500/20 text-gray-500 cursor-not-allowed'
                      }`}
                    >
                      {isRegistered 
                        ? '✓ Registered' 
                        : competition.status === 'upcoming' 
                          ? isFull ? '⚠️ Full' : '➤ Register Now'
                          : competition.status === 'ongoing' 
                          ? '🔴 Live' 
                          : 'Closed'}
                    </motion.button>
                  )}
                  {!user && (
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate('/login')}
                      className="flex-1 py-2 rounded-lg font-rajdhani font-bold bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 text-white shadow-neon-green hover:shadow-neon-blue transition-all duration-300"
                    >
                      Login to Register
                    </motion.button>
                  )}
                  {user?.role !== 'player' && user && (
                    <div className="flex-1 py-2 rounded-lg font-rajdhani font-bold bg-gray-500/20 text-gray-500 text-center">
                      Players Only
                    </div>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="px-4 py-2 glass border border-cyber-blue-500/30 rounded-lg font-rajdhani font-semibold text-cyber-blue-500 hover:border-cyber-blue-500 transition-all duration-300"
                  >
                    Details
                  </motion.button>
                </div>
              </motion.div>
            )})}
          </div>
        )}
      </main>

      {/* Tournament Registration Modal */}
      <TournamentRegistrationModal
        isOpen={isRegistrationModalOpen}
        onClose={() => {
          setIsRegistrationModalOpen(false);
          setSelectedCompetition(null);
        }}
        competition={selectedCompetition}
        onSuccess={handleRegistrationSuccess}
      />
    </div>
  );
}

export default Competitions;
