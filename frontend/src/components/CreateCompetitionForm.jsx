import { useState } from 'react';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { createCompetition } from '../services/competitionService';

/**
 * CreateCompetitionForm Component
 * Modal form for organizers to create new competitions
 */
function CreateCompetitionForm({ isOpen, onClose, onSuccess }) {
  const { token } = useAuth();
  
  const [formData, setFormData] = useState({
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

  const [loading, setLoading] = useState(false);

  const gameTypes = [
    'BGMI',
    'Free Fire',
    'Call of Duty',
    'Valorant',
    'Chess',
    'Cricket',
    'Football',
    'Basketball',
    'Other',
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold text-gray-800">Create New Competition</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 text-2xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Competition Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="e.g., BGMI Championship 2025"
              required
            />
          </div>

          {/* Game Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Game Type *
            </label>
            <select
              name="gameType"
              value={formData.gameType}
              onChange={handleChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              required
            >
              {gameTypes.map((game) => (
                <option key={game} value={game}>
                  {game}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description *
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              placeholder="Describe your competition..."
              required
            />
          </div>

          {/* Grid for smaller inputs */}
          <div className="grid grid-cols-2 gap-4">
            {/* Entry Fee */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Fee (₹)
              </label>
              <input
                type="number"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleChange}
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            {/* Max Players */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Max Players *
              </label>
              <input
                type="number"
                name="maxPlayers"
                value={formData.maxPlayers}
                onChange={handleChange}
                min="2"
                max="1000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Date/Time Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Start Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <input
                type="datetime-local"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>

            {/* End Time */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <input
                type="datetime-local"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Prize Pool */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Prize Pool (₹) (Optional)
            </label>
            <input
              type="number"
              name="prizePool"
              value={formData.prizePool}
              onChange={handleChange}
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Rules */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Rules (Optional)
            </label>
            <textarea
              name="rules"
              value={formData.rules}
              onChange={handleChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label className="ml-2 text-sm text-gray-700">
              Restrict to my college only
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors duration-200"
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
