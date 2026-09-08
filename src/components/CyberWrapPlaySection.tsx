import React, { useState } from 'react';
import { Play, Sparkles, ChevronRight, Award, Trophy, Zap, ShieldCheck, Flame, Compass, Utensils, ArrowRight } from 'lucide-react';
import { DailyRunCard } from './DailyRunCard';
import { DailyRunState } from './DailyRunStatusCard';
import { buildCyberWrapLaunchUrl } from '../lib/attribution';
import { CyberwrapCoupon } from '../services/rewardsApi';

interface CyberWrapPlaySectionProps {
  onOrderClick?: () => void;
  onLaunchClick?: () => void;
}

export const CyberWrapPlaySection: React.FC<CyberWrapPlaySectionProps> = ({
  onOrderClick,
  onLaunchClick
}) => {
  const [cardState, setCardState] = useState<{
    state: DailyRunState;
    score: number;
    remaining: number;
    threshold: number;
    activeCoupon: CyberwrapCoupon | null;
  }>({
    state: 'new',
    score: 0,
    remaining: 200,
    threshold: 200,
    activeCoupon: null
  });

  const handlePrimaryPlay = () => {
    if (onLaunchClick) onLaunchClick();
    const url = buildCyberWrapLaunchUrl('homepage_play_section');
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleOrder = () => {
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

  return (
    <section id="play-cyberwrap" className="py-16 md:py-24 bg-gradient-to-b from-stone-900 via-[#13161c] to-stone-950 text-white relative overflow-hidden border-t border-b border-orange-500/20">
      {/* Subtle background graphics */}
      <div className="absolute top-1/4 -left-20 w-80 h-80 bg-orange-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-0 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 md:px-8 relative z-10">
        <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* Left Column: Visual Storytelling & State-Aware Conversion */}
          <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
            {cardState.state === 'reward' ? (
              <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 border border-amber-500/40 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
                <Sparkles size={14} className="text-yellow-300 animate-spin" />
                <span>🎟️ 20% OFF Unlocked • Ready to Redeem</span>
              </div>
            ) : cardState.state === 'progress' ? (
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
                <Flame size={14} className="text-orange-400" />
                <span>🔥 {cardState.score} / 200 Points In Progress</span>
              </div>
            ) : (
              <div className="inline-flex items-center gap-2 bg-orange-500/20 text-orange-400 border border-orange-500/30 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono">
                <Sparkles size={14} className="text-orange-400" />
                <span>Play • Earn • Eat</span>
              </div>
            )}

            <div className="space-y-3">
              <div className="text-amber-400 font-mono text-sm tracking-widest uppercase font-bold">
                DailyBread Arcade Integration
              </div>
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading tracking-tight text-white leading-tight">
                {cardState.state === 'reward' ? (
                  <>Your <span className="text-amber-400">20% Reward</span> is Ready</>
                ) : cardState.state === 'progress' ? (
                  <>Continue Your <span className="text-orange-400">Daily Run</span></>
                ) : (
                  <>🎮 Your Daily Run</>
                )}
              </h2>
              <p className="text-stone-300 text-base md:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed font-sans">
                {cardState.state === 'reward' ? (
                  <>Congratulations! Your CyberWrap 20% discount coupon is active and ready to apply to your order of shawarmas, platters, and sides.</>
                ) : cardState.state === 'progress' ? (
                  <>You're only <strong className="text-amber-400 font-mono">{cardState.remaining} points</strong> away from unlocking 20% OFF your next DailyBread order. Jump back into the delivery truck in Buea!</>
                ) : (
                  <>Play CyberWrap and earn 20% OFF your next DailyBread order. Hop in the delivery truck, explore Buea city, deliver shawarmas, and score 200 points to unlock your discount.</>
                )}
              </p>
            </div>

            {/* Step-by-step loop banner: 200 PTS -> 20% OFF */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-4 sm:p-5 max-w-lg mx-auto lg:mx-0">
              <div className="grid grid-cols-3 gap-2 sm:gap-4 items-center text-center">
                <div className="space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 font-bold">
                    <Compass size={18} />
                  </div>
                  <div className="text-xs font-bold text-white font-mono">1. Drive & Deliver</div>
                  <div className="text-[11px] text-stone-400">WebGL 3D City</div>
                </div>

                <div className="space-y-1 relative">
                  <div className="hidden sm:block absolute -left-3 top-4 text-orange-500/60 font-bold">➔</div>
                  <div className="w-10 h-10 mx-auto rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 font-bold">
                    <Trophy size={18} />
                  </div>
                  <div className="text-xs font-bold text-amber-300 font-mono">2. 200 Points</div>
                  <div className="text-[11px] text-stone-400">Score Threshold</div>
                  <div className="hidden sm:block absolute -right-3 top-4 text-orange-500/60 font-bold">➔</div>
                </div>

                <div className="space-y-1">
                  <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
                    <Award size={18} />
                  </div>
                  <div className="text-xs font-bold text-emerald-400 font-mono">3. 20% OFF</div>
                  <div className="text-[11px] text-stone-400">7 Days Valid</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start pt-2 font-ui">
              {cardState.state === 'reward' ? (
                <>
                  <button
                    onClick={handleOrder}
                    className="bg-white text-orange-950 hover:bg-amber-100 font-black px-8 py-4 rounded-xl shadow-lg shadow-white/10 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 text-sm uppercase tracking-wider cursor-pointer"
                    id="cyberwrap-section-order-btn"
                  >
                    <Utensils size={18} className="text-orange-600" />
                    <span>ORDER NOW & USE 20% OFF</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={handlePrimaryPlay}
                    className="bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 font-bold px-6 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Play size={16} fill="currentColor" />
                    <span>Play Bonus Run</span>
                  </button>
                </>
              ) : cardState.state === 'progress' ? (
                <>
                  <button
                    onClick={handlePrimaryPlay}
                    className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 text-sm uppercase tracking-wider cursor-pointer"
                    id="cyberwrap-section-continue-btn"
                  >
                    <Play size={18} fill="currentColor" />
                    <span>CONTINUE RUN</span>
                    <ArrowRight size={18} />
                  </button>

                  <button
                    onClick={handleOrder}
                    className="bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 font-bold px-6 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Utensils size={16} className="text-amber-400" />
                    <span>Order DailyBread</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handlePrimaryPlay}
                    className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-black px-8 py-4 rounded-xl shadow-lg shadow-orange-500/30 transition-all transform hover:-translate-y-0.5 flex items-center justify-center gap-2.5 text-sm uppercase tracking-wider cursor-pointer"
                    id="cyberwrap-section-play-btn"
                  >
                    <Play size={18} fill="currentColor" />
                    <span>Play Your Daily Run</span>
                  </button>

                  <button
                    onClick={handleOrder}
                    className="bg-white/10 hover:bg-white/20 text-stone-200 border border-white/15 font-bold px-6 py-4 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm cursor-pointer"
                  >
                    <Utensils size={16} className="text-amber-400" />
                    <span>Order DailyBread</span>
                  </button>
                </>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs text-stone-400 font-mono pt-1">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Browser-based (No App Install)
              </span>
              <span>•</span>
              <span>Desktop, Tablet & Mobile</span>
              <span>•</span>
              <span>Free to Play</span>
            </div>
          </div>

          {/* Right Column: Dynamic "Your Daily Run" Status Card */}
          <div className="lg:col-span-5">
            <div className="relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-500 to-amber-500 rounded-3xl blur opacity-25" />
              <DailyRunCard
                placement="homepage_play_section"
                onOrderClick={onOrderClick}
                onLaunchClick={onLaunchClick}
                onStateChange={setCardState}
                className="relative z-10"
              />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
