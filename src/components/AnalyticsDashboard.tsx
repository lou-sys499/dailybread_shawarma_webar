import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, 
  AreaChart, Area, PieChart, Pie, Cell, Legend 
} from 'recharts';
import { 
  Activity, Users, Ticket, Award, RefreshCw, Filter, Search, 
  Database, CheckCircle2, AlertTriangle, ArrowUpRight, Download, 
  PlusCircle, Play, Eye, Copy, Check, ChevronDown, ChevronUp,
  Sparkles, Layers, ShieldCheck, Flame, Gift, ArrowLeft
} from 'lucide-react';
import { AnalyticsDashboardData, AnalyticsEvent } from '../types/analytics';

interface AnalyticsDashboardProps {
  onBackToStore?: () => void;
  onNavigateToRewardsAdmin?: () => void;
}

const CAMPAIGN_COLORS = ['#f97316', '#3b82f6', '#10b981', '#8b5cf6', '#ec4899', '#eab308', '#06b6d4'];

export function AnalyticsDashboard({ onBackToStore, onNavigateToRewardsAdmin }: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Filters & Controls
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
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
    campaign: 'Summer Shawarma Splash',
    event: 'coupon_earned',
    game_version: 'v1.4.2',
    score: 650,
    coupon_code: 'BUEA-VIP-20',
    discount: '20%'
  });

  // Fetch summary and event logs from server
  const fetchData = useCallback(async (isManual: boolean = false) => {
    if (isManual) setIsRefreshing(true);
    try {
      const url = selectedCampaign !== 'all' 
        ? `/api/analytics/summary?campaign=${encodeURIComponent(selectedCampaign)}` 
        : '/api/analytics/summary';
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP error ${res.status}`);
      const json: AnalyticsDashboardData = await res.json();
      
      setData(json);
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
      let customData: Record<string, any> = {};
      if (simForm.event === 'game_played') {
        customData = { score: simForm.score, duration_sec: 28 };
      } else if (simForm.event === 'coupon_earned') {
        customData = { coupon_code: simForm.coupon_code || 'SHAWARMA-GOLD', discount: simForm.discount || '15%' };
      } else if (simForm.event === 'coupon_redeemed') {
        customData = { order_value_xaf: 4000, channel: 'whatsapp_web', coupon_code: simForm.coupon_code || 'SHAWARMA-GOLD' };
      } else {
        customData = { ar_view_duration_sec: 15, item: '3d_beef_shawarma' };
      }

      const res = await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: simForm.session_id,
          campaign: simForm.campaign,
          event: simForm.event,
          game_version: simForm.game_version,
          timestamp: Date.now(),
          data: customData
        })
      });

      if (res.ok) {
        setActionMessage(`✓ Event "${simForm.event}" logged successfully!`);
        setTimeout(() => setActionMessage(null), 3000);
        setShowSimulateModal(false);
        // Refresh session id for next event
        setSimForm(prev => ({ ...prev, session_id: `sess_${Math.floor(Math.random() * 9000) + 1000}` }));
        fetchData(true);
      }
    } catch (err: any) {
      console.error('Failed to log event:', err);
    }
  };

  // Quick Seed Data
  const handleSeedData = async () => {
    try {
      setIsRefreshing(true);
      const res = await fetch('/api/analytics/seed', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 25 })
      });
      if (res.ok) {
        setActionMessage('✓ Seeded 25 test records across campaigns!');
        setTimeout(() => setActionMessage(null), 3500);
        fetchData();
      }
    } catch (err) {
      console.error('Seed error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Filter raw events for the interactive table
  const filteredEvents = useMemo(() => {
    if (!data?.rawEvents) return [];
    return data.rawEvents.filter(ev => {
      const matchesCampaign = selectedCampaign === 'all' || ev.campaign === selectedCampaign;
      const matchesEvent = selectedEvent === 'all' || ev.event === selectedEvent;
      const matchesSearch = !searchQuery.trim() || 
        ev.session_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.event.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ev.campaign.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (ev.data && JSON.stringify(ev.data).toLowerCase().includes(searchQuery.toLowerCase()));

      return matchesCampaign && matchesEvent && matchesSearch;
    });
  }, [data?.rawEvents, selectedCampaign, selectedEvent, searchQuery]);

  // Paginated events
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const totalPages = Math.ceil(filteredEvents.length / pageSize) || 1;

  // Export raw filtered events to CSV
  const handleExportCSV = () => {
    if (!filteredEvents.length) return;
    const headers = ['id', 'session_id', 'campaign', 'event', 'timestamp', 'game_version', 'created_at', 'data'];
    const rows = filteredEvents.map(ev => [
      ev.id,
      ev.session_id,
      `"${ev.campaign.replace(/"/g, '""')}"`,
      ev.event,
      ev.timestamp,
      ev.game_version,
      ev.created_at,
      `"${JSON.stringify(ev.data || {}).replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `analytics_events_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const copySqlToClipboard = () => {
    const sql = `-- Supabase Table Schema for public.analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  campaign TEXT NOT NULL,
  event TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  game_version TEXT DEFAULT 'v1.0.0',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS and create policy for server service role access
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow server access to analytics_events"
ON public.analytics_events
FOR ALL
USING (true)
WITH CHECK (true);

-- Index for high-performance aggregations & time-series
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON public.analytics_events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_event_campaign ON public.analytics_events (event, campaign);
`;
    navigator.clipboard.writeText(sql);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2500);
  };

  // Badge styler for events
  const getEventBadge = (event: string) => {
    switch (event) {
      case 'game_played':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">🎮 Game Played</span>;
      case 'coupon_earned':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-300">🎟️ Coupon Earned</span>;
      case 'coupon_redeemed':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-900 border border-emerald-300">🔥 Redeemed</span>;
      case '3d_ar_opened':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">👓 3D AR Opened</span>;
      case 'order_initiated':
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-100 text-rose-800 border border-rose-200">🛒 Order Initiated</span>;
      default:
        return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-stone-100 text-stone-800 border border-stone-200">{event}</span>;
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117] text-stone-100 font-sans pb-24 selection:bg-orange-500/30">
      
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#161b22]/90 backdrop-blur-md border-b border-white/10 px-4 md:px-8 py-3.5 shadow-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          <div className="flex items-center gap-3">
            {onBackToStore && (
              <button 
                onClick={onBackToStore}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-semibold text-stone-300 border border-white/10 transition-all cursor-pointer"
                title="Return to Customer Storefront"
              >
                <ArrowLeft size={14} />
                <span>Storefront</span>
              </button>
            )}

            {onNavigateToRewardsAdmin && (
              <button 
                onClick={onNavigateToRewardsAdmin}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-amber-500/20 to-orange-500/20 hover:from-amber-500/30 hover:to-orange-500/30 text-xs font-semibold text-amber-300 border border-amber-500/30 transition-all cursor-pointer"
                title="Open Supabase Cyberwrap Rewards Admin Dashboard"
              >
                <Gift size={14} className="text-amber-400" />
                <span>Rewards Admin</span>
              </button>
            )}

            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
                <Activity size={18} />
              </div>
              <div>
                <h1 className="text-base md:text-lg font-black font-heading tracking-tight text-white flex items-center gap-2">
                  DailyBread Live Analytics
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Realtime CMS
                  </span>
                </h1>
                <p className="text-[11px] text-stone-400 font-mono">
                  Schema: <code className="text-stone-300">public.analytics_events</code>
                </p>
              </div>
            </div>
          </div>

          {/* Status & Control Actions */}
          <div className="flex flex-wrap items-center gap-2.5 text-xs">
            
            {/* Supabase Status Pill */}
            <div 
              onClick={() => setShowSqlModal(true)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border cursor-pointer transition-all ${
                data?.isSupabaseConnected 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
              }`}
              title="Click to view Supabase configuration & table SQL"
            >
              <Database size={13} />
              <span className="font-semibold font-mono">
                {data?.isSupabaseConnected ? 'Supabase: Connected' : 'Supabase: Ready (Demo Engine)'}
              </span>
              <span className={`w-2 h-2 rounded-full ${data?.isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
            </div>

            {/* Auto Refresh Toggle */}
            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border font-medium transition-all cursor-pointer ${
                autoRefresh 
                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-300 hover:bg-blue-500/20' 
                  : 'bg-white/5 border-white/10 text-stone-400 hover:bg-white/10'
              }`}
              title="Toggle automatic 10-second polling"
            >
              <RefreshCw size={13} className={autoRefresh && isRefreshing ? 'animate-spin' : ''} />
              <span>Auto-refresh</span>
              {autoRefresh && (
                <span className="font-mono bg-blue-500/30 text-blue-200 px-1.5 py-0.2 rounded text-[10px] font-bold">
                  {refreshCountdown}s
                </span>
              )}
            </button>

            {/* Manual Refresh */}
            <button
              onClick={() => fetchData(true)}
              disabled={isRefreshing}
              className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 transition-all cursor-pointer disabled:opacity-50"
              title="Refresh Analytics Now"
            >
              <RefreshCw size={14} className={isRefreshing ? 'animate-spin text-orange-400' : ''} />
            </button>

            {/* Simulate Event Button */}
            <button
              onClick={() => setShowSimulateModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold transition-all shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <PlusCircle size={14} />
              <span>Log Event</span>
            </button>

            {/* SQL Setup Modal trigger */}
            <button
              onClick={() => setShowSqlModal(true)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 transition-all cursor-pointer"
            >
              <ShieldCheck size={14} className="text-stone-400" />
              <span>SQL Schema</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Action toast notification */}
        {actionMessage && (
          <div className="bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 px-4 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between animate-fade-in shadow-lg">
            <span className="flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400" />
              {actionMessage}
            </span>
            <button onClick={() => setActionMessage(null)} className="text-emerald-300 hover:text-white">✕</button>
          </div>
        )}

        {/* Supabase connection banner (if using demo mode or table pending) */}
        {!data?.isSupabaseConnected && (
          <div className="bg-[#1c1f26] border border-amber-500/30 p-4 rounded-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 shrink-0">
                <AlertTriangle size={18} />
              </div>
              <div className="space-y-1">
                <h3 className="font-bold text-amber-200 text-sm">
                  {data?.isSupabaseConfigured 
                    ? 'Supabase Credentials Detected — Table Sync Ready' 
                    : 'Supabase Server Connection Standby'}
                </h3>
                <p className="text-stone-400 leading-relaxed max-w-2xl">
                  {data?.isSupabaseConfigured
                    ? `Connected to Supabase URL. If table public.analytics_events hasn't been created yet, click "SQL Schema" to initialize it.`
                    : `Provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in your server environment to stream straight to your remote database. Currently serving through real-time in-memory simulation engine.`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 self-end md:self-auto shrink-0">
              <button
                onClick={handleSeedData}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-200 border border-white/10 font-semibold transition-all cursor-pointer"
              >
                + Seed 25 Events
              </button>
              <button
                onClick={() => setShowSqlModal(true)}
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 font-semibold transition-all cursor-pointer"
              >
                View SQL Script
              </button>
            </div>
          </div>
        )}

        {/* Global Filter Bar */}
        <section className="bg-[#161b22] border border-white/10 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 text-xs w-full md:w-auto">
            
            {/* Campaign Filter Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-stone-400 font-medium">Campaign:</span>
              <select
                value={selectedCampaign}
                onChange={(e) => setSelectedCampaign(e.target.value)}
                className="bg-[#0d1117] border border-white/15 text-stone-200 rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="all">🌟 All Campaigns</option>
                <option value="Summer Shawarma Splash">Summer Shawarma Splash</option>
                <option value="Student Special Buea">Student Special Buea</option>
                <option value="Weekend Feast Bokwaongo">Weekend Feast Bokwaongo</option>
                <option value="Zobo Loyalty Blast">Zobo Loyalty Blast</option>
                <option value="Independence Promo">Independence Promo</option>
              </select>
            </div>

            {/* Event Type Filter */}
            <div className="flex items-center gap-2">
              <span className="text-stone-400 font-medium">Event:</span>
              <select
                value={selectedEvent}
                onChange={(e) => setSelectedEvent(e.target.value)}
                className="bg-[#0d1117] border border-white/15 text-stone-200 rounded-lg px-3 py-1.5 font-medium focus:outline-none focus:border-orange-500 cursor-pointer"
              >
                <option value="all">⚡ All Events</option>
                <option value="game_played">🎮 game_played</option>
                <option value="coupon_earned">🎟️ coupon_earned</option>
                <option value="coupon_redeemed">🔥 coupon_redeemed</option>
                <option value="3d_ar_opened">👓 3d_ar_opened</option>
                <option value="order_initiated">🛒 order_initiated</option>
              </select>
            </div>

          </div>

          <div className="flex items-center gap-2 text-xs text-stone-400 font-mono w-full md:w-auto justify-between md:justify-end">
            <span>Last Sync: {data?.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : '--:--:--'}</span>
            <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-stone-300">
              Source: {data?.dataSource === 'supabase' ? 'Supabase Table' : 'Realtime Memory Engine'}
            </span>
          </div>
        </section>

        {/* 1. KPI Cards (4 metrics required) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Events */}
          <div className="bg-[#161b22] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-orange-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">Total Events</span>
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                <Activity size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black font-heading text-white tracking-tight">
                {data?.kpis.totalEvents ?? 0}
              </div>
              <div className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
                <ArrowUpRight size={14} />
                <span>Live recorded actions</span>
              </div>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-orange-500 h-full w-4/5 rounded-full" />
            </div>
          </div>

          {/* Total Unique Sessions */}
          <div className="bg-[#161b22] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-blue-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">Unique Sessions</span>
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
                <Users size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black font-heading text-white tracking-tight">
                {data?.kpis.totalUniqueSessions ?? 0}
              </div>
              <div className="text-[11px] text-stone-400">
                Distinct <code className="text-blue-300">session_id</code> count
              </div>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-3/5 rounded-full" />
            </div>
          </div>

          {/* Total Coupons Earned */}
          <div className="bg-[#161b22] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">Coupons Earned</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Ticket size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black font-heading text-amber-300 tracking-tight">
                {data?.kpis.totalCouponsEarned ?? 0}
              </div>
              <div className="text-[11px] text-amber-400/80 font-medium">
                Issued via games & promos
              </div>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-amber-400 h-full w-2/3 rounded-full" />
            </div>
          </div>

          {/* Total Coupons Redeemed */}
          <div className="bg-[#161b22] border border-white/10 p-5 rounded-2xl space-y-3 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-400 uppercase tracking-wider font-mono">Coupons Redeemed</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Gift size={18} />
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-3xl font-black font-heading text-emerald-300 tracking-tight">
                {data?.kpis.totalCouponsRedeemed ?? 0}
              </div>
              <div className="text-[11px] text-emerald-400 font-semibold">
                Conversion Rate: {data?.kpis.redemptionRate ?? 0}%
              </div>
            </div>
            <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
              <div className="bg-emerald-400 h-full w-1/2 rounded-full" />
            </div>
          </div>

        </section>

        {/* 2. Charts Section (3 required: Bar chart, Line chart, Pie chart) */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Chart 1: Bar Chart - Event Frequency */}
          <div className="lg:col-span-6 bg-[#161b22] border border-white/10 p-5 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Flame size={16} className="text-orange-400" />
                  Event Frequency by Name
                </h3>
                <p className="text-xs text-stone-400">Total occurrences grouped by <code className="text-stone-300">event</code> column</p>
              </div>
              <span className="text-[11px] font-mono text-stone-400 bg-white/5 px-2 py-1 rounded">Bar Chart</span>
            </div>

            <div className="h-64 w-full pt-2">
              {data?.eventFrequency && data.eventFrequency.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.eventFrequency} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis 
                      dataKey="displayName" 
                      stroke="#8b949e" 
                      fontSize={11} 
                      tickLine={false} 
                      interval={0}
                      angle={-20}
                      textAnchor="end"
                    />
                    <YAxis stroke="#8b949e" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f242c', borderColor: '#30363d', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      formatter={(val: any) => [`${val} events`, 'Frequency']}
                    />
                    <Bar dataKey="count" fill="#f97316" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-stone-500">
                  No event records found for current filter.
                </div>
              )}
            </div>
          </div>

          {/* Chart 2: Pie / Donut Chart - Campaign Distribution */}
          <div className="lg:col-span-6 bg-[#161b22] border border-white/10 p-5 rounded-2xl space-y-4 shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Layers size={16} className="text-blue-400" />
                  Campaign Distribution
                </h3>
                <p className="text-xs text-stone-400">Share of engagement across marketing campaigns</p>
              </div>
              <span className="text-[11px] font-mono text-stone-400 bg-white/5 px-2 py-1 rounded">Pie Chart</span>
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              {data?.campaignDistribution && data.campaignDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.campaignDistribution}
                      dataKey="count"
                      nameKey="campaign"
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={85}
                      paddingAngle={4}
                    >
                      {data.campaignDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color || CAMPAIGN_COLORS[index % CAMPAIGN_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f242c', borderColor: '#30363d', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                      formatter={(value: any, name: any, item: any) => [`${value} events (${item.payload.percentage}%)`, name]}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      formatter={(val) => <span className="text-[11px] text-stone-300">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-xs text-stone-500">No campaign data available.</div>
              )}
            </div>
          </div>

          {/* Chart 3: Line / Area Chart - Event Volume Over Time */}
          <div className="lg:col-span-12 bg-[#161b22] border border-white/10 p-5 rounded-2xl space-y-4 shadow-lg">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="text-sm font-bold text-white font-heading flex items-center gap-2">
                  <Activity size={16} className="text-emerald-400" />
                  Event Volume Timeline (<code className="text-emerald-300 font-mono">created_at</code>)
                </h3>
                <p className="text-xs text-stone-400">Time-series tracking of total actions, games played, coupons earned & redeemed</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-stone-400">
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-400" /> Total Volume</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-400" /> Coupons Earned</span>
                <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-blue-400" /> Games Played</span>
              </div>
            </div>

            <div className="h-64 w-full pt-2">
              {data?.volumeOverTime && data.volumeOverTime.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.volumeOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.0}/>
                      </linearGradient>
                      <linearGradient id="colorCoupons" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                    <XAxis dataKey="formattedTime" stroke="#8b949e" fontSize={11} tickLine={false} />
                    <YAxis stroke="#8b949e" fontSize={11} tickLine={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1f242c', borderColor: '#30363d', borderRadius: '8px', color: '#fff', fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="count" name="Total Events" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
                    <Area type="monotone" dataKey="couponsEarned" name="Coupons Earned" stroke="#f59e0b" strokeWidth={2} fillOpacity={1} fill="url(#colorCoupons)" />
                    <Area type="monotone" dataKey="games" name="Games Played" stroke="#3b82f6" strokeWidth={1.5} fillOpacity={0} />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-xs text-stone-500">
                  No timeline data logged yet.
                </div>
              )}
            </div>
          </div>

        </section>

        {/* 3. Interactive Data Table: Raw Event Logs */}
        <section className="bg-[#161b22] border border-white/10 rounded-2xl overflow-hidden shadow-xl space-y-4 p-5">
          
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-bold text-white font-heading flex items-center gap-2">
                <Database size={17} className="text-orange-400" />
                Raw Analytics Event Logs (<code className="text-stone-300 font-mono">public.analytics_events</code>)
              </h3>
              <p className="text-xs text-stone-400">
                Sorted by <code className="text-stone-300">created_at</code> descending. Total matching events: <span className="text-white font-bold">{filteredEvents.length}</span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search input */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search session, event, payload..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="bg-[#0d1117] border border-white/15 text-stone-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:border-orange-500 w-48 sm:w-60"
                />
              </div>

              {/* Export CSV button */}
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-stone-300 border border-white/10 text-xs font-semibold transition-all cursor-pointer"
                title="Download matching logs as CSV"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="overflow-x-auto border border-white/10 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0d1117] text-stone-400 font-mono border-b border-white/10 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">ID</th>
                  <th className="py-3 px-4">Created At</th>
                  <th className="py-3 px-4">Event</th>
                  <th className="py-3 px-4">Session ID</th>
                  <th className="py-3 px-4">Campaign</th>
                  <th className="py-3 px-4">Game Version</th>
                  <th className="py-3 px-4">Data (JSONB)</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 font-sans">
                {paginatedEvents.length > 0 ? (
                  paginatedEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-4 font-mono text-stone-400 text-[11px]">#{ev.id}</td>
                      <td className="py-3 px-4 font-mono text-stone-300 text-[11px] whitespace-nowrap">
                        {new Date(ev.created_at).toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      </td>
                      <td className="py-3 px-4 whitespace-nowrap">
                        {getEventBadge(ev.event)}
                      </td>
                      <td className="py-3 px-4 font-mono text-blue-300 text-[11px] whitespace-nowrap">
                        {ev.session_id}
                      </td>
                      <td className="py-3 px-4 text-stone-300 font-medium">
                        {ev.campaign}
                      </td>
                      <td className="py-3 px-4 font-mono text-stone-400 text-[11px]">
                        {ev.game_version || 'v1.0.0'}
                      </td>
                      <td className="py-3 px-4 max-w-xs truncate font-mono text-[11px] text-stone-400">
                        {ev.data ? JSON.stringify(ev.data) : '{}'}
                      </td>
                      <td className="py-3 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => setSelectedEventForDetail(ev)}
                          className="px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-orange-300 border border-white/10 text-[11px] font-semibold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Eye size={12} />
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-stone-500">
                      No matching events found. Try adjusting your search query or campaign filter.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-400 pt-2 font-mono">
            <div className="flex items-center gap-2">
              <span>Showing {filteredEvents.length > 0 ? (currentPage - 1) * pageSize + 1 : 0} to {Math.min(currentPage * pageSize, filteredEvents.length)} of {filteredEvents.length} logs</span>
              <span>•</span>
              <span>Rows per page:</span>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setCurrentPage(1); }}
                className="bg-[#0d1117] border border-white/15 text-stone-300 rounded px-2 py-1 text-xs"
              >
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-stone-300 border border-white/10 transition-all cursor-pointer"
              >
                Previous
              </button>
              <span className="px-3 py-1 rounded bg-white/10 text-stone-200 font-bold">
                Page {currentPage} / {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                disabled={currentPage >= totalPages}
                className="px-3 py-1 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30 text-stone-300 border border-white/10 transition-all cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>

        </section>

      </main>

      {/* SQL Setup Modal */}
      {showSqlModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-white/15 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Database size={20} className="text-emerald-400" />
                <h3 className="text-lg font-bold text-white font-heading">Supabase SQL Table Schema</h3>
              </div>
              <button 
                onClick={() => setShowSqlModal(false)}
                className="text-stone-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-stone-300 leading-relaxed">
              To connect your live Supabase database, copy and run this SQL query in your <strong>Supabase SQL Editor</strong>, then set <code className="bg-black/40 text-orange-400 px-1 py-0.5 rounded">SUPABASE_URL</code> and <code className="bg-black/40 text-orange-400 px-1 py-0.5 rounded">SUPABASE_SERVICE_ROLE_KEY</code> in your environment:
            </p>

            <div className="relative">
              <pre className="bg-[#0d1117] border border-white/10 p-4 rounded-xl text-xs font-mono text-stone-200 overflow-x-auto max-h-64 leading-relaxed">
{`-- Supabase Table: public.analytics_events
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id BIGSERIAL PRIMARY KEY,
  session_id TEXT NOT NULL,
  campaign TEXT NOT NULL,
  event TEXT NOT NULL,
  timestamp BIGINT NOT NULL,
  game_version TEXT DEFAULT 'v1.4.2',
  data JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow server access to analytics_events"
ON public.analytics_events FOR ALL
USING (true) WITH CHECK (true);

-- Indices for rapid query performance
CREATE INDEX IF NOT EXISTS idx_analytics_created_at 
ON public.analytics_events (created_at DESC);

CREATE INDEX IF NOT EXISTS idx_analytics_event_campaign 
ON public.analytics_events (event, campaign);`}
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
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect JSON Modal */}
      {selectedEventForDetail && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-white/15 rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Eye size={18} className="text-orange-400" />
                <h3 className="text-base font-bold text-white font-heading">Event Details #{selectedEventForDetail.id}</h3>
              </div>
              <button 
                onClick={() => setSelectedEventForDetail(null)}
                className="text-stone-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2 bg-[#0d1117] p-3 rounded-xl border border-white/10 font-mono">
                <div><span className="text-stone-500">Event:</span> <span className="text-orange-300 font-bold">{selectedEventForDetail.event}</span></div>
                <div><span className="text-stone-500">Session:</span> <span className="text-blue-300">{selectedEventForDetail.session_id}</span></div>
                <div><span className="text-stone-500">Campaign:</span> <span className="text-stone-200">{selectedEventForDetail.campaign}</span></div>
                <div><span className="text-stone-500">Version:</span> <span className="text-stone-300">{selectedEventForDetail.game_version}</span></div>
                <div className="col-span-2"><span className="text-stone-500">Created At:</span> <span className="text-stone-300">{selectedEventForDetail.created_at}</span></div>
              </div>

              <div>
                <h4 className="text-[11px] uppercase font-bold text-stone-400 font-mono mb-1.5">Payload Data (JSONB):</h4>
                <pre className="bg-[#0d1117] border border-white/10 p-3 rounded-xl text-xs font-mono text-emerald-400 overflow-x-auto max-h-48">
                  {JSON.stringify(selectedEventForDetail.data, null, 2)}
                </pre>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedEventForDetail(null)}
                className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-stone-200 text-xs font-bold transition-all cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulate Event Modal */}
      {showSimulateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-white/15 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <PlusCircle size={18} className="text-orange-400" />
                <h3 className="text-base font-bold text-white font-heading">Log Real-Time Event</h3>
              </div>
              <button 
                onClick={() => setShowSimulateModal(false)}
                className="text-stone-400 hover:text-white text-lg p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSimulateEvent} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-stone-400 font-medium mb-1">Event Type</label>
                <select
                  value={simForm.event}
                  onChange={(e) => setSimForm({ ...simForm, event: e.target.value })}
                  className="w-full bg-[#0d1117] border border-white/15 text-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500"
                >
                  <option value="coupon_earned">🎟️ coupon_earned</option>
                  <option value="coupon_redeemed">🔥 coupon_redeemed</option>
                  <option value="game_played">🎮 game_played</option>
                  <option value="3d_ar_opened">👓 3d_ar_opened</option>
                  <option value="order_initiated">🛒 order_initiated</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-400 font-medium mb-1">Campaign</label>
                <select
                  value={simForm.campaign}
                  onChange={(e) => setSimForm({ ...simForm, campaign: e.target.value })}
                  className="w-full bg-[#0d1117] border border-white/15 text-stone-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-orange-500"
                >
                  <option value="Summer Shawarma Splash">Summer Shawarma Splash</option>
                  <option value="Student Special Buea">Student Special Buea</option>
                  <option value="Weekend Feast Bokwaongo">Weekend Feast Bokwaongo</option>
                  <option value="Zobo Loyalty Blast">Zobo Loyalty Blast</option>
                  <option value="Independence Promo">Independence Promo</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-400 font-medium mb-1">Session ID</label>
                  <input
                    type="text"
                    value={simForm.session_id}
                    onChange={(e) => setSimForm({ ...simForm, session_id: e.target.value })}
                    className="w-full bg-[#0d1117] border border-white/15 text-stone-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="block text-stone-400 font-medium mb-1">Game Version</label>
                  <input
                    type="text"
                    value={simForm.game_version}
                    onChange={(e) => setSimForm({ ...simForm, game_version: e.target.value })}
                    className="w-full bg-[#0d1117] border border-white/15 text-stone-200 rounded-lg p-2 text-xs font-mono"
                  />
                </div>
              </div>

              {simForm.event === 'coupon_earned' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-stone-400 font-medium mb-1">Coupon Code</label>
                    <input
                      type="text"
                      value={simForm.coupon_code}
                      onChange={(e) => setSimForm({ ...simForm, coupon_code: e.target.value })}
                      className="w-full bg-[#0d1117] border border-white/15 text-stone-200 rounded-lg p-2 text-xs font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-stone-400 font-medium mb-1">Discount</label>
                    <input
                      type="text"
                      value={simForm.discount}
                      onChange={(e) => setSimForm({ ...simForm, discount: e.target.value })}
                      className="w-full bg-[#0d1117] border border-white/15 text-stone-200 rounded-lg p-2 text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setShowSimulateModal(false)}
                  className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-stone-300 text-xs font-bold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-lg shadow-orange-500/20 cursor-pointer flex items-center gap-1.5"
                >
                  <PlusCircle size={14} />
                  <span>Send to Supabase</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
