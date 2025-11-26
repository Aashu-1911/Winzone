import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/authService';

function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [loading, setLoading] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.email || !formData.password) {
      toast.error('Please fill in all fields');
      return;
    }

    setLoading(true);

    try {
      // Call API service
      const data = await loginUser(formData);

      if (data.success && data.token && data.user) {
        // Login successful
        login(data.user, data.token);
        
        // Show success toast
        toast.success(`Welcome back, ${data.user.name}! 🎮`);
        
        // Redirect based on role
        if (data.user.role === 'organizer') {
          navigate('/organizer-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(data.message || 'Login failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Network error. Please try again.';
      toast.error(errorMessage);
      console.error('Login error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      {/* Animated background */}
      <motion.div
        animate={{
          scale: [1, 1.1, 1],
          rotate: [0, 45, 0],
        }}
        transition={{ duration: 20, repeat: Infinity }}
        className="absolute top-1/4 right-1/4 w-96 h-96 bg-cyber-purple-500/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-md w-full relative z-10"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: "spring" }}
            className="flex justify-center mb-6"
          >
            <motion.img
              src="/images/winzone.png"
              alt="WinZone Logo"
              animate={{ 
                filter: [
                  'drop-shadow(0 0 20px rgba(14, 165, 233, 0.6))',
                  'drop-shadow(0 0 30px rgba(168, 85, 247, 0.6))',
                  'drop-shadow(0 0 20px rgba(14, 165, 233, 0.6))',
                ]
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="h-64 w-64 object-contain"
            />
          </motion.div>
          <motion.div
            animate={{
              textShadow: [
                '0 0 20px #0ea5e9',
                '0 0 30px #a855f7',
                '0 0 20px #0ea5e9',
              ],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block"
          >
            <h1 className="font-orbitron text-5xl font-black bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 bg-clip-text text-transparent mb-2">
              WINZONE
            </h1>
          </motion.div>
          <p className="font-rajdhani text-xl text-gray-400">
            🔑 Access Your Gaming Arena
          </p>
        </div>

        {/* Login Form */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass p-8 rounded-2xl border border-cyber-blue-500/30"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block font-rajdhani text-sm font-semibold text-gray-300 mb-2">
                📧 Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-surface border border-cyber-blue-500/30 rounded-lg focus:ring-2 focus:ring-cyber-blue-500 focus:border-cyber-blue-500 transition-all duration-300 text-white font-rajdhani placeholder-gray-500"
                placeholder="Enter your email"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block font-rajdhani text-sm font-semibold text-gray-300 mb-2">
                🔒 Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-surface border border-cyber-blue-500/30 rounded-lg focus:ring-2 focus:ring-cyber-blue-500 focus:border-cyber-blue-500 transition-all duration-300 text-white font-rajdhani placeholder-gray-500"
                placeholder="Enter your password"
                required
              />
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-cyber bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 text-white py-3 rounded-lg font-orbitron font-bold shadow-neon-blue hover:shadow-neon-purple transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                '🚀 Login'
              )}
            </motion.button>
          </form>

          {/* Register Link */}
          <div className="mt-6 text-center">
            <p className="font-rajdhani text-gray-400">
              Don't have an account?{' '}
              <Link
                to="/register"
                className="text-cyber-blue-500 hover:text-cyber-purple-500 font-semibold transition-colors duration-300"
              >
                Register here
              </Link>
            </p>
          </div>
        </motion.div>

        {/* Demo Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-6 glass p-4 rounded-lg border border-cyber-green-500/30"
        >
          <p className="text-sm text-cyber-green-500 font-rajdhani font-semibold mb-2">
            💡 Create a new account to test the system
          </p>
          <p className="text-xs text-gray-400 font-rajdhani">
            Choose your role: Player, Organizer, or Admin
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Login;
