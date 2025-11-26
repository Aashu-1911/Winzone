import { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, XCircle, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import competitionService from '../services/competitionService';
import { motion, AnimatePresence } from 'framer-motion';

const TeamRegistrationsModal = ({ competition, isOpen, onClose }) => {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ pending: 0, verified: 0, rejected: 0, total: 0 });
  const [expandedTeam, setExpandedTeam] = useState(null);
  const [verifyingId, setVerifyingId] = useState(null);
  const [battleCredentials, setBattleCredentials] = useState({});

  const fetchRegistrations = async () => {
    if (!competition?._id) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching registrations for competition:', competition._id);
      const response = await competitionService.getCompetitionRegistrations(competition._id);
      
      console.log('Registrations response:', response);
      
      if (response.success) {
        setRegistrations(response.data || []);
        setStats(response.stats || { pending: 0, verified: 0, rejected: 0, total: 0 });
      } else {
        setError(response.message || 'Failed to load registrations');
      }
    } catch (err) {
      console.error('Error fetching registrations:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Failed to load registrations';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && competition) {
      fetchRegistrations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, competition]);

  const handleVerify = async (registrationId) => {
    setVerifyingId(registrationId);
    
    try {
      const creds = battleCredentials[registrationId] || {};
      const response = await competitionService.verifyRegistration(
        competition._id,
        registrationId,
        {
          battleRoomID: creds.battleRoomID || competition.gameRoomID,
          battleRoomPassword: creds.battleRoomPassword || competition.gameRoomPassword,
          timeSlot: creds.timeSlot || ''
        }
      );

      if (response.success) {
        toast.success('Registration verified successfully! ✅');
        await fetchRegistrations();
        setBattleCredentials(prev => {
          const newCreds = { ...prev };
          delete newCreds[registrationId];
          return newCreds;
        });
      }
    } catch (err) {
      console.error('Verify error:', err);
      toast.error(err.message || 'Failed to verify registration');
    } finally {
      setVerifyingId(null);
    }
  };

  const handleReject = async (registrationId) => {
    const reason = window.prompt('Enter rejection reason (optional):');
    if (reason === null) return; // User cancelled

    try {
      const response = await competitionService.rejectRegistration(
        competition._id,
        registrationId,
        reason
      );

      if (response.success) {
        toast.success('Registration rejected');
        await fetchRegistrations();
      }
    } catch (err) {
      console.error('Reject error:', err);
      toast.error(err.message || 'Failed to reject registration');
    }
  };

  const updateBattleCredentials = (registrationId, field, value) => {
    setBattleCredentials(prev => ({
      ...prev,
      [registrationId]: {
        ...(prev[registrationId] || {}),
        [field]: value
      }
    }));
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return 'bg-cyber-green-500/20 text-cyber-green-500 border-cyber-green-500/50';
      case 'rejected':
        return 'bg-red-500/20 text-red-500 border-red-500/50';
      default:
        return 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50';
    }
  };

  if (!isOpen || !competition) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto border border-cyber-blue-500/50 shadow-neon-blue">
        {/* Header */}
        <div className="sticky top-0 glass-darker border-b border-cyber-blue-500/50 px-6 py-4 flex justify-between items-center backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold font-orbitron bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 bg-clip-text text-transparent">
              Team Registrations
            </h2>
            <p className="font-rajdhani text-sm text-gray-400 mt-1">{competition.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-cyber-green-500 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Total', value: stats.total, color: 'blue', icon: '📊' },
              { label: 'Pending', value: stats.pending, color: 'yellow', icon: '⏳' },
              { label: 'Verified', value: stats.verified, color: 'green', icon: '✅' },
              { label: 'Rejected', value: stats.rejected, color: 'red', icon: '❌' },
            ].map((stat) => (
              <div
                key={stat.label}
                className={`glass-darker border border-cyber-${stat.color}-500/30 rounded-xl p-4`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-rajdhani text-sm text-gray-400">{stat.label}</p>
                    <p className="font-orbitron text-3xl font-bold text-white">{stat.value}</p>
                  </div>
                  <div className="text-3xl">{stat.icon}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyber-blue-500 border-t-transparent"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="glass-darker border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <div className="flex-1">
                <p className="font-rajdhani text-sm text-red-400">{error}</p>
                <button
                  onClick={fetchRegistrations}
                  className="mt-3 px-4 py-2 bg-red-500/20 border border-red-500 text-red-400 rounded-lg hover:bg-red-500/30 font-rajdhani font-bold"
                >
                  Retry
                </button>
              </div>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && registrations.length === 0 && (
            <div className="glass-darker border border-cyber-blue-500/30 rounded-xl p-12 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="font-rajdhani text-gray-400 text-lg">No registrations yet</p>
              <p className="font-rajdhani text-sm text-gray-500 mt-2">
                Teams who register will appear here for verification
              </p>
            </div>
          )}

          {/* Registrations List */}
          {!loading && !error && registrations.length > 0 && (
            <div className="space-y-4">
              {registrations.map((registration) => (
                <div
                  key={registration._id}
                  className={`glass border rounded-xl overflow-hidden ${
                    registration.status === 'verified'
                      ? 'border-cyber-green-500/50'
                      : registration.status === 'rejected'
                      ? 'border-red-500/50'
                      : 'border-cyber-blue-500/30'
                  }`}
                >
                  {/* Registration Header */}
                  <div className="p-4 flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-orbitron text-lg font-bold text-white">
                          {registration.teamName || registration.playerId?.name || 'Unknown'}
                        </h4>
                        <span
                          className={`px-3 py-1 rounded-lg text-xs font-rajdhani font-bold uppercase border ${getStatusBadge(
                            registration.status
                          )}`}
                        >
                          {registration.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm font-rajdhani text-gray-400">
                        <span>👤 {registration.playerId?.name}</span>
                        <span>📧 {registration.playerId?.email}</span>
                        <span>🎮 {registration.inGamePlayerID}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => setExpandedTeam(expandedTeam === registration._id ? null : registration._id)}
                      className="px-4 py-2 glass border border-cyber-blue-500/30 rounded-lg font-rajdhani font-bold text-cyber-blue-500 hover:border-cyber-blue-500 transition-all"
                    >
                      {expandedTeam === registration._id ? 'Hide Details' : 'View Details'}
                    </button>
                  </div>

                  {/* Expanded Team Details */}
                  <AnimatePresence>
                    {expandedTeam === registration._id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                        className="border-t border-cyber-blue-500/30 overflow-hidden"
                      >
                        <div className="p-4 space-y-4">
                          {/* Team Members */}
                          {registration.teamMembers && registration.teamMembers.length > 0 && (
                            <div>
                              <h5 className="font-orbitron font-semibold text-white mb-3">
                                Team Members ({registration.teamMembers.length})
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {registration.teamMembers.map((member, index) => (
                                  <div
                                    key={index}
                                    className="glass-darker border border-cyber-purple-500/30 rounded-lg p-3"
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-10 h-10 bg-cyber-purple-500/20 text-cyber-purple-500 rounded-full flex items-center justify-center font-bold font-orbitron">
                                        {member.name?.charAt(0).toUpperCase() || '?'}
                                      </div>
                                      <div className="flex-1">
                                        <p className="font-rajdhani font-semibold text-white">
                                          {member.name}
                                        </p>
                                        <p className="font-rajdhani text-xs text-gray-400">
                                          {member.role} • ID: {member.inGameID}
                                        </p>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Battle Credentials (for verified teams) */}
                          {registration.status === 'verified' && (
                            <div className="glass-darker border border-cyber-green-500/30 rounded-lg p-4">
                              <h5 className="font-orbitron font-semibold text-cyber-green-500 mb-3">
                                Battle Credentials
                              </h5>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-rajdhani">
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Room ID</p>
                                  <p className="text-white font-semibold">
                                    {registration.battleRoomID || 'Not assigned'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Password</p>
                                  <p className="text-white font-semibold">
                                    {registration.battleRoomPassword || 'Not assigned'}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-xs text-gray-400 mb-1">Time Slot</p>
                                  <p className="text-white font-semibold">
                                    {registration.timeSlot || 'Not assigned'}
                                  </p>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Verification Section (for pending) */}
                          {registration.status === 'pending' && (
                            <div className="glass-darker border border-yellow-500/30 rounded-lg p-4">
                              <h5 className="font-orbitron font-semibold text-yellow-500 mb-2">
                                Assign Battle Credentials
                              </h5>
                              <p className="font-rajdhani text-xs text-gray-400 mb-3">
                                {competition.gameRoomID && competition.gameRoomPassword
                                  ? `Default room credentials from competition will be used: Room ID: ${competition.gameRoomID} • Password: ${competition.gameRoomPassword}`
                                  : 'Enter custom room credentials below (optional)'}
                              </p>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                  <label className="block font-rajdhani text-sm font-medium text-gray-300 mb-2">
                                    Room ID {competition.gameRoomID && <span className="text-xs text-gray-500">(Optional - Override)</span>}
                                  </label>
                                  <input
                                    type="text"
                                    value={battleCredentials[registration._id]?.battleRoomID || ''}
                                    onChange={(e) =>
                                      updateBattleCredentials(registration._id, 'battleRoomID', e.target.value)
                                    }
                                    placeholder={competition.gameRoomID || 'Enter room ID'}
                                    className="w-full px-3 py-2 bg-dark-surface border border-yellow-500/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block font-rajdhani text-sm font-medium text-gray-300 mb-2">
                                    Password {competition.gameRoomPassword && <span className="text-xs text-gray-500">(Optional - Override)</span>}
                                  </label>
                                  <input
                                    type="text"
                                    value={battleCredentials[registration._id]?.battleRoomPassword || ''}
                                    onChange={(e) =>
                                      updateBattleCredentials(registration._id, 'battleRoomPassword', e.target.value)
                                    }
                                    placeholder={competition.gameRoomPassword || 'Enter password'}
                                    className="w-full px-3 py-2 bg-dark-surface border border-yellow-500/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                                  />
                                </div>
                                <div>
                                  <label className="block font-rajdhani text-sm font-medium text-gray-300 mb-2">
                                    Time Slot <span className="text-xs text-gray-500">(Optional)</span>
                                  </label>
                                  <input
                                    type="text"
                                    value={battleCredentials[registration._id]?.timeSlot || ''}
                                    onChange={(e) =>
                                      updateBattleCredentials(registration._id, 'timeSlot', e.target.value)
                                    }
                                    placeholder="e.g., 2:00 PM - 3:00 PM"
                                    className="w-full px-3 py-2 bg-dark-surface border border-yellow-500/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-yellow-500 transition-colors"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-3">
                                <button
                                  onClick={() => handleVerify(registration._id)}
                                  disabled={verifyingId === registration._id}
                                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 text-white rounded-lg font-rajdhani font-bold hover:shadow-neon-green transition-all disabled:opacity-50"
                                >
                                  {verifyingId === registration._id ? (
                                    <span className="flex items-center justify-center gap-2">
                                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                        <circle
                                          className="opacity-25"
                                          cx="12"
                                          cy="12"
                                          r="10"
                                          stroke="currentColor"
                                          strokeWidth="4"
                                          fill="none"
                                        />
                                        <path
                                          className="opacity-75"
                                          fill="currentColor"
                                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                        />
                                      </svg>
                                      Verifying...
                                    </span>
                                  ) : (
                                    <>
                                      <CheckCircle size={18} className="inline mr-2" />
                                      Verify & Allow
                                    </>
                                  )}
                                </button>
                                <button
                                  onClick={() => handleReject(registration._id)}
                                  className="flex-1 px-4 py-2.5 bg-red-500/20 border border-red-500 text-red-400 rounded-lg font-rajdhani font-bold hover:bg-red-500/30 transition-all"
                                >
                                  <XCircle size={18} className="inline mr-2" />
                                  Reject
                                </button>
                              </div>
                            </div>
                          )}

                          {/* Rejection Reason */}
                          {registration.status === 'rejected' && registration.rejectionReason && (
                            <div className="glass-darker border border-red-500/30 rounded-lg p-4">
                              <h5 className="font-orbitron font-semibold text-red-500 mb-2">
                                Rejection Reason
                              </h5>
                              <p className="font-rajdhani text-gray-400">{registration.rejectionReason}</p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          )}

          {/* Close Button */}
          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-3 glass border border-gray-500/30 text-gray-300 rounded-lg hover:border-gray-400 transition-colors font-rajdhani font-bold"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamRegistrationsModal;
