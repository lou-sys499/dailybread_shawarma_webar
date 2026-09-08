import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend 
} from 'recharts';
import { Compass, Users, Flame, ShoppingBag, Gift, ArrowUpRight } from 'lucide-react';
import { SourcePerformanceItem } from '../../types/analytics';

interface AcquisitionSourcesSectionProps {
  sources: SourcePerformanceItem[];
}

export const AcquisitionSourcesSection: React.FC<AcquisitionSourcesSectionProps> = ({
  sources = []
}) => {
  // Compute highlights
  const highlights = useMemo(() => {
    if (!sources || sources.length === 0) return null;

    const highestTraffic = [...sources].sort((a, b) => b.visitors - a.visitors)[0];
    const highestDailyRun = [...sources].sort((a, b) => b.players - a.players)[0];
    const highestIntentRate = [...sources].filter(s => s.visitors >= 5).sort((a, b) => b.conversionToWhatsAppIntent - a.conversionToWhatsAppIntent)[0] || sources[0];
    const highestRedemption = [...sources].sort((a, b) => b.couponsRedeemed - a.couponsRedeemed)[0];

    return {
      highestTraffic,
      highestDailyRun,
      highestIntentRate,
      highestRedemption
    };
  }, [sources]);

  const chartData = useMemo(() => {
    return sources.slice(0, 8).map(s => ({
      name: s.displayName.replace(' (Direct/Organic)', '').replace(' Stand', '').replace(' Checkout Counter', ' Counter'),
      visitors: s.visitors,
      orderIntent: s.orderIntentCount,
      intentRate: s.conversionToWhatsAppIntent
    }));
  }, [sources]);

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <Compass size={16} className="text-orange-400" />
          <span>6. Acquisition Sources & Attribution</span>
        </h2>
        <p className="text-xs text-slate-400">
          Tracking distinct customer acquisition across QR codes, social channels, and web storefront
        </p>
      </div>

      {/* Highlights Cards */}
      {highlights && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-[#121722] border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Users size={13} className="text-blue-400" />
              <span>Top Traffic Source</span>
            </div>
            <div className="text-base font-bold font-mono text-white truncate" title={highlights.highestTraffic.displayName}>
              {highlights.highestTraffic.displayName}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">
              {highlights.highestTraffic.visitors.toLocaleString()} visitors ({highlights.highestTraffic.sessions} sessions)
            </span>
          </div>

          <div className="bg-[#121722] border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Flame size={13} className="text-purple-400" />
              <span>Top Daily Run Engagement</span>
            </div>
            <div className="text-base font-bold font-mono text-purple-400 truncate" title={highlights.highestDailyRun.displayName}>
              {highlights.highestDailyRun.displayName}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">
              {highlights.highestDailyRun.players.toLocaleString()} players ({highlights.highestDailyRun.gameStarts} starts)
            </span>
          </div>

          <div className="bg-[#121722] border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <ShoppingBag size={13} className="text-emerald-400" />
              <span>Highest Intent Rate</span>
            </div>
            <div className="text-base font-bold font-mono text-emerald-400 truncate" title={highlights.highestIntentRate.displayName}>
              {highlights.highestIntentRate.displayName}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">
              {highlights.highestIntentRate.conversionToWhatsAppIntent.toFixed(1)}% order intent rate
            </span>
          </div>

          <div className="bg-[#121722] border border-slate-800 rounded-xl p-3.5 space-y-1">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
              <Gift size={13} className="text-pink-400" />
              <span>Top Coupon Redemptions</span>
            </div>
            <div className="text-base font-bold font-mono text-pink-400 truncate" title={highlights.highestRedemption.displayName}>
              {highlights.highestRedemption.displayName}
            </div>
            <span className="text-[10px] text-slate-500 font-mono block">
              {highlights.highestRedemption.couponsRedeemed.toLocaleString()} verified redemptions
            </span>
          </div>
        </div>
      )}

      {/* Sources Visual Bar Chart */}
      <div className="bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Visitors & WhatsApp Order Intent by Source
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            Distinct visitor_id vs. distinct order intent
          </span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} angle={-25} textAnchor="end" />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0a0d14', borderColor: '#334155', borderRadius: '0.75rem', fontSize: '11px', fontFamily: 'monospace' }}
                itemStyle={{ color: '#e2e8f0' }}
              />
              <Legend wrapperStyle={{ fontSize: '11px', fontFamily: 'monospace', paddingTop: '10px' }} />
              <Bar dataKey="visitors" name="Unique Visitors" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="orderIntent" name="WhatsApp Intent" fill="#f97316" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Complete Sources Table */}
      <div className="bg-[#121722] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Detailed Source Breakdown (Distinct People Tracking)
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            9 Canonical Attribution Channels
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0a0d14] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-4 py-3">Source Channel</th>
                <th className="px-3 py-3 text-right">Visitors</th>
                <th className="px-3 py-3 text-right">Sessions</th>
                <th className="px-3 py-3 text-right">Players</th>
                <th className="px-3 py-3 text-right">Starts</th>
                <th className="px-3 py-3 text-right">Completed</th>
                <th className="px-3 py-3 text-right">Coupons</th>
                <th className="px-3 py-3 text-right">Redeemed</th>
                <th className="px-3 py-3 text-right text-orange-400">WhatsApp Intent</th>
                <th className="px-4 py-3 text-right text-amber-400">Intent Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {sources.map((s) => (
                <tr key={s.source} className="hover:bg-slate-800/30 transition-colors">
                  <td className="px-4 py-2.5 font-bold text-slate-200">
                    {s.displayName}
                  </td>
                  <td className="px-3 py-2.5 text-right text-white">
                    {s.visitors.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-300">
                    {s.sessions.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right text-purple-400">
                    {s.players.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-300">
                    {s.gameStarts.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right text-slate-300">
                    {s.challengesCompleted.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right text-pink-400">
                    {s.couponsEarned.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right text-emerald-400">
                    {s.couponsRedeemed.toLocaleString()}
                  </td>
                  <td className="px-3 py-2.5 text-right font-bold text-orange-400">
                    {s.orderIntentCount.toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 text-right font-bold text-amber-400">
                    {s.conversionToWhatsAppIntent.toFixed(1)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
};
