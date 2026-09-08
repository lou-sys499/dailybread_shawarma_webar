import React from 'react';
import { TrendingUp, ShoppingBag, Gamepad2, ArrowRight } from 'lucide-react';
import { FunnelStep } from '../../types/analytics';

interface CustomerJourneySectionProps {
  commerceFunnel?: FunnelStep[];
  dailyRunFunnel?: FunnelStep[];
}

export const CustomerJourneySection: React.FC<CustomerJourneySectionProps> = ({
  commerceFunnel = [],
  dailyRunFunnel = []
}) => {
  const renderFunnelGrid = (title: string, icon: React.ReactNode, steps: FunnelStep[], goalNote: string) => {
    return (
      <div className="bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            {icon}
            <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
              {title}
            </h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded">
            {goalNote}
          </span>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {steps.map((step, idx) => (
            <div
              key={step.id || idx}
              className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 flex flex-col justify-between space-y-2 relative overflow-hidden group hover:border-slate-700 transition-colors"
            >
              {/* Step Number & Badge */}
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  0{idx + 1}
                </span>
                {step.isPendingAttribution ? (
                  <span className="text-[9px] font-mono bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-bold">
                    Intent
                  </span>
                ) : (
                  <span className="text-[10px] font-mono font-bold text-emerald-400">
                    {step.conversionRate}%
                  </span>
                )}
              </div>

              {/* Step Name & Count */}
              <div>
                <span className="text-xs font-bold text-slate-200 block truncate" title={step.name}>
                  {step.name}
                </span>
                <div className="text-lg font-black font-mono text-white mt-0.5">
                  {step.count.toLocaleString()}
                </div>
              </div>

              {/* Step Conversion & Drop-off */}
              <div className="text-[10px] font-mono text-slate-400 pt-1.5 border-t border-slate-800/80 space-y-0.5">
                {idx > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Step conv:</span>
                    <span className="text-slate-300">{step.stepConversionRate}%</span>
                  </div>
                )}
                {idx > 0 && step.dropOffRate > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Drop-off:</span>
                    <span className="text-rose-400/90">{step.dropOffRate}%</span>
                  </div>
                )}
                {step.notes && (
                  <span className="text-[9px] text-slate-500 block truncate pt-0.5" title={step.notes}>
                    {step.notes}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <TrendingUp size={16} className="text-orange-400" />
          <span>2. Customer Journey Funnels</span>
        </h2>
        <p className="text-xs text-slate-400">
          Comparing the primary Commerce funnel with the Daily Run gamified reward funnel
        </p>
      </div>

      <div className="space-y-4">
        {renderFunnelGrid(
          'A. Commerce Journey: Storefront ➔ WhatsApp Order Intent',
          <ShoppingBag size={16} className="text-orange-400" />,
          commerceFunnel,
          'Goal: Unique Visitor ➔ WhatsApp Order Handoff'
        )}

        {renderFunnelGrid(
          'B. Daily Run Journey: Play ➔ 200 PTS ➔ Coupon Redemption',
          <Gamepad2 size={16} className="text-purple-400" />,
          dailyRunFunnel,
          'Goal: Daily Run Play ➔ 200 PTS ➔ 20% Cart Discount'
        )}
      </div>
    </section>
  );
};
