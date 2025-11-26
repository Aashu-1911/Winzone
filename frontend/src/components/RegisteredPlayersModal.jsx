import { useState, useEffect } from 'react';
import { Users, Mail, Trophy, X } from 'lucide-react';
import competitionService from '../services/competitionService';

const RegisteredPlayersModal = ({ competitionId, competitionTitle, isOpen, onClose }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    total: 0,
    maxPlayers: 0,
    availableSlots: 0,
  });

  const fetchParticipants = async () => {
    setLoading(true);
    setError('');
    
    try {
      const response = await competitionService.getCompetitionParticipants(competitionId);
      
      if (response.data.success) {
        setParticipants(response.data.data.participants || []);
        setStats({
          total: response.data.data.totalParticipants || 0,
          maxPlayers: response.data.data.maxPlayers || 0,
          availableSlots: response.data.data.availableSlots || 0,
        });
      }
    } catch (err) {
      console.error('Error fetching participants:', err);
      setError(err.response?.data?.message || 'Failed to load participants');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && competitionId) {
      fetchParticipants();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, competitionId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Registered Players</h2>
            <p className="text-sm text-gray-600 mt-1">{competitionTitle}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-blue-600 text-white p-3 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total Registered</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-600 text-white p-3 rounded-lg">
                  <Trophy size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Max Players</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.maxPlayers}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="bg-purple-600 text-white p-3 rounded-lg">
                  <Users size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Available Slots</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.availableSlots}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-800">{error}</p>
              <button
                onClick={fetchParticipants}
                className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          )}

          {/* Empty State */}
          {!loading && !error && participants.length === 0 && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
              <Users size={48} className="mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600">No players registered yet</p>
              <p className="text-sm text-gray-500 mt-2">
                Players who register for this tournament will appear here
              </p>
            </div>
          )}

          {/* Participants Table */}
          {!loading && !error && participants.length > 0 && (
            <div className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        #
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Player Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        College
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Stats
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {participants.map((participant, index) => (
                      <tr key={participant._id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold">
                              {participant.name?.charAt(0).toUpperCase() || '?'}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">
                                {participant.name}
                              </div>
                              <div className="text-xs text-gray-500">
                                Role: {participant.role || 'Player'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail size={16} />
                            {participant.email}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                          {participant.collegeName || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm space-y-1">
                            <div className="text-gray-600">
                              Matches: <span className="font-medium text-gray-900">{participant.stats?.matchesPlayed || 0}</span>
                            </div>
                            <div className="text-gray-600">
                              Wins: <span className="font-medium text-green-600">{participant.stats?.matchesWon || 0}</span>
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex justify-between items-center">
            <p className="text-sm text-gray-600">
              Showing {participants.length} of {stats.total} registered players
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisteredPlayersModal;
