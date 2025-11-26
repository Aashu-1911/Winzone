import { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import competitionService from '../services/competitionService';
import { useAuth } from '../context/AuthContext';

const TournamentRegistrationModal = ({ competition, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [inGamePlayerID, setInGamePlayerID] = useState('');
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const teamSize = competition?.teamSize || 1;
  const isTeamCompetition = teamSize > 1;

  // Initialize team members when modal opens or teamSize changes
  useEffect(() => {
    if (isOpen && isTeamCompetition && competition) {
      const initialMembers = Array.from({ length: teamSize - 1 }, (_, i) => ({
        name: '',
        inGameID: '',
        role: `Player ${i + 1}`
      }));
      setTeamMembers(initialMembers);
    }
  }, [isOpen, isTeamCompetition, teamSize, competition]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setInGamePlayerID('');
      setTeamName('');
      setTeamMembers([]);
      setError('');
      setIsProcessing(false);
    }
  }, [isOpen]);

  if (!isOpen || !competition) return null;

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const handleTeamMemberChange = (index, field, value) => {
    const updatedMembers = [...teamMembers];
    updatedMembers[index][field] = value;
    setTeamMembers(updatedMembers);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    // Validate in-game player ID
    if (!inGamePlayerID.trim()) {
      setError('Please enter your in-game player ID');
      setIsProcessing(false);
      return;
    }

    // Validate team details for team competitions
    if (isTeamCompetition) {
      if (!teamName.trim()) {
        setError('Please enter a team name');
        setIsProcessing(false);
        return;
      }

      // Validate all team members have required fields
      for (let i = 0; i < teamMembers.length; i++) {
        if (!teamMembers[i].name.trim() || !teamMembers[i].inGameID.trim()) {
          setError(`Please fill in all details for ${teamMembers[i].role}`);
          setIsProcessing(false);
          return;
        }
      }
    }

    try {
      const loadingToast = toast.loading('Registering for tournament...');

      // Prepare registration data
      const registrationData = {
        inGamePlayerID: inGamePlayerID.trim(),
        ...(isTeamCompetition && {
          teamName: teamName.trim(),
          teamMembers: [
            // Include leader as first team member
            {
              name: user?.name || 'Leader',
              inGameID: inGamePlayerID.trim(),
              role: 'Leader'
            },
            // Include other team members
            ...teamMembers.map(member => ({
              name: member.name.trim(),
              inGameID: member.inGameID.trim(),
              role: member.role
            }))
          ]
        })
      };

      console.log('Registration data:', {
        competitionId: competition._id,
        teamSize: competition.teamSize,
        isTeamCompetition,
        dataBeingSent: registrationData
      });

      // Register for competition
      const result = await competitionService.registerForCompetition(competition._id, registrationData);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || 'Successfully registered! 🎮');

        // Call success callback first
        if (onSuccess) {
          await onSuccess();
        }

        // Close modal after a brief delay to show success message
        setTimeout(() => {
          onClose();
        }, 500);
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      toast.dismiss();
      console.error('Registration error:', err);
      const errorMessage = err.message || err.response?.data?.message || 'Registration failed. Please try again.';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyber-blue-500/50 shadow-neon-blue">
        {/* Header */}
        <div className="sticky top-0 glass-darker border-b border-cyber-blue-500/50 px-6 py-4 flex justify-between items-center backdrop-blur-xl">
          <div>
            <h2 className="text-2xl font-bold font-orbitron bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 bg-clip-text text-transparent">
              Tournament Registration
            </h2>
            <p className="font-rajdhani text-sm text-gray-400 mt-1">{competition.title}</p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-cyber-green-500 text-2xl leading-none transition-colors"
            disabled={isProcessing}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tournament Info */}
          <div className="glass-darker border border-cyber-blue-500/30 rounded-xl p-4">
            <h3 className="font-orbitron font-semibold text-cyber-blue-500 mb-3">Tournament Details</h3>
            <div className="grid grid-cols-2 gap-4 text-sm font-rajdhani">
              <div>
                <span className="text-gray-400">Game Type:</span>
                <span className="ml-2 font-medium text-white">{competition.gameType}</span>
              </div>
              <div>
                <span className="text-gray-400">Entry Fee:</span>
                <span className="ml-2 font-medium text-cyber-green-500">₹{competition.entryFee}</span>
              </div>
              <div>
                <span className="text-gray-400">Team Size:</span>
                <span className="ml-2 font-medium text-white">
                  {teamSize} {teamSize === 1 ? 'Solo' : 'Players per team'}
                </span>
              </div>
              <div>
                <span className="text-gray-400">Start Time:</span>
                <span className="ml-2 font-medium text-white text-xs">
                  {new Date(competition.startTime).toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="glass-darker border border-red-500/50 rounded-xl p-4 flex items-start gap-3">
              <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="font-rajdhani text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Leader Information */}
          <div className="space-y-4">
            <h3 className="font-orbitron font-semibold text-white text-lg flex items-center gap-2">
              <span className="text-cyber-green-500">👑</span> Leader Information
            </h3>
            
            <div>
              <label className="block font-rajdhani text-sm font-medium text-gray-300 mb-2">
                Your Name
              </label>
              <input
                type="text"
                value={user?.name || ''}
                className="w-full px-4 py-2.5 bg-dark-surface border border-cyber-green-500/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green-500 transition-colors"
                disabled
              />
            </div>

            <div>
              <label className="block font-rajdhani text-sm font-medium text-gray-300 mb-2">
                In-Game Player ID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={inGamePlayerID}
                onChange={(e) => setInGamePlayerID(e.target.value)}
                className="w-full px-4 py-2.5 bg-dark-surface border border-cyber-green-500/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-cyber-green-500 transition-colors"
                placeholder="Enter your in-game ID"
                required
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Team Information (only for team competitions) */}
          {isTeamCompetition && (
            <div className="space-y-4">
              <h3 className="font-orbitron font-semibold text-white text-lg flex items-center gap-2">
                <span className="text-cyber-blue-500">👥</span> Team Information
              </h3>

              <div>
                <label className="block font-rajdhani text-sm font-medium text-gray-300 mb-2">
                  Team Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  className="w-full px-4 py-2.5 bg-dark-surface border border-cyber-blue-500/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-cyber-blue-500 transition-colors"
                  placeholder="Enter your team name"
                  required
                  disabled={isProcessing}
                />
              </div>

              {/* Team Members */}
              <div className="space-y-4">
                <p className="font-rajdhani text-sm text-gray-400">
                  Add details for all {teamSize - 1} team member{teamSize - 1 !== 1 ? 's' : ''}
                </p>
                
                {teamMembers.map((member, index) => (
                  <div key={index} className="glass-darker border border-cyber-purple-500/30 rounded-xl p-4">
                    <h4 className="font-rajdhani font-semibold text-cyber-purple-500 mb-3">
                      {member.role}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block font-rajdhani text-sm font-medium text-gray-300 mb-2">
                          Player Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={member.name}
                          onChange={(e) => handleTeamMemberChange(index, 'name', e.target.value)}
                          className="w-full px-4 py-2.5 bg-dark-surface border border-cyber-purple-500/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-cyber-purple-500 transition-colors"
                          placeholder="Enter player name"
                          required
                          disabled={isProcessing}
                        />
                      </div>

                      <div>
                        <label className="block font-rajdhani text-sm font-medium text-gray-300 mb-2">
                          In-Game ID <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={member.inGameID}
                          onChange={(e) => handleTeamMemberChange(index, 'inGameID', e.target.value)}
                          className="w-full px-4 py-2.5 bg-dark-surface border border-cyber-purple-500/30 rounded-lg font-rajdhani text-white placeholder-gray-500 focus:outline-none focus:border-cyber-purple-500 transition-colors"
                          placeholder="Enter in-game ID"
                          required
                          disabled={isProcessing}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Payment Summary */}
          <div className="glass-darker border border-cyber-green-500/30 rounded-xl p-4">
            <h3 className="font-orbitron font-semibold text-cyber-green-500 mb-3">Payment Summary</h3>
            <div className="space-y-2 font-rajdhani text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Entry Fee</span>
                <span className="font-medium text-white">₹{competition.entryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Platform Fee</span>
                <span className="font-medium text-white">₹0</span>
              </div>
              <div className="border-t border-cyber-green-500/30 pt-2 flex justify-between">
                <span className="font-semibold text-white">Total Amount</span>
                <span className="font-bold text-cyber-green-500 text-lg">₹{competition.entryFee}</span>
              </div>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 glass border border-gray-500/30 text-gray-300 rounded-lg hover:border-gray-400 transition-colors font-rajdhani font-medium"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 text-white rounded-lg hover:shadow-neon-green transition-all font-rajdhani font-bold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isProcessing}
            >
              {isProcessing ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                `Pay ₹${competition.entryFee} & Register`
              )}
            </button>
          </div>

          {/* Disclaimer */}
          <div className="glass-darker border border-yellow-500/30 rounded-lg p-3">
            <p className="font-rajdhani text-xs text-yellow-400">
              <strong>Note:</strong> By registering, you agree to the tournament rules. The organizer will verify your registration details before confirming your participation.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentRegistrationModal;
