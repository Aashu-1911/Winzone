import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { getAllCompetitions } from '../services/competitionService';

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [liveCompetitions, setLiveCompetitions] = useState([]);
  const [loadingCompetitions, setLoadingCompetitions] = useState(true);

  // Fetch live competitions on mount
  useEffect(() => {
    fetchLiveCompetitions();
  }, []);

  const fetchLiveCompetitions = async () => {
    try {
      const data = await getAllCompetitions();
      if (data.success && Array.isArray(data.data)) {
        // Get only first 6 upcoming/ongoing competitions
        const live = data.data
          .filter(comp => comp.status === 'upcoming' || comp.status === 'ongoing')
          .slice(0, 6);
        setLiveCompetitions(live);
      }
    } catch (error) {
      console.error('Failed to fetch competitions:', error);
    } finally {
      setLoadingCompetitions(false);
    }
  };

  const features = [
    {
      icon: '🎮',
      title: 'Multiple Games',
      description: 'BGMI, Free Fire, Valorant, Chess, Ludo & more',
      color: 'cyber-blue',
    },
    {
      icon: '🏆',
      title: 'Win Big',
      description: 'Exciting prize pools up to ₹50,000+',
      color: 'cyber-purple',
    },
    {
      icon: '⚡',
      title: 'Live Matches',
      description: 'Real-time tournaments and competitions',
      color: 'cyber-green',
    },
    {
      icon: '🎯',
      title: 'Fair Play',
      description: 'Transparent rules and verified organizers',
      color: 'cyber-pink',
    },
  ];

  const games = [
    { name: 'BGMI', emoji: '🔫', players: '2.5K+' },
    { name: 'Free Fire', emoji: '🔥', players: '3.2K+' },
    { name: 'Valorant', emoji: '💥', players: '1.8K+' },
    { name: 'Chess', emoji: '♟️', players: '1.2K+' },
    { name: 'Ludo', emoji: '🎲', players: '2.1K+' },
    { name: 'COD Mobile', emoji: '💣', players: '1.5K+' },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 overflow-hidden">
        {/* Animated background elements */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-20 right-10 w-64 h-64 bg-cyber-blue-500/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            rotate: [90, 0, 90],
          }}
          transition={{ duration: 15, repeat: Infinity }}
          className="absolute bottom-20 left-10 w-96 h-96 bg-cyber-purple-500/10 rounded-full blur-3xl"
        />

        <div className="max-w-7xl mx-auto relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center"
          >
            {/* Logo */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.5, type: "spring" }}
              className="flex justify-center mb-8"
            >
              <motion.img
                src="/logo.png"
                alt="WinZone Logo"
                animate={{ 
                  rotate: [0, 5, -5, 0],
                  filter: [
                    'drop-shadow(0 0 20px rgba(34, 211, 238, 0.6))',
                    'drop-shadow(0 0 30px rgba(168, 85, 247, 0.6))',
                    'drop-shadow(0 0 20px rgba(34, 211, 238, 0.6))',
                  ]
                }}
                transition={{ duration: 4, repeat: Infinity }}
                className="h-32 w-32 md:h-40 md:w-40 object-contain"
              />
            </motion.div>

            {/* Main heading */}
            <motion.h1
              className="font-orbitron text-6xl md:text-8xl font-black mb-6"
              animate={{
                textShadow: [
                  '0 0 20px #0ea5e9, 0 0 30px #0ea5e9, 0 0 40px #0ea5e9',
                  '0 0 30px #a855f7, 0 0 40px #a855f7, 0 0 50px #a855f7',
                  '0 0 20px #0ea5e9, 0 0 30px #0ea5e9, 0 0 40px #0ea5e9',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
            >
              <span className="text-white drop-shadow-[0_0_15px_rgba(34,211,238,0.9)]">
                WINZONE
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="font-rajdhani text-2xl md:text-3xl text-gray-300 mb-4"
            >
              The Ultimate Gaming Competition Platform
            </motion.p>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8 }}
              className="font-rajdhani text-lg text-cyber-blue-400 mb-12"
            >
              Compete • Dominate • Win • Rise to Glory
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              {!isAuthenticated() ? (
                <>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/register"
                      className="btn-cyber px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 text-white font-rajdhani text-lg font-bold shadow-neon-blue hover:shadow-neon-purple transition-all duration-300"
                    >
                      🚀 Get Started
                    </Link>
                  </motion.div>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Link
                      to="/login"
                      className="px-8 py-4 rounded-xl bg-dark-surface border-2 border-cyber-blue-500 text-cyber-blue-500 font-rajdhani text-lg font-bold hover:bg-cyber-blue-500/10 transition-all duration-300"
                    >
                      🔑 Login
                    </Link>
                  </motion.div>
                </>
              ) : (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Link
                    to="/dashboard"
                    className="btn-cyber px-8 py-4 rounded-xl bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 text-white font-rajdhani text-lg font-bold shadow-neon-green transition-all duration-300"
                  >
                    🎮 Go to Dashboard
                  </Link>
                </motion.div>
              )}
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.8 }}
              className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            >
              {[
                { label: 'Active Players', value: '10K+', icon: '👥' },
                { label: 'Live Tournaments', value: '500+', icon: '🏆' },
                { label: 'Total Prize Pool', value: '₹50L+', icon: '💰' },
                { label: 'Daily Matches', value: '200+', icon: '⚡' },
              ].map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1 + index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  className="glass p-6 rounded-xl border border-cyber-blue-500/30 hover:border-cyber-blue-500 transition-all duration-300"
                >
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <div className="font-orbitron text-2xl font-bold text-cyber-blue-500 mb-1">
                    {stat.value}
                  </div>
                  <div className="font-rajdhani text-sm text-gray-400">
                    {stat.label}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-orbitron text-4xl md:text-5xl font-bold text-center mb-4"
          >
            <span className="bg-gradient-to-r from-cyber-purple-500 to-cyber-pink bg-clip-text text-transparent">
              Why Choose WinZone?
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-rajdhani text-xl text-center text-gray-400 mb-16"
          >
            Experience next-level competitive gaming
          </motion.p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ y: -10 }}
                className="glass p-6 rounded-xl border border-cyber-blue-500/30 hover:border-cyber-blue-500 transition-all duration-300"
              >
                <motion.div
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, delay: index * 0.2 }}
                  className="text-5xl mb-4"
                >
                  {feature.icon}
                </motion.div>
                <h3 className={`font-orbitron text-xl font-bold mb-2 text-${feature.color}-500`}>
                  {feature.title}
                </h3>
                <p className="font-rajdhani text-gray-400">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Games Section */}
      <section className="py-20 px-4 bg-dark-surface/50">
        <div className="max-w-7xl mx-auto">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-orbitron text-4xl md:text-5xl font-bold text-center mb-4"
          >
            <span className="bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 bg-clip-text text-transparent">
              Supported Games
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="font-rajdhani text-xl text-center text-gray-400 mb-16"
          >
            Join thousands of players competing across multiple games
          </motion.p>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {games.map((game, index) => (
              <motion.div
                key={game.name}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="glass p-6 rounded-xl border border-cyber-purple-500/30 hover:border-cyber-purple-500 text-center cursor-pointer transition-all duration-300"
              >
                <div className="text-4xl mb-3">{game.emoji}</div>
                <h4 className="font-orbitron text-lg font-bold text-white mb-2">
                  {game.name}
                </h4>
                <p className="font-rajdhani text-sm text-cyber-green-500">
                  {game.players} Players
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated() && (
        <section className="py-20 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass p-12 rounded-2xl border border-cyber-blue-500/50"
            >
              <h2 className="font-orbitron text-4xl md:text-5xl font-bold mb-6">
                <span className="bg-gradient-to-r from-cyber-blue-500 via-cyber-purple-500 to-cyber-pink bg-clip-text text-transparent">
                  Ready to Compete?
                </span>
              </h2>
              <p className="font-rajdhani text-xl text-gray-300 mb-8">
                Join thousands of gamers and start your journey to victory today!
              </p>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  to="/register"
                  className="btn-cyber inline-block px-12 py-5 rounded-xl bg-gradient-to-r from-cyber-purple-500 to-cyber-pink text-white font-rajdhani text-xl font-bold shadow-neon-purple hover:shadow-neon-pink transition-all duration-300"
                >
                  🚀 Create Free Account
                </Link>
              </motion.div>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
};

export default Home;
