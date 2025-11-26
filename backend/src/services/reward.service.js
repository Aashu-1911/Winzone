/**
 * Reward Distribution Service (Phase 7)
 * Handles automated reward distribution after match completion
 */

import mongoose from 'mongoose';
import Match from '../models/match.model.js';
import Competition from '../models/competition.model.js';
import { creditWallet } from './wallet.service.js';

/**
 * Prize distribution templates
 * Can be customized per competition
 */
const PRIZE_DISTRIBUTIONS = {
  // Winner takes all
  winner_takes_all: (prizePool) => [
    { rank: 1, percentage: 100 },
  ],
  
  // Top 3 split
  top3: (prizePool) => [
    { rank: 1, percentage: 50 },
    { rank: 2, percentage: 30 },
    { rank: 3, percentage: 20 },
  ],
  
  // Top 5 split
  top5: (prizePool) => [
    { rank: 1, percentage: 40 },
    { rank: 2, percentage: 25 },
    { rank: 3, percentage: 15 },
    { rank: 4, percentage: 12 },
    { rank: 5, percentage: 8 },
  ],

  // Top 10 split
  top10: (prizePool) => [
    { rank: 1, percentage: 30 },
    { rank: 2, percentage: 20 },
    { rank: 3, percentage: 15 },
    { rank: 4, percentage: 10 },
    { rank: 5, percentage: 8 },
    { rank: 6, percentage: 6 },
    { rank: 7, percentage: 4 },
    { rank: 8, percentage: 3 },
    { rank: 9, percentage: 2 },
    { rank: 10, percentage: 2 },
  ],
};

/**
 * Calculate rewards for match winners
 */
const calculateRewards = (leaderboard, prizePool, distributionType = 'top3') => {
  const distribution = PRIZE_DISTRIBUTIONS[distributionType] || PRIZE_DISTRIBUTIONS.top3;
  const prizeStructure = distribution(prizePool);
  
  const rewards = [];
  
  for (const prize of prizeStructure) {
    const player = leaderboard[prize.rank - 1];
    if (player) {
      const amount = Math.floor((prizePool * prize.percentage) / 100);
      rewards.push({
        playerId: player.playerId,
        rank: prize.rank,
        amount,
        percentage: prize.percentage,
      });
    }
  }
  
  return rewards;
};

/**
 * Distribute rewards to match winners
 * Uses MongoDB transactions for atomicity
 * Implements idempotency to prevent duplicate payouts
 */
export const distributeMatchRewards = async (matchId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    // Fetch match with competition details
    const match = await Match.findById(matchId)
      .populate('competitionId')
      .populate('players')
      .session(session);

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status !== 'completed') {
      throw new Error('Match is not completed yet');
    }

    // Check if rewards already distributed
    if (match.metadata?.rewardsDistributed) {
      console.log(`[RewardService] Rewards already distributed for match ${matchId}`);
      await session.abortTransaction();
      return {
        success: false,
        message: 'Rewards already distributed',
        alreadyDistributed: true,
      };
    }

    const competition = match.competitionId;
    const prizePool = competition.prizePool || 0;

    if (prizePool === 0) {
      console.log(`[RewardService] No prize pool for match ${matchId}`);
      await session.abortTransaction();
      return {
        success: false,
        message: 'No prize pool configured',
      };
    }

    // Get leaderboard and calculate rewards
    const leaderboard = match.getLeaderboard();
    const distributionType = competition.metadata?.prizeDistribution || 'top3';
    const rewards = calculateRewards(leaderboard, prizePool, distributionType);

    console.log(`[RewardService] Distributing rewards for match ${matchId}:`, rewards);

    // Credit wallets for each winner
    const creditResults = [];
    
    for (const reward of rewards) {
      const idempotencyKey = `match_reward_${matchId}_${reward.playerId}_${reward.rank}`;
      
      const result = await creditWallet({
        userId: reward.playerId,
        amount: reward.amount,
        type: 'reward',
        source: `match:${matchId}`,
        description: `Rank #${reward.rank} reward for ${competition.title}`,
        metadata: {
          matchId,
          competitionId: competition._id,
          rank: reward.rank,
          percentage: reward.percentage,
        },
        idempotencyKey,
        session,
      });

      creditResults.push({
        playerId: reward.playerId,
        amount: reward.amount,
        rank: reward.rank,
        duplicate: result.duplicate,
      });
    }

    // Mark rewards as distributed
    match.metadata = {
      ...match.metadata,
      rewardsDistributed: true,
      rewardsDistributedAt: new Date(),
      distributionType,
      totalDistributed: rewards.reduce((sum, r) => sum + r.amount, 0),
    };
    
    await match.save({ session });

    await session.commitTransaction();
    
    console.log(`[RewardService] Successfully distributed ${rewards.length} rewards for match ${matchId}`);
    
    return {
      success: true,
      matchId,
      prizePool,
      rewards: creditResults,
      totalDistributed: match.metadata.totalDistributed,
    };
  } catch (error) {
    await session.abortTransaction();
    console.error('[RewardService] Reward distribution error:', error);
    throw error;
  } finally {
    session.endSession();
  }
};

/**
 * Calculate entry fee split (organizer fee + platform fee)
 */
export const calculateFeeSplit = (entryFee) => {
  const platformFeePercentage = parseInt(process.env.PLATFORM_FEE_PERCENTAGE || '10', 10);
  const organizerFeePercentage = parseInt(process.env.ORGANIZER_FEE_PERCENTAGE || '5', 10);
  
  const platformFee = Math.floor((entryFee * platformFeePercentage) / 100);
  const organizerFee = Math.floor((entryFee * organizerFeePercentage) / 100);
  const prizePoolContribution = entryFee - platformFee - organizerFee;
  
  return {
    entryFee,
    platformFee,
    organizerFee,
    prizePoolContribution,
  };
};

export default {
  distributeMatchRewards,
  calculateFeeSplit,
  calculateRewards,
};
