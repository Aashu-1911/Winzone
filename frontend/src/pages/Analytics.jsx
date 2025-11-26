import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { getPlayerAnalytics } from '../services/matchService';

function Analytics() {
  const { userId } = useParams();
  const { user } = useAuth();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const targetUserId = userId || user?._id;

  const fetchAnalytics = async () => {
    if (!targetUserId) {
      console.log('No targetUserId, skipping fetch');
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      console.log('Fetching analytics for user:', targetUserId);
      const response = await getPlayerAnalytics(targetUserId);
      console.log('Analytics response:', response);

      if (response.success) {
        setAnalytics(response.data);
      } else {
        toast.error(response.message || 'No analytics data found');
        setLoading(false);
      }
    } catch (err) {
      console.error('Fetch analytics error:', err);
      toast.error(err.message || 'Failed to load analytics');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [targetUserId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyber-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="font-rajdhani text-xl text-gray-400">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen bg-dark-bg pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className="font-orbitron text-2xl font-bold text-white mb-4">No Analytics Data</h2>
          <p className="font-rajdhani text-gray-400">Play some matches to see your statistics!</p>
        </div>
      </div>
    );
  }

  const { stats, recentMatches = [] } = analytics;

  // Prepare data for charts
  const winLossData = [
    { name: 'Wins', value: stats.wins || 0, color: '#00ff9f' },
    { name: 'Losses', value: stats.losses || 0, color: '#ff3366' },
  ];

  const scoreProgressionData = recentMatches
    .slice(0, 20)
    .reverse()
    .map((match, index) => ({
      match: `M${index + 1}`,
      score: match.playerScore || 0,
      date: new Date(match.createdAt).toLocaleDateString(),
    }));

  const COLORS = {
    wins: '#00ff9f',
    losses: '#ff3366',
    blue: '#00d4ff',
    purple: '#a78bfa',
  };

  // Custom tooltip styling
  // eslint-disable-next-line react/prop-types
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass rounded-lg border border-cyber-blue-500/30 p-3">
          {payload.map((entry, index) => (
            <div key={index} className="font-rajdhani">
              <p className="text-white font-semibold">{entry.name}:</p>
              <p className="text-cyber-blue-500 font-bold">{entry.value}</p>
            </div>
          ))}
        </div>
      );
    }
    return null;
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
          <h1 className="font-orbitron text-4xl font-black bg-gradient-to-r from-cyber-blue-500 via-cyber-purple-500 to-cyber-pink bg-clip-text text-transparent mb-2">
            📊 Player Analytics
          </h1>
          <p className="font-rajdhani text-xl text-gray-400">
            {analytics.user?.name || 'Player'} - Performance Statistics
          </p>
        </motion.div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass rounded-2xl border border-cyber-blue-500/30 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🎮</span>
              <h3 className="font-rajdhani text-sm text-gray-400 uppercase">Total Matches</h3>
            </div>
            <p className="font-orbitron text-4xl font-bold text-cyber-blue-500">
              {stats.matchesPlayed || 0}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass rounded-2xl border border-cyber-green-500/30 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">🏆</span>
              <h3 className="font-rajdhani text-sm text-gray-400 uppercase">Win Rate</h3>
            </div>
            <p className="font-orbitron text-4xl font-bold text-cyber-green-500">
              {stats.winRate?.toFixed(1) || 0}%
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass rounded-2xl border border-cyber-purple-500/30 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">📈</span>
              <h3 className="font-rajdhani text-sm text-gray-400 uppercase">Avg Score</h3>
            </div>
            <p className="font-orbitron text-4xl font-bold text-cyber-purple-500">
              {stats.averageScore?.toFixed(0) || 0}
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass rounded-2xl border border-cyber-pink/30 p-6"
          >
            <div className="flex items-center gap-3 mb-2">
              <span className="text-3xl">⭐</span>
              <h3 className="font-rajdhani text-sm text-gray-400 uppercase">Highest Score</h3>
            </div>
            <p className="font-orbitron text-4xl font-bold text-cyber-pink">
              {stats.highestScore || 0}
            </p>
          </motion.div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Wins vs Losses Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="glass rounded-2xl border border-cyber-blue-500/30 p-6"
          >
            <h2 className="font-orbitron text-2xl font-bold text-white mb-6">
              🏆 Wins vs Losses
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={winLossData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="name"
                  stroke="#94a3b8"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                />
                <YAxis stroke="#94a3b8" style={{ fontFamily: 'Rajdhani, sans-serif' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontFamily: 'Rajdhani, sans-serif', color: '#fff' }} />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Win Rate Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 }}
            className="glass rounded-2xl border border-cyber-purple-500/30 p-6"
          >
            <h2 className="font-orbitron text-2xl font-bold text-white mb-6">
              📊 Win Distribution
            </h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={winLossData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  style={{ fontFamily: 'Rajdhani, sans-serif', fontWeight: 'bold' }}
                >
                  {winLossData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        {/* Score Progression Line Chart */}
        {scoreProgressionData.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="glass rounded-2xl border border-cyber-green-500/30 p-6 mb-8"
          >
            <h2 className="font-orbitron text-2xl font-bold text-white mb-6">
              📈 Score Progression (Recent Matches)
            </h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={scoreProgressionData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis
                  dataKey="match"
                  stroke="#94a3b8"
                  style={{ fontFamily: 'Rajdhani, sans-serif' }}
                />
                <YAxis stroke="#94a3b8" style={{ fontFamily: 'Rajdhani, sans-serif' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend wrapperStyle={{ fontFamily: 'Rajdhani, sans-serif', color: '#fff' }} />
                <Line
                  type="monotone"
                  dataKey="score"
                  stroke={COLORS.blue}
                  strokeWidth={3}
                  dot={{ fill: COLORS.blue, r: 6 }}
                  activeDot={{ r: 8, fill: COLORS.purple }}
                />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>
        )}

        {/* Recent Matches Table */}
        {recentMatches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="glass rounded-2xl border border-cyber-blue-500/30 p-6"
          >
            <h2 className="font-orbitron text-2xl font-bold text-white mb-6">
              📜 Recent Matches
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-cyber-blue-500/30">
                    <th className="px-4 py-3 text-left font-rajdhani text-sm text-gray-400 uppercase">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-rajdhani text-sm text-gray-400 uppercase">
                      Competition
                    </th>
                    <th className="px-4 py-3 text-center font-rajdhani text-sm text-gray-400 uppercase">
                      Score
                    </th>
                    <th className="px-4 py-3 text-center font-rajdhani text-sm text-gray-400 uppercase">
                      Result
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {recentMatches.slice(0, 10).map((match) => (
                    <tr
                      key={match._id}
                      className="border-b border-cyber-blue-500/10 hover:bg-cyber-blue-500/5 transition-colors duration-200"
                    >
                      <td className="px-4 py-4 font-rajdhani text-white">
                        {new Date(match.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4 font-rajdhani text-white">
                        {match.competitionId?.title || 'Unknown'}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="font-orbitron font-bold text-cyber-blue-500 text-lg">
                          {match.playerScore || 0}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {match.isWinner ? (
                          <span className="px-3 py-1 bg-cyber-green-500/20 text-cyber-green-500 rounded-full text-sm font-rajdhani font-bold">
                            🏆 WIN
                          </span>
                        ) : (
                          <span className="px-3 py-1 bg-red-500/20 text-red-500 rounded-full text-sm font-rajdhani font-bold">
                            ❌ LOSS
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}

export default Analytics;
