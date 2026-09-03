// -------------------------------------------------------------
// Database Schema Interfaces for Cyberwrap / Supabase Integration
// -------------------------------------------------------------

/**
 * 1. analytics_events
 * Tracks live interaction telemetry, user journeys, and campaign interactions.
 */
export interface AnalyticsEvent {
  id: number | string; // int8 (Primary Key, Identity)
  session_id: string;
  campaign: string;
  event: string;
  timestamp: number;
  game_version: string;
  data: Record<string, any> | null;
  created_at: string;
  player_id?: string | null; // uuid (Nullable)
}

/**
 * 2. cyberwrap_reward_claims
 * Records individual score submissions and credits towards rewards.
 */
export interface CyberwrapRewardClaim {
  id: string; // uuid (Primary Key)
  player_id: string; // uuid
  session_id: string;
  game_id: string; // uuid
  score_amount: number; // int4
  credited_amount: number; // int4
  coupon_id?: string | null; // uuid (Nullable, Foreign Key -> cyberwrap_coupons.id)
  created_at: string; // timestamptz
}

/**
 * 3. cyberwrap_coupons
 * Discount voucher generated when a player reaches a score milestone.
 */
export type CouponStatus = 'active' | 'redeemed' | 'expired';

export interface CyberwrapCoupon {
  id: string; // uuid (Primary Key)
  player_id: string; // uuid (Foreign Key -> cyberwrap_rewards.player_id)
  reward_id: string; // uuid (Foreign Key -> cyberwrap_rewards.id)
  code_hash: string; // text (e.g. SHAWARMA-20-7391)
  discount_percent: number; // int4 (20% coupon)
  status: CouponStatus; // 'active' | 'redeemed' | 'expired'
  generated_at: string; // timestamptz
  expires_at: string; // timestamptz (generated_at + 7 days)
  redeemed_at?: string | null; // timestamptz (Nullable)
  created_at: string; // timestamptz
}

/**
 * 4. cyberwrap_rewards
 * Aggregated rewards progress and score milestones for a player cycle (2,000 pts threshold).
 */
export type RewardCycleStatus = 'in_progress' | 'claimed' | 'cycle_completed' | 'tier_achieved';

export interface CyberwrapReward {
  id: string; // uuid (Primary Key)
  player_id: string; // uuid
  cumulative_score: number; // int4 (0 - 2,000)
  cycle_started_at: string; // timestamptz
  cycle_expires_at: string; // timestamptz (7-day cycle)
  coupons_earned_in_cycle: number; // int4 (max 2 per cycle)
  reward_status: RewardCycleStatus; // text
  created_at: string; // timestamptz
  updated_at: string; // timestamptz
}

// -------------------------------------------------------------
// Relational / Admin Aggregation Data Types
// -------------------------------------------------------------

export interface PlayerRewardWithRelations extends CyberwrapReward {
  playerName?: string;
  coupons: CyberwrapCoupon[];
  claims: CyberwrapRewardClaim[];
}

export interface AdminRewardsMetrics {
  totalCouponsIssued: number;
  totalCouponsRedeemed: number;
  totalCouponsActive: number;
  totalCouponsExpired: number;
  redemptionRatePercent: number;
  activeRewardCycles?: number;
  totalScoreClaimed: number;
  totalCreditedAmount: number;
  totalRewardClaims: number;
  totalActivePlayers: number;
  avgScorePerClaim: number;
}

export interface RewardsOverviewResponse {
  success: boolean;
  dataSource: 'supabase' | 'simulated_fallback';
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  metrics: AdminRewardsMetrics;
  recentCoupons: CyberwrapCoupon[];
  topPlayers: PlayerRewardWithRelations[];
  recentClaims: CyberwrapRewardClaim[];
  serverTime?: string;
  lastUpdated: string;
  error?: string | null;
}

export interface ClaimScorePayload {
  player_id: string;
  session_id: string;
  game_id?: string;
  score_amount: number;
  game_version?: string;
}

export interface ClaimScoreResult {
  success: boolean;
  claim: CyberwrapRewardClaim;
  reward: CyberwrapReward;
  newCoupon?: CyberwrapCoupon | null;
  milestoneReached: boolean;
  message: string;
}

export interface AuthUserProfile {
  id: string;
  email: string;
  role: 'admin' | 'staff' | 'user';
  isAdmin: boolean;
}
