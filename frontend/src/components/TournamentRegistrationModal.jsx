import { useState } from 'react';
import { X, CreditCard, Wallet, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import competitionService from '../services/competitionService';
import { useAuth } from '../context/AuthContext';

const TournamentRegistrationModal = ({ competition, isOpen, onClose, onSuccess }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    playerName: user?.name || '',
    email: user?.email || '',
    phone: '',
    gameId: '',
    teamName: '',
  });
  const [paymentMethod, setPaymentMethod] = useState('wallet');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !competition) return null;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsProcessing(true);

    // Validate form
    if (!formData.playerName || !formData.email || !formData.phone || !formData.gameId) {
      setError('Please fill in all required fields');
      setIsProcessing(false);
      return;
    }

    try {
      const loadingToast = toast.loading('Registering for tournament...');

      // Register for competition using existing API
      const result = await competitionService.registerForCompetition(competition._id);

      toast.dismiss(loadingToast);

      if (result.success) {
        toast.success(result.message || 'Successfully registered! 🎮');

        // Call success callback
        if (onSuccess) {
          onSuccess();
        }

        // Close modal
        onClose();
      }
    } catch (err) {
      toast.dismiss();
      console.error('Registration error:', err);
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Tournament Registration</h2>
            <p className="text-sm text-gray-600 mt-1">{competition.title}</p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isProcessing}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Tournament Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">Tournament Details</h3>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-gray-600">Game Type:</span>
                <span className="ml-2 font-medium text-gray-900">{competition.gameType}</span>
              </div>
              <div>
                <span className="text-gray-600">Entry Fee:</span>
                <span className="ml-2 font-medium text-green-600">₹{competition.entryFee}</span>
              </div>
              <div>
                <span className="text-gray-600">Start Time:</span>
                <span className="ml-2 font-medium text-gray-900">
                  {new Date(competition.startTime).toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-gray-600">Available Slots:</span>
                <span className="ml-2 font-medium text-gray-900">{competition.availableSlots}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Player Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Player Information</h3>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Player Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="playerName"
                value={formData.playerName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter your full name"
                required
                disabled={isProcessing}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="your@email.com"
                  required
                  disabled={isProcessing}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+91 9876543210"
                  required
                  disabled={isProcessing}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Game ID/Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="gameId"
                value={formData.gameId}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Your in-game ID"
                required
                disabled={isProcessing}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Team Name <span className="text-gray-400">(Optional)</span>
              </label>
              <input
                type="text"
                name="teamName"
                value={formData.teamName}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Enter team name if applicable"
                disabled={isProcessing}
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 text-lg">Payment Method</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Wallet Payment */}
              <button
                type="button"
                onClick={() => setPaymentMethod('wallet')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === 'wallet'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={isProcessing}
              >
                <div className="flex items-start gap-3">
                  <Wallet className={paymentMethod === 'wallet' ? 'text-blue-600' : 'text-gray-400'} size={24} />
                  <div>
                    <h4 className="font-medium text-gray-900">Wallet</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay from your WinZone wallet
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Not functional yet - Coming soon)
                    </p>
                  </div>
                </div>
              </button>

              {/* Card Payment */}
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg text-left transition-all ${
                  paymentMethod === 'card'
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                disabled={isProcessing}
              >
                <div className="flex items-start gap-3">
                  <CreditCard className={paymentMethod === 'card' ? 'text-blue-600' : 'text-gray-400'} size={24} />
                  <div>
                    <h4 className="font-medium text-gray-900">Card/UPI</h4>
                    <p className="text-sm text-gray-600 mt-1">
                      Pay via Credit/Debit Card or UPI
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      (Not functional yet - Coming soon)
                    </p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Payment Summary */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Payment Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Entry Fee</span>
                <span className="font-medium text-gray-900">₹{competition.entryFee}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Platform Fee</span>
                <span className="font-medium text-gray-900">₹0</span>
              </div>
              <div className="border-t border-gray-300 pt-2 flex justify-between">
                <span className="font-semibold text-gray-900">Total Amount</span>
                <span className="font-bold text-green-600 text-lg">₹{competition.entryFee}</span>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              disabled={isProcessing}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:bg-gray-400 disabled:cursor-not-allowed"
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> Payment functionality is not yet implemented. This is a preview of the registration form. 
              Actual payment integration will be added in the next phase.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TournamentRegistrationModal;
