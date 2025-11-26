import express from 'express';
import cors from 'cors';
import healthRoutes from './routes/health.route.js';
import authRoutes from './routes/auth.route.js';
import competitionRoutes from './routes/competition.route.js';
import matchRoutes from './routes/match.route.js';
import walletRoutes from './routes/wallet.route.js';
import payoutRoutes from './routes/payout.route.js';
import transactionRoutes from './routes/transaction.route.js';
import paymentRoutes from './routes/payment.route.js';
import adminRoutes from './routes/admin.route.js';

const app = express();

// ========== Middleware Configuration ==========

// Enable CORS for all origins (configure as needed for production)
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));

// Payment webhook endpoint (must be before express.json() for raw body)
app.use('/api/payments', paymentRoutes);

// Parse JSON request bodies
app.use(express.json());

// Parse URL-encoded request bodies
app.use(express.urlencoded({ extended: true }));

// ========== Routes ==========

// Health check route
app.use('/api/health', healthRoutes);

// Authentication routes
app.use('/api/auth', authRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Competition routes
app.use('/api/competitions', competitionRoutes);

// Match routes (Phase 6: Real-Time Match System)
app.use('/api/matches', matchRoutes);

// Wallet routes (Phase 7: Wallet & Payout)
app.use('/api/wallet', walletRoutes);

// Admin payout routes (Phase 7: Wallet & Payout)
app.use('/api/admin/payouts', payoutRoutes);

// Transaction routes (Phase 7: Wallet & Payout)
app.use('/api/transactions', transactionRoutes);

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to WinZone API' });
});

// ========== Error Handling Middleware ==========

// 404 Handler - Route not found
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);

  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

export default app;
