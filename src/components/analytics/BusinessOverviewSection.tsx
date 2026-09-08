import React from 'react';
import { 
  Users, Layers, ShoppingBag, Percent, Play, Award, Gift, CheckCircle2, 
  ArrowUp, ArrowDown, Minus, Info, Sparkles, AlertCircle 
} from 'lucide-react';
import { BusinessOverviewKPIs, BusinessInsight, MetricComparison } from '../../types/analytics';

interface BusinessOverviewSectionProps {
  overview?: BusinessOverviewKPIs;
  insights?: BusinessInsight[];
  sampleSize?: number;
}

export const BusinessOverviewSection: React.FC<BusinessOverviewSectionProps> = ({
  overview,
  insights,
  sampleSize = 0
}) => {
  if (!overview) {
    return null;
  }

  const renderComparisonBadge = (comp: MetricComparison, isPercentagePoint: boolean = false) => {
    // If no previous period or previous is 0
    if (comp.previous === 0) {
      if (comp.current > 0) {
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <span>+{comp.current} vs 0 (New)</span>
          </span>
        );
      }
      return (
        <span className="inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
          <Minus size={10} /> <span>0 vs 0</span>
        </span>
      );
    }

    if (isPercentagePoint && comp.diffPoints !== undefined) {
      const isPositive = comp.diffPoints > 0;
      const isNeutral = comp.diffPoints === 0;
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : isNeutral
              ? 'bg-slate-800 text-slate-400'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {isPositive ? <ArrowUp size={10} /> : isNeutral ? <Minus size={10} /> : <ArrowDown size={10} />}
          <span>
            {isPositive ? '+' : ''}
            {comp.diffPoints.toFixed(1)} pp
          </span>
        </span>
      );
    }

    if (comp.changePercent !== null) {
      const isPositive = comp.changePercent > 0;
      const isNeutral = comp.changePercent === 0;
      return (
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${
            isPositive
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : isNeutral
              ? 'bg-slate-800 text-slate-400'
              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
          }`}
        >
          {isPositive ? <ArrowUp size={10} /> : isNeutral ? <Minus size={10} /> : <ArrowDown size={10} />}
          <span>
            {isPositive ? '+' : ''}
            {comp.changePercent.toFixed(1)}%
          </span>
        </span>
      );
    }

    return null;
  };

  const kpisList = [
    {
      id: 'visitors',
      label: 'Unique Visitors',
      value: overview.uniqueVisitors.current.toLocaleString(),
      comparison: overview.uniqueVisitors,
      icon: <Users size={16} className="text-blue-400" />,
      subtext: 'Distinct visitor_id / browser identity'
    },
    {
      id: 'sessions',
      label: 'Browsing Sessions',
      value: overview.sessions.current.toLocaleString(),
      comparison: overview.sessions,
      icon: <Layers size={16} className="text-cyan-400" />,
      subtext: '30-minute activity windows'
    },
    {
      id: 'whatsapp_intent',
      label: 'WhatsApp Order Intent',
      value: overview.whatsappOrderIntent.current.toLocaleString(),
      comparison: overview.whatsappOrderIntent,
      icon: <ShoppingBag size={16} className="text-orange-400" />,
      subtext: 'Unique visitors initiating WhatsApp order'
    },
    {
      id: 'whatsapp_intent_rate',
      label: 'WhatsApp Intent Rate',
      value: `${overview.whatsappIntentRate.current.toFixed(1)}%`,
      comparison: overview.whatsappIntentRate,
      isPp: true,
      icon: <Percent size={16} className="text-amber-400" />,
      subtext: '% of unique visitors initiating order'
    },
    {
      id: 'daily_run_users',
      label: 'Daily Run Users',
      value: overview.dailyRunUsers.current.toLocaleString(),
      comparison: overview.dailyRunUsers,
      icon: <Play size={16} className="text-purple-400" />,
      subtext: 'Unique visitors launching CyberWrap'
    },
    {
      id: 'game_completions',
      label: 'Game Completions',
      value: overview.gameCompletions.current.toLocaleString(),
      comparison: overview.gameCompletions,
      icon: <Award size={16} className="text-emerald-400" />,
      subtext: 'Completed 3D Buea delivery runs'
    },
    {
      id: 'coupons_earned',
      label: 'Coupons Earned',
      value: overview.couponsEarned.current.toLocaleString(),
      comparison: overview.couponsEarned,
      icon: <Gift size={16} className="text-pink-400" />,
      subtext: '200+ pt milestone rewards unlocked'
    },
    {
      id: 'coupons_redeemed',
      label: 'Coupons Redeemed',
      value: overview.couponsRedeemed.current.toLocaleString(),
      comparison: overview.couponsRedeemed,
      icon: <CheckCircle2 size={16} className="text-emerald-300" />,
      subtext: 'Verified redemptions applied in cart'
    }
  ];

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Sparkles size={16} className="text-orange-400" />
            <span>1. Business Overview</span>
          </h2>
          <p className="text-xs text-slate-400">
            Core storefront metrics with period-over-period comparison
          </p>
        </div>
        <span className="text-[11px] font-mono text-slate-500">
          Sample size: {sampleSize.toLocaleString()} visitors
        </span>
      </div>

      {/* 8 Primary KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {kpisList.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-2 relative overflow-hidden"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase text-slate-400 font-medium">
                {kpi.label}
              </span>
              <div className="p-1.5 rounded-lg bg-[#0a0d14] border border-slate-800">
                {kpi.icon}
              </div>
            </div>

            <div className="flex items-baseline justify-between gap-2 pt-1">
              <div className="text-2xl font-black font-mono text-white">
                {kpi.value}
              </div>
              {renderComparisonBadge(kpi.comparison, !!kpi.isPp)}
            </div>

            <div className="flex items-center justify-between text-[10px] text-slate-500 font-mono pt-1 border-t border-slate-800/60">
              <span className="truncate">{kpi.subtext}</span>
              <span className="text-slate-400 shrink-0 ml-1">
                prev: {kpi.comparison.previous.toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Prominent Revenue Attribution Notice Banner */}
      <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-amber-200">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 shrink-0 mt-0.5">
            <Info size={18} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase font-mono tracking-wider text-amber-300">
                REVENUE ATTRIBUTION: PENDING CONFIRMATION
              </span>
              <span className="text-[9px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded font-mono font-bold">
                WhatsApp Manual Handoff Model
              </span>
            </div>
            <p className="text-xs text-amber-200/80 leading-relaxed max-w-4xl">
              DailyBread Shawarma orders transition from the website cart to a WhatsApp conversation where customers manually confirm payment and delivery coordinates. Analytics measures <strong>WhatsApp Order Intent</strong> with exact item and coupon data. True financial revenue is marked as <em>Pending Confirmation</em> until restaurant staff validates delivery completion.
            </p>
          </div>
        </div>
      </div>

      {/* Automated Business Insights Callouts */}
      {insights && insights.length > 0 && (
        <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
              <Sparkles size={14} className="text-orange-400" />
              <span>Automated Business Insights</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">
              {sampleSize >= 20 ? 'High-confidence behavioral intelligence' : 'Sample building in progress'}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {insights.map((insight) => (
              <div
                key={insight.id}
                className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-orange-400"></span>
                  <span className="text-xs font-bold font-mono text-slate-200">
                    {insight.title}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed pl-4">
                  {insight.message}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
};
