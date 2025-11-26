import express from 'express';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint to verify backend is running
 * @access  Public
 */
router.get('/', (req, res) => {
  res.status(200).json({
    status: 'WinZone backend running successfully',
    timestamp: new Date().toISOString(),
  });
});

export default router;
