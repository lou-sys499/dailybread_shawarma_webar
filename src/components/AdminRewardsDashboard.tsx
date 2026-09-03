import React, { useState, useEffect, useCallback } from 'react';
import { 
  Gift, 
  Ticket, 
  Trophy, 
  Users, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  Copy, 
  RefreshCw, 
  Database, 
  Search, 
  Filter, 
  Sparkles, 
  Check, 
  Ban, 
  Play, 
  Code2, 
  ArrowLeft, 
  TrendingUp, 
  ExternalLink,
  ChevronDown,
  ChevronRight,
  ShieldCheck,
  Zap,
  Info
} from 'lucide-react';
import { 
  CyberwrapCoupon, 
  CyberwrapReward, 
  CyberwrapRewardClaim, 
  PlayerRewardWithRelations,
  AdminRewardsMetrics,
  CouponStatus,
  ClaimScoreResult
} from '../types/rewards';
import { rewardsApi } from '../services/rewardsApi';

interface AdminRewardsDashboardProps {
  onBackToStore?: () => void;
  onNavigateToAnalytics?: () => void;
}

export const AdminRewardsDashboard: React.FC<AdminRewardsDashboardProps> = ({
  onBackToStore,
  onNavigateToAnalytics
}) => {
  const [activeTab, setActiveTab] = useState<'coupons' | 'players' | 'simulator' | 'schema'>('coupons');
  const [couponStatusFilter, setCouponStatusFilter] = useState<CouponStatus | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Data state
  const [metrics, setMetrics] = useState<AdminRewardsMetrics | null>(null);
  const [coupons, setCoupons] = useState<CyberwrapCoupon[]>([]);
  const [players, setPlayers] = useState<PlayerRewardWithRelations[]>([]);
  const [recentClaims, setRecentClaims] = useState<CyberwrapRewardClaim[]>([]);
  
  // Meta state
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState<boolean>(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [dataSource, setDataSource] = useState<'supabase' | 'simulated_fallback'>('simulated_fallback');
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // UI states
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [expandedPlayerId, setExpandedPlayerId] = useState<string | null>(null);
  const [actionSuccessMessage, setActionSuccessMessage] = useState<string | null>(null);
  const [showSchemaModal, setShowSchemaModal] = useState<boolean>(false);
  const [schemaSql, setSchemaSql] = useState<string>('');

  // Simulator Form State
  const [simPlayerId, setSimPlayerId] = useState<string>(() => 'ply_' + Math.floor(Math.random() * 9000 + 1000));
  const [simScore, setSimScore] = useState<number>(750);
  const [simSessionId, setSimSessionId] = useState<string>(() => 'sess_' + Math.floor(Math.random() * 9000 + 1000));
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationResult, setSimulationResult] = useState<ClaimScoreResult | null>(null);

  // Quick Redeem Box
  const [redeemCodeInput, setRedeemCodeInput] = useState<string>('');
  const [redeemMessage, setRedeemMessage] = useState<{ text: string; isError: boolean } | null>(null);

  const fetchDashboardData = useCallback(async (showSpin: boolean = true) => {
    if (showSpin) setIsRefreshing(true);
    setErrorMessage(null);
    try {
      const overview = await rewardsApi.getOverview();
      setMetrics(overview.metrics);
      setCoupons(overview.recentCoupons || []);
      setPlayers(overview.topPlayers || []);
      setRecentClaims(overview.recentClaims || []);
      setIsSupabaseConfigured(overview.isSupabaseConfigured);
      setIsSupabaseConnected(overview.isSupabaseConnected);
      setDataSource(overview.dataSource);
      setLastUpdated(overview.lastUpdated || new Date().toLocaleTimeString());
      if (overview.error) {
        setErrorMessage(overview.error);
      }
    } catch (err: any) {
      console.error('Failed to load rewards dashboard data:', err);
      setErrorMessage(err.message || 'Failed to communicate with API server');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData(true);
    // Poll updates every 12 seconds
    const interval = setInterval(() => {
      fetchDashboardData(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // Load Schema SQL once
  useEffect(() => {
    rewardsApi.getSchemaSql().then(setSchemaSql).catch(() => {});
  }, []);

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateCouponStatus = async (couponId: string, newStatus: CouponStatus) => {
    try {
      const res = await rewardsApi.updateCouponStatus(couponId, newStatus);
      setActionSuccessMessage(`Coupon status updated to ${newStatus.toUpperCase()}`);
      setTimeout(() => setActionSuccessMessage(null), 4000);
      fetchDashboardData(false);
    } catch (err: any) {
      alert(`Error updating coupon: ${err.message}`);
    }
  };

  const handleSeedData = async () => {
    setIsRefreshing(true);
    try {
      const res = await rewardsApi.seedRewardsData(10);
      setActionSuccessMessage(`Seeded demo data: +${res.seededClaims} claims, +${res.seededCoupons} coupons, +${res.seededRewards} reward cycles.`);
      setTimeout(() => setActionSuccessMessage(null), 5000);
      fetchDashboardData(false);
    } catch (err: any) {
      alert(`Seed failed: ${err.message}`);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleRunSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const result = await rewardsApi.claimScore({
        player_id: simPlayerId,
        session_id: simSessionId,
        score_amount: Number(simScore),
        game_version: 'v1.4.2'
      });

      setSimulationResult(result);
      // Refresh dashboard stats
      fetchDashboardData(false);
      // Auto-set session for next run
      setSimSessionId('sess_' + Math.floor(Math.random() * 9000 + 1000));
    } catch (err: any) {
      alert(`Simulation failed: ${err.message}`);
    } finally {
      setIsSimulating(false);
    }
  };

  const handleQuickRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCodeInput.trim()) return;
    setRedeemMessage(null);

    try {
      const result = await rewardsApi.redeemCoupon(redeemCodeInput.trim(), 4000);
      setRedeemMessage({ text: result.message, isError: false });
      setRedeemCodeInput('');
      fetchDashboardData(false);
    } catch (err: any) {
      setRedeemMessage({ text: err.message, isError: true });
    }
  };

  // Filtered coupons
  const filteredCoupons = coupons.filter(c => {
    const matchesStatus = couponStatusFilter === 'all' || c.status === couponStatusFilter;
    const matchesSearch = !searchQuery || 
      c.code_hash.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.player_id.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-[#0d1117] text-slate-100 font-sans selection:bg-orange-500/30 pb-20">
      
      {/* 1. Top Navigation Bar */}
      <header className="bg-[#161b22] border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-white shadow-lg shadow-orange-500/20">
              <Gift size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">Cyberwrap Rewards Admin</h1>
                <span className="bg-orange-500/20 text-orange-400 border border-orange-500/30 text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase">
                  CMS v1.4
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">
                Supabase Tables: <code className="text-slate-300">rewards</code> | <code className="text-slate-300">coupons</code> | <code className="text-slate-300">claims</code>
              </p>
            </div>
          </div>

          {/* Quick Actions & Navigation Controls */}
          <div className="flex items-center gap-2.5 flex-wrap">
            
            {/* Supabase Status Pill */}
            <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-mono border ${
              isSupabaseConnected 
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                : isSupabaseConfigured
                ? 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                : 'bg-slate-800 border-slate-700 text-slate-300'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                isSupabaseConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
              }`} />
              <Database size={13} />
              <span>
                {isSupabaseConnected ? 'Supabase Live' : dataSource === 'simulated_fallback' ? 'In-Memory Fallback' : 'Connecting...'}
              </span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={() => fetchDashboardData(true)}
              disabled={isRefreshing}
              className="bg-[#21262d] hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
              title="Refresh Rewards Data"
            >
              <RefreshCw size={13} className={isRefreshing ? 'animate-spin text-orange-400' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            {/* Seed Demo Data Button */}
            <button
              onClick={handleSeedData}
              disabled={isRefreshing}
              className="bg-orange-600/20 hover:bg-orange-600/30 text-orange-300 border border-orange-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Generate Mock Claims & Coupons"
            >
              <Sparkles size={13} className="text-orange-400" />
              <span>Seed Data</span>
            </button>

            {/* SQL Schema Button */}
            <button
              onClick={() => setShowSchemaModal(true)}
              className="bg-[#21262d] hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="View SQL DDL for Supabase Editor"
            >
              <Code2 size={13} />
              <span className="hidden md:inline">SQL Schema</span>
            </button>

            {/* Link to Analytics */}
            {onNavigateToAnalytics && (
              <button
                onClick={onNavigateToAnalytics}
                className="bg-blue-950/60 hover:bg-blue-900/60 text-blue-300 border border-blue-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <TrendingUp size={13} />
                <span className="hidden sm:inline">Live Analytics</span>
              </button>
            )}

            {/* Back to Storefront */}
            {onBackToStore && (
              <button
                onClick={onBackToStore}
                className="bg-emerald-950/60 hover:bg-emerald-900/60 text-emerald-300 border border-emerald-500/40 px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} />
                <span>Store</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Global Notification Banner */}
      {actionSuccessMessage && (
        <div className="bg-emerald-900/90 border-b border-emerald-500/50 px-4 py-2 text-xs text-emerald-100 flex items-center justify-between max-w-7xl mx-auto mt-2 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle size={15} className="text-emerald-400" />
            <span>{actionSuccessMessage}</span>
          </div>
          <button onClick={() => setActionSuccessMessage(null)} className="text-emerald-300 hover:text-white">✕</button>
        </div>
      )}

      {errorMessage && (
        <div className="bg-amber-950/90 border border-amber-500/40 p-3 text-xs text-amber-200 flex items-start gap-2 max-w-7xl mx-auto mt-3 rounded-xl">
          <AlertTriangle size={16} className="text-amber-400 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold">Notice: {errorMessage}</p>
            <p className="text-[11px] text-amber-300/80 mt-0.5">
              The dashboard is operating in full reactive memory mode so you can test claims, coupons, and revocations seamlessly. Run the SQL schema in your Supabase SQL editor to enable persistent storage.
            </p>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">

        {/* 2. High-Level KPI Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Total Coupons Issued */}
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Total Coupons Issued
              </span>
              <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                <Ticket size={17} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {metrics?.totalCouponsIssued ?? 0}
              </span>
              <span className="text-xs text-emerald-400 font-mono font-semibold">
                {metrics?.totalCouponsActive ?? 0} Active
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
              <span>Redeemed: <strong className="text-slate-200">{metrics?.totalCouponsRedeemed ?? 0}</strong></span>
              <span>Expired: <strong className="text-slate-200">{metrics?.totalCouponsExpired ?? 0}</strong></span>
            </div>
          </div>

          {/* Redemption Rate */}
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Coupon Redemption Rate
              </span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle size={17} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {metrics?.redemptionRatePercent ?? 0}%
              </span>
              <span className="text-xs text-slate-400 font-mono">
                of issued coupons
              </span>
            </div>
            {/* Progress bar */}
            <div className="mt-3 w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${Math.min(metrics?.redemptionRatePercent ?? 0, 100)}%` }}
              />
            </div>
          </div>

          {/* Total Claimed Scores */}
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Total Claimed Score
              </span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Trophy size={17} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight font-mono">
                {(metrics?.totalScoreClaimed ?? 0).toLocaleString()}
              </span>
              <span className="text-xs text-blue-400 font-mono">
                pts
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
              <span>Claims: <strong className="text-slate-200">{metrics?.totalRewardClaims ?? 0}</strong></span>
              <span>Avg/Claim: <strong className="text-slate-200">{metrics?.avgScorePerClaim ?? 0}</strong></span>
            </div>
          </div>

          {/* Active Players & Cycles */}
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 sm:p-5 relative overflow-hidden shadow-lg group hover:border-slate-700 transition-all">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                Active Reward Cycles
              </span>
              <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Users size={17} />
              </div>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {metrics?.totalActivePlayers ?? players.length}
              </span>
              <span className="text-xs text-purple-400 font-mono">
                participating players
              </span>
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/80 pt-2 font-mono">
              <span>Source: <strong className="text-slate-200">{dataSource}</strong></span>
              <span>Synced: <strong className="text-slate-200">{lastUpdated || 'Now'}</strong></span>
            </div>
          </div>

        </div>

        {/* 3. Tab Selector */}
        <div className="flex items-center border-b border-slate-800 gap-2 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('coupons')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'coupons'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Ticket size={16} />
            <span>Coupons Registry ({coupons.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('players')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'players'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Trophy size={16} />
            <span>Player Reward Cycles & Claims ({players.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'simulator'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Zap size={16} />
            <span>Score & Voucher Simulator</span>
          </button>

          <button
            onClick={() => setActiveTab('schema')}
            className={`px-4 py-2.5 rounded-t-xl text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              activeTab === 'schema'
                ? 'border-orange-500 text-orange-400 bg-orange-500/10'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Code2 size={16} />
            <span>Supabase Schema & DDL</span>
          </button>
        </div>

        {/* 4. Tab 1: Live Coupons Registry */}
        {activeTab === 'coupons' && (
          <div className="space-y-4">
            
            {/* Filter & Search Toolbar */}
            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              
              {/* Status Filter Buttons */}
              <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                {(['all', 'active', 'redeemed', 'expired'] as const).map(status => (
                  <button
                    key={status}
                    onClick={() => setCouponStatusFilter(status)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors cursor-pointer ${
                      couponStatusFilter === status
                        ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                        : 'bg-[#0d1117] text-slate-400 hover:text-slate-200 border border-slate-700'
                    }`}
                  >
                    {status} ({status === 'all' ? coupons.length : coupons.filter(c => c.status === status).length})
                  </button>
                ))}
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter code or player ID..."
                  className="w-full bg-[#0d1117] border border-slate-700 rounded-xl pl-9 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-orange-500 font-mono"
                />
              </div>

            </div>

            {/* Coupons Table */}
            <div className="bg-[#161b22] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[#0d1117] text-slate-400 font-mono uppercase text-[11px] border-b border-slate-800">
                    <tr>
                      <th className="py-3.5 px-4">Coupon Code</th>
                      <th className="py-3.5 px-4">Discount</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Player UUID</th>
                      <th className="py-3.5 px-4">Generated At</th>
                      <th className="py-3.5 px-4">Expires At</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {filteredCoupons.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-400">
                          No coupons found matching your filter criteria.
                        </td>
                      </tr>
                    ) : (
                      filteredCoupons.map((coupon) => (
                        <tr key={coupon.id} className="hover:bg-slate-800/40 transition-colors">
                          
                          {/* Code Hash */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-white text-xs bg-slate-800/80 px-2 py-1 rounded border border-slate-700">
                                {coupon.code_hash}
                              </span>
                              <button
                                onClick={() => copyToClipboard(coupon.code_hash, coupon.id)}
                                className="text-slate-400 hover:text-orange-400 transition-colors cursor-pointer"
                                title="Copy coupon code"
                              >
                                {copiedId === coupon.id ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
                              </button>
                            </div>
                          </td>

                          {/* Discount % */}
                          <td className="py-3 px-4">
                            <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-bold">
                              {coupon.discount_percent}% OFF
                            </span>
                          </td>

                          {/* Status Badge */}
                          <td className="py-3 px-4">
                            <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                              coupon.status === 'active'
                                ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                : coupon.status === 'redeemed'
                                ? 'bg-blue-950/80 text-blue-300 border border-blue-500/40'
                                : 'bg-slate-800 text-slate-400 border border-slate-700'
                            }`}>
                              {coupon.status === 'active' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                              {coupon.status}
                            </span>
                          </td>

                          {/* Player ID */}
                          <td className="py-3 px-4 text-slate-300">
                            <span title={coupon.player_id}>
                              {coupon.player_id.substring(0, 12)}...
                            </span>
                          </td>

                          {/* Generated At */}
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {new Date(coupon.generated_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </td>

                          {/* Expires At */}
                          <td className="py-3 px-4 text-slate-400 text-[11px]">
                            {new Date(coupon.expires_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </td>

                          {/* Action Buttons */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {coupon.status === 'active' ? (
                                <button
                                  onClick={() => handleUpdateCouponStatus(coupon.id, 'redeemed')}
                                  className="bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                  title="Mark coupon as redeemed"
                                >
                                  Redeem
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleUpdateCouponStatus(coupon.id, 'active')}
                                  className="bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded text-[11px] font-semibold transition-colors cursor-pointer"
                                  title="Reactivate coupon"
                                >
                                  Reactivate
                                </button>
                              )}
                            </div>
                          </td>

                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* 5. Tab 2: Player Performance & Claims */}
        {activeTab === 'players' && (
          <div className="space-y-4">
            
            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-5 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-base font-bold text-white">Cyberwrap Rewards Performance</h2>
                  <p className="text-xs text-slate-400">
                    Relational view of cumulative player scores, cycle validity windows, and associated claim events.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2.5 py-1 rounded-lg">
                  {players.length} Active Profiles
                </span>
              </div>

              <div className="space-y-3">
                {players.length === 0 ? (
                  <div className="text-center py-8 text-slate-400 text-xs font-mono">
                    No player rewards records available. Click "Seed Data" or use the Simulator to generate scores.
                  </div>
                ) : (
                  players.map((player) => {
                    const isExpanded = expandedPlayerId === player.player_id;
                    const associatedClaims = recentClaims.filter(c => c.player_id === player.player_id);

                    return (
                      <div 
                        key={player.id} 
                        className="border border-slate-800 rounded-xl overflow-hidden bg-[#0d1117]/60 hover:border-slate-700 transition-all"
                      >
                        {/* Player Header Row */}
                        <div 
                          onClick={() => setExpandedPlayerId(isExpanded ? null : player.player_id)}
                          className="p-4 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-slate-800/30 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 font-bold font-mono text-sm">
                              {player.playerName ? player.playerName[0] : 'P'}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-white text-xs sm:text-sm">
                                  {player.playerName || 'Player UUID'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-400">
                                  ({player.player_id.substring(0, 14)}...)
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 font-mono">
                                Cycle: {new Date(player.cycle_started_at).toLocaleDateString()} → {new Date(player.cycle_expires_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-4 sm:gap-6 font-mono text-xs">
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Cumulative Score</span>
                              <span className="font-bold text-orange-400 text-sm">{player.cumulative_score.toLocaleString()} pts</span>
                            </div>
                            <div>
                              <span className="text-[10px] text-slate-500 block uppercase">Coupons Earned</span>
                              <span className="font-bold text-emerald-400">{player.coupons_earned_in_cycle}</span>
                            </div>
                            <div className="hidden sm:block">
                              <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                              <span className="text-slate-300 font-semibold uppercase text-[11px]">{player.reward_status}</span>
                            </div>
                            <div className="text-slate-400">
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                          </div>
                        </div>

                        {/* Expanded Drawer: Relational Claims */}
                        {isExpanded && (
                          <div className="bg-[#161b22] border-t border-slate-800 p-4 space-y-3 font-mono text-xs">
                            <h4 className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                              <Clock size={13} className="text-orange-400" />
                              Associated Score Claims ({associatedClaims.length} records in <code className="text-slate-300">cyberwrap_reward_claims</code>)
                            </h4>

                            {associatedClaims.length === 0 ? (
                              <p className="text-slate-500 text-[11px] italic">No recent individual score claims recorded for this player.</p>
                            ) : (
                              <div className="overflow-x-auto">
                                <table className="w-full text-left text-[11px]">
                                  <thead className="text-slate-500 border-b border-slate-800">
                                    <tr>
                                      <th className="py-2 px-3">Claim ID</th>
                                      <th className="py-2 px-3">Session ID</th>
                                      <th className="py-2 px-3">Score Amount</th>
                                      <th className="py-2 px-3">Credited Amount</th>
                                      <th className="py-2 px-3">Coupon Triggered</th>
                                      <th className="py-2 px-3">Claimed At</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-800/50">
                                    {associatedClaims.map(claim => (
                                      <tr key={claim.id} className="hover:bg-slate-800/40">
                                        <td className="py-2 px-3 text-slate-300">{claim.id.substring(0, 8)}...</td>
                                        <td className="py-2 px-3 text-slate-400">{claim.session_id}</td>
                                        <td className="py-2 px-3 text-white font-bold">{claim.score_amount} pts</td>
                                        <td className="py-2 px-3 text-emerald-400 font-bold">+{claim.credited_amount}</td>
                                        <td className="py-2 px-3">
                                          {claim.coupon_id ? (
                                            <span className="bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded text-[10px]">
                                              Coupon Issued
                                            </span>
                                          ) : (
                                            <span className="text-slate-500">—</span>
                                          )}
                                        </td>
                                        <td className="py-2 px-3 text-slate-400">
                                          {new Date(claim.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        )}

                      </div>
                    );
                  })
                )}
              </div>
            </div>

          </div>
        )}

        {/* 6. Tab 3: Score & Voucher Simulator */}
        {activeTab === 'simulator' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Left Box: Submit Game Score Simulator */}
            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
                  <Play size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Score Claim Pipeline Simulator</h3>
                  <p className="text-xs text-slate-400">
                    Simulate end-to-end game score submissions across all 4 database tables.
                  </p>
                </div>
              </div>

              <form onSubmit={handleRunSimulation} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Player UUID / ID
                  </label>
                  <input
                    type="text"
                    value={simPlayerId}
                    onChange={(e) => setSimPlayerId(e.target.value)}
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Score Amount
                    </label>
                    <input
                      type="number"
                      value={simScore}
                      onChange={(e) => setSimScore(Number(e.target.value))}
                      className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                      min={10}
                      max={5000}
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                      Session ID
                    </label>
                    <input
                      type="text"
                      value={simSessionId}
                      onChange={(e) => setSimSessionId(e.target.value)}
                      className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-orange-500"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSimulating}
                  className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Zap size={15} />
                  <span>{isSimulating ? 'Processing Claim...' : 'Execute Score Claim'}</span>
                </button>
              </form>

              {/* Simulation Result Box */}
              {simulationResult && (
                <div className="mt-4 p-4 bg-[#0d1117] border border-slate-700 rounded-xl space-y-2 font-mono text-xs">
                  <div className="flex items-center gap-2 text-emerald-400 font-bold">
                    <CheckCircle size={15} />
                    <span>{simulationResult.message}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-300 pt-2 border-t border-slate-800">
                    <div>Cumulative Score: <strong className="text-orange-400">{simulationResult.reward?.cumulative_score} pts</strong></div>
                    <div>Coupons in Cycle: <strong className="text-emerald-400">{simulationResult.reward?.coupons_earned_in_cycle}</strong></div>
                  </div>
                  {simulationResult.newCoupon && (
                    <div className="mt-2 p-2.5 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 text-[11px]">
                      🎉 <strong>New Coupon Issued:</strong> {simulationResult.newCoupon.code_hash} ({simulationResult.newCoupon.discount_percent}% OFF)
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Right Box: Quick Coupon Redemption Tester */}
            <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Ticket size={20} />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Vendor Coupon Redemption Tester</h3>
                  <p className="text-xs text-slate-400">
                    Simulate customer checkout and instant voucher validation.
                  </p>
                </div>
              </div>

              <form onSubmit={handleQuickRedeem} className="space-y-4 pt-2">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Coupon Code (e.g. SHAWARMA-GOLD-...)
                  </label>
                  <input
                    type="text"
                    value={redeemCodeInput}
                    onChange={(e) => setRedeemCodeInput(e.target.value)}
                    placeholder="Enter coupon code hash..."
                    className="w-full bg-[#0d1117] border border-slate-700 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-emerald-500"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <CheckCircle size={15} />
                  <span>Validate & Redeem Coupon</span>
                </button>
              </form>

              {redeemMessage && (
                <div className={`p-4 rounded-xl font-mono text-xs flex items-start gap-2 border ${
                  redeemMessage.isError
                    ? 'bg-red-950/60 border-red-500/40 text-red-200'
                    : 'bg-emerald-950/60 border-emerald-500/40 text-emerald-200'
                }`}>
                  {redeemMessage.isError ? (
                    <XCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
                  ) : (
                    <CheckCircle size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                  )}
                  <span>{redeemMessage.text}</span>
                </div>
              )}

              <div className="pt-2 text-[11px] text-slate-400 border-t border-slate-800 space-y-1">
                <p>💡 <strong>Tip:</strong> Quick test with active codes from the Coupons Registry tab.</p>
              </div>
            </div>

          </div>
        )}

        {/* 7. Tab 4: SQL Schema & DDL */}
        {activeTab === 'schema' && (
          <div className="bg-[#161b22] border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Database size={18} className="text-orange-400" />
                  Supabase PostgreSQL Tables Definition
                </h3>
                <p className="text-xs text-slate-400">
                  Execute this SQL in your Supabase SQL Editor to generate all 4 relational tables and indexes.
                </p>
              </div>
              <button
                onClick={() => copyToClipboard(schemaSql, 'full-sql')}
                className="bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedId === 'full-sql' ? <Check size={14} /> : <Copy size={14} />}
                <span>Copy SQL DDL</span>
              </button>
            </div>

            <pre className="bg-[#0d1117] border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-x-auto max-h-[480px] leading-relaxed select-all">
              {schemaSql || `Loading schema...`}
            </pre>
          </div>
        )}

      </main>

      {/* SQL Schema Modal */}
      {showSchemaModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#161b22] border border-slate-700 rounded-2xl max-w-3xl w-full p-6 space-y-4 max-h-[90vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database size={18} className="text-orange-400" />
                Supabase SQL DDL Migration
              </h3>
              <button onClick={() => setShowSchemaModal(false)} className="text-slate-400 hover:text-white font-mono text-sm">
                ✕ Close
              </button>
            </div>
            <pre className="bg-[#0d1117] border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-400 overflow-auto flex-1 leading-relaxed">
              {schemaSql}
            </pre>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
              <button
                onClick={() => copyToClipboard(schemaSql, 'modal-sql')}
                className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-2 cursor-pointer"
              >
                {copiedId === 'modal-sql' ? <Check size={14} /> : <Copy size={14} />}
                <span>Copy Entire Script</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
