import React, { useState, useEffect, useRef } from 'react';
import { Play, Sparkles, ArrowRight, Clock, Ticket, Copy, Check, Flame, Award, Loader2, Utensils } from 'lucide-react';
import { buildCyberWrapLaunchUrl, getAttribution } from '../lib/attribution';
import { rewardsApi, CyberwrapCoupon } from '../services/rewardsApi';
import { PlayerRewardsResponse } from '../types/rewards';

export type DailyRunState = 'new' | 'progress' | 'reward';

export interface DailyRunStatusCardProps {
  placement?: string;
  onOrderClick?: () => void;
  onLaunchClick?: () => void;
  className?: string;
  onStateChange?: (info: {
    state: DailyRunState;
    score: number;
    remaining: number;
    threshold: number;
    activeCoupon: CyberwrapCoupon | null;
  }) => void;
}

const REWARD_THRESHOLD = 200;

export const DailyRunStatusCard: React.FC<DailyRunStatusCardProps> = ({
  placement = 'homepage_daily_run',
  onOrderClick,
  onLaunchClick,
  className = '',
  onStateChange
}) => {
  const [loading, setLoading] = useState<boolean>(true);
  const [playerData, setPlayerData] = useState<PlayerRewardsResponse | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const hasLoggedViewRef = useRef<boolean>(false);

  // Load player state from backend
  useEffect(() => {
    let isMounted = true;

    const fetchPlayerStatus = async () => {
      try {
        const localPlayerId = rewardsApi.getLocalPlayerId();
        if (localPlayerId) {
          const res = await rewardsApi.getPlayerRewards(localPlayerId);
          if (isMounted && res && res.success) {
            setPlayerData(res);
          }
        }
      } catch (err) {
        console.warn('Unable to retrieve CyberWrap player state:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchPlayerStatus();

    return () => {
      isMounted = false;
    };
  }, []);

  // Compute authoritative state & values
  const now = Date.now();
  
  // 1. Authoritative active coupon check
  const activeCoupon: CyberwrapCoupon | null = (
    playerData?.activeCoupons?.find(
      (c) => c.status === 'active' && new Date(c.expires_at).getTime() > now
    ) ||
    playerData?.coupons?.find(
      (c) => c.status === 'active' && new Date(c.expires_at).getTime() > now
    ) ||
    null
  );
  const validRewardAvailable = Boolean(activeCoupon);

  // 2. Authoritative cumulative score
  const rawScore = Number(playerData?.cumulative_score ?? playerData?.reward?.cumulative_score ?? 0);
  const currentScore = isNaN(rawScore) ? 0 : Math.max(0, rawScore);

  // 3. State Priority:
  // 1. VALID AVAILABLE REWARD
  // 2. ACTIVE SCORE > 0 AND SCORE < 200
  // 3. NO ACTIVE PROGRESS
  let state: DailyRunState = 'new';
  let displayScore = currentScore;

  if (validRewardAvailable) {
    state = 'reward';
  } else if (currentScore > 0) {
    state = 'progress';
    // If score >= 200 but reward has been consumed/expired, wrap to remainder in current cycle
    if (displayScore >= REWARD_THRESHOLD) {
      displayScore = displayScore % REWARD_THRESHOLD;
      if (displayScore === 0) {
        state = 'new';
      }
    }
  } else {
    state = 'new';
  }

  const remaining = Math.max(0, REWARD_THRESHOLD - displayScore);
  const progressPercent = Math.min(100, Math.max(0, Math.round((displayScore / REWARD_THRESHOLD) * 100)));

  // Notify parent component if callback provided
  useEffect(() => {
    if (!loading && onStateChange) {
      onStateChange({
        state,
        score: displayScore,
        remaining,
        threshold: REWARD_THRESHOLD,
        activeCoupon
      });
    }
  }, [loading, state, displayScore, remaining, activeCoupon, onStateChange]);

  // Log daily_run_section_viewed analytics event exactly once per mount
  useEffect(() => {
    if (!loading && !hasLoggedViewRef.current) {
      hasLoggedViewRef.current = true;
      const attr = getAttribution();
      const playerId = rewardsApi.getLocalPlayerId();

      const payload = {
        session_id: `sess_${Date.now()}_${Math.floor(Math.random() * 8999 + 1000)}`,
        campaign: attr.campaign,
        event: 'daily_run_section_viewed',
        timestamp: Date.now(),
        game_version: 'v1.4.2',
        player_id: playerId,
        data: {
          state,
          score: displayScore,
          threshold: REWARD_THRESHOLD,
          placement,
          source: attr.source
        }
      };

      try {
        fetch('/api/analytics/events', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        }).catch(() => {});
      } catch {}
    }
  }, [loading, state, displayScore, placement]);

  // Helper to log CTA click with full state data
  const logCtaClick = (clickedState: DailyRunState) => {
    const attr = getAttribution();
    const playerId = rewardsApi.getLocalPlayerId();

    const payload = {
      session_id: `sess_${Date.now()}_${Math.floor(Math.random() * 8999 + 1000)}`,
      campaign: attr.campaign,
      event: 'daily_run_cta_clicked',
      timestamp: Date.now(),
      game_version: 'v1.4.2',
      player_id: playerId,
      data: {
        state: clickedState,
        score: displayScore,
        threshold: REWARD_THRESHOLD,
        placement,
        source: attr.source
      }
    };

    try {
      fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      }).catch(() => {});
    } catch {}
  };

  // Launch CyberWrap game (for NEW and PROGRESS states)
  const handleLaunchGame = () => {
    logCtaClick(state);
    if (onLaunchClick) onLaunchClick();
    const url = buildCyberWrapLaunchUrl(placement);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  // Order now (for REWARD state)
  const handleOrderNow = () => {
    logCtaClick('reward');
    if (onOrderClick) {
      onOrderClick();
    } else {
      const menuElem = document.getElementById('menu');
      if (menuElem) {
        menuElem.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.hash = 'menu';
      }
    }
  };

  // Copy coupon code helper
  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2500);
  };

  // -------------------------------------------------------------
  // LOADING STATE (Reserved height to prevent layout shift)
  // -------------------------------------------------------------
  if (loading) {
    return (
      <div 
        className={`min-h-[290px] bg-gradient-to-br from-stone-900 via-stone-950 to-slate-950 text-white rounded-2xl p-6 shadow-xl border border-orange-500/20 flex flex-col justify-between relative overflow-hidden ${className}`}
        aria-busy="true"
        aria-label="Checking your Daily Run progress"
      >
        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono text-stone-400">
            <span>🎮 YOUR DAILY RUN</span>
          </div>
          <span className="w-16 h-5 bg-white/5 rounded animate-pulse" />
        </div>

        <div className="space-y-3 my-auto py-4">
          <div className="flex items-center gap-2.5 text-amber-400">
            <Loader2 size={20} className="animate-spin text-orange-500 shrink-0" />
            <span className="text-base sm:text-lg font-bold font-sans tracking-tight text-stone-200">
              Checking your progress...
            </span>
          </div>
          <div className="w-3/4 h-3 bg-white/5 rounded animate-pulse" />
        </div>

        <div className="w-full h-12 bg-white/5 rounded-xl animate-pulse" />
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 3 — REWARD EARNED (Active valid 20% coupon available)
  // -------------------------------------------------------------
  if (state === 'reward' && activeCoupon) {
    const daysLeft = Math.max(
      1,
      Math.ceil((new Date(activeCoupon.expires_at).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    );
    const formattedExpiry = new Date(activeCoupon.expires_at).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });

    return (
      <div 
        className={`min-h-[290px] bg-gradient-to-br from-amber-500 via-orange-600 to-amber-700 text-white rounded-2xl p-6 shadow-xl border border-amber-300/40 relative overflow-hidden flex flex-col justify-between ${className}`}
        id="daily-run-card-reward"
      >
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-yellow-300/20 rounded-full blur-2xl pointer-events-none" />

        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider">
              <Sparkles size={14} className="text-yellow-200 animate-spin" />
              <span>🎟️ 20% OFF UNLOCKED</span>
            </div>
            <span className="text-[11px] font-semibold text-amber-100 flex items-center gap-1 font-mono">
              <Clock size={12} />
              <span>VALID {daysLeft} {daysLeft === 1 ? 'DAY' : 'DAYS'} ({formattedExpiry})</span>
            </span>
          </div>

          <div className="space-y-1 mb-4">
            <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight leading-snug">
              Your CyberWrap reward is ready.
            </h3>
            <p className="text-amber-100 text-xs sm:text-sm leading-relaxed">
              Use your 20% discount coupon on your next DailyBread order:
            </p>
          </div>

          {/* Coupon Code Pill */}
          <div className="bg-black/30 border border-white/20 rounded-xl p-3 flex items-center justify-between gap-3 mb-4 font-mono">
            <div className="flex items-center gap-2.5 min-w-0">
              <Ticket size={18} className="text-yellow-300 shrink-0" />
              <div className="truncate">
                <span className="text-[10px] text-amber-300/80 uppercase block font-sans">Coupon Code</span>
                <span className="text-base sm:text-lg font-black tracking-widest text-yellow-200 select-all truncate block">
                  {activeCoupon.code_hash}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => handleCopyCode(activeCoupon.code_hash)}
              className="flex items-center gap-1.5 bg-white text-orange-950 px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-yellow-200 transition-colors shadow-sm cursor-pointer shrink-0"
              title="Copy coupon code"
            >
              {copiedCode === activeCoupon.code_hash ? (
                <>
                  <Check size={13} className="text-emerald-600" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={13} />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Primary Action: ORDER NOW */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1 font-ui">
          <button
            type="button"
            onClick={handleOrderNow}
            className="flex-1 bg-white text-orange-950 hover:bg-amber-100 font-extrabold py-3 px-5 rounded-xl text-center text-sm shadow-md transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 cursor-pointer uppercase tracking-wider"
            id="daily-run-order-now-btn"
          >
            <Utensils size={15} className="text-orange-600" />
            <span>ORDER NOW</span>
            <ArrowRight size={15} />
          </button>
          <button
            type="button"
            onClick={handleLaunchGame}
            className="bg-black/40 hover:bg-black/60 text-white font-bold py-3 px-4 rounded-xl text-center text-xs tracking-wider uppercase transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            title="Play again for fun or leaderboard ranking"
          >
            <Play size={12} fill="currentColor" />
            <span>PLAY AGAIN</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 2 — RETURNING PLAYER / ACTIVE PROGRESS (< 200 points)
  // -------------------------------------------------------------
  if (state === 'progress') {
    return (
      <div 
        className={`min-h-[290px] bg-gradient-to-br from-slate-900 via-stone-900 to-orange-950 text-white rounded-2xl p-6 shadow-xl border border-orange-500/30 relative overflow-hidden flex flex-col justify-between ${className}`}
        id="daily-run-card-progress"
      >
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
              <Flame size={14} className="text-orange-400" />
              <span>🎮 YOUR DAILY RUN</span>
            </div>
            <span className="text-xs font-mono text-amber-300 font-bold bg-amber-500/20 px-2.5 py-1 rounded-md border border-amber-500/30">
              {displayScore} / {REWARD_THRESHOLD} POINTS
            </span>
          </div>

          <div className="space-y-1.5 mb-4">
            <h3 className="text-xl sm:text-2xl font-black font-heading tracking-tight text-white leading-snug">
              You're only <span className="text-amber-400 font-mono">{remaining}</span> {remaining === 1 ? 'point' : 'points'} away from 20% OFF.
            </h3>
            <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
              Hop back in the delivery truck in Buea to reach 200 points and claim your 7-day restaurant discount.
            </p>
          </div>

          {/* Dynamic Progress Bar (Clamped 0% to 100%) */}
          <div className="space-y-1.5 mb-4">
            <div 
              className="w-full bg-slate-800/80 rounded-full h-3 overflow-hidden border border-slate-700/60 p-0.5"
              role="progressbar"
              aria-valuenow={displayScore}
              aria-valuemin={0}
              aria-valuemax={REWARD_THRESHOLD}
            >
              <div 
                className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-400 h-full rounded-full transition-all duration-700 ease-out"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-mono text-stone-400">
              <span>{displayScore} pts scored</span>
              <span className="text-amber-400 font-bold">{remaining} pts remaining</span>
              <span>200 pts goal</span>
            </div>
          </div>
        </div>

        {/* Primary Action: CONTINUE RUN */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1 font-ui">
          <button
            type="button"
            onClick={handleLaunchGame}
            className="flex-1 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3 px-5 rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer"
            id="daily-run-continue-btn"
          >
            <Play size={15} fill="currentColor" />
            <span>CONTINUE RUN</span>
            <ArrowRight size={15} />
          </button>
          <button
            type="button"
            onClick={handleOrderNow}
            className="bg-white/10 hover:bg-white/20 text-stone-200 text-xs font-bold px-4 py-3 rounded-xl transition-colors cursor-pointer"
          >
            Order Now
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // STATE 1 — NEW VISITOR / NO ACTIVE PROGRESS (Default)
  // -------------------------------------------------------------
  return (
    <div 
      className={`min-h-[290px] bg-gradient-to-br from-[#12161f] via-[#1a202c] to-[#2d1b11] text-white rounded-2xl p-6 shadow-xl border border-orange-500/20 relative overflow-hidden flex flex-col justify-between ${className}`}
      id="daily-run-card-new"
    >
      {/* Background Accent */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />

      <div>
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
            <Award size={14} className="text-orange-400" />
            <span>🎮 YOUR DAILY RUN</span>
          </div>
          <span className="text-xs font-mono text-amber-300/90 font-semibold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            0 / {REWARD_THRESHOLD} POINTS
          </span>
        </div>

        <div className="space-y-1.5 mb-4">
          <div className="text-amber-400 font-mono text-xs font-bold uppercase tracking-wider">
            Play. Earn. Eat.
          </div>
          <h3 className="text-xl md:text-2xl font-black font-heading tracking-tight text-white leading-snug">
            Score 200 points to unlock 20% OFF your next order.
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            Drive the CyberWrap delivery truck through 3D Buea, deliver hot shawarmas, and earn your discount in minutes.
          </p>
        </div>

        {/* Value Badges */}
        <div className="grid grid-cols-3 gap-2 text-center text-[11px] font-medium text-stone-300 mb-4 font-mono">
          <div className="bg-white/5 border border-white/10 rounded-lg p-2">
            <span className="text-orange-400 font-bold block text-sm">3D WebGL</span>
            <span>No Download</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-2">
            <span className="text-amber-400 font-bold block text-sm">200 Pts</span>
            <span>Daily Goal</span>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-2">
            <span className="text-emerald-400 font-bold block text-sm">20% OFF</span>
            <span>Valid 7 Days</span>
          </div>
        </div>
      </div>

      {/* Primary Action: PLAY YOUR DAILY RUN */}
      <button
        type="button"
        onClick={handleLaunchGame}
        className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black py-3.5 px-6 rounded-xl shadow-lg shadow-orange-500/20 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2 text-sm uppercase tracking-wider cursor-pointer font-ui"
        id="daily-run-play-btn"
      >
        <Play size={16} fill="currentColor" />
        <span>PLAY YOUR DAILY RUN</span>
        <ArrowRight size={16} />
      </button>
    </div>
  );
};
