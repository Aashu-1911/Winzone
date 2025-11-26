import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const socialLinks = [
    { name: 'Discord', icon: '💬', url: '#' },
    { name: 'Twitter', icon: '🐦', url: '#' },
    { name: 'Instagram', icon: '📷', url: '#' },
    { name: 'YouTube', icon: '📺', url: '#' },
  ];

  const footerLinks = [
    { name: 'About', path: '/about' },
    { name: 'Privacy', path: '/privacy' },
    { name: 'Terms', path: '/terms' },
    { name: 'Support', path: '/support' },
  ];

  return (
    <footer className="relative mt-auto glass border-t border-cyber-blue-500/20">
      {/* Animated line */}
      <motion.div
        className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-cyber-blue-500 via-cyber-purple-500 to-cyber-green-500"
        initial={{ width: 0 }}
        animate={{ width: '100%' }}
        transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 2 }}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <img 
                src="/logo.png" 
                alt="WinZone Logo" 
                className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]"
              />
              <span className="font-orbitron text-2xl font-bold text-white drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]">
                WINZONE
              </span>
            </div>
            <p className="font-rajdhani text-gray-400 text-sm">
              The ultimate inter-college gaming competition platform. 
              Compete, dominate, and win amazing prizes!
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.url}
                  whileHover={{ scale: 1.2, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  className="w-10 h-10 rounded-lg bg-dark-surface border border-cyber-blue-500/30 flex items-center justify-center text-xl hover:border-cyber-blue-500 hover:shadow-neon-blue transition-all duration-300"
                  title={social.name}
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="font-orbitron text-lg font-bold text-cyber-blue-500">
              Quick Links
            </h3>
            <ul className="space-y-2">
              {footerLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="font-rajdhani text-gray-400 hover:text-cyber-blue-500 transition-colors duration-300 inline-flex items-center group"
                  >
                    <span className="mr-2 text-cyber-purple-500 group-hover:text-cyber-blue-500 transition-colors">▶</span>
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Stats Section */}
          <div className="space-y-4">
            <h3 className="font-orbitron text-lg font-bold text-cyber-green-500">
              Platform Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Active Users', value: '10K+', color: 'cyber-blue' },
                { label: 'Competitions', value: '500+', color: 'cyber-purple' },
                { label: 'Prize Pool', value: '₹50L+', color: 'cyber-green' },
                { label: 'Winners', value: '2K+', color: 'cyber-pink' },
              ].map((stat) => (
                <motion.div
                  key={stat.label}
                  whileHover={{ scale: 1.05 }}
                  className="p-3 rounded-lg bg-dark-surface border border-cyber-blue-500/20"
                >
                  <p className={`font-orbitron text-xl font-bold text-${stat.color}-500`}>
                    {stat.value}
                  </p>
                  <p className="font-rajdhani text-xs text-gray-400">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-cyber-blue-500/20 flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          <p className="font-rajdhani text-gray-400 text-sm">
            © {currentYear} <span className="text-cyber-blue-500 font-semibold">WinZone</span>. 
            All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <motion.div
              animate={{ 
                boxShadow: [
                  '0 0 5px #0ea5e9',
                  '0 0 20px #0ea5e9',
                  '0 0 5px #0ea5e9',
                ]
              }}
              transition={{ duration: 2, repeat: Infinity }}
              className="px-4 py-1 rounded-full bg-dark-surface border border-cyber-blue-500/50 font-rajdhani text-sm text-cyber-blue-500"
            >
              🟢 All Systems Operational
            </motion.div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
