import { 
  CyberwrapRewardClaim, 
  CyberwrapCoupon, 
  CyberwrapReward, 
  RewardsOverviewResponse, 
  ClaimScorePayload, 
  ClaimScoreResult,
  CouponStatus
} from '../types/rewards';

export const rewardsApi = {
  /**
   * Fetches overall aggregated metrics for the admin rewards dashboard
   */
  async getOverview(): Promise<RewardsOverviewResponse> {
    const res = await fetch('/api/admin/rewards/overview');
    if (!res.ok) {
      throw new Error(`Failed to fetch rewards overview (${res.status})`);
    }
    return res.json();
  },

  /**
   * Fetches live list of coupons with optional status filter and search term
   */
  async getCoupons(status?: CouponStatus | 'all', search?: string): Promise<{
    success: boolean;
    coupons: CyberwrapCoupon[];
    total: number;
    dataSource: string;
  }> {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    const res = await fetch(`/api/admin/rewards/coupons?${params.toString()}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch coupons (${res.status})`);
    }
    return res.json();
  },

  /**
   * Manually updates coupon status (e.g. revoke, mark redeemed)
   */
  async updateCouponStatus(couponId: string, status: CouponStatus): Promise<{
    success: boolean;
    coupon: CyberwrapCoupon;
    message: string;
  }> {
    const res = await fetch(`/api/admin/rewards/coupons/${couponId}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update coupon status (${res.status})`);
    }
    return res.json();
  },

  /**
   * Fetches the reward cycle and coupon inventory for a specific player
   */
  async getPlayerRewards(playerId: string): Promise<{
    success: boolean;
    player_id: string;
    reward: CyberwrapReward | null;
    cumulative_score: number;
    coupons_earned_in_cycle: number;
    cycle_expires_at: string | null;
    coupons: CyberwrapCoupon[];
    activeCoupons: CyberwrapCoupon[];
    redeemedCoupons: CyberwrapCoupon[];
    expiredCoupons: CyberwrapCoupon[];
    claims: CyberwrapRewardClaim[];
  }> {
    const res = await fetch(`/api/rewards/player/${playerId}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch player rewards (${res.status})`);
    }
    return res.json();
  },

  /**
   * Claims a score for a player, updating cyberwrap_rewards and issuing cyberwrap_coupons if milestone reached
   */
  async claimScore(payload: ClaimScorePayload): Promise<ClaimScoreResult> {
    const res = await fetch('/api/rewards/claim-score', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to claim score (${res.status})`);
    }
    return res.json();
  },

  /**
   * Validates an active coupon code before placing an order
   */
  async validateCoupon(code: string): Promise<{
    success: boolean;
    valid: boolean;
    coupon?: CyberwrapCoupon;
    discountPercent?: number;
    message?: string;
    error?: string;
  }> {
    const res = await fetch('/api/rewards/validate-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.error || `Invalid coupon code (${res.status})`);
    }
    return data;
  },

  /**
   * Redeems an active coupon during checkout or vendor order
   */
  async redeemCoupon(codeOrId: string, orderValueXaf?: number): Promise<{
    success: boolean;
    coupon?: CyberwrapCoupon;
    discountPercent?: number;
    message: string;
  }> {
    const res = await fetch('/api/rewards/redeem-coupon', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ codeOrId, orderValueXaf }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to redeem coupon (${res.status})`);
    }
    return res.json();
  },

  /**
   * Seeds demo data into rewards tables
   */
  async seedRewardsData(count: number = 10): Promise<{
    success: boolean;
    message: string;
    seededClaims: number;
    seededCoupons: number;
    seededRewards: number;
  }> {
    const res = await fetch('/api/admin/rewards/seed', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ count }),
    });
    if (!res.ok) {
      throw new Error(`Failed to seed data (${res.status})`);
    }
    return res.json();
  },

  /**
   * Fetches the SQL schema file string
   */
  async getSchemaSql(): Promise<string> {
    const res = await fetch('/api/rewards/schema.sql');
    if (!res.ok) {
      throw new Error('Failed to load SQL schema');
    }
    return res.text();
  }
};
