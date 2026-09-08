export type EventCategory = 
  | 'acquisition' 
  | 'website' 
  | 'commerce' 
  | 'daily_run' 
  | 'reward' 
  | 'ux';

export interface AnalyticsEvent {
  id: number | string;
  visitor_id?: string | null;
  session_id: string;
  player_id?: string | null;
  campaign: string;
  event: string;
  event_category?: string | null;
  source?: string | null;
  medium?: string | null;
  referrer?: string | null;
  page?: string | null;
  path?: string | null;
  timestamp: number;
  game_version?: string | null;
  game_mode?: string | null;
  data: Record<string, any> | null;
  created_at: string;
}

export interface AnalyticsVisitor {
  visitor_id: string;
  first_seen_at: string;
  last_seen_at: string;
  first_source?: string | null;
  first_medium?: string | null;
  first_campaign?: string | null;
  first_referrer?: string | null;
  first_landing_page?: string | null;
  created_at: string;
}

export interface AnalyticsSession {
  session_id: string;
  visitor_id: string;
  started_at: string;
  ended_at?: string | null;
  landing_page?: string | null;
  source?: string | null;
  medium?: string | null;
  campaign?: string | null;
  referrer?: string | null;
  device_type?: string | null;
  browser?: string | null;
  os?: string | null;
  created_at: string;
}

export interface WebsiteKPIs {
  uniqueVisitors: number;
  totalSessions: number;
  pageViews: number;
  menuViews: number;
  orderIntentCount: number;
  whatsappOrderOpened: number;
  conversionToWhatsAppIntent: number; // % of sessions reaching order intent
}

export interface DailyRunKPIs {
  dailyRunVisitors: number;
  dailyRunStarts: number;
  dailyRunCompletions: number;
  rewardsEarned: number;
  couponsRedeemed: number;
}

export interface CrossJourneyKPIs {
  dailyRunToWhatsAppIntent: number;
  nonDailyRunToWhatsAppIntent: number;
  postOrderDailyRunStarts: number;
  couponAssistedOrderIntent: number;
}

export interface AnalyticsKPIs {
  totalEvents: number;
  totalUniqueSessions: number;
  totalCouponsEarned: number;
  totalCouponsRedeemed: number;
  redemptionRate: number;
}

export interface FunnelStep {
  id: string;
  name: string;
  count: number;
  conversionRate: number; // % of top of funnel
  stepConversionRate: number; // % of previous step
  dropOffRate: number;
  isPendingAttribution?: boolean;
  notes?: string;
}

export interface ExecutiveKPIs {
  monthlyPlayers: number;
  challengesCompleted: number;
  playersReceivingCoupons: number;
  couponsGenerated: number;
  couponsRedeemed: number;
  incrementalOrders: number | string;
  incrementalRevenue: number | string;
  isRevenueAttributionPending: boolean;
}

export interface RevenueImpact {
  incrementalRevenueDisplay: string;
  incrementalOrdersCount: number;
  averageIncrementalOrderDisplay: string;
  redemptionRate: number;
  statusNote: string;
}

export interface PlayerEngagementMetrics {
  uniquePlayers: number;
  uniqueSessions: number;
  avgSessionsPerPlayer: number;
  avgPlayDurationSec: number;
  avgScore: number;
  challengeCompletionRate: number;
  thresholdAchievementRate: number;
  returningPlayers: number;
}

export interface SourcePerformanceItem {
  source: string;
  displayName: string;
  visitors: number;
  sessions: number;
  players: number;
  gameStarts: number;
  challengesCompleted: number;
  couponsEarned: number;
  couponsRedeemed: number;
  menuViews: number;
  orderIntentCount: number;
  whatsappOrderOpened: number;
  conversionToWhatsAppIntent: number; // percentage
  ordersInitiated?: number; // legacy alias for orderIntentCount
}

export type GameModeFilter = 'all' | 'challenge' | 'free_roam';

export type DateRangePreset = 'today' | '7d' | '30d' | '90d' | 'all' | 'custom';

export interface DateRangeState {
  preset: DateRangePreset;
  startDate: string;
  endDate: string;
}

export interface MetricComparison {
  current: number;
  previous: number;
  changePercent: number | null; // null if previous === 0 or no previous period
  diffPoints?: number; // percentage point difference (e.g. +14.2)
  trend: 'up' | 'down' | 'neutral';
}

export interface BusinessOverviewKPIs {
  uniqueVisitors: MetricComparison;
  sessions: MetricComparison;
  whatsappOrderIntent: MetricComparison;
  whatsappIntentRate: MetricComparison; // in %
  dailyRunUsers: MetricComparison;
  gameCompletions: MetricComparison;
  couponsEarned: MetricComparison;
  couponsRedeemed: MetricComparison;
}

export interface CommercialImpactAnalysis {
  dailyRunUsersCount: number;
  dailyRunIntentCount: number;
  dailyRunIntentRate: number; // %
  nonPlayersCount: number;
  nonPlayerIntentCount: number;
  nonPlayerIntentRate: number; // %
  diffPercentagePoints: number; // e.g. +16.7
  dailyRunCouponsEarned: number;
  dailyRunCouponsRedeemed: number;
  postOrderInvitations: number;
  postOrderStarts: number;
  postOrderCompletionRate: number;
}

export interface WhatsAppOrderIntentMetrics {
  orderCtaClicks: number;
  uniqueVisitorsInitiating: number;
  whatsappOpens: number;
  uniqueVisitorsOpening: number;
  intentToOpenRate: number;
  intentRatePerVisitor: number;
  intentRatePerSession: number;
  couponAssistedIntent: number;
}

export interface CouponAssistedMetrics {
  totalOrderIntent: number;
  couponAssistedIntent: number;
  couponAssistedPercent: number;
  couponsEarned: number;
  couponsActive: number;
  couponsRedeemed: number;
  redemptionRate: number;
}

export interface TopProductItem {
  name: string;
  count: number;
}

export interface TopPlacementItem {
  placement: string;
  count: number;
}

export interface WebsitePerformanceMetrics {
  websiteFunnel: FunnelStep[];
  topViewedProducts: TopProductItem[];
  topAddToCartProducts: TopProductItem[];
  topOrderingCtaPlacements: TopPlacementItem[];
}

export interface HeatmapClickPoint {
  id: string | number;
  element_id?: string;
  element_type?: string;
  placement: string;
  x_normalized: number;
  y_normalized: number;
  viewport_width?: number;
  viewport_height?: number;
  created_at?: string;
}

export interface TopClickedElement {
  element_id: string;
  element_type?: string;
  placement: string;
  count: number;
}

export interface ScrollRetentionItem {
  depth: number; // 25, 50, 75, 90, 100
  visitorsReached: number;
  retentionPercent: number; // % of total unique visitors
}

export interface AnalyticsHealthStatus {
  supabaseConfigured: boolean;
  supabaseConnected: boolean;
  eventIngestionHealthy: boolean;
  lastEventTimestamp: string | null;
  lastEventAgo: string;
  visitorTrackingActive: boolean;
  sessionTrackingActive: boolean;
  dailyRunTrackingActive: boolean;
  whatsappTrackingActive: boolean;
  rewardsApiActive: boolean;
  revenueAttributionStatus: 'Pending Confirmation';
}

export interface BusinessInsight {
  id: string;
  type: 'positive' | 'neutral' | 'info';
  title: string;
  message: string;
  sampleSize: number;
  isSufficientSample: boolean;
}

export interface EventFrequencyItem {
  event: string;
  displayName: string;
  count: number;
  percentage: number;
}

export interface EventVolumeTimeItem {
  timestamp: string;
  formattedTime: string;
  count: number;
  games: number;
  couponsEarned: number;
  couponsRedeemed: number;
}

export interface CampaignDistributionItem {
  campaign: string;
  count: number;
  percentage: number;
  color?: string;
}

export interface AnalyticsDashboardData {
  kpis: AnalyticsKPIs;
  websiteKPIs?: WebsiteKPIs;
  dailyRunKPIs?: DailyRunKPIs;
  crossJourneyKPIs?: CrossJourneyKPIs;
  sourcePerformance?: SourcePerformanceItem[];
  eventFrequency: EventFrequencyItem[];
  volumeOverTime: EventVolumeTimeItem[];
  campaignDistribution: CampaignDistributionItem[];
  rawEvents: AnalyticsEvent[];
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  dataSource: 'supabase' | 'simulated_fallback';
  lastUpdated: string;
  error?: string | null;
  // Enhanced Customer Intelligence fields
  dateRange?: {
    range: DateRangePreset;
    startDate: string;
    endDate: string;
    previousStartDate?: string;
    previousEndDate?: string;
  };
  businessOverview?: BusinessOverviewKPIs;
  commerceFunnel?: FunnelStep[];
  dailyRunFunnel?: FunnelStep[];
  commercialImpact?: CommercialImpactAnalysis;
  whatsappIntentMetrics?: WhatsAppOrderIntentMetrics;
  couponAssistedMetrics?: CouponAssistedMetrics;
  websitePerformance?: WebsitePerformanceMetrics;
  heatmapClicks?: HeatmapClickPoint[];
  topClickedElements?: TopClickedElement[];
  scrollRetention?: ScrollRetentionItem[];
  analyticsHealth?: AnalyticsHealthStatus;
  insights?: BusinessInsight[];
}
