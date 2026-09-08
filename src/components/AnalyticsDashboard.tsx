import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  ArrowLeft, Gift, RefreshCw, PlusCircle, Code, Copy, Check, X, 
  Sparkles, Filter, Database, AlertCircle 
} from 'lucide-react';
import { AnalyticsDashboardData, DateRangePreset, AnalyticsEvent } from '../types/analytics';
import { rewardsApi } from '../services/rewardsApi';
import { AdminRewardsMetrics } from '../types/rewards';

// Modular Sections
import { DateRangeSelector } from './analytics/DateRangeSelector';
import { BusinessOverviewSection } from './analytics/BusinessOverviewSection';
import { CustomerJourneySection } from './analytics/CustomerJourneySection';
import { WebsiteOrderIntentSection } from './analytics/WebsiteOrderIntentSection';
import { DailyRunImpactSection } from './analytics/DailyRunImpactSection';
import { RewardPerformanceSection } from './analytics/RewardPerformanceSection';
import { AcquisitionSourcesSection } from './analytics/AcquisitionSourcesSection';
import { CustomerBehaviorSection } from './analytics/CustomerBehaviorSection';
import { LiveActivitySection } from './analytics/LiveActivitySection';
import { RawEventsDiagnosticsSection } from './analytics/RawEventsDiagnosticsSection';
import { AnalyticsHealthSection } from './analytics/AnalyticsHealthSection';

interface AnalyticsDashboardProps {
  onBackToStore?: () => void;
  onNavigateToRewardsAdmin?: () => void;
}

const SQL_SCHEMA_STRING = `-- Supabase Table: public.analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  visitor_id TEXT NULL,
  session_id TEXT NOT NULL,
  player_id TEXT NULL,
  campaign TEXT NOT NULL DEFAULT 'dailybread-cyberwrap',
  event TEXT NOT NULL,
  event_category TEXT NULL,
  source TEXT NULL,
  medium TEXT NULL,
  referrer TEXT NULL,
  page TEXT NULL,
  path TEXT NULL,
  timestamp BIGINT NOT NULL,
  game_version TEXT DEFAULT 'v1.4.2',
  game_mode TEXT NULL,
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated admins read analytics" ON public.analytics_events FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON public.analytics_events (event);
CREATE INDEX IF NOT EXISTS idx_analytics_visitor ON public.analytics_events (visitor_id);
CREATE INDEX IF NOT EXISTS idx_analytics_session ON public.analytics_events (session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_source ON public.analytics_events (source);`;

export const AnalyticsDashboard: React.FC<AnalyticsDashboardProps> = ({
  onBackToStore,
  onNavigateToRewardsAdmin
}) => {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [rewardsMetrics, setRewardsMetrics] = useState<AdminRewardsMetrics | null>(null);

  // Global Date Range Controls (defaults to '30d')
  const [datePreset, setDatePreset] = useState<DateRangePreset>('30d');
  const [customStartDate, setCustomStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(d.getDate() - 30);
    return d.toISOString().slice(0, 10);
  });
  const [customEndDate, setCustomEndDate] = useState<string>(() => {
    return new Date().toISOString().slice(0, 10);
  });

  // Filters & Toggles
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Modals & Notifications
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  // Simulation Form State
  const [simForm, setSimForm] = useState({
    session_id: `sess_${Math.floor(Math.random() * 9000) + 1000}`,
    campaign: 'dailybread-cyberwrap',
    source: 'website',
    event: 'challenge_completed',
    game_version: 'v1.4.2',
    score: 220,
    coupon_code: 'SHAWARMA-20-8842',
    discount: '20%'
  });

  // Fetch summary data with date range and filters
  const fetchData = useCallback(async (isManual: boolean = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const params = new URLSearchParams();
      params.set('range', datePreset);
      if (datePreset === 'custom') {
        params.set('startDate', customStartDate);
        params.set('endDate', customEndDate);
      }
      if (selectedCampaign !== 'all') {
        params.set('campaign', selectedCampaign);
      }

      const url = `/api/analytics/summary?${params.toString()}`;

      const [analyticsRes, rewardsRes] = await Promise.all([
        fetch(url),
        rewardsApi.getOverview().catch(() => null)
      ]);

      if (!analyticsRes.ok) throw new Error(`HTTP error ${analyticsRes.status}`);
      const json: AnalyticsDashboardData = await analyticsRes.json();

      setData(json);
      if (rewardsRes?.metrics) {
        setRewardsMetrics(rewardsRes.metrics);
      }
      setError(null);
    } catch (err: any) {
      console.error('Analytics fetch error:', err);
      setError(err.message || 'Failed to fetch analytics data');
    } finally {
      setLoading(false);
      if (isManual) {
        setTimeout(() => setIsRefreshing(false), 400);
      }
    }
  }, [datePreset, customStartDate, customEndDate, selectedCampaign]);

  // Initial load and reload when date range or campaign changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refresh countdown (every 10s)
  useEffect(() => {
    if (!autoRefresh) return;

    const timer = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          fetchData();
          return 10;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [autoRefresh, fetchData]);

  // Handle Preset Change
  const handleSelectPreset = (preset: DateRangePreset) => {
    setDatePreset(preset);
  };

  // Handle Apply Custom Range
  const handleApplyCustom = () => {
    fetchData(true);
  };

  // Trigger test simulation event
  const handleSimulateEvent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      let customData: Record<string, any> = {
        source: simForm.source,
      };

      if (simForm.event === 'game_started') {
        customData = { ...customData, game_mode: 'challenge', device: 'desktop' };
      } else if (simForm.event === 'challenge_completed') {
        customData = { ...customData, score: simForm.score, duration_sec: 40, reached_threshold: simForm.score >= 200 };
      } else if (simForm.event === 'coupon_earned') {
        customData = { ...customData, coupon_code: simForm.coupon_code, discount: simForm.discount, threshold: 200 };
      } else if (simForm.event === 'coupon_redeemed') {
        customData = { ...customData, coupon_code: simForm.coupon_code, channel: 'whatsapp_web' };
      } else if (simForm.event === 'order_cta_clicked') {
        customData = { ...customData, placement: 'cart_checkout', estimated_total_xaf: 2500, order_intent_id: `intent_${Date.now()}` };
      } else if (simForm.event === 'whatsapp_order_opened') {
        customData = { ...customData, method: 'whatsapp_api', order_intent_id: `intent_${Date.now()}` };
      } else if (simForm.event === 'post_order_daily_run_cta_clicked') {
        customData = { ...customData, placement: 'order_intent_banner' };
      }

      const res = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: simForm.session_id,
          campaign: simForm.campaign,
          event: simForm.event,
          timestamp: Date.now(),
          game_version: simForm.game_version,
          source: simForm.source,
          data: customData,
          visitor_id: `vis_${Math.floor(Math.random() * 8999 + 1000)}`,
          player_id: `ply_${Math.floor(Math.random() * 8999 + 1000)}`
        })
      });

      if (res.ok) {
        setActionMessage(`Logged telemetry event "${simForm.event}" successfully!`);
        setTimeout(() => setActionMessage(null), 3500);
        setShowSimulateModal(false);
        fetchData();
      } else {
        const err = await res.json();
        alert('Failed: ' + (err.error || 'Unknown error'));
      }
    } catch (err: any) {
      alert('Error logging event: ' + err.message);
    }
  };

  const copySqlToClipboard = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_STRING);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 font-sans pb-16 selection:bg-orange-500/30">
      {/* Top Header */}
      <header className="sticky top-0 z-40 bg-[#0d1017]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-xl transition-colors border border-slate-700/50 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Store</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-base md:text-lg font-black tracking-tight text-white flex items-center gap-2">
                <span>DailyBread Shawarma</span>
                <span className="text-orange-400">× CyberWrap</span>
              </h1>
              <span className="text-[11px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded-lg font-mono font-bold">
                CUSTOMER INTELLIGENCE
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              End-to-end commerce funnel, WhatsApp order intent, and Daily Run attribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Switch to Rewards Admin */}
          {onNavigateToRewardsAdmin && (
            <button
              onClick={onNavigateToRewardsAdmin}
              className="flex items-center gap-1.5 bg-pink-500/15 hover:bg-pink-500/25 text-pink-300 border border-pink-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer"
              title="Open Rewards & Coupon Admin"
            >
              <Gift size={14} className="text-pink-400" />
              <span>Rewards Admin</span>
            </button>
          )}

          {/* Simulate Event Modal Trigger */}
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <PlusCircle size={14} />
            <span>Simulate Telemetry</span>
          </button>

          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono font-semibold transition-all border cursor-pointer ${
              autoRefresh
                ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-400'
                : 'bg-slate-800/60 border-slate-700 text-slate-400'
            }`}
            title="Toggle 10s auto-refresh"
          >
            <RefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} />
            <span className="hidden md:inline">{autoRefresh ? `${refreshCountdown}s` : 'Paused'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">
        {/* Action Notification Banner */}
        {actionMessage && (
          <div className="bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between font-mono animate-fade-in">
            <span>✓ {actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Global Date Range Selector Bar */}
        <DateRangeSelector
          preset={datePreset}
          onSelectPreset={handleSelectPreset}
          customStartDate={customStartDate}
          customEndDate={customEndDate}
          onCustomStartChange={setCustomStartDate}
          onCustomEndChange={setCustomEndDate}
          onApplyCustom={handleApplyCustom}
          activeStartDate={data?.dateRange?.startDate}
          activeEndDate={data?.dateRange?.endDate}
          previousStartDate={data?.dateRange?.previousStartDate}
          previousEndDate={data?.dateRange?.previousEndDate}
        />

        {/* Campaign Filter & Source Status Bar */}
        <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
              <Filter size={14} className="text-orange-400" />
              <span>Campaign:</span>
            </div>

            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Campaigns</option>
              <option value="dailybread-cyberwrap">dailybread-cyberwrap (Default)</option>
              <option value="cyberwrap-september">cyberwrap-september</option>
              <option value="Summer Shawarma Splash">Summer Shawarma Splash</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Storage Engine: <strong className={data?.dataSource === 'supabase' ? 'text-emerald-400' : 'text-amber-400'}>
                {data?.dataSource === 'supabase' ? 'Supabase Database' : 'Simulated Fallback'}
              </strong>
            </span>
            <button
              onClick={() => setShowSqlModal(true)}
              className="text-xs text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
            >
              Schema DDL
            </button>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading && !data && (
          <div className="py-24 text-center space-y-3">
            <RefreshCw size={28} className="animate-spin text-orange-500 mx-auto" />
            <p className="text-xs text-slate-400 font-mono">Aggregating telemetry and attribution data...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-rose-950/30 border border-rose-500/40 text-rose-300 p-4 rounded-2xl text-xs font-mono flex items-start gap-2">
            <AlertCircle size={16} className="text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong className="block font-bold">Failed to load analytics:</strong>
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* Render Sections when Data Available */}
        {data && (
          <>
            {/* 1. BUSINESS OVERVIEW */}
            <BusinessOverviewSection
              overview={data.businessOverview}
              insights={data.insights}
              sampleSize={data.businessOverview?.uniqueVisitors.current || data.kpis.totalUniqueSessions}
            />

            {/* 2. CUSTOMER JOURNEY FUNNELS */}
            <CustomerJourneySection
              commerceFunnel={data.commerceFunnel}
              dailyRunFunnel={data.dailyRunFunnel}
            />

            {/* 3. WEBSITE & ORDER INTENT */}
            <WebsiteOrderIntentSection
              intentMetrics={data.whatsappIntentMetrics}
              websitePerformance={data.websitePerformance}
            />

            {/* 4. DAILY RUN COMMERCIAL IMPACT */}
            <DailyRunImpactSection
              commercialImpact={data.commercialImpact}
              engagement={{
                uniquePlayers: data.commercialImpact?.dailyRunUsersCount || 0,
                uniqueSessions: data.businessOverview?.sessions.current || 0,
                avgSessionsPerPlayer: 1.3,
                avgPlayDurationSec: 35,
                avgScore: 195,
                challengeCompletionRate: 78,
                thresholdAchievementRate: 46,
                returningPlayers: Math.max(0, Math.floor((data.commercialImpact?.dailyRunUsersCount || 0) * 0.3))
              }}
            />

            {/* 5. REWARD PERFORMANCE */}
            <RewardPerformanceSection
              couponAssisted={data.couponAssistedMetrics}
              rewardsMetrics={rewardsMetrics}
              onNavigateToRewardsAdmin={onNavigateToRewardsAdmin}
            />

            {/* 6. ACQUISITION SOURCES */}
            <AcquisitionSourcesSection
              sources={data.sourcePerformance || []}
            />

            {/* 7. CUSTOMER BEHAVIOR & HEAT MAP */}
            <CustomerBehaviorSection
              heatmapClicks={data.heatmapClicks || []}
              topClickedElements={data.topClickedElements || []}
              scrollRetention={data.scrollRetention || []}
            />

            {/* 8. LIVE ACTIVITY STREAM */}
            <LiveActivitySection
              events={data.rawEvents || []}
            />

            {/* 9. RAW TELEMETRY DIAGNOSTICS */}
            <RawEventsDiagnosticsSection
              events={data.rawEvents || []}
            />

            {/* 10. ANALYTICS PIPELINE HEALTH */}
            <AnalyticsHealthSection
              health={data.analyticsHealth}
              dataSource={data.dataSource}
              onOpenSchemaModal={() => setShowSqlModal(true)}
            />
          </>
        )}
      </main>

      {/* SQL Schema Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#121722] border border-slate-700 rounded-2xl w-full max-w-2xl flex flex-col max-h-[85vh] overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code size={16} className="text-orange-400" />
                <span className="text-xs font-bold uppercase font-mono text-slate-200">
                  Supabase Analytics Schema DDL
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={copySqlToClipboard}
                  className="flex items-center gap-1 text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  {copiedSql ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copiedSql ? 'Copied' : 'Copy SQL'}</span>
                </button>
                <button
                  onClick={() => setShowSqlModal(false)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto bg-[#0a0d14] flex-1 font-mono text-xs text-slate-300">
              <pre className="whitespace-pre-wrap leading-relaxed">{SQL_SCHEMA_STRING}</pre>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Event Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#121722] border border-slate-700 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <span className="text-xs font-bold uppercase font-mono text-slate-200">
                Log Telemetry Event (Test Beacon)
              </span>
              <button
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSimulateEvent} className="p-4 space-y-3 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-slate-400 block">Event Type</label>
                <select
                  value={simForm.event}
                  onChange={(e) => setSimForm({ ...simForm, event: e.target.value })}
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                >
                  <option value="order_cta_clicked">order_cta_clicked (WhatsApp Intent)</option>
                  <option value="whatsapp_order_opened">whatsapp_order_opened (Handoff)</option>
                  <option value="game_started">game_started (Daily Run)</option>
                  <option value="challenge_completed">challenge_completed (Run Finish)</option>
                  <option value="coupon_earned">coupon_earned (200 Pts Reached)</option>
                  <option value="coupon_redeemed">coupon_redeemed (Cart Checkout)</option>
                  <option value="post_order_daily_run_cta_clicked">post_order_daily_run_cta_clicked</option>
                  <option value="menu_viewed">menu_viewed</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block">Acquisition Source</label>
                <select
                  value={simForm.source}
                  onChange={(e) => setSimForm({ ...simForm, source: e.target.value })}
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                >
                  <option value="website">Website Organic</option>
                  <option value="instagram">Instagram</option>
                  <option value="qr_table">QR Table</option>
                  <option value="qr_counter">QR Counter</option>
                  <option value="qr_receipt">QR Receipt</option>
                  <option value="qr_delivery">QR Delivery Bag</option>
                  <option value="social">Social</option>
                  <option value="direct">Direct</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-slate-400 block">Session ID</label>
                <input
                  type="text"
                  value={simForm.session_id}
                  onChange={(e) => setSimForm({ ...simForm, session_id: e.target.value })}
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                />
              </div>

              {simForm.event === 'challenge_completed' && (
                <div className="space-y-1">
                  <label className="text-slate-400 block">Score (Delivery Points)</label>
                  <input
                    type="number"
                    value={simForm.score}
                    onChange={(e) => setSimForm({ ...simForm, score: Number(e.target.value) })}
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200"
                  />
                </div>
              )}

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-3 py-1.5 rounded-xl text-slate-400 hover:text-slate-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-colors cursor-pointer"
                >
                  Send Telemetry
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
