import { useState } from 'react';
import toast from 'react-hot-toast';
import { createCompetition } from '../services/competitionService';

/**
 * CreateCompetitionForm Component
 * Modal form for organizers to create new competitions
 */
function CreateCompetitionForm({ isOpen, onClose, onSuccess }) {
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    gameType: 'BGMI',
    entryFee: 0,
    startTime: '',
    endTime: '',
    maxPlayers: 10,
    teamSize: 1,
    gameRoomID: '',
    gameRoomPassword: '',
    isCollegeRestricted: false,
    prizePool: 0,
    rules: '',
  });

  const [loading, setLoading] = useState(false);

  const gameTypes = [
    'BGMI',
    'FREE FIRE',
    'CALL OF DUTY',
    'VALORANT',
  ];

  // Handle input changes
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation
      if (!formData.title || !formData.description || !formData.startTime || !formData.endTime) {
        toast.error('Please fill in all required fields');
        setLoading(false);
        return;
      }

      // Validate game room credentials
      if (!formData.gameRoomID || !formData.gameRoomPassword) {
        toast.error('Game Room ID and Password are required for verified players to join');
        setLoading(false);
        return;
      }

      // Call API service
      const data = await createCompetition(formData);

      if (data.success) {
        // Success
        toast.success('Competition created successfully! 🎮');
        onSuccess(data.data);
        resetForm();
        onClose();
      } else {
        toast.error(data.message || 'Failed to create competition');
      }
    } catch (err) {
      const errorMessage = err.message || 'Network error. Please try again.';
      toast.error(errorMessage);
      console.error('Create competition error:', err);
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      gameType: 'BGMI',
      entryFee: 0,
      startTime: '',
      endTime: '',
      maxPlayers: 10,
      isCollegeRestricted: false,
      prizePool: 0,
      rules: '',
    });
  };

  // Close modal
  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="glass rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-cyber-blue-500/50 shadow-neon-blue">
        {/* Header */}
        <div className="sticky top-0 glass-darker border-b border-cyber-blue-500/50 px-6 py-4 flex justify-between items-center backdrop-blur-xl">
          <h2 className="text-2xl font-bold font-orbitron bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 bg-clip-text text-transparent">Create New Competition</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-cyber-green-500 text-2xl leading-none transition-colors"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
              Competition Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500 text-white placeholder-gray-500 font-rajdhani"
              placeholder="e.g., BGMI Championship 2025"
              required
            />
          </div>

          {/* Game Type */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
              Game Type *
            </label>
            <select
              name="gameType"
              value={formData.gameType}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500 text-white font-rajdhani"
              required
            >
              {gameTypes.map((game) => (
                <option key={game} value={game} className="bg-dark-surface text-white font-rajdhani">
                  {game}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500"
              placeholder="Describe your competition..."
              required
            />
          </div>

          {/* Grid for smaller inputs */}
          <div className="grid grid-cols-2 gap-4">
            {/* Entry Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
                Entry Fee (₹)
              </label>
              <input
                type="number"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500"
              />
            </div>

            {/* Max Players */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
                Max Players *
              </label>
              <input
                type="number"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                min="2"
                max="1000"
                className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500"
                required
              />
            </div>
          </div>

          {/* Team Size */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
              Team Size *
            </label>
            <select
              name="teamSize"
              value={formData.teamSize}
              onChange={handleChange}
              className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500"
              required
            >
              <option value={1}>Solo (1 player)</option>
              <option value={2}>Duo (2 players)</option>
              <option value={3}>Squad (3 players)</option>
              <option value={4}>Squad (4 players)</option>
            </select>
          </div>

          {/* Game Room Credentials */}
          <div className="bg-cyber-blue-500/5 border border-cyber-blue-500/30 rounded-lg p-4">
            <h3 className="font-orbitron text-sm font-bold text-cyber-blue-500 mb-2">
              🎮 Game Room Credentials
            </h3>
            <p className="font-rajdhani text-xs text-gray-400 mb-3">
              These credentials will be automatically shared with verified teams. Players will use these to join the game room.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
                  Room ID *
                </label>
                <input
                  type="text"
                  name="gameRoomID"
                  value={formData.gameRoomID}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-surface border border-cyber-blue-500/30 rounded-lg focus:ring-2 focus:ring-cyber-blue-500 focus:border-cyber-blue-500 text-white font-rajdhani placeholder-gray-500"
                  placeholder="e.g., ROOM-12345"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
                  Room Password *
                </label>
                <input
                  type="text"
                  name="gameRoomPassword"
                  value={formData.gameRoomPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-2 bg-dark-surface border border-cyber-blue-500/30 rounded-lg focus:ring-2 focus:ring-cyber-blue-500 focus:border-cyber-blue-500 text-white font-rajdhani placeholder-gray-500"
                  placeholder="e.g., PASS-12345"
                  required
                />
              </div>
            </div>
          </div>

          {/* Date/Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500"
                required
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500"
                required
              />
            </div>
          </div>

          {/* Prize Pool */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
              Prize Pool (₹) (Optional)
            </label>
            <input
              type="number"
              name="prizePool"
              value={formData.prizePool}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500"
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2 font-rajdhani">
              Rules (Optional)
            </label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500"
              placeholder="Competition rules and guidelines..."
            />
          </div>

          {/* College Restriction Checkbox */}
          <div className="flex items-center">
            <input
              type="checkbox"
              name="isCollegeRestricted"
              checked={formData.isCollegeRestricted}
              onChange={handleChange}
              className="w-4 h-4 text-purple-600 border-cyber-green-500/30 rounded focus:ring-cyber-green-500"
            />
            <label className="ml-2 text-sm text-gray-300">
              Restrict to my college only
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-cyber-green-500/30 text-gray-300 rounded-lg font-semibold hover:bg-dark-surface transition-colors duration-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 transition-colors duration-200 disabled:bg-purple-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Competition'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCompetitionForm;
