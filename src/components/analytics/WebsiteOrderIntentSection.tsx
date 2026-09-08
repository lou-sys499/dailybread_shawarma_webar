import React from 'react';
import { ShoppingBag, MessageSquare, Tag, Eye, MousePointer, ShieldCheck, Percent } from 'lucide-react';
import { WhatsAppOrderIntentMetrics, WebsitePerformanceMetrics } from '../../types/analytics';

interface WebsiteOrderIntentSectionProps {
  intentMetrics?: WhatsAppOrderIntentMetrics;
  websitePerformance?: WebsitePerformanceMetrics;
}

export const WebsiteOrderIntentSection: React.FC<WebsiteOrderIntentSectionProps> = ({
  intentMetrics,
  websitePerformance
}) => {
  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
          <ShoppingBag size={16} className="text-orange-400" />
          <span>3. Website & WhatsApp Order Intent</span>
        </h2>
        <p className="text-xs text-slate-400">
          In-depth tracking of customer shopping behavior and WhatsApp ordering intent
        </p>
      </div>

      {/* Dedicated WhatsApp Order Intent Metrics Panel */}
      {intentMetrics && (
        <div className="bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <MessageSquare size={16} className="text-emerald-400" />
              <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
                WhatsApp Order Intent Attribution
              </h3>
            </div>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 border border-amber-500/30 px-2 py-0.5 rounded">
              Deduplicated by order_intent_id
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {/* CTA Clicks vs Unique Visitors */}
            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Order CTA Clicks
              </span>
              <div className="text-xl font-black font-mono text-white">
                {intentMetrics.orderCtaClicks.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {intentMetrics.uniqueVisitorsInitiating.toLocaleString()} unique visitors
              </span>
            </div>

            {/* WhatsApp Opens */}
            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                WhatsApp App Opens
              </span>
              <div className="text-xl font-black font-mono text-emerald-400">
                {intentMetrics.whatsappOpens.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 block">
                {intentMetrics.uniqueVisitorsOpening.toLocaleString()} unique visitors
              </span>
            </div>

            {/* Intent-to-Open Rate */}
            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Intent ➔ Open Rate
              </span>
              <div className="text-xl font-black font-mono text-cyan-400">
                {intentMetrics.intentToOpenRate.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500 block">
                Proceeded to wa.me app
              </span>
            </div>

            {/* Intent Rate Per Visitor */}
            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Intent Per Visitor
              </span>
              <div className="text-xl font-black font-mono text-amber-400">
                {intentMetrics.intentRatePerVisitor.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500 block">
                Of all unique visitors
              </span>
            </div>

            {/* Intent Rate Per Session */}
            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Intent Per Session
              </span>
              <div className="text-xl font-black font-mono text-purple-400">
                {intentMetrics.intentRatePerSession.toFixed(1)}%
              </div>
              <span className="text-[10px] text-slate-500 block">
                Of total site sessions
              </span>
            </div>

            {/* Coupon-Assisted Intent */}
            <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">
                Coupon-Assisted
              </span>
              <div className="text-xl font-black font-mono text-pink-400">
                {intentMetrics.couponAssistedIntent.toLocaleString()}
              </div>
              <span className="text-[10px] text-slate-500 block">
                Applied 20% discount code
              </span>
            </div>
          </div>

          <div className="text-[11px] font-mono text-slate-400 bg-[#0a0d14] p-3 rounded-xl border border-slate-800/80 flex items-start gap-2">
            <ShieldCheck size={14} className="text-emerald-400 shrink-0 mt-0.5" />
            <span>
              <strong>Attribution Accuracy Note:</strong> Every cart checkout assigns a cryptographically random <code className="text-slate-300">order_intent_id</code>. Rapid double-clicks or repeated button taps within the same browsing session are deduplicated server-side, measuring legitimate customer order intent.
            </span>
          </div>
        </div>
      )}

      {/* Website Merchandising & Placement Performance */}
      {websitePerformance && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Top Viewed Products */}
          <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                <Eye size={14} className="text-blue-400" />
                <span>Top Viewed Products</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Views</span>
            </div>

            <div className="space-y-2">
              {websitePerformance.topViewedProducts.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-2">No product views recorded</p>
              ) : (
                websitePerformance.topViewedProducts.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between text-xs font-mono py-1 border-b border-slate-800/40 last:border-0">
                    <span className="text-slate-300 truncate max-w-[180px]">
                      {idx + 1}. {p.name}
                    </span>
                    <span className="text-white font-bold">{p.count.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Add-To-Cart Products */}
          <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                <ShoppingBag size={14} className="text-emerald-400" />
                <span>Top Added to Cart</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Adds</span>
            </div>

            <div className="space-y-2">
              {websitePerformance.topAddToCartProducts.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-2">No items added to cart</p>
              ) : (
                websitePerformance.topAddToCartProducts.map((p, idx) => (
                  <div key={p.name} className="flex items-center justify-between text-xs font-mono py-1 border-b border-slate-800/40 last:border-0">
                    <span className="text-slate-300 truncate max-w-[180px]">
                      {idx + 1}. {p.name}
                    </span>
                    <span className="text-emerald-400 font-bold">{p.count.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Top Ordering CTA Placements */}
          <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                <MousePointer size={14} className="text-orange-400" />
                <span>Top CTA Placements</span>
              </div>
              <span className="text-[10px] font-mono text-slate-500">Clicks</span>
            </div>

            <div className="space-y-2">
              {websitePerformance.topOrderingCtaPlacements.length === 0 ? (
                <p className="text-xs text-slate-500 font-mono py-2">No CTA clicks recorded</p>
              ) : (
                websitePerformance.topOrderingCtaPlacements.map((p, idx) => (
                  <div key={p.placement} className="flex items-center justify-between text-xs font-mono py-1 border-b border-slate-800/40 last:border-0">
                    <span className="text-slate-300 truncate max-w-[180px]">
                      {idx + 1}. {p.placement}
                    </span>
                    <span className="text-orange-400 font-bold">{p.count.toLocaleString()}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
