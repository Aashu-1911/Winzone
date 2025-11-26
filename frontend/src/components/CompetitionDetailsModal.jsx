import { X, Calendar, Users, Trophy, DollarSign, Clock, MapPin, FileText, PlayCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompetitionDetailsModal = ({ competition, isOpen, onClose, isRegistered }) => {
  const navigate = useNavigate();

  if (!isOpen || !competition) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      dateStyle: 'full',
      timeStyle: 'short',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'upcoming':
        return 'bg-blue-500/20 text-blue-500 border-blue-500';
      case 'ongoing':
        return 'bg-green-500/20 text-green-500 border-green-500';
      case 'completed':
        return 'bg-gray-500/20 text-gray-400 border-gray-500';
      case 'cancelled':
        return 'bg-red-500/20 text-red-500 border-red-500';
      default:
        return 'bg-purple-500/20 text-purple-500 border-purple-500';
    }
  };

  const handleJoinTournament = () => {
    if (competition.status === 'ongoing') {
      // Navigate to live match page
      navigate(`/live-match/${competition._id}`);
    } else {
      // Show message that tournament hasn't started yet
      alert('Tournament will start at: ' + formatDate(competition.startTime));
    }
  };

  const isFull = competition.participants?.length >= competition.maxPlayers;
  const spotsLeft = competition.maxPlayers - (competition.participants?.length || 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full my-8 border border-cyan-500/30">
        {/* Header */}
        <div className="relative px-6 py-6 border-b border-cyan-500/30 bg-gradient-to-r from-cyan-900/20 to-purple-900/20">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
          >
            <X size={28} />
          </button>
          
          <div className="flex items-start justify-between pr-12">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h2 className="text-3xl font-bold text-white font-orbitron">
                  {competition.title}
                </h2>
                {isRegistered && (
                  <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-bold border border-green-500">
                    ✓ REGISTERED
                  </span>
                )}
              </div>
              <p className="text-gray-400 font-rajdhani text-lg mb-3">
                by {competition.organizerId?.name || 'Unknown Organizer'}
              </p>
              <div className="flex items-center gap-4 flex-wrap">
                <span className={`px-4 py-2 rounded-lg text-sm font-bold uppercase border ${getStatusColor(competition.status)}`}>
                  {competition.status}
                </span>
                <span className="px-4 py-2 bg-purple-500/20 text-purple-400 rounded-lg text-sm font-bold border border-purple-500">
                  🎮 {competition.gameType}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 max-h-[70vh] overflow-y-auto">
          {/* Key Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-green-900/30 to-green-800/20 border border-green-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-green-500/20 p-2 rounded-lg">
                  <DollarSign size={24} className="text-green-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-rajdhani">Entry Fee</p>
                  <p className="text-xl font-bold text-green-400 font-orbitron">₹{competition.entryFee}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/30 to-cyan-800/20 border border-cyan-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-cyan-500/20 p-2 rounded-lg">
                  <Trophy size={24} className="text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-rajdhani">Prize Pool</p>
                  <p className="text-xl font-bold text-cyan-400 font-orbitron">₹{competition.prizePool}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/30 to-purple-800/20 border border-purple-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-purple-500/20 p-2 rounded-lg">
                  <Users size={24} className="text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-rajdhani">Participants</p>
                  <p className="text-xl font-bold text-purple-400 font-orbitron">
                    {competition.participants?.length || 0}/{competition.maxPlayers}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-900/30 to-orange-800/20 border border-orange-500/30 rounded-xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="bg-orange-500/20 p-2 rounded-lg">
                  <Clock size={24} className="text-orange-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-rajdhani">Spots Left</p>
                  <p className={`text-xl font-bold font-orbitron ${isFull ? 'text-red-400' : 'text-orange-400'}`}>
                    {isFull ? 'FULL' : spotsLeft}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Description Section */}
          <div className="bg-gray-800/50 border border-cyan-500/20 rounded-xl p-5 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={20} className="text-cyan-400" />
              <h3 className="text-xl font-bold text-white font-orbitron">Description</h3>
            </div>
            <p className="text-gray-300 font-rajdhani text-base leading-relaxed">
              {competition.description || 'No description provided.'}
            </p>
          </div>

          {/* Tournament Details */}
          <div className="bg-gray-800/50 border border-cyan-500/20 rounded-xl p-5 mb-6">
            <h3 className="text-xl font-bold text-white font-orbitron mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-cyan-400" />
              Tournament Details
            </h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Calendar size={18} className="text-cyan-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400 font-rajdhani">Start Time</p>
                  <p className="text-white font-rajdhani font-semibold">{formatDate(competition.startTime)}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock size={18} className="text-cyan-400 mt-1" />
                <div className="flex-1">
                  <p className="text-sm text-gray-400 font-rajdhani">End Time</p>
                  <p className="text-white font-rajdhani font-semibold">{formatDate(competition.endTime)}</p>
                </div>
              </div>
              {competition.isCollegeRestricted && (
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-cyan-400 mt-1" />
                  <div className="flex-1">
                    <p className="text-sm text-gray-400 font-rajdhani">College Restriction</p>
                    <p className="text-white font-rajdhani font-semibold">Restricted to specific colleges</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rules Section */}
          {competition.rules && competition.rules.length > 0 && (
            <div className="bg-gray-800/50 border border-cyan-500/20 rounded-xl p-5 mb-6">
              <h3 className="text-xl font-bold text-white font-orbitron mb-4 flex items-center gap-2">
                <FileText size={20} className="text-cyan-400" />
                Tournament Rules
              </h3>
              <ul className="space-y-2">
                {competition.rules.map((rule, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300 font-rajdhani">
                    <span className="text-cyan-400 font-bold mt-1">{index + 1}.</span>
                    <span className="flex-1">{rule}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Prize Distribution (if available) */}
          {competition.prizeDistribution && (
            <div className="bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-xl p-5 mb-6">
              <h3 className="text-xl font-bold text-white font-orbitron mb-4 flex items-center gap-2">
                <Trophy size={20} className="text-yellow-400" />
                Prize Distribution
              </h3>
              <div className="space-y-2">
                {Object.entries(competition.prizeDistribution).map(([position, prize]) => (
                  <div key={position} className="flex items-center justify-between">
                    <span className="text-gray-300 font-rajdhani font-semibold capitalize">{position}</span>
                    <span className="text-yellow-400 font-orbitron font-bold">₹{prize}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Current Status Info */}
          {competition.status === 'upcoming' && (
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6">
              <p className="text-blue-400 font-rajdhani text-center">
                <Clock size={18} className="inline mr-2" />
                Tournament starts on {formatDate(competition.startTime)}
              </p>
            </div>
          )}

          {competition.status === 'ongoing' && (
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 mb-6 animate-pulse">
              <p className="text-green-400 font-rajdhani text-center font-bold">
                🔴 LIVE NOW - Tournament is in progress!
              </p>
            </div>
          )}
        </div>

        {/* Footer with Actions */}
        <div className="px-6 py-4 border-t border-cyan-500/30 bg-gray-900/50 flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-rajdhani font-bold"
          >
            Close
          </button>
          
          {isRegistered && (
            <button
              onClick={handleJoinTournament}
              disabled={competition.status === 'completed' || competition.status === 'cancelled'}
              className={`px-8 py-3 rounded-lg font-rajdhani font-bold text-white transition-all flex items-center gap-2 ${
                competition.status === 'ongoing'
                  ? 'bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 shadow-lg shadow-green-500/50 animate-pulse'
                  : competition.status === 'upcoming'
                  ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600'
                  : 'bg-gray-600 cursor-not-allowed'
              }`}
            >
              <PlayCircle size={20} />
              {competition.status === 'ongoing' 
                ? 'Join Tournament Now' 
                : competition.status === 'upcoming'
                ? 'Waiting to Start'
                : 'Tournament Ended'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompetitionDetailsModal;
