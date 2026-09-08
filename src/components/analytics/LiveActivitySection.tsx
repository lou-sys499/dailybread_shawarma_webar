import React from 'react';
import { 
  Activity, ShoppingBag, MessageSquare, Play, Award, Gift, CheckCircle2, 
  Gamepad2, Compass, Eye 
} from 'lucide-react';
import { AnalyticsEvent } from '../../types/analytics';

interface LiveActivitySectionProps {
  events?: AnalyticsEvent[];
}

export const LiveActivitySection: React.FC<LiveActivitySectionProps> = ({
  events = []
}) => {
  const maskToken = (token?: string | null) => {
    if (!token) return 'anonymous';
    if (token.length <= 10) return token;
    return `${token.slice(0, 6)}...${token.slice(-4)}`;
  };

  const formatTime = (created_at: string) => {
    try {
      const d = new Date(created_at);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return created_at;
    }
  };

  const renderEventItem = (ev: AnalyticsEvent) => {
    let icon = <Activity size={14} className="text-orange-400" />;
    let title = ev.event.replace(/_/g, ' ');
    let badge = 'Storefront';
    let badgeColor = 'bg-slate-800 text-slate-300';
    let detail = `Session: ${maskToken(ev.session_id)}`;

    if (ev.event === 'order_cta_clicked' || ev.event === 'order_initiated') {
      icon = <ShoppingBag size={14} className="text-orange-400" />;
      title = 'WhatsApp Order Intent Initiated';
      badge = 'Order Intent';
      badgeColor = 'bg-orange-500/20 text-orange-400 border border-orange-500/30';
      detail = `Est. Total: ${ev.data?.estimated_total_xaf || ev.data?.subtotal_xaf || 2500} XAF • Coupon: ${ev.data?.coupon_applied ? '20% Applied' : 'None'}`;
    } else if (ev.event === 'whatsapp_order_opened') {
      icon = <MessageSquare size={14} className="text-emerald-400" />;
      title = 'WhatsApp Application Opened';
      badge = 'Handoff';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      detail = `Customer transferred to WhatsApp conversation`;
    } else if (ev.event === 'game_started') {
      icon = <Play size={14} className="text-purple-400" />;
      title = 'CyberWrap Run Started';
      badge = 'Daily Run';
      badgeColor = 'bg-purple-500/20 text-purple-300 border border-purple-500/30';
      detail = `Mode: ${ev.data?.game_mode || 'Challenge'} • ${ev.data?.game_version || 'v1.4.2'}`;
    } else if (ev.event === 'game_completed' || ev.event === 'challenge_completed') {
      icon = <Award size={14} className="text-amber-400" />;
      title = 'CyberWrap Run Completed';
      badge = 'Completed';
      badgeColor = 'bg-amber-500/20 text-amber-300 border border-amber-500/30';
      detail = `Score: ${ev.data?.score || 0} pts • Duration: ${ev.data?.duration_sec || 35}s`;
    } else if (ev.event === 'reward_threshold_reached' || ev.event === 'coupon_earned') {
      icon = <Gift size={14} className="text-pink-400" />;
      title = '20% Discount Reward Unlocked';
      badge = 'Reward';
      badgeColor = 'bg-pink-500/20 text-pink-300 border border-pink-500/30';
      detail = `Code: ${ev.data?.coupon_code || 'SHAWARMA-20-XXXX'} (7-Day Validity)`;
    } else if (ev.event === 'coupon_redeemed') {
      icon = <CheckCircle2 size={14} className="text-emerald-400" />;
      title = 'Coupon Verified & Redeemed';
      badge = 'Redemption';
      badgeColor = 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30';
      detail = `Applied 20% discount code during checkout`;
    } else if (ev.event === 'post_order_daily_run_cta_clicked') {
      icon = <Gamepad2 size={14} className="text-cyan-400" />;
      title = 'Post-Order Daily Run Invite Clicked';
      badge = 'Post-Order';
      badgeColor = 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30';
      detail = `Customer launched game after initiating WhatsApp order`;
    } else if (ev.event === 'menu_viewed') {
      icon = <Eye size={14} className="text-blue-400" />;
      title = 'Menu Catalog Viewed';
      badge = 'Browse';
      badgeColor = 'bg-blue-500/20 text-blue-300';
      detail = `Visitor browsing shawarma options`;
    }

    return (
      <div
        key={ev.id}
        className="flex items-center justify-between p-3 rounded-xl bg-[#0a0d14] border border-slate-800/80 hover:border-slate-700 transition-colors text-xs font-mono"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[#121722] border border-slate-800">
            {icon}
          </div>
          <div className="space-y-0.5">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-200">{title}</span>
              <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${badgeColor}`}>
                {badge}
              </span>
            </div>
            <div className="text-[11px] text-slate-400">
              {detail} • <span className="text-slate-500">Visitor: {maskToken(ev.visitor_id)}</span>
            </div>
          </div>
        </div>

        <div className="text-right shrink-0">
          <span className="text-slate-400 block">{formatTime(ev.created_at)}</span>
          <span className="text-[10px] text-slate-600 block">{ev.source || 'website'}</span>
        </div>
      </div>
    );
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Activity size={16} className="text-orange-400" />
            <span>8. Live Customer Activity Stream</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time feed of key commerce and Daily Run interactions (PII-safe tokens)
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>Live Ingestion Active</span>
        </div>
      </div>

      <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-2 max-h-[420px] overflow-y-auto">
        {events.length === 0 ? (
          <p className="text-xs text-slate-500 font-mono py-4 text-center">
            No live events recorded in this window
          </p>
        ) : (
          events.slice(0, 10).map(renderEventItem)
        )}
      </div>
    </section>
  );
};
