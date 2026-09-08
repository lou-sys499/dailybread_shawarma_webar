import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Activity, Users, Ticket, Award, RefreshCw, Filter, Search, 
  Database, CheckCircle2, AlertTriangle, ArrowUpRight, Download, 
  PlusCircle, Play, Eye, Copy, Check, ChevronDown, ChevronUp,
  Sparkles, Layers, ShieldCheck, Flame, Gift, ArrowLeft,
  DollarSign, TrendingUp, Compass, ShoppingBag, Info, Clock, ExternalLink
} from 'lucide-react';
import { 
  AnalyticsDashboardData, 
  AnalyticsEvent, 
  FunnelStep, 
  ExecutiveKPIs, 
  RevenueImpact, 
  PlayerEngagementMetrics, 
  SourcePerformanceItem,
  GameModeFilter 
} from '../types/analytics';
import { rewardsApi } from '../services/rewardsApi';
import { AdminRewardsMetrics } from '../types/rewards';

interface AnalyticsDashboardProps {
  onBackToStore?: () => void;
  onNavigateToRewardsAdmin?: () => void;
}

const CAMPAIGN_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#eab308', '#06b6d4'];

export function AnalyticsDashboard({ onBackToStore, onNavigateToRewardsAdmin }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Authoritative rewards metrics from backend
  const [rewardsMetrics, setRewardsMetrics] = useState<AdminRewardsMetrics | null>(null);

  // Filters & Controls
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [selectedSource, setSelectedSource] = useState<string>('all');
  const [selectedGameMode, setSelectedGameMode] = useState<GameModeFilter>('all');
  const [selectedEvent, setSelectedEvent] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(10);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  // Modals & UI States
  const [showSqlModal, setShowSqlModal] = useState<boolean>(false);
  const [showSimulateModal, setShowSimulateModal] = useState<boolean>(false);
  const [selectedEventForDetail, setSelectedEventForDetail] = useState<AnalyticsEvent | null>(null);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  
  // Table Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);

  // Simulation Form State
  const [simForm, setSimForm] = useState({
    session_id: `sess_${Math.floor(Math.random() * 9000) + 1000}`,
    campaign: 'dailybread-cyberwrap',
    source: 'website',
    game_mode: 'challenge',
    event: 'challenge_completed',
    game_version: 'v1.4.2',
    score: 220,
    coupon_code: 'SHAWARMA-20-8842',
    discount: '20%'
  });

  // Fetch summary and event logs from server
  const fetchData = useCallback(async (isManual: boolean = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const url = selectedCampaign !== 'all' 
        ? `/api/analytics/summary?campaign=${encodeURIComponent(selectedCampaign)}` 
        : '/api/analytics/summary';
      
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
  }, [selectedCampaign]);

  // Initial load
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

  // Trigger test simulation event
  const handleSimulateEvent = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    try {
      let customData: Record<string, any> = {
        source: simForm.source,
        game_mode: simForm.game_mode,
      };

      if (simForm.event === 'game_started') {
        customData = { ...customData, game_mode: simForm.game_mode, device: 'desktop' };
      } else if (simForm.event === 'challenge_completed') {
        customData = { ...customData, score: simForm.score, duration_sec: 45, reached_threshold: simForm.score >= 200 };
      } else if (simForm.event === 'coupon_earned') {
        customData = { ...customData, coupon_code: simForm.coupon_code, discount: simForm.discount, threshold: 200 };
      } else if (simForm.event === 'coupon_redeemed') {
        customData = { ...customData, coupon_code: simForm.coupon_code, channel: 'whatsapp_web' };
      } else if (simForm.event === 'order_initiated') {
        customData = { ...customData, cart_count: 2, subtotal_xaf: 5000, coupon_applied: true };
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
          data: customData,
          player_id: `ply_${Math.floor(Math.random() * 8999 + 1000)}`
        })
      });

      if (res.ok) {
        setActionMessage(`Logged event "${simForm.event}" successfully!`);
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

  // Filter raw events based on user selection
  const filteredEvents = useMemo(() => {
    if (!data?.rawEvents) return [];
    return data.rawEvents.filter((ev) => {
      // Event filter
      if (selectedEvent !== 'all' && ev.event !== selectedEvent) return false;
      
      // Source filter
      if (selectedSource !== 'all') {
        const eventSource = ev.data?.source || (ev.data?.placement?.includes('table') ? 'qr_table' : 'website');
        if (eventSource !== selectedSource) return false;
      }

      // Game mode filter
      if (selectedGameMode !== 'all') {
        const mode = ev.data?.game_mode || 'challenge';
        if (mode !== selectedGameMode) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchSession = ev.session_id?.toLowerCase().includes(q);
        const matchEvent = ev.event?.toLowerCase().includes(q);
        const matchCampaign = ev.campaign?.toLowerCase().includes(q);
        const matchData = JSON.stringify(ev.data || {}).toLowerCase().includes(q);
        return matchSession || matchEvent || matchCampaign || matchData;
      }
      return true;
    });
  }, [data?.rawEvents, selectedEvent, selectedSource, selectedGameMode, searchQuery]);

  // Derived Business Metrics

  // 1. Executive KPIs
  const executiveKPIs: ExecutiveKPIs = useMemo(() => {
    const raw = data?.rawEvents || [];
    const uniquePlayers = new Set(raw.map(e => e.player_id || e.session_id)).size;
    const challengesCompleted = raw.filter(e => e.event === 'challenge_completed').length;
    const couponsGenerated = rewardsMetrics?.totalCoupons ?? raw.filter(e => e.event === 'coupon_earned' || e.event === 'reward_earned').length;
    const couponsRedeemed = rewardsMetrics?.redeemedCoupons ?? raw.filter(e => e.event === 'coupon_redeemed').length;
    const playersReceivingCoupons = rewardsMetrics?.totalPlayers ?? new Set(
      raw.filter(e => e.event === 'coupon_earned' || e.event === 'reward_earned').map(e => e.player_id || e.session_id)
    ).size;
    
    // Count WhatsApp order intent (order_cta_clicked or order_initiated)
    const orderIntentCount = data?.websiteKPIs?.orderIntentCount ?? raw.filter(e => e.event === 'order_cta_clicked' || e.event === 'order_initiated').length;

    return {
      monthlyPlayers: Math.max(uniquePlayers, 1),
      challengesCompleted,
      playersReceivingCoupons,
      couponsGenerated,
      couponsRedeemed,
      incrementalOrders: orderIntentCount,
      incrementalRevenue: 'Attribution Pending',
      isRevenueAttributionPending: true
    };
  }, [data?.rawEvents, data?.websiteKPIs, rewardsMetrics]);

  // 2. Conversion Funnel calculation
  const funnelSteps: FunnelStep[] = useMemo(() => {
    const raw = data?.rawEvents || [];
    
    // Count events in journey
    const gameStarts = raw.filter(e => e.event === 'game_started' || e.event === 'game_played' || e.event === 'cyberwrap_launch_clicked').length;
    const challenges = raw.filter(e => e.event === 'challenge_completed' || e.event === 'game_completed').length;
    const thresholdReached = raw.filter(e => 
      e.event === 'reward_threshold_reached' || 
      (e.event === 'challenge_completed' && (e.data?.score >= 200 || e.data?.reached_threshold))
    ).length;
    const couponsGenerated = rewardsMetrics?.totalCoupons ?? raw.filter(e => e.event === 'coupon_earned' || e.event === 'reward_earned').length;
    const couponsViewed = raw.filter(e => e.event === 'coupon_viewed' || e.event === 'reward_viewed').length;
    const couponsRedeemed = rewardsMetrics?.redeemedCoupons ?? raw.filter(e => e.event === 'coupon_redeemed').length;
    const ordersInitiated = data?.websiteKPIs?.orderIntentCount ?? raw.filter(e => e.event === 'order_cta_clicked' || e.event === 'order_initiated').length;

    const topCount = Math.max(gameStarts, 1);

    const stepsRaw = [
      { id: 'start', name: 'Game Started', count: gameStarts, notes: 'Player initiated CyberWrap run' },
      { id: 'challenge', name: 'Challenge Completed', count: challenges, notes: 'Finished run in Buea city' },
      { id: 'threshold', name: '200 Points Reached', count: thresholdReached, notes: 'Scored 200+ delivery points' },
      { id: 'coupon_gen', name: 'Coupon Generated', count: couponsGenerated, notes: '20% coupon issued (7-day)' },
      { id: 'coupon_view', name: 'Coupon Viewed', count: couponsViewed, notes: 'Code viewed in reward card' },
      { id: 'coupon_redeem', name: 'Coupon Applied', count: couponsRedeemed, notes: 'Code verified in cart' },
      { id: 'restaurant_order', name: 'WhatsApp Order Intent', count: ordersInitiated, isPendingAttribution: true, notes: 'WhatsApp order intent initiated' },
      { id: 'repeat_order', name: 'Confirmed Order', count: 0, isPendingAttribution: true, notes: 'Pending restaurant confirmation' }
    ];

    return stepsRaw.map((step, idx) => {
      const prevCount = idx === 0 ? topCount : Math.max(stepsRaw[idx - 1].count, 1);
      const conversionRate = Math.min(100, Math.round((step.count / topCount) * 100));
      const stepConversionRate = Math.min(100, Math.round((step.count / prevCount) * 100));
      const dropOffRate = 100 - stepConversionRate;

      return {
        ...step,
        conversionRate,
        stepConversionRate,
        dropOffRate: Math.max(0, dropOffRate)
      };
    });
  }, [data?.rawEvents, data?.websiteKPIs, rewardsMetrics]);

  // 3. Player Engagement Metrics
  const engagementMetrics: PlayerEngagementMetrics = useMemo(() => {
    const raw = data?.rawEvents || [];
    const uniqueSessions = new Set(raw.map(e => e.session_id)).size;
    const uniquePlayers = Math.max(new Set(raw.map(e => e.player_id || e.session_id)).size, 1);
    
    // Average score from completed challenges
    const scores = raw
      .filter(e => (e.event === 'challenge_completed' || e.event === 'game_played') && e.data?.score)
      .map(e => Number(e.data.score));
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

    // Average duration
    const durations = raw
      .filter(e => e.data?.duration_sec)
      .map(e => Number(e.data.duration_sec));
    const avgPlayDurationSec = durations.length > 0 ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : 35;

    const gameStarts = raw.filter(e => e.event === 'game_started' || e.event === 'game_played' || e.event === 'cyberwrap_launch_clicked').length;
    const challenges = raw.filter(e => e.event === 'challenge_completed' || e.event === 'game_completed').length;
    const thresholdReached = raw.filter(e => 
      e.event === 'reward_threshold_reached' || (e.data?.score >= 200)
    ).length;

    const challengeCompletionRate = gameStarts > 0 ? Math.round((challenges / gameStarts) * 100) : 0;
    const thresholdAchievementRate = challenges > 0 ? Math.round((thresholdReached / challenges) * 100) : 0;

    return {
      uniquePlayers,
      uniqueSessions,
      avgSessionsPerPlayer: Number((uniqueSessions / uniquePlayers).toFixed(1)),
      avgPlayDurationSec,
      avgScore,
      challengeCompletionRate,
      thresholdAchievementRate,
      returningPlayers: Math.max(0, uniquePlayers - Math.round(uniquePlayers * 0.7))
    };
  }, [data?.rawEvents]);

  // 4. Acquisition Sources Performance
  const sourcePerformance: SourcePerformanceItem[] = useMemo(() => {
    if (data?.sourcePerformance && data.sourcePerformance.length > 0) {
      return data.sourcePerformance;
    }

    const raw = data?.rawEvents || [];
    const sourcesList = [
      { id: 'website', name: 'Website (Direct/Organic)' },
      { id: 'instagram', name: 'Instagram' },
      { id: 'qr_table', name: 'QR Table Stand' },
      { id: 'qr_counter', name: 'QR Checkout Counter' },
      { id: 'qr_receipt', name: 'QR Receipt' },
      { id: 'qr_delivery', name: 'QR Takeout Bag' },
      { id: 'social', name: 'Social Media' },
      { id: 'direct', name: 'Direct Link' }
    ];

    return sourcesList.map(s => {
      const sourceEvents = raw.filter(e => {
        const evSource = (e.source || e.data?.source || (e.data?.placement?.includes('table') ? 'qr_table' : 'website')).toLowerCase();
        return evSource === s.id;
      });

      const visitors = new Set(sourceEvents.filter(e => e.visitor_id).map(e => e.visitor_id as string)).size ||
                       new Set(sourceEvents.map(e => e.session_id)).size;
      const sessions = new Set(sourceEvents.map(e => e.session_id)).size;
      const players = new Set(sourceEvents.filter(e => e.player_id).map(e => e.player_id as string)).size;
      const gameStarts = sourceEvents.filter(e => ['game_started', 'game_played', 'cyberwrap_launch_clicked'].includes(e.event)).length;
      const challengesCompleted = sourceEvents.filter(e => ['challenge_completed', 'game_completed'].includes(e.event)).length;
      const couponsEarned = sourceEvents.filter(e => ['coupon_earned', 'reward_earned'].includes(e.event)).length;
      const couponsRedeemed = sourceEvents.filter(e => e.event === 'coupon_redeemed').length;
      const menuViews = sourceEvents.filter(e => e.event === 'menu_viewed').length;
      const orderIntentCount = sourceEvents.filter(e => e.event === 'order_cta_clicked' || e.event === 'order_initiated').length;
      const whatsappOrderOpened = sourceEvents.filter(e => e.event === 'whatsapp_order_opened').length;
      const conversionToWhatsAppIntent = sessions > 0 ? Number(((orderIntentCount / sessions) * 100).toFixed(1)) : 0;

      return {
        source: s.id,
        displayName: s.name,
        visitors,
        sessions,
        players,
        gameStarts,
        challengesCompleted,
        couponsEarned,
        couponsRedeemed,
        menuViews,
        orderIntentCount,
        whatsappOrderOpened,
        conversionToWhatsAppIntent,
        ordersInitiated: orderIntentCount
      };
    });
  }, [data?.sourcePerformance, data?.rawEvents]);

  // 5. Live Activity Feed (Filtered human-readable stream)
  const liveActivityFeed = useMemo(() => {
    const raw = data?.rawEvents || [];
    return raw.slice(0, 8).map(ev => {
      let icon = <Activity size={16} className="text-orange-400" />;
      let title = ev.event.replace(/_/g, ' ');
      let detail = `Session ${ev.session_id}`;

      if (ev.event === 'game_started') {
        icon = <Play size={16} className="text-blue-400" />;
        title = 'New CyberWrap Session';
        detail = `Mode: ${ev.data?.game_mode || 'Challenge'} • ${ev.campaign}`;
      } else if (ev.event === 'challenge_completed') {
        icon = <Award size={16} className="text-amber-400" />;
        title = 'Challenge Completed';
        detail = `Score: ${ev.data?.score || 0} pts • Duration: ${ev.data?.duration_sec || 30}s`;
      } else if (ev.event === 'coupon_earned') {
        icon = <Gift size={16} className="text-emerald-400" />;
        title = '20% Coupon Earned';
        detail = `Code: ${ev.data?.coupon_code || 'SHAWARMA-20-XXXX'}`;
      } else if (ev.event === 'coupon_viewed') {
        icon = <Eye size={16} className="text-purple-400" />;
        title = 'Coupon Viewed';
        detail = 'Player inspected active discount card';
      } else if (ev.event === 'coupon_redeemed') {
        icon = <CheckCircle2 size={16} className="text-emerald-400" />;
        title = 'Coupon Redeemed';
        detail = `Applied 20% discount in cart checkout`;
      } else if (ev.event === 'order_initiated') {
        icon = <ShoppingBag size={16} className="text-orange-500" />;
        title = 'WhatsApp Order Initiated';
        detail = `Cart items: ${ev.data?.cart_count || 1} • Est: ${ev.data?.total_xaf || 4000} XAF`;
      } else if (ev.event === '3d_ar_opened') {
        icon = <Compass size={16} className="text-cyan-400" />;
        title = 'AR Landmark / 3D Viewer';
        detail = `Explored item: ${ev.data?.item_id || 'Signature Beef'}`;
      }

      return {
        id: ev.id,
        icon,
        title,
        detail,
        timestamp: new Date(ev.created_at).toLocaleTimeString()
      };
    });
  }, [data?.rawEvents]);

  // Export filtered events as CSV
  const exportToCSV = () => {
    if (!filteredEvents.length) return;
    const headers = ['ID', 'Session ID', 'Campaign', 'Event', 'Timestamp', 'Game Version', 'Data', 'Created At'];
    const rows = filteredEvents.map(e => [
      e.id,
      e.session_id,
      e.campaign,
      e.event,
      e.timestamp,
      e.game_version,
      JSON.stringify(e.data || {}).replace(/"/g, '""'),
      e.created_at
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(f => `"${f}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `dailybread_analytics_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySqlToClipboard = () => {
    const sql = `-- Supabase Table: public.analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  campaign TEXT NOT NULL DEFAULT 'dailybread-cyberwrap',
  event TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  game_version TEXT DEFAULT 'v1.4.2',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  player_id UUID NULL
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated admins read analytics" ON public.analytics_events FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event ON public.analytics_events (event);`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Pagination calculation
  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 font-sans selection:bg-orange-500/30 pb-20">
      
      {/* Top Admin Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#10141e]/90 backdrop-blur-md border-b border-slate-800/80 px-4 md:px-8 py-3.5 flex flex-wrap justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 px-3 py-1.5 rounded-lg transition-colors border border-slate-700/50 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Back to Store</span>
            </button>
          )}

          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h1 className="text-base md:text-lg font-black font-heading tracking-tight text-white flex items-center gap-2">
                <span>DailyBread Shawarma</span>
                <span className="text-orange-400">× CyberWrap</span>
              </h1>
              <span className="text-[11px] bg-orange-500/20 text-orange-400 border border-orange-500/30 px-2 py-0.5 rounded font-mono font-bold">
                BUSINESS ANALYTICS
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Executive conversion funnel, game engagement, and reward attribution
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Switch to Rewards Admin */}
          {onNavigateToRewardsAdmin && (
            <button
              onClick={onNavigateToRewardsAdmin}
              className="flex items-center gap-1.5 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer"
              title="Open Rewards & Coupon Inventory Dashboard"
            >
              <Gift size={14} className="text-amber-400" />
              <span>Rewards Admin</span>
            </button>
          )}

          {/* Simulate Event Modal Trigger */}
          <button
            onClick={() => setShowSimulateModal(true)}
            className="flex items-center gap-1.5 bg-orange-500 hover:bg-orange-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold shadow-md transition-all cursor-pointer"
          >
            <PlusCircle size={14} />
            <span className="hidden sm:inline">Simulate Event</span>
          </button>

          {/* Auto-Refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
              autoRefresh 
                ? 'bg-emerald-950/40 text-emerald-400 border-emerald-500/30' 
                : 'bg-slate-800/60 text-slate-400 border-slate-700'
            }`}
            title="Toggle Live Auto-Refresh (every 10s)"
          >
            <RefreshCw size={13} className={autoRefresh ? 'animate-spin' : ''} />
            <span className="hidden md:inline">{autoRefresh ? `${refreshCountdown}s` : 'Paused'}</span>
          </button>

          {/* Manual Refresh */}
          <button
            onClick={() => fetchData(true)}
            disabled={isRefreshing}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors border border-slate-700 cursor-pointer disabled:opacity-50"
            title="Refresh analytics data"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-8">

        {/* Action Message Banner */}
        {actionMessage && (
          <div className="bg-emerald-900/40 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl text-xs flex items-center justify-between animate-fade-in font-mono">
            <span>✓ {actionMessage}</span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-400 hover:text-white">✕</button>
          </div>
        )}

        {/* Filters Bar: Campaign, Source & Game Mode */}
        <section className="bg-[#121722] border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold uppercase tracking-wider font-mono">
              <Filter size={14} className="text-orange-400" />
              <span>Filters:</span>
            </div>

            {/* Campaign Select */}
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Campaigns</option>
              <option value="dailybread-cyberwrap">dailybread-cyberwrap</option>
              <option value="cyberwrap-september">cyberwrap-september</option>
              <option value="Summer Shawarma Splash">Summer Shawarma Splash</option>
            </select>

            {/* Source Select */}
            <select
              value={selectedSource}
              onChange={(e) => setSelectedSource(e.target.value)}
              className="bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Sources</option>
              <option value="website">Website (Homepage)</option>
              <option value="instagram">Instagram</option>
              <option value="qr_table">QR Table</option>
              <option value="qr_counter">QR Counter</option>
              <option value="qr_receipt">QR Receipt</option>
              <option value="qr_delivery">QR Delivery</option>
              <option value="social">Social</option>
              <option value="direct">Direct</option>
            </select>

            {/* Game Mode Select */}
            <select
              value={selectedGameMode}
              onChange={(e) => setSelectedGameMode(e.target.value as GameModeFilter)}
              className="bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-orange-500 cursor-pointer"
            >
              <option value="all">All Game Modes</option>
              <option value="challenge">Challenge Mode (Rewards Active)</option>
              <option value="free_roam">Free Roam (No Points)</option>
            </select>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400 font-mono">
              Source: <strong className={data?.dataSource === 'supabase' ? 'text-emerald-400' : 'text-amber-400'}>
                {data?.dataSource === 'supabase' ? 'Supabase Live' : 'Simulated In-Memory'}
              </strong>
            </span>
            <button
              onClick={() => setShowSqlModal(true)}
              className="text-xs text-slate-400 hover:text-slate-200 underline font-mono cursor-pointer"
            >
              Schema DDL
            </button>
          </div>
        </section>

        {/* 1. EXECUTIVE OVERVIEW (Top KPI Cards) */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 font-mono flex items-center gap-2">
              <Sparkles size={16} className="text-orange-400" />
              <span>1. Executive Overview</span>
            </h2>
            <span className="text-xs text-slate-500 font-mono">High-Level Performance</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3 sm:gap-4">
            {/* Monthly Players */}
            <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Monthly Players</span>
              <div className="text-2xl font-black font-mono text-white">{executiveKPIs.monthlyPlayers}</div>
              <span className="text-[10px] text-slate-500 block">Unique visitors / drivers</span>
            </div>

            {/* Challenges Completed */}
            <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Challenges Done</span>
              <div className="text-2xl font-black font-mono text-blue-400">{executiveKPIs.challengesCompleted}</div>
              <span className="text-[10px] text-slate-500 block">Completed runs</span>
            </div>

            {/* Players Receiving Coupons */}
            <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Players Awarded</span>
              <div className="text-2xl font-black font-mono text-amber-400">{executiveKPIs.playersReceivingCoupons}</div>
              <span className="text-[10px] text-slate-500 block">Hit 200 pts milestone</span>
            </div>

            {/* Coupons Generated */}
            <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Coupons Issued</span>
              <div className="text-2xl font-black font-mono text-emerald-400">{executiveKPIs.couponsGenerated}</div>
              <span className="text-[10px] text-slate-500 block">Unique 20% codes</span>
            </div>

            {/* Coupons Redeemed */}
            <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Coupons Redeemed</span>
              <div className="text-2xl font-black font-mono text-purple-400">{executiveKPIs.couponsRedeemed}</div>
              <span className="text-[10px] text-slate-500 block">Applied in checkout</span>
            </div>

            {/* Incremental Orders / WhatsApp Order Intent */}
            <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">WhatsApp Order Intent</span>
              <div className="text-2xl font-black font-mono text-orange-400">{executiveKPIs.incrementalOrders}</div>
              <span className="text-[10px] text-amber-400/80 font-mono block">Order Intent (Not Confirmed)</span>
            </div>

            {/* Incremental Revenue */}
            <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-1">
              <span className="text-[11px] font-mono uppercase text-slate-400 block">Revenue Attribution</span>
              <div className="text-xs font-bold font-mono text-amber-300 mt-2 bg-amber-500/10 border border-amber-500/30 px-2 py-1 rounded text-center">
                Pending Confirmation
              </div>
              <span className="text-[10px] text-slate-500 block text-center">WhatsApp intent only</span>
            </div>
          </div>

          {/* Cross-Journey & Website Acquisition KPIs */}
          <div className="bg-[#121722]/80 border border-slate-800 rounded-2xl p-4 sm:p-5 mt-4 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
                <Layers size={15} className="text-emerald-400" />
                <span>Website & Cross-Journey Attribution (Daily Run ↔ WhatsApp)</span>
              </div>
              <span className="text-[11px] font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded">
                Distinguishing Order Intent from Confirmed Orders
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1">
              <div className="bg-[#0a0d14] border border-slate-800/80 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Unique Visitors</span>
                <div className="text-lg font-black font-mono text-white">
                  {data?.websiteKPIs?.uniqueVisitors ?? data?.kpis?.totalUniqueSessions ?? 1}
                </div>
                <span className="text-[10px] text-slate-500">Persistent browser ID</span>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800/80 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Browsing Sessions</span>
                <div className="text-lg font-black font-mono text-blue-400">
                  {data?.websiteKPIs?.totalSessions ?? data?.kpis?.totalUniqueSessions ?? 1}
                </div>
                <span className="text-[10px] text-slate-500">Website visits</span>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800/80 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Menu Views</span>
                <div className="text-lg font-black font-mono text-amber-400">
                  {data?.websiteKPIs?.menuViews ?? 0}
                </div>
                <span className="text-[10px] text-slate-500">Menu interactions</span>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800/80 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Daily Run Intent</span>
                <div className="text-lg font-black font-mono text-emerald-400">
                  {data?.crossJourneyKPIs?.dailyRunToWhatsAppIntent ?? 0}
                </div>
                <span className="text-[10px] text-slate-500">Played Run ➔ WhatsApp</span>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800/80 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Post-Order Play CTA</span>
                <div className="text-lg font-black font-mono text-purple-400">
                  {data?.crossJourneyKPIs?.postOrderDailyRunStarts ?? 0}
                </div>
                <span className="text-[10px] text-slate-500">Ordered ➔ Played Run</span>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800/80 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Coupon-Assisted Intent</span>
                <div className="text-lg font-black font-mono text-orange-400">
                  {data?.crossJourneyKPIs?.couponAssistedOrderIntent ?? 0}
                </div>
                <span className="text-[10px] text-slate-500">Orders with coupon code</span>
              </div>
            </div>
          </div>
        </section>

        {/* 2. CONVERSION FUNNEL */}
        <section className="bg-[#121722] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <TrendingUp size={18} className="text-orange-400" />
                <span>2. CyberWrap Conversion Funnel</span>
              </h3>
              <p className="text-xs text-slate-400">
                End-to-end user conversion from initial WebGL run to restaurant coupon redemption
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-slate-800/60 px-3 py-1 rounded-lg">
              Goal: 200 PTS ➔ 20% Coupon ➔ Shawarma Order
            </div>
          </div>

          {/* Stepped Funnel Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
            {funnelSteps.map((step, index) => (
              <div 
                key={step.id} 
                className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3.5 flex flex-col justify-between relative overflow-hidden"
              >
                {/* Step Index Pill */}
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono text-slate-500 font-bold">0{index + 1}</span>
                  {step.isPendingAttribution ? (
                    <span className="text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-bold">
                      Pending
                    </span>
                  ) : (
                    <span className="text-[10px] font-mono text-emerald-400 font-bold">
                      {step.stepConversionRate}%
                    </span>
                  )}
                </div>

                <div className="space-y-1 my-1">
                  <div className="text-xs font-bold text-slate-200 line-clamp-1" title={step.name}>
                    {step.name}
                  </div>
                  <div className="text-xl font-black font-mono text-white">
                    {step.isPendingAttribution && step.count === 0 ? '—' : step.count}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-800/80 mt-2 text-[10px] font-mono text-slate-400">
                  {step.isPendingAttribution ? (
                    <span className="text-amber-400/90">{step.notes}</span>
                  ) : (
                    <span>{step.dropOffRate > 0 ? `-${step.dropOffRate}% drop` : 'Baseline'}</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-amber-950/20 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-200/90 flex items-start gap-2.5">
            <Info size={16} className="text-amber-400 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong>Funnel Attribution Note:</strong> Conversion percentages are calculated strictly from recorded database events. Because DailyBread utilizes WhatsApp-mediated ordering, final cash/Momo restaurant receipts and repeat customer orders are handled offline and marked as <em>Attribution pending</em> until direct POS webhooks are linked.
            </p>
          </div>
        </section>

        {/* 3 & 4. REVENUE IMPACT & PLAYER ENGAGEMENT (Two Columns) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* 3. Revenue Impact */}
          <div className="lg:col-span-6 bg-[#121722] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4 flex flex-col justify-between">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <DollarSign size={18} className="text-emerald-400" />
                <span>3. Revenue Impact</span>
              </h3>
              <p className="text-xs text-slate-400">
                Financial incrementality generated via CyberWrap rewards
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-xs font-mono uppercase text-slate-400">Incremental Revenue</span>
                <div className="text-sm font-bold font-mono text-amber-300 py-1">
                  Order attribution not yet available
                </div>
                <span className="text-[10px] text-slate-500">Requires POS payment sync</span>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-xs font-mono uppercase text-slate-400">Initiated Orders</span>
                <div className="text-2xl font-black font-mono text-white">
                  {executiveKPIs.incrementalOrders}
                </div>
                <span className="text-[10px] text-slate-500">WhatsApp checkout clicks</span>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-xs font-mono uppercase text-slate-400">Avg Incremental Order</span>
                <div className="text-sm font-bold font-mono text-amber-300 py-1">
                  Order attribution not yet available
                </div>
                <span className="text-[10px] text-slate-500">Pending final receipt amounts</span>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-4 space-y-1">
                <span className="text-xs font-mono uppercase text-slate-400">Coupon Redemption Rate</span>
                <div className="text-2xl font-black font-mono text-emerald-400">
                  {rewardsMetrics?.redemptionRate ?? data?.kpis?.redemptionRate ?? 0}%
                </div>
                <span className="text-[10px] text-slate-500">Claimed vs Issued</span>
              </div>
            </div>

            <div className="text-[11px] text-slate-400 bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/50">
              💡 <em>To enable exact revenue tracking, restaurant staff can record coupon redemption receipts in the Rewards Admin.</em>
            </div>
          </div>

          {/* 4. Player Engagement */}
          <div className="lg:col-span-6 bg-[#121722] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Users size={18} className="text-blue-400" />
                <span>4. Player Engagement</span>
              </h3>
              <p className="text-xs text-slate-400">
                Gameplay session depth, scores, and completion behaviors
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Unique Sessions</span>
                <div className="text-lg font-black font-mono text-white">{engagementMetrics.uniqueSessions}</div>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Avg Sessions/Player</span>
                <div className="text-lg font-black font-mono text-blue-400">{engagementMetrics.avgSessionsPerPlayer}</div>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Avg Duration</span>
                <div className="text-lg font-black font-mono text-amber-400">{engagementMetrics.avgPlayDurationSec}s</div>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3">
                <span className="text-[10px] font-mono uppercase text-slate-400 block">Avg Score</span>
                <div className="text-lg font-black font-mono text-emerald-400">{engagementMetrics.avgScore} pts</div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Challenge Finish Rate</span>
                <div className="text-xl font-black font-mono text-white">{engagementMetrics.challengeCompletionRate}%</div>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">200 Pts Rate</span>
                <div className="text-xl font-black font-mono text-orange-400">{engagementMetrics.thresholdAchievementRate}%</div>
              </div>

              <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 text-center">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Returning Players</span>
                <div className="text-xl font-black font-mono text-purple-400">{engagementMetrics.returningPlayers}</div>
              </div>
            </div>
          </div>

        </section>

        {/* 5 & 6. REWARD PERFORMANCE & ACQUISITION SOURCES */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 5. Reward Performance */}
          <div className="lg:col-span-5 bg-[#121722] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Ticket size={18} className="text-amber-400" />
                <span>5. Reward Performance</span>
              </h3>
              <p className="text-xs text-slate-400">
                Authoritative backend coupon lifecycle (7-day validity)
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center bg-[#0a0d14] border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-300 font-mono">Total Coupons Generated</span>
                <span className="text-sm font-bold font-mono text-white">
                  {rewardsMetrics?.totalCoupons ?? executiveKPIs.couponsGenerated}
                </span>
              </div>

              <div className="flex justify-between items-center bg-[#0a0d14] border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-300 font-mono">Active Coupons (Unused)</span>
                <span className="text-sm font-bold font-mono text-emerald-400">
                  {rewardsMetrics?.activeCoupons ?? Math.max(0, executiveKPIs.couponsGenerated - executiveKPIs.couponsRedeemed)}
                </span>
              </div>

              <div className="flex justify-between items-center bg-[#0a0d14] border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-300 font-mono">Redeemed in Restaurant</span>
                <span className="text-sm font-bold font-mono text-purple-400">
                  {rewardsMetrics?.redeemedCoupons ?? executiveKPIs.couponsRedeemed}
                </span>
              </div>

              <div className="flex justify-between items-center bg-[#0a0d14] border border-slate-800 p-3 rounded-xl">
                <span className="text-xs text-slate-300 font-mono">Expired After 7 Days</span>
                <span className="text-sm font-bold font-mono text-red-400">
                  {rewardsMetrics?.expiredCoupons ?? 0}
                </span>
              </div>

              <div className="flex justify-between items-center bg-emerald-950/20 border border-emerald-500/30 p-3 rounded-xl">
                <span className="text-xs text-emerald-300 font-mono font-bold">Overall Redemption Rate</span>
                <span className="text-base font-black font-mono text-emerald-400">
                  {rewardsMetrics?.redemptionRate ?? data?.kpis?.redemptionRate ?? 0}%
                </span>
              </div>
            </div>
          </div>

          {/* 6. Acquisition Sources Breakdown */}
          <div className="lg:col-span-7 bg-[#121722] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Compass size={18} className="text-cyan-400" />
                <span>6. Acquisition Sources Performance</span>
              </h3>
              <p className="text-xs text-slate-400">
                Visitor attribution by touchpoint (Website, Instagram, QR Table/Counter/Receipt)
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                    <th className="py-2 px-2">Source</th>
                    <th className="py-2 px-2 text-right">Visitors</th>
                    <th className="py-2 px-2 text-right">Sessions</th>
                    <th className="py-2 px-2 text-right">Game Starts</th>
                    <th className="py-2 px-2 text-right">Challenges</th>
                    <th className="py-2 px-2 text-right">Coupons</th>
                    <th className="py-2 px-2 text-right">WhatsApp Intent</th>
                    <th className="py-2 px-2 text-right">Conv %</th>
                    <th className="py-2 px-2 text-right">Redemptions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {sourcePerformance.map((src) => (
                    <tr key={src.source} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-2 px-2 font-bold text-slate-200">
                        {src.displayName}
                      </td>
                      <td className="py-2 px-2 text-right text-slate-300">{src.visitors}</td>
                      <td className="py-2 px-2 text-right text-slate-400">{src.sessions}</td>
                      <td className="py-2 px-2 text-right text-blue-400">{src.gameStarts}</td>
                      <td className="py-2 px-2 text-right text-amber-400">{src.challengesCompleted}</td>
                      <td className="py-2 px-2 text-right text-emerald-400">{src.couponsEarned}</td>
                      <td className="py-2 px-2 text-right text-orange-400 font-bold">{src.orderIntentCount}</td>
                      <td className="py-2 px-2 text-right text-emerald-400">{src.conversionToWhatsAppIntent}%</td>
                      <td className="py-2 px-2 text-right text-purple-400">{src.couponsRedeemed}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </section>

        {/* 7 & 8. LIVE ACTIVITY & CHARTS */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">

          {/* 8. Live Activity Feed */}
          <div className="lg:col-span-5 bg-[#121722] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                  <Flame size={18} className="text-orange-400" />
                  <span>8. Live Activity Stream</span>
                </h3>
                <p className="text-xs text-slate-400">Real-time actions in CyberWrap and DailyBread</p>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto pr-1">
              {liveActivityFeed.length === 0 ? (
                <div className="text-xs text-slate-500 py-6 text-center font-mono">
                  No recent events recorded.
                </div>
              ) : (
                liveActivityFeed.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-[#0a0d14] border border-slate-800/90 rounded-xl p-2.5 flex items-center gap-3"
                  >
                    <div className="p-2 rounded-lg bg-slate-800/80 shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-slate-200 capitalize truncate">
                          {item.title}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500 shrink-0">
                          {item.timestamp}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-mono truncate">
                        {item.detail}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Volume Over Time Chart */}
          <div className="lg:col-span-7 bg-[#121722] border border-slate-800 rounded-2xl p-5 sm:p-6 space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Activity size={18} className="text-orange-400" />
                <span>Event Volume Trends</span>
              </h3>
              <p className="text-xs text-slate-400">Total gameplay actions and rewards issued over time</p>
            </div>

            <div className="h-64 w-full">
              {data?.volumeOverTime && data.volumeOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.volumeOverTime}>
                    <defs>
                      <linearGradient id="eventColor" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                    <XAxis dataKey="formattedTime" stroke="#6e7681" fontSize={11} />
                    <YAxis stroke="#6e7681" fontSize={11} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#161b22', borderColor: '#30363d', color: '#fff', fontSize: '12px' }} 
                    />
                    <Area type="monotone" dataKey="count" stroke="#f97316" fillOpacity={1} fill="url(#eventColor)" name="Total Events" />
                    <Area type="monotone" dataKey="games" stroke="#3b82f6" fillOpacity={0} name="Games" />
                    <Area type="monotone" dataKey="couponsEarned" stroke="#10b981" fillOpacity={0} name="Coupons Earned" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-slate-500 font-mono">
                  Insufficient chronological data. Log events to populate graph.
                </div>
              )}
            </div>
          </div>

        </section>

        {/* 9. TECHNICAL EVENT EXPLORER (Detailed Logs) */}
        <section className="bg-[#121722] border border-slate-800 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-3">
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Layers size={18} className="text-orange-400" />
                <span>9. Technical Event Explorer</span>
              </h3>
              <p className="text-xs text-slate-400">
                Raw audit logs with query search, JSON payload inspector, and CSV export
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={exportToCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold border border-slate-700 transition-all cursor-pointer"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Search and event-type filter controls */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by session, event, campaign or payload..."
                className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
              />
            </div>

            <select
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
              className="bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-orange-500 font-mono cursor-pointer"
            >
              <option value="all">All Event Types</option>
              <option value="game_started">game_started</option>
              <option value="challenge_completed">challenge_completed</option>
              <option value="reward_threshold_reached">reward_threshold_reached</option>
              <option value="coupon_earned">coupon_earned</option>
              <option value="coupon_viewed">coupon_viewed</option>
              <option value="coupon_redeemed">coupon_redeemed</option>
              <option value="order_initiated">order_initiated</option>
              <option value="3d_ar_opened">3d_ar_opened</option>
              <option value="cyberwrap_launch_clicked">cyberwrap_launch_clicked</option>
              <option value="daily_run_section_viewed">daily_run_section_viewed</option>
              <option value="daily_run_cta_clicked">daily_run_cta_clicked</option>
            </select>
          </div>

          {/* Table */}
          <div className="overflow-x-auto border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0a0d14] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">ID</th>
                  <th className="py-2.5 px-3">Event</th>
                  <th className="py-2.5 px-3">Session</th>
                  <th className="py-2.5 px-3">Campaign</th>
                  <th className="py-2.5 px-3">Metadata</th>
                  <th className="py-2.5 px-3">Logged At</th>
                  <th className="py-2.5 px-3 text-right">Inspect</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 font-mono">
                {paginatedEvents.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 text-xs">
                      No analytics events found matching filters.
                    </td>
                  </tr>
                ) : (
                  paginatedEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 text-slate-500 text-[11px]">#{ev.id}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-bold text-orange-400">{ev.event}</span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-300">{ev.session_id}</td>
                      <td className="py-2.5 px-3 text-slate-400">{ev.campaign}</td>
                      <td className="py-2.5 px-3 text-slate-400 max-w-[200px] truncate text-[11px]">
                        {JSON.stringify(ev.data || {})}
                      </td>
                      <td className="py-2.5 px-3 text-slate-400 text-[11px]">
                        {new Date(ev.created_at).toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => setSelectedEventForDetail(ev)}
                          className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-700 transition-colors cursor-pointer"
                          title="View JSON Payload"
                        >
                          <Eye size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400 font-mono pt-2">
            <div>
              Showing {paginatedEvents.length} of {filteredEvents.length} filtered records
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage <= 1}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
              >
                Previous
              </button>
              <span>Page {currentPage} of {totalPages}</span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 transition-colors cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* SQL Setup Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121722] border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-emerald-400" />
                <h3 className="text-base font-bold text-white font-heading">Supabase SQL Table Schema</h3>
              </div>
              <button 
                onClick={() => setShowSqlModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Database schema for analytics telemetry. Client inserts are permitted; SELECT permissions are restricted to authenticated admins:
            </p>

            <div className="relative">
              <pre className="bg-[#0a0d14] border border-slate-800 p-4 rounded-xl text-xs font-mono text-slate-200 overflow-x-auto max-h-60 leading-relaxed">
{`-- Supabase Table: public.analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  campaign TEXT NOT NULL DEFAULT 'dailybread-cyberwrap',
  event TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  game_version TEXT DEFAULT 'v1.4.2',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  player_id UUID NULL
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public insert analytics" ON public.analytics_events FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow authenticated admins read analytics" ON public.analytics_events FOR SELECT TO authenticated USING (true);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON public.analytics_events (created_at DESC);`}
              </pre>

              <button
                onClick={copySqlToClipboard}
                className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold flex items-center gap-1.5 shadow transition-all cursor-pointer"
              >
                {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                <span>{copiedSql ? 'Copied SQL!' : 'Copy SQL'}</span>
              </button>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setShowSqlModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect JSON Modal */}
      {selectedEventForDetail && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121722] border border-slate-800 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-orange-400" />
                <h3 className="text-base font-bold text-white font-heading">Event #{selectedEventForDetail.id} Details</h3>
              </div>
              <button 
                onClick={() => setSelectedEventForDetail(null)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2 text-xs font-mono">
              <div className="grid grid-cols-2 gap-2 bg-[#0a0d14] p-3 rounded-xl border border-slate-800">
                <div>Event: <strong className="text-orange-400">{selectedEventForDetail.event}</strong></div>
                <div>Session: <strong className="text-slate-200">{selectedEventForDetail.session_id}</strong></div>
                <div>Campaign: <strong className="text-blue-400">{selectedEventForDetail.campaign}</strong></div>
                <div>Version: <strong className="text-emerald-400">{selectedEventForDetail.game_version}</strong></div>
              </div>

              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Payload JSON:</span>
                <pre className="bg-[#0a0d14] border border-slate-800 p-3 rounded-xl text-[11px] text-slate-300 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedEventForDetail.data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEventForDetail(null)}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Event Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#121722] border border-slate-800 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-orange-400" />
                <h3 className="text-base font-bold text-white font-heading">Simulate Live Telemetry Event</h3>
              </div>
              <button 
                onClick={() => setShowSimulateModal(false)}
                className="text-slate-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateEvent} className="space-y-3 text-xs font-mono">
              <div>
                <label className="block text-slate-400 mb-1">Event Type</label>
                <select
                  value={simForm.event}
                  onChange={(e) => setSimForm({ ...simForm, event: e.target.value })}
                  className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-2 text-white"
                >
                  <option value="game_started">game_started</option>
                  <option value="challenge_completed">challenge_completed</option>
                  <option value="reward_threshold_reached">reward_threshold_reached</option>
                  <option value="coupon_earned">coupon_earned</option>
                  <option value="coupon_viewed">coupon_viewed</option>
                  <option value="coupon_redeemed">coupon_redeemed</option>
                  <option value="order_initiated">order_initiated</option>
                  <option value="3d_ar_opened">3d_ar_opened</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1">Source</label>
                  <select
                    value={simForm.source}
                    onChange={(e) => setSimForm({ ...simForm, source: e.target.value })}
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  >
                    <option value="website">website</option>
                    <option value="instagram">instagram</option>
                    <option value="qr_table">qr_table</option>
                    <option value="qr_counter">qr_counter</option>
                    <option value="qr_receipt">qr_receipt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Score</label>
                  <input
                    type="number"
                    value={simForm.score}
                    onChange={(e) => setSimForm({ ...simForm, score: Number(e.target.value) })}
                    className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold cursor-pointer"
                >
                  Emit Event
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
