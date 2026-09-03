export interface AnalyticsEvent {
  id: number | string;
  session_id: string;
  campaign: string;
  event: string;
  timestamp: number;
  game_version: string;
  data: Record<string, any> | null;
  created_at: string;
}

export interface AnalyticsKPIs {
  totalEvents: number;
  totalUniqueSessions: number;
  totalCouponsEarned: number;
  totalCouponsRedeemed: number;
  redemptionRate: number;
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
  eventFrequency: EventFrequencyItem[];
  volumeOverTime: EventVolumeTimeItem[];
  campaignDistribution: CampaignDistributionItem[];
  rawEvents: AnalyticsEvent[];
  isSupabaseConfigured: boolean;
  isSupabaseConnected: boolean;
  dataSource: 'supabase' | 'simulated_fallback';
  lastUpdated: string;
  error?: string | null;
}
