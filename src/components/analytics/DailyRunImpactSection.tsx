import React from 'react';
import { Gamepad2, ArrowUpRight, Award, Clock, Target, Info, Sparkles } from 'lucide-react';
import { CommercialImpactAnalysis, PlayerEngagementMetrics } from '../../types/analytics';

interface DailyRunImpactSectionProps {
  commercialImpact?: CommercialImpactAnalysis;
  engagement?: PlayerEngagementMetrics;
}

export const DailyRunImpactSection: React.FC<DailyRunImpactSectionProps> = ({
  commercialImpact,
  engagement
}) => {
  if (!commercialImpact) {
    return null;
  }

  const isPositiveUplift = commercialImpact.diffPercentagePoints > 0;

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Gamepad2 size={16} className="text-purple-400" />
          <span>4. Daily Run Commercial Impact & Gameplay</span>
        </h2>
        <p className="text-xs text-slate-400">
          Evaluating the commercial uplift associated with CyberWrap gameplay vs standard browsing
        </p>
      </div>

      {/* Daily Run Users vs Non-Players Comparison */}
      <div className="bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Sparkles size={16} className="text-orange-400" />
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              Cohort Analysis: Daily Run Users vs. Non-Players
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
            Observed Intent Uplift
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Daily Run Cohort Card */}
          <div className="bg-[#0a0d14] border border-purple-900/40 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-purple-400">
                Daily Run Cohort
              </span>
              <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                Engaged with Game
              </span>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-black font-mono text-white">
                {commercialImpact.dailyRunIntentRate.toFixed(1)}%
              </div>
              <span className="text-xs text-slate-400 font-mono">WhatsApp Intent Rate</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 space-y-0.5">
              <div className="flex justify-between">
                <span>Unique Visitors:</span>
                <span className="text-slate-200 font-bold">{commercialImpact.dailyRunUsersCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Intent Count:</span>
                <span className="text-purple-300 font-bold">{commercialImpact.dailyRunIntentCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Non-Player Cohort Card */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono uppercase font-bold text-slate-400">
                Non-Player Cohort
              </span>
              <span className="text-[10px] font-mono bg-slate-800 text-slate-400 px-2 py-0.5 rounded">
                Storefront Only
              </span>
            </div>
            <div className="pt-2">
              <div className="text-2xl font-black font-mono text-slate-300">
                {commercialImpact.nonPlayerIntentRate.toFixed(1)}%
              </div>
              <span className="text-xs text-slate-500 font-mono">WhatsApp Intent Rate</span>
            </div>
            <div className="text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/80 space-y-0.5">
              <div className="flex justify-between">
                <span>Unique Visitors:</span>
                <span className="text-slate-200 font-bold">{commercialImpact.nonPlayersCount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Order Intent Count:</span>
                <span className="text-slate-300 font-bold">{commercialImpact.nonPlayerIntentCount.toLocaleString()}</span>
              </div>
            </div>
          </div>

          {/* Net Intent Difference & Attribution Note */}
          <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-2">
            <div>
              <span className="text-xs font-mono uppercase font-bold text-slate-400 block">
                Net Intent Difference
              </span>
              <div className="flex items-baseline gap-2 pt-2">
                <span
                  className={`text-3xl font-black font-mono ${
                    isPositiveUplift ? 'text-emerald-400' : 'text-slate-300'
                  }`}
                >
                  {isPositiveUplift ? '+' : ''}
                  {commercialImpact.diffPercentagePoints.toFixed(1)} pp
                </span>
              </div>
              <span className="text-xs text-slate-400 font-mono block mt-1">
                {isPositiveUplift
                  ? 'Higher order intent rate among game players'
                  : 'Similar order intent rate between cohorts'}
              </span>
            </div>

            <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 text-[10px] font-mono text-slate-400 flex items-start gap-1.5">
              <Info size={13} className="text-amber-400 shrink-0 mt-0.5" />
              <span>
                <strong>Methodology:</strong> Observed association across browsing cohorts. Does not establish strict causality; engaged visitors may already possess higher purchase intent.
              </span>
            </div>
          </div>
        </div>

        {/* Post-Order Engagement Sub-Panel */}
        <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800/80 pb-2">
            <span className="text-xs font-mono uppercase font-bold text-slate-300">
              Post-Order Intent Engagement
            </span>
            <span className="text-[10px] font-mono text-slate-400">
              Engaging customers while waiting for food preparation
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            <div className="p-2.5 rounded-lg bg-[#121722] border border-slate-800/60">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Post-Order Invites Clicked
              </span>
              <div className="text-lg font-black font-mono text-white mt-0.5">
                {commercialImpact.postOrderInvitations.toLocaleString()}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#121722] border border-slate-800/60">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Game Starts Post-Order
              </span>
              <div className="text-lg font-black font-mono text-purple-400 mt-0.5">
                {commercialImpact.postOrderStarts.toLocaleString()}
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-[#121722] border border-slate-800/60">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Post-Order Completion Rate
              </span>
              <div className="text-lg font-black font-mono text-emerald-400 mt-0.5">
                {commercialImpact.postOrderCompletionRate.toFixed(1)}%
              </div>
            </div>
          </div>
        </div>

        {/* Gameplay Performance Stats */}
        {engagement && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Target size={13} className="text-blue-400" />
                <span>Avg Game Score</span>
              </div>
              <div className="text-lg font-black font-mono text-white">
                {engagement.avgScore} <span className="text-xs text-slate-500 font-normal">pts</span>
              </div>
            </div>

            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Clock size={13} className="text-amber-400" />
                <span>Avg Duration</span>
              </div>
              <div className="text-lg font-black font-mono text-amber-400">
                {engagement.avgPlayDurationSec} <span className="text-xs text-slate-500 font-normal">sec</span>
              </div>
            </div>

            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Award size={13} className="text-emerald-400" />
                <span>Completion Rate</span>
              </div>
              <div className="text-lg font-black font-mono text-emerald-400">
                {engagement.challengeCompletionRate}%
              </div>
            </div>

            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Sparkles size={13} className="text-pink-400" />
                <span>200-Pt Milestone</span>
              </div>
              <div className="text-lg font-black font-mono text-pink-400">
                {engagement.thresholdAchievementRate}%
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
