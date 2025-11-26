import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { registerUser } from '../services/authService';

function Register() {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'player',
    collegeName: '',
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      // Call API service
      const data = await registerUser({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
        collegeName: formData.collegeName,
      });

      if (data.success && data.token && data.user) {
        // Registration successful
        register(data.user, data.token);
        
        // Show success toast
        toast.success(`Welcome to WinZone, ${data.user.name}! 🎮`);
        
        // Redirect based on role
        if (data.user.role === 'organizer') {
          navigate('/organizer-dashboard');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(data.message || 'Registration failed');
      }
    } catch (err) {
      const errorMessage = err.message || 'Network error. Please try again.';
      toast.error(errorMessage);
      console.error('Registration error:', err);
    } finally {
      setLoading(false);
    }
  };

  const roleOptions = [
    { value: 'player', icon: '🎮', label: 'Player', desc: 'Join and compete' },
    { value: 'organizer', icon: '🏆', label: 'Organizer', desc: 'Create tournaments' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-24">
      <motion.div
        animate={{ scale: [1, 1.2, 1], rotate: [0, -45, 0] }}
        transition={{ duration: 25, repeat: Infinity }}
        className="absolute top-1/3 left-1/4 w-96 h-96 bg-cyber-green-500/10 rounded-full blur-3xl"
      />

      <motion.div
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-2xl w-full relative z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{
              textShadow: ['0 0 20px #22c55e', '0 0 30px #0ea5e9', '0 0 20px #22c55e'],
            }}
            transition={{ duration: 3, repeat: Infinity }}
            className="inline-block"
          >
            <h1 className="font-orbitron text-5xl font-black bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 bg-clip-text text-transparent mb-2">
              WINZONE
            </h1>
          </motion.div>
          <p className="font-rajdhani text-xl text-gray-400">
            🚀 Join the Gaming Revolution
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.4 }}
          className="glass p-8 rounded-2xl border border-cyber-green-500/30"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-rajdhani text-sm font-semibold text-gray-300 mb-2">
                  👤 Full Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500 transition-all duration-300 text-white font-rajdhani placeholder-gray-500"
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div>
                <label className="block font-rajdhani text-sm font-semibold text-gray-300 mb-2">
                  📧 Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500 transition-all duration-300 text-white font-rajdhani placeholder-gray-500"
                  placeholder="your@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block font-rajdhani text-sm font-semibold text-gray-300 mb-3">
                🎭 Select Your Role *
              </label>
              <div className="grid grid-cols-2 gap-4">
                {roleOptions.map((role) => (
                  <motion.label
                    key={role.value}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`relative cursor-pointer p-4 rounded-lg border-2 transition-all duration-300 ${
                      formData.role === role.value
                        ? 'border-cyber-green-500 bg-cyber-green-500/10 shadow-neon-green'
                        : 'border-cyber-green-500/30 bg-dark-surface hover:border-cyber-green-500/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role.value}
                      checked={formData.role === role.value}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <div className="text-3xl mb-2">{role.icon}</div>
                      <div className="font-orbitron text-lg font-bold text-white mb-1">
                        {role.label}
                      </div>
                      <div className="font-rajdhani text-xs text-gray-400">
                        {role.desc}
                      </div>
                    </div>
                    {formData.role === role.value && (
                      <motion.div
                        layoutId="selected-role"
                        className="absolute top-2 right-2 text-cyber-green-500"
                      >
                        ✓
                      </motion.div>
                    )}
                  </motion.label>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-rajdhani text-sm font-semibold text-gray-300 mb-2">
                🏫 College Name (Optional)
              </label>
              <input
                type="text"
                name="collegeName"
                value={formData.collegeName}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500 transition-all duration-300 text-white font-rajdhani placeholder-gray-500"
                placeholder="Enter your college"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block font-rajdhani text-sm font-semibold text-gray-300 mb-2">
                  🔒 Password *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500 transition-all duration-300 text-white font-rajdhani placeholder-gray-500"
                  placeholder="Min 6 characters"
                  required
                />
              </div>

              <div>
                <label className="block font-rajdhani text-sm font-semibold text-gray-300 mb-2">
                  🔐 Confirm Password *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full px-4 py-3 bg-dark-surface border border-cyber-green-500/30 rounded-lg focus:ring-2 focus:ring-cyber-green-500 focus:border-cyber-green-500 transition-all duration-300 text-white font-rajdhani placeholder-gray-500"
                  placeholder="Repeat password"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
              className="w-full btn-cyber bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 text-white py-4 rounded-lg font-orbitron font-bold shadow-neon-green hover:shadow-neon-blue transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating Account...
                </span>
              ) : (
                '🚀 Create Account'
              )}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            <p className="font-rajdhani text-gray-400">
              Already have an account?{' '}
              <Link
                to="/login"
                className="text-cyber-green-500 hover:text-cyber-blue-500 font-semibold transition-colors duration-300"
              >
                Login here
              </Link>
            </p>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

export default Register;
