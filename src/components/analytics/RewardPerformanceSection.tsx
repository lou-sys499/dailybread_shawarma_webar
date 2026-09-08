import React from 'react';
import { Gift, CheckCircle2, Clock, AlertTriangle, ArrowRight, ShieldCheck, Ticket } from 'lucide-react';
import { CouponAssistedMetrics } from '../../types/analytics';
import { AdminRewardsMetrics } from '../../types/rewards';

interface RewardPerformanceSectionProps {
  couponAssisted?: CouponAssistedMetrics;
  rewardsMetrics?: AdminRewardsMetrics | null;
  onNavigateToRewardsAdmin?: () => void;
}

export const RewardPerformanceSection: React.FC<RewardPerformanceSectionProps> = ({
  couponAssisted,
  rewardsMetrics,
  onNavigateToRewardsAdmin
}) => {
  // Prefer authoritative rewards API metrics when available, fallback to couponAssisted
  const totalIssued = rewardsMetrics?.totalCoupons ?? couponAssisted?.couponsEarned ?? 0;
  const activeCoupons = rewardsMetrics?.activeCoupons ?? couponAssisted?.couponsActive ?? 0;
  const redeemedCoupons = rewardsMetrics?.redeemedCoupons ?? couponAssisted?.couponsRedeemed ?? 0;
  const expiredCoupons = rewardsMetrics?.expiredCoupons ?? 0;
  const redemptionRate = rewardsMetrics?.redemptionRate ?? couponAssisted?.redemptionRate ?? 0;

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Gift size={16} className="text-pink-400" />
            <span>5. Reward & Coupon Performance</span>
          </h2>
          <p className="text-xs text-slate-400">
            Authoritative rewards lifecycle: issuance, active 7-day windows, and cart redemption
          </p>
        </div>
        {onNavigateToRewardsAdmin && (
          <button
            onClick={onNavigateToRewardsAdmin}
            className="flex items-center gap-1.5 text-xs font-mono text-pink-400 hover:text-pink-300 bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 px-3 py-1.5 rounded-xl transition-colors cursor-pointer"
          >
            <span>Open Rewards Admin</span>
            <ArrowRight size={13} />
          </button>
        )}
      </div>

      <div className="bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-4">
        {/* Core Rewards Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {/* Total Issued */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Ticket size={13} className="text-pink-400" />
              <span>Total Coupons Issued</span>
            </div>
            <div className="text-2xl font-black font-mono text-white">
              {totalIssued.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 block">20% off Buea delivery</span>
          </div>

          {/* Active Coupons */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <Clock size={13} className="text-emerald-400" />
              <span>Active in 7-Day Window</span>
            </div>
            <div className="text-2xl font-black font-mono text-emerald-400">
              {activeCoupons.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 block">Ready for checkout</span>
          </div>

          {/* Redeemed Coupons */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <CheckCircle2 size={13} className="text-purple-400" />
              <span>Redeemed in Cart</span>
            </div>
            <div className="text-2xl font-black font-mono text-purple-400">
              {redeemedCoupons.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 block">Applied during checkout</span>
          </div>

          {/* Expired */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <AlertTriangle size={13} className="text-amber-400" />
              <span>Expired Coupons</span>
            </div>
            <div className="text-2xl font-black font-mono text-amber-400">
              {expiredCoupons.toLocaleString()}
            </div>
            <span className="text-[10px] text-slate-500 block">Exceeded 7-day lifecycle</span>
          </div>

          {/* Redemption Rate */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <ShieldCheck size={13} className="text-cyan-400" />
              <span>Redemption Rate</span>
            </div>
            <div className="text-2xl font-black font-mono text-cyan-400">
              {redemptionRate.toFixed(1)}%
            </div>
            <span className="text-[10px] text-slate-500 block">Redeemed / Total Issued</span>
          </div>
        </div>

        {/* Coupon-Assisted WhatsApp Intent Breakdown */}
        {couponAssisted && (
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs font-mono uppercase font-bold text-slate-300 block">
                Coupon-Assisted Order Intent Share
              </span>
              <p className="text-xs text-slate-400 max-w-xl">
                Out of <strong>{couponAssisted.totalOrderIntent.toLocaleString()}</strong> total WhatsApp order intents,{' '}
                <strong className="text-pink-400">{couponAssisted.couponAssistedIntent.toLocaleString()}</strong> (
                <strong>{couponAssisted.couponAssistedPercent.toFixed(1)}%</strong>) were accompanied by an active 20% discount code earned through CyberWrap.
              </p>
            </div>

            <div className="flex items-center gap-3 bg-[#121722] border border-slate-800 px-4 py-2.5 rounded-xl shrink-0">
              <div className="text-center">
                <span className="text-[10px] font-mono text-slate-500 block">Assisted Rate</span>
                <span className="text-xl font-black font-mono text-pink-400">
                  {couponAssisted.couponAssistedPercent.toFixed(1)}%
                </span>
              </div>
              <div className="w-px h-8 bg-slate-800"></div>
              <div className="text-center">
                <span className="text-[10px] font-mono text-slate-500 block">Assisted Orders</span>
                <span className="text-xl font-black font-mono text-white">
                  {couponAssisted.couponAssistedIntent.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
