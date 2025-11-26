import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getMyCompetitions, deleteCompetition } from '../services/competitionService';
import CreateCompetitionForm from '../components/CreateCompetitionForm';
import TeamRegistrationsModal from '../components/TeamRegistrationsModal';

/**
 * Organizer Dashboard Component
 * Allows organizers to create, view, edit, and delete competitions
 */
function OrganizerDashboard() {
  const { user } = useAuth();

  const [competitions, setCompetitions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);

  // Fetch organizer's competitions
  useEffect(() => {
    fetchCompetitions();
  }, []);

  const fetchCompetitions = async () => {
    try {
      setLoading(true);
      const data = await getMyCompetitions();
      
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

  // Handle successful competition creation
  const handleCompetitionCreated = (newCompetition) => {
    setCompetitions([newCompetition, ...competitions]);
    fetchCompetitions(); // Refresh list
  };

  // Handle competition deletion
  const handleDelete = async (competitionId) => {
    if (!window.confirm('Are you sure you want to delete this competition?')) {
      return;
    }

    try {
      const data = await deleteCompetition(competitionId);
      
      if (data.success) {
        setCompetitions(competitions.filter((comp) => comp._id !== competitionId));
        toast.success('Competition deleted successfully! 🗑️');
      } else {
        toast.error(data.message || 'Failed to delete competition');
      }
    } catch (err) {
      toast.error(err.message || 'Network error. Please try again.');
      console.error('Delete competition error:', err);
    }
  };

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
      case 'cancelled':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  return (
    <div className="min-h-screen bg-dark-bg pt-20">
      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-cyber-purple-500/30 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div>
              <h2 className="font-orbitron text-4xl font-black bg-gradient-to-r from-cyber-purple-500 to-cyber-pink bg-clip-text text-transparent mb-2">
                Welcome, {user?.name}! 👋
              </h2>
              <p className="font-rajdhani text-xl text-gray-400">
                🏆 Manage your competitions and grow your community
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowCreateModal(true)}
              className="btn-cyber px-8 py-4 bg-gradient-to-r from-cyber-purple-500 to-cyber-pink rounded-xl font-orbitron font-bold text-white shadow-neon-purple hover:shadow-neon-pink transition-all duration-300 flex items-center gap-2"
            >
              <span className="text-2xl">+</span>
              Create Competition
            </motion.button>
          </div>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {[
            { label: 'Total Competitions', value: competitions.length, color: 'purple', icon: '🏆' },
            { label: 'Upcoming', value: competitions.filter((c) => c.status === 'upcoming').length, color: 'blue', icon: '📅' },
            { label: 'Ongoing', value: competitions.filter((c) => c.status === 'ongoing').length, color: 'green', icon: '⚡' },
            { label: 'Total Participants', value: competitions.reduce((sum, c) => sum + (c.participants?.length || 0), 0), color: 'pink', icon: '👥' },
          ].map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className={`glass rounded-xl border border-cyber-${stat.color}-500/30 p-6 hover:border-cyber-${stat.color}-500 transition-all duration-300`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl">{stat.icon}</div>
                <div className={`text-4xl font-orbitron font-black text-cyber-${stat.color}-500`}>
                  {stat.value}
                </div>
              </div>
              <div className="font-rajdhani text-sm text-gray-400">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* Competitions List */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-2xl border border-cyber-blue-500/30 p-8"
        >
          <h3 className="font-orbitron text-3xl font-bold bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 bg-clip-text text-transparent mb-6">
            Your Competitions
          </h3>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyber-blue-500 border-t-transparent"></div>
            </div>
          )}

          {/* Empty State */}
          {!loading && competitions.length === 0 && (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="text-center py-12"
            >
              <div className="text-6xl mb-4 animate-float">🎮</div>
              <h3 className="font-orbitron text-2xl font-bold text-white mb-2">
                No competitions yet
              </h3>
              <p className="font-rajdhani text-gray-400 mb-6">
                Create your first competition to get started!
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="btn-cyber px-8 py-3 bg-gradient-to-r from-cyber-purple-500 to-cyber-pink rounded-lg font-orbitron font-bold text-white shadow-neon-purple"
              >
                Create Competition
              </motion.button>
            </motion.div>
          )}

          {/* Competitions Grid */}
          {!loading && competitions.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {competitions.map((competition, index) => (
                <motion.div
                  key={competition._id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className="glass border border-cyber-blue-500/30 rounded-xl p-6 hover:border-cyber-blue-500 transition-all duration-300"
                >
                  {/* Status Badge */}
                  <div className="flex justify-between items-start mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-orbitron font-bold uppercase border ${getStatusColor(
                        competition.status
                      )}`}
                    >
                      {competition.status}
                    </span>
                    <span className="text-sm font-rajdhani font-semibold text-cyber-purple-500">{competition.gameType}</span>
                  </div>

                  {/* Title */}
                  <h4 className="font-orbitron text-lg font-bold text-white mb-2">
                    {competition.title}
                  </h4>

                  {/* Description */}
                  <p className="font-rajdhani text-sm text-gray-400 mb-4 line-clamp-2">
                    {competition.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="font-rajdhani text-gray-400">Entry Fee:</span>
                      <span className="font-rajdhani font-bold text-cyber-green-500">
                        ₹{competition.entryFee}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-rajdhani text-gray-400">Participants:</span>
                      <span className="font-rajdhani font-bold text-cyber-blue-500">
                        {competition.participants?.length || 0}/{competition.maxPlayers}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="font-rajdhani text-gray-400">Start Time:</span>
                      <span className="font-rajdhani font-semibold text-white text-xs">
                        {formatDate(competition.startTime)}
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => {
                        setSelectedCompetition(competition);
                        setShowParticipantsModal(true);
                      }}
                      className="flex-1 px-4 py-2 bg-cyber-blue-500/20 border border-cyber-blue-500 text-cyber-blue-500 rounded-lg hover:bg-cyber-blue-500/30 font-rajdhani font-bold text-sm"
                    >
                      Players ({competition.participants?.length || 0})
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleDelete(competition._id)}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-red-500 to-pink-500 text-white rounded-lg font-rajdhani font-bold text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={competition.participants?.length > 0}
                    >
                      Delete
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {/* Create Competition Modal */}
      <CreateCompetitionForm
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCompetitionCreated}
      />

      {/* Team Registrations Modal */}
      <TeamRegistrationsModal
        isOpen={showParticipantsModal}
        onClose={() => {
          setShowParticipantsModal(false);
          setSelectedCompetition(null);
        }}
        competition={selectedCompetition}
      />
    </div>
  );
}

export default OrganizerDashboard;
