import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const navLinks = isAuthenticated() ? [
    { name: 'Dashboard', path: user?.role === 'organizer' ? '/organizer-dashboard' : '/dashboard' },
    { name: 'Competitions', path: '/competitions' },
    ...(user?.role === 'organizer' ? [{ name: 'Future Scope', path: '/future-scope' }] : []),
    { name: 'Analytics', path: '/analytics' },
  ] : [
    { name: 'Home', path: '/' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass border-b border-cyber-blue-500/20"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <motion.img
              src="/images/winzone.png"
              alt="WinZone Logo"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.3 }}
              className="h-32 w-32 object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
            />
            <span className="font-orbitron text-3xl font-black tracking-wider text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
              WINZONE
            </span>
            <motion.div
              className="h-2 w-2 rounded-full bg-cyber-green-500 shadow-neon-green"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="relative font-rajdhani text-lg font-medium text-gray-300 hover:text-cyber-blue-500 transition-colors duration-300 group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 group-hover:w-full transition-all duration-300" />
              </Link>
            ))}
            
            {isAuthenticated() && (
              <>
                <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-dark-surface border border-cyber-blue-500/30">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 flex items-center justify-center">
                    <span className="font-orbitron text-sm font-bold">
                      {user?.name?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-rajdhani text-sm font-semibold text-white">{user?.name}</p>
                    <p className="text-xs text-cyber-blue-400">{user?.role}</p>
                  </div>
                </div>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleLogout}
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-rajdhani font-semibold shadow-neon-pink hover:shadow-lg transition-all duration-300"
                >
                  Logout
                </motion.button>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 rounded-lg bg-dark-surface border border-cyber-blue-500/30 text-cyber-blue-500"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {isOpen ? (
                  <path d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </motion.button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <motion.div
        initial={{ height: 0, opacity: 0 }}
        animate={{
          height: isOpen ? 'auto' : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className="md:hidden overflow-hidden border-t border-cyber-blue-500/20 bg-dark-surface/95"
      >
        <div className="px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              onClick={() => setIsOpen(false)}
              className="block px-4 py-2 rounded-lg font-rajdhani text-lg font-medium text-gray-300 hover:text-cyber-blue-500 hover:bg-dark-bg/50 transition-all duration-300"
            >
              {link.name}
            </Link>
          ))}
          
          {isAuthenticated() && (
            <div className="pt-4 border-t border-cyber-blue-500/20 space-y-3">
              <div className="flex items-center space-x-3 px-4 py-2 rounded-lg bg-dark-bg/50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 flex items-center justify-center">
                  <span className="font-orbitron text-lg font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-rajdhani text-base font-semibold text-white">{user?.name}</p>
                  <p className="text-sm text-cyber-blue-400">{user?.role}</p>
                </div>
              </div>
              <button
                onClick={() => {
                  handleLogout();
                  setIsOpen(false);
                }}
                className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-red-500 to-pink-500 text-white font-rajdhani font-semibold shadow-lg"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
