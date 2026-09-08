import { 
  CyberwrapRewardClaim, 
  CyberwrapCoupon, 
  CyberwrapReward, 
  RewardsOverviewResponse, 
  ClaimScorePayload, 
  ClaimScoreResult,
  CouponStatus
} from '../types/rewards';

export type { CyberwrapCoupon };

export const rewardsApi = {
  /**
   * Helper to retrieve locally stored player identity if available on this device,
   * including query parameters when returning from external CyberWrap game.
   */
  getLocalPlayerId(): string | null {
    if (typeof window === 'undefined') return null;

    try {
      const params = new URLSearchParams(window.location.search);
      const urlPlayerId = params.get('player_id') || params.get('playerId');
      if (urlPlayerId && urlPlayerId.trim()) {
        const clean = urlPlayerId.trim();
        localStorage.setItem('cyberwrap_player_id', clean);
        localStorage.setItem('cyberwrap_last_player_id', clean);
        return clean;
      }
    } catch {}

    try {
      return localStorage.getItem('cyberwrap_player_id') || 
             localStorage.getItem('cyberwrap_last_player_id') || 
             sessionStorage.getItem('cyberwrap_player_id') || 
             sessionStorage.getItem('cyberwrap_last_player_id') || 
             null;
    } catch {
      return null;
    }
  },

  /**
   * Fetches overall aggregated metrics for the admin rewards dashboard
   */
  async getOverview(): Promise<RewardsOverviewResponse> {
    try {
      const res = await fetch('/api/admin/rewards/overview');
      if (res.ok) {
        return await res.json();
      }
      // Try fallback route
      const fallbackRes = await fetch('/api/rewards/overview');
      if (fallbackRes.ok) {
        return await fallbackRes.json();
      }
      throw new Error(`Failed to fetch rewards overview (${res.status})`);
    } catch (err: any) {
      console.warn('Rewards overview API call encountered error:', err.message);
      throw err;
    }
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
