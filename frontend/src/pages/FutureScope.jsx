import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Trophy, Users, DollarSign, TrendingUp, Zap, Award, Target } from 'lucide-react';

function FutureScope() {
  const [activeTab, setActiveTab] = useState('live');

  // Hardcoded demo data
  const liveMatchData = {
    matchId: 'MATCH-2025-001',
    gameType: 'BGMI',
    status: 'LIVE',
    currentZone: 'Zone 4 - Safe Zone Shrinking',
    timeElapsed: '18:34',
    teamsAlive: 12,
    totalTeams: 20,
  };

  const leaderboardData = [
    { rank: 1, team: 'Team Dynamo', kills: 18, placement: 1, points: 35, trend: 'up' },
    { rank: 2, team: 'Phoenix Squad', kills: 15, placement: 2, points: 28, trend: 'same' },
    { rank: 3, team: 'Thunder Wolves', kills: 12, placement: 3, points: 24, trend: 'down' },
    { rank: 4, team: 'Elite Warriors', kills: 10, placement: 5, points: 18, trend: 'up' },
    { rank: 5, team: 'Shadow Riders', kills: 9, placement: 4, points: 17, trend: 'up' },
    { rank: 6, team: 'Cyber Ninjas', kills: 8, placement: 7, points: 13, trend: 'down' },
    { rank: 7, team: 'Storm Breakers', kills: 7, placement: 6, points: 12, trend: 'same' },
    { rank: 8, team: 'Venom Squad', kills: 6, placement: 8, points: 10, trend: 'down' },
  ];

  const prizeDistribution = {
    totalPrize: 50000,
    breakdown: [
      { position: '1st Place', amount: 25000, percentage: 50, team: 'Team Dynamo' },
      { position: '2nd Place', amount: 12500, percentage: 25, team: 'Phoenix Squad' },
      { position: '3rd Place', amount: 7500, percentage: 15, team: 'Thunder Wolves' },
      { position: '4th Place', amount: 3000, percentage: 6, team: 'Elite Warriors' },
      { position: '5th Place', amount: 2000, percentage: 4, team: 'Shadow Riders' },
    ],
  };

  const liveStats = [
    { label: 'Total Kills', value: '247', icon: Target, color: 'red' },
    { label: 'Avg Survival Time', value: '12:45', icon: Zap, color: 'yellow' },
    { label: 'Active Players', value: '48', icon: Users, color: 'green' },
    { label: 'Prize Pool', value: '₹50K', icon: DollarSign, color: 'blue' },
  ];

  const getTrendIcon = (trend) => {
    if (trend === 'up') return '↑';
    if (trend === 'down') return '↓';
    return '→';
  };

  const getTrendColor = (trend) => {
    if (trend === 'up') return 'text-cyber-green-500';
    if (trend === 'down') return 'text-red-500';
    return 'text-gray-400';
  };

  return (
    <div className="min-h-screen bg-dark-bg pt-20">
      <main className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-cyber-purple-500 to-cyber-pink flex items-center justify-center">
              <Zap className="text-white" size={24} />
            </div>
            <div>
              <h1 className="font-orbitron text-5xl font-black bg-gradient-to-r from-cyber-purple-500 via-cyber-pink to-cyber-blue-500 bg-clip-text text-transparent">
                Future Scope
              </h1>
              <p className="font-rajdhani text-xl text-gray-400 mt-1">
                Coming Soon - Advanced Tournament Features
              </p>
            </div>
          </div>
          
          <div className="glass border border-cyber-purple-500/30 rounded-xl p-4">
            <p className="font-rajdhani text-sm text-gray-300">
              <span className="text-cyber-purple-500 font-bold">🚀 Preview Mode:</span> These features are currently in development and will be available in future updates. The data shown below is for demonstration purposes only.
            </p>
          </div>
        </motion.div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 overflow-x-auto">
          {[
            { id: 'live', label: 'Live Match Display', icon: Play },
            { id: 'leaderboard', label: 'Live Leaderboard', icon: Trophy },
            { id: 'prizes', label: 'Auto Prize Distribution', icon: Award },
          ].map((tab) => (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-rajdhani font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-gradient-to-r from-cyber-purple-500 to-cyber-pink text-white shadow-neon-purple'
                  : 'glass border border-cyber-purple-500/30 text-gray-400 hover:text-white'
              }`}
            >
              <tab.icon size={20} />
              {tab.label}
            </motion.button>
          ))}
        </div>

        {/* Live Match Display */}
        {activeTab === 'live' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Match Status Card */}
            <div className="glass border border-red-500/50 rounded-2xl p-6 bg-red-500/5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="font-orbitron text-2xl font-bold text-white">LIVE MATCH</h2>
                  <span className="px-3 py-1 bg-red-500/20 text-red-400 rounded-lg text-sm font-rajdhani font-bold border border-red-500">
                    {liveMatchData.status}
                  </span>
                </div>
                <div className="font-orbitron text-3xl font-bold text-cyber-green-500">
                  {liveMatchData.timeElapsed}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-darker border border-cyber-blue-500/30 rounded-lg p-4">
                  <p className="font-rajdhani text-sm text-gray-400 mb-1">Match ID</p>
                  <p className="font-orbitron text-lg font-bold text-white">{liveMatchData.matchId}</p>
                </div>
                <div className="glass-darker border border-cyber-green-500/30 rounded-lg p-4">
                  <p className="font-rajdhani text-sm text-gray-400 mb-1">Game Type</p>
                  <p className="font-orbitron text-lg font-bold text-cyber-green-500">{liveMatchData.gameType}</p>
                </div>
                <div className="glass-darker border border-yellow-500/30 rounded-lg p-4">
                  <p className="font-rajdhani text-sm text-gray-400 mb-1">Current Zone</p>
                  <p className="font-rajdhani text-sm font-bold text-yellow-500">{liveMatchData.currentZone}</p>
                </div>
                <div className="glass-darker border border-red-500/30 rounded-lg p-4">
                  <p className="font-rajdhani text-sm text-gray-400 mb-1">Teams Alive</p>
                  <p className="font-orbitron text-lg font-bold text-red-400">
                    {liveMatchData.teamsAlive} / {liveMatchData.totalTeams}
                  </p>
                </div>
              </div>
            </div>

            {/* Live Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {liveStats.map((stat, index) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -5 }}
                  className={`glass border border-cyber-${stat.color}-500/30 rounded-xl p-6 hover:border-cyber-${stat.color}-500 transition-all`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`w-12 h-12 rounded-full bg-cyber-${stat.color}-500/20 flex items-center justify-center`}>
                      <stat.icon className={`text-cyber-${stat.color}-500`} size={24} />
                    </div>
                    <TrendingUp className="text-cyber-green-500" size={20} />
                  </div>
                  <p className="font-rajdhani text-sm text-gray-400 mb-1">{stat.label}</p>
                  <p className={`font-orbitron text-3xl font-bold text-cyber-${stat.color}-500`}>{stat.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Live Feed Simulation */}
            <div className="glass border border-cyber-purple-500/30 rounded-xl p-6">
              <h3 className="font-orbitron text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Zap className="text-cyber-purple-500" size={20} />
                Live Kill Feed
              </h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {[
                  { killer: 'Team Dynamo', killed: 'Shadow Riders', weapon: 'AWM', time: '18:34' },
                  { killer: 'Phoenix Squad', killed: 'Venom Squad', weapon: 'M416', time: '18:32' },
                  { killer: 'Thunder Wolves', killed: 'Storm Breakers', weapon: 'Kar98K', time: '18:29' },
                  { killer: 'Elite Warriors', killed: 'Cyber Ninjas', weapon: 'AKM', time: '18:25' },
                ].map((event, index) => (
                  <motion.div
                    key={index}
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: index * 0.1 }}
                    className="glass-darker border border-gray-700 rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3 font-rajdhani">
                      <span className="text-cyber-green-500 font-bold">{event.killer}</span>
                      <span className="text-gray-500">eliminated</span>
                      <span className="text-red-400 font-bold">{event.killed}</span>
                      <span className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded text-xs border border-yellow-500/50">
                        {event.weapon}
                      </span>
                    </div>
                    <span className="text-xs text-gray-500">{event.time}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Live Leaderboard */}
        {activeTab === 'leaderboard' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass border border-cyber-blue-500/30 rounded-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-r from-cyber-blue-500/20 to-cyber-purple-500/20 border-b border-cyber-blue-500/30 px-6 py-4">
              <h2 className="font-orbitron text-2xl font-bold text-white flex items-center gap-2">
                <Trophy className="text-yellow-500" size={28} />
                Live Tournament Leaderboard
              </h2>
              <p className="font-rajdhani text-sm text-gray-400 mt-1">
                Real-time rankings updated every 30 seconds
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-dark-surface/50 border-b border-cyber-blue-500/20">
                  <tr>
                    <th className="px-6 py-4 text-left font-rajdhani text-sm font-bold text-gray-400 uppercase">Rank</th>
                    <th className="px-6 py-4 text-left font-rajdhani text-sm font-bold text-gray-400 uppercase">Team</th>
                    <th className="px-6 py-4 text-center font-rajdhani text-sm font-bold text-gray-400 uppercase">Kills</th>
                    <th className="px-6 py-4 text-center font-rajdhani text-sm font-bold text-gray-400 uppercase">Placement</th>
                    <th className="px-6 py-4 text-center font-rajdhani text-sm font-bold text-gray-400 uppercase">Total Points</th>
                    <th className="px-6 py-4 text-center font-rajdhani text-sm font-bold text-gray-400 uppercase">Trend</th>
                  </tr>
                </thead>
                <tbody>
                  {leaderboardData.map((team, index) => (
                    <motion.tr
                      key={team.rank}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-b border-gray-800 hover:bg-dark-surface/30 transition-colors ${
                        team.rank === 1 ? 'bg-yellow-500/5' : team.rank === 2 ? 'bg-gray-400/5' : team.rank === 3 ? 'bg-orange-500/5' : ''
                      }`}
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {team.rank <= 3 && (
                            <Trophy
                              className={
                                team.rank === 1 ? 'text-yellow-500' : team.rank === 2 ? 'text-gray-400' : 'text-orange-500'
                              }
                              size={20}
                            />
                          )}
                          <span className={`font-orbitron text-xl font-bold ${
                            team.rank === 1 ? 'text-yellow-500' : team.rank === 2 ? 'text-gray-400' : team.rank === 3 ? 'text-orange-500' : 'text-white'
                          }`}>
                            #{team.rank}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500 flex items-center justify-center">
                            <span className="font-orbitron text-sm font-bold">{team.team.charAt(0)}</span>
                          </div>
                          <span className="font-rajdhani text-lg font-bold text-white">{team.team}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-orbitron text-lg font-bold text-red-400">{team.kills}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-orbitron text-lg font-bold text-cyber-blue-500">{team.placement}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className="font-orbitron text-xl font-bold text-cyber-green-500">{team.points}</span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`font-orbitron text-2xl font-bold ${getTrendColor(team.trend)}`}>
                          {getTrendIcon(team.trend)}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="bg-dark-surface/50 border-t border-cyber-blue-500/20 px-6 py-4">
              <p className="font-rajdhani text-sm text-gray-400 text-center">
                <span className="text-cyber-green-500 font-bold">Live Updates:</span> Rankings refreshed at {new Date().toLocaleTimeString()}
              </p>
            </div>
          </motion.div>
        )}

        {/* Auto Prize Distribution */}
        {activeTab === 'prizes' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Prize Pool Overview */}
            <div className="glass border border-cyber-green-500/50 rounded-2xl p-8 bg-cyber-green-500/5">
              <div className="text-center mb-8">
                <h2 className="font-orbitron text-3xl font-bold text-white mb-2">Automated Prize Distribution</h2>
                <p className="font-rajdhani text-lg text-gray-400">
                  Prizes will be automatically transferred based on final standings
                </p>
              </div>

              <div className="text-center mb-8">
                <p className="font-rajdhani text-sm text-gray-400 mb-2">Total Prize Pool</p>
                <p className="font-orbitron text-6xl font-black bg-gradient-to-r from-cyber-green-500 to-cyber-blue-500 bg-clip-text text-transparent">
                  ₹{prizeDistribution.totalPrize.toLocaleString()}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {prizeDistribution.breakdown.map((prize, index) => (
                  <motion.div
                    key={prize.position}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ scale: 1.05, y: -5 }}
                    className={`glass-darker border rounded-xl p-6 ${
                      index === 0
                        ? 'border-yellow-500/50 bg-yellow-500/5'
                        : index === 1
                        ? 'border-gray-400/50 bg-gray-400/5'
                        : index === 2
                        ? 'border-orange-500/50 bg-orange-500/5'
                        : 'border-cyber-blue-500/30'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Award
                          className={
                            index === 0 ? 'text-yellow-500' : index === 1 ? 'text-gray-400' : index === 2 ? 'text-orange-500' : 'text-cyber-blue-500'
                          }
                          size={24}
                        />
                        <span className="font-orbitron text-lg font-bold text-white">{prize.position}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-rajdhani font-bold ${
                        index === 0
                          ? 'bg-yellow-500/20 text-yellow-500 border border-yellow-500'
                          : index === 1
                          ? 'bg-gray-400/20 text-gray-400 border border-gray-400'
                          : index === 2
                          ? 'bg-orange-500/20 text-orange-500 border border-orange-500'
                          : 'bg-cyber-blue-500/20 text-cyber-blue-500 border border-cyber-blue-500'
                      }`}>
                        {prize.percentage}%
                      </span>
                    </div>

                    <div className="mb-4">
                      <p className="font-rajdhani text-sm text-gray-400 mb-1">Winner</p>
                      <p className="font-rajdhani text-lg font-bold text-cyber-green-500">{prize.team}</p>
                    </div>

                    <div className="pt-4 border-t border-gray-700">
                      <p className="font-rajdhani text-sm text-gray-400 mb-1">Prize Amount</p>
                      <p className="font-orbitron text-2xl font-bold text-white">₹{prize.amount.toLocaleString()}</p>
                    </div>

                    <div className="mt-4">
                      <div className="w-full h-2 bg-dark-surface rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${prize.percentage}%` }}
                          transition={{ duration: 1, delay: index * 0.1 }}
                          className={`h-full ${
                            index === 0
                              ? 'bg-gradient-to-r from-yellow-500 to-yellow-600'
                              : index === 1
                              ? 'bg-gradient-to-r from-gray-400 to-gray-500'
                              : index === 2
                              ? 'bg-gradient-to-r from-orange-500 to-orange-600'
                              : 'bg-gradient-to-r from-cyber-blue-500 to-cyber-purple-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <div className="flex items-center justify-between text-xs font-rajdhani">
                        <span className="text-gray-500">Status</span>
                        <span className="px-2 py-1 bg-cyber-green-500/20 text-cyber-green-500 rounded font-bold border border-cyber-green-500">
                          AUTO TRANSFER
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 glass-darker border border-cyber-purple-500/30 rounded-xl p-6">
                <h3 className="font-orbitron text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <Zap className="text-cyber-purple-500" size={20} />
                  How Auto Distribution Works
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[
                    { step: '1', title: 'Match Ends', desc: 'System detects match completion', icon: '🏁' },
                    { step: '2', title: 'Calculate Prizes', desc: 'Auto-calculate based on rankings', icon: '🧮' },
                    { step: '3', title: 'Transfer Funds', desc: 'Instant wallet credit to winners', icon: '💰' },
                  ].map((item) => (
                    <div key={item.step} className="glass border border-cyber-blue-500/20 rounded-lg p-4">
                      <div className="text-3xl mb-2">{item.icon}</div>
                      <div className="flex items-center gap-2 mb-2">
                        <span className="w-6 h-6 rounded-full bg-cyber-purple-500 text-white flex items-center justify-center text-xs font-bold">
                          {item.step}
                        </span>
                        <span className="font-orbitron text-sm font-bold text-white">{item.title}</span>
                      </div>
                      <p className="font-rajdhani text-xs text-gray-400">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default FutureScope;
