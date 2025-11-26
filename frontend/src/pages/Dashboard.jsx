import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getMyRegistrations } from '../services/competitionService';
import CompetitionDetailsModal from '../components/CompetitionDetailsModal';
import toast from 'react-hot-toast';

function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [registeredCompetitions, setRegisteredCompetitions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCompetition, setSelectedCompetition] = useState(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);

  const getRoleContent = () => {
    switch (user?.role) {
      case 'organizer':
        return {
          title: '🎯 Organizer Dashboard',
          description: 'Manage tournaments and events',
          gradient: 'from-cyber-purple-500 to-cyber-pink',
          icon: '🎯',
          features: [
            'Create and manage tournaments',
            'Track participant registrations',
            'Monitor competition status',
            'Manage prize pools',
            'View competition analytics',
            'Update tournament details',
          ],
        };
      case 'player':
        return {
          title: '🎮 Player Dashboard',
          description: 'Browse and join live tournaments',
          gradient: 'from-cyber-green-500 to-cyber-blue-500',
          icon: '🎮',
          features: [
            'Browse live competitions',
            'Register for tournaments',
            'Track your registrations',
            'View competition schedules',
            'Manage wallet balance',
            'Check leaderboards',
          ],
        };
      case 'admin':
        return {
          title: '👑 Admin Dashboard',
          description: 'Manage the entire platform',
          gradient: 'from-red-500 to-pink-500',
          icon: '👑',
          features: [
            'Manage all users',
            'Oversee all competitions',
            'Platform analytics',
            'User verification',
            'Handle disputes',
            'System configuration',
          ],
        };
      default:
        return {
          title: '📊 Dashboard',
          description: 'Welcome to WinZone',
          gradient: 'from-cyber-blue-500 to-cyber-purple-500',
          icon: '📊',
          features: [
            'Access platform features',
            'View competitions',
            'Manage your profile',
            'Track activities',
          ],
        };
    }
  };

  // Fetch registered competitions for players
  useEffect(() => {
    if (user?.role === 'player') {
      fetchRegisteredCompetitions();
    }
  }, [user]);

  const fetchRegisteredCompetitions = async () => {
    try {
      setLoading(true);
      const data = await getMyRegistrations();
      if (data.success) {
        setRegisteredCompetitions(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching registered competitions:', error);
      toast.error(error.message || 'Failed to load registered competitions');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (competition) => {
    setSelectedCompetition(competition);
    setIsDetailsModalOpen(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-500 border-blue-500';
      case 'ongoing':
        return 'bg-green-500/20 text-green-500 border-green-500';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
      default:
        return 'bg-purple-500/20 text-purple-500 border-purple-500';
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  };

  const roleContent = getRoleContent();

  return (
    <div className="min-h-screen bg-dark-bg pt-20">
      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl border border-cyber-blue-500/30 p-8 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between mb-6 gap-4">
            <div>
              <h2 className="font-orbitron text-4xl font-black bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 bg-clip-text text-transparent mb-2">
                Welcome back, {user?.name}! 👋
              </h2>
              <p className="font-rajdhani text-xl text-gray-400">
                You are logged in as a <span className="font-bold text-cyber-green-500 capitalize">{user?.role}</span>
              </p>
            </div>
            <motion.div
              whileHover={{ scale: 1.05, rotate: 5 }}
              className={`px-6 py-3 rounded-xl bg-gradient-to-r ${roleContent.gradient} shadow-neon-blue`}
            >
              <span className="font-orbitron text-lg font-bold text-white uppercase">
                {user?.role}
              </span>
            </motion.div>
          </div>

          {/* User Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
            {[
              { label: 'Email', value: user?.email, icon: '📧' },
              { label: 'College', value: user?.collegeName || 'Not specified', icon: '🏫' },
              { label: 'Wallet Balance', value: `₹${user?.walletBalance?.toFixed(2) || '0.00'}`, icon: '💰' },
              { label: 'Member Since', value: user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A', icon: '📅' },
            ].map((detail, index) => (
              <motion.div
                key={detail.label}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -5 }}
                className="glass rounded-xl border border-cyber-green-500/30 p-6"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl">{detail.icon}</span>
                  <p className="font-rajdhani text-sm text-gray-400">{detail.label}</p>
                </div>
                <p className="font-orbitron text-lg font-bold text-white">{detail.value}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Role-Specific Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-2xl border border-cyber-purple-500/30 p-8"
        >
          <div className="flex items-center gap-4 mb-6">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-5xl"
            >
              {roleContent.icon}
            </motion.div>
            <div>
              <h3 className={`font-orbitron text-3xl font-bold bg-gradient-to-r ${roleContent.gradient} bg-clip-text text-transparent mb-2`}>
                {roleContent.title}
              </h3>
              <p className="font-rajdhani text-xl text-gray-400">{roleContent.description}</p>
            </div>
          </div>

          {/* Features List */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {roleContent.features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                whileHover={{ x: 5 }}
                className="glass rounded-lg border border-cyber-blue-500/30 p-4 flex items-center gap-3 hover:border-cyber-blue-500 transition-all duration-300"
              >
                <span className="text-2xl text-cyber-green-500">✓</span>
                <span className="font-rajdhani text-lg font-semibold text-white">
                  {feature}
                </span>
              </motion.div>
            ))}
          </div>

          {/* Call to Action Button */}
          {user?.role === 'player' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/competitions')}
              className="w-full py-4 bg-gradient-to-r from-cyber-green-500 via-cyber-blue-500 to-cyber-purple-500 text-white rounded-xl font-orbitron font-bold text-lg shadow-neon-blue hover:shadow-neon-green transition-all duration-300"
            >
              🎮 Browse & Join Live Tournaments →
            </motion.button>
          )}

          {user?.role === 'organizer' && (
            <motion.button
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/organizer-dashboard')}
              className="w-full py-4 bg-gradient-to-r from-cyber-purple-500 via-cyber-pink to-cyber-blue-500 text-white rounded-xl font-orbitron font-bold text-lg shadow-neon-purple hover:shadow-neon-blue transition-all duration-300"
            >
              🎯 Manage Your Tournaments →
            </motion.button>
          )}
        </motion.div>

        {/* My Registrations Section (Player Only) */}
        {user?.role === 'player' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl border border-cyber-green-500/30 p-8"
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="font-orbitron text-3xl font-bold text-white mb-2">
                  🎯 My Registered Tournaments
                </h3>
                <p className="font-rajdhani text-lg text-gray-400">
                  Tournaments you have registered for
                </p>
              </div>
              {registeredCompetitions.length > 0 && (
                <span className="px-4 py-2 bg-cyan-500/20 text-cyan-400 rounded-lg font-rajdhani font-bold border border-cyan-500">
                  {registeredCompetitions.length} Active
                </span>
              )}
            </div>

            {/* Loading State */}
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
              </div>
            )}

            {/* Empty State */}
            {!loading && registeredCompetitions.length === 0 && (
              <div className="bg-gray-800/30 border border-cyan-500/20 rounded-xl p-12 text-center">
                <div className="text-6xl mb-4 animate-float">🎮</div>
                <h4 className="font-orbitron text-xl font-bold text-white mb-2">
                  No Registered Tournaments
                </h4>
                <p className="font-rajdhani text-gray-400 mb-6">
                  You haven&apos;t registered for any tournaments yet. Browse and join competitions to get started!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/competitions')}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-lg font-rajdhani font-bold shadow-neon-blue"
                >
                  Browse Tournaments
                </motion.button>
              </div>
            )}

            {/* Registered Competitions Grid */}
            {!loading && registeredCompetitions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {registeredCompetitions.map((registration, index) => {
                  const competition = registration.competitionId;
                  if (!competition) return null;
                  
                  return (
                  <motion.div
                    key={registration._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -5 }}
                    className={`glass border rounded-xl p-6 transition-all duration-300 ${
                      registration.status === 'verified'
                        ? 'border-cyber-green-500/50 bg-cyber-green-500/5'
                        : registration.status === 'rejected'
                        ? 'border-red-500/50 bg-red-500/5'
                        : 'border-yellow-500/50 bg-yellow-500/5'
                    }`}
                  >
                    {/* Status Badges */}
                    <div className="flex justify-between items-start mb-4 gap-2">
                      <span className={`px-3 py-1 rounded-lg text-xs font-rajdhani font-bold uppercase border ${getStatusColor(competition.status)}`}>
                        {competition.status}
                      </span>
                      <span className={`px-3 py-1 rounded-lg text-xs font-rajdhani font-bold uppercase border ${
                        registration.status === 'verified'
                          ? 'bg-cyber-green-500/20 text-cyber-green-500 border-cyber-green-500/50'
                          : registration.status === 'rejected'
                          ? 'bg-red-500/20 text-red-500 border-red-500/50'
                          : 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50'
                      }`}>
                        {registration.status === 'verified' ? '✅ Verified' : registration.status === 'rejected' ? '❌ Rejected' : '⏳ Pending'}
                      </span>
                    </div>

                    {/* Title */}
                    <h4 className="font-orbitron text-lg font-bold text-white mb-2 line-clamp-1">
                      {competition.title}
                    </h4>

                    {/* Team Name (if team competition) */}
                    {registration.teamName && (
                      <p className="text-sm font-rajdhani text-cyber-purple-500 mb-2">
                        👥 {registration.teamName}
                      </p>
                    )}

                    {/* Game Type */}
                    <p className="text-sm font-rajdhani text-cyan-400 mb-3">
                      🎮 {competition.gameType}
                    </p>

                    {/* Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-sm">
                        <span className="font-rajdhani text-gray-400">Prize Pool</span>
                        <span className="font-rajdhani font-bold text-cyan-400">₹{competition.prizePool}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="font-rajdhani text-gray-400">Starts</span>
                        <span className="font-rajdhani text-white text-xs">
                          {formatDate(competition.startTime)}
                        </span>
                      </div>
                    </div>

                    {/* Battle Credentials (for verified registrations) */}
                    {registration.status === 'verified' && registration.battleRoomID && (
                      <div className="glass-darker border border-cyber-green-500/30 rounded-lg p-3 mb-4">
                        <h5 className="font-orbitron text-xs font-bold text-cyber-green-500 mb-2">
                          🎯 Battle Credentials
                        </h5>
                        <div className="space-y-1 text-xs font-rajdhani">
                          <div className="flex justify-between">
                            <span className="text-gray-400">Room ID:</span>
                            <span className="text-white font-bold">{registration.battleRoomID}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-gray-400">Password:</span>
                            <span className="text-white font-bold">{registration.battleRoomPassword}</span>
                          </div>
                          {registration.timeSlot && (
                            <div className="flex justify-between">
                              <span className="text-gray-400">Time Slot:</span>
                              <span className="text-white font-bold">{registration.timeSlot}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Rejection Reason */}
                    {registration.status === 'rejected' && registration.rejectionReason && (
                      <div className="glass-darker border border-red-500/30 rounded-lg p-3 mb-4">
                        <h5 className="font-orbitron text-xs font-bold text-red-500 mb-1">
                          Rejection Reason
                        </h5>
                        <p className="text-xs font-rajdhani text-gray-400">{registration.rejectionReason}</p>
                      </div>
                    )}

                    {/* Action Button */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(competition);
                      }}
                      className={`w-full py-2 rounded-lg font-rajdhani font-bold transition-all ${
                        registration.status === 'verified' && competition.status === 'ongoing'
                          ? 'bg-gradient-to-r from-green-500 to-cyan-500 text-white shadow-neon-green animate-pulse'
                          : registration.status === 'verified'
                          ? 'bg-cyan-500/20 border border-cyan-500 text-cyan-400 hover:bg-cyan-500/30'
                          : registration.status === 'pending'
                          ? 'bg-yellow-500/20 border border-yellow-500 text-yellow-400'
                          : 'bg-red-500/20 border border-red-500 text-red-400'
                      }`}
                      disabled={registration.status === 'rejected'}
                    >
                      {registration.status === 'verified' && competition.status === 'ongoing'
                        ? '▶ Join Now'
                        : registration.status === 'verified'
                        ? '✓ Verified - Ready'
                        : registration.status === 'pending'
                        ? '⏳ Awaiting Approval'
                        : '❌ Registration Rejected'}
                    </motion.button>
                  </motion.div>
                )})}
              </div>
            )}
          </motion.div>
        )}
      </main>

      {/* Competition Details Modal */}
      <CompetitionDetailsModal
        isOpen={isDetailsModalOpen}
        onClose={() => {
          setIsDetailsModalOpen(false);
          setSelectedCompetition(null);
        }}
        competition={selectedCompetition}
        isRegistered={true}
      />
    </div>
  );
}

export default Dashboard;
