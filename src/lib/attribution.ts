/**
 * Privacy-conscious First-Party Campaign & Source Attribution Service
 * 
 * Supports attribution tracking across:
 * - Sources: website, instagram, qr_table, qr_counter, qr_receipt, qr_delivery, social, direct, other
 * - Campaigns: cyberwrap, cyberwrap-september, dailybread-cyberwrap, or custom query strings
 * 
 * Stores attribution in sessionStorage (fallback localStorage).
 * Never captures customer PII or requires login.
 */

import { getVisitorId, getSessionId, getPlayerId } from './analyticsIdentity';

export interface AttributionData {
  campaign: string;
  source: string;
  medium: string;
  placement?: string;
  term?: string;
  content?: string;
  referrer: string;
  landingPage: string;
  firstVisitTimestamp: number;
}

const STORAGE_KEY = 'dailybread_attribution_v1';
export const DEFAULT_CAMPAIGN = 'dailybread-cyberwrap';
export const DEFAULT_SOURCE = 'website';

export const VALID_SOURCES = [
  'website',
  'instagram',
  'qr_table',
  'qr_counter',
  'qr_receipt',
  'qr_delivery',
  'social',
  'direct',
  'other'
] as const;

export type AttributionSource = typeof VALID_SOURCES[number];

/**
 * Normalizes a source string to one of the supported source identifiers
 */
export function normalizeSource(rawSource?: string | null, referrer?: string): string {
  if (!rawSource) {
    if (!referrer || referrer === '') return 'direct';
    const lowerRef = referrer.toLowerCase();
    if (lowerRef.includes('instagram.com') || lowerRef.includes('ig.me')) return 'instagram';
    if (lowerRef.includes('facebook.com') || lowerRef.includes('twitter.com') || lowerRef.includes('t.co') || lowerRef.includes('tiktok.com')) return 'social';
    if (lowerRef.includes('dailybreadshawarma.store')) return 'website';
    return 'other';
  }

  const normalized = rawSource.toLowerCase().trim().replace(/[\s-]+/g, '_');
  if ((VALID_SOURCES as readonly string[]).includes(normalized)) {
    return normalized;
  }

  if (normalized.includes('insta')) return 'instagram';
  if (normalized.includes('table')) return 'qr_table';
  if (normalized.includes('counter')) return 'qr_counter';
  if (normalized.includes('receipt')) return 'qr_receipt';
  if (normalized.includes('delivery')) return 'qr_delivery';
  if (normalized.includes('qr')) return 'qr_counter';
  if (normalized.includes('social')) return 'social';

  return 'other';
}

/**
 * Parses URL search parameters and stores initial attribution data if not already present
 */
export function initAttribution(): AttributionData {
  if (typeof window === 'undefined') {
    return {
      campaign: DEFAULT_CAMPAIGN,
      source: DEFAULT_SOURCE,
      medium: 'referral',
      referrer: '',
      landingPage: '/',
      firstVisitTimestamp: Date.now()
    };
  }

  const params = new URLSearchParams(window.location.search);
  const urlCampaign = params.get('campaign') || params.get('utm_campaign');
  const urlSource = params.get('source') || params.get('utm_source');
  const urlPlacement = params.get('placement');

  try {
    // If no explicit campaign/source in URL, reuse existing stored attribution
    if (!urlCampaign && !urlSource) {
      const existingRaw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
      if (existingRaw) {
        const parsed = JSON.parse(existingRaw);
        if (parsed && parsed.campaign && parsed.source) {
          return parsed as AttributionData;
        }
      }
    }
  } catch {
    // Ignore storage read errors
  }

  // Parse campaign and source (from URL or defaults)
  const rawCampaign = urlCampaign || DEFAULT_CAMPAIGN;
  const medium = params.get('medium') || params.get('utm_medium') || (urlSource ? 'campaign' : 'direct');
  const term = params.get('term') || params.get('utm_term') || undefined;
  const content = params.get('content') || params.get('utm_content') || undefined;
  const referrer = typeof document !== 'undefined' ? document.referrer : '';

  const source = normalizeSource(urlSource, referrer);

  const attribution: AttributionData = {
    campaign: rawCampaign.trim(),
    source,
    medium,
    placement: urlPlacement || undefined,
    term,
    content,
    referrer,
    landingPage: window.location.pathname + window.location.search,
    firstVisitTimestamp: Date.now()
  };

  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    if (!localStorage.getItem(STORAGE_KEY) || urlCampaign) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(attribution));
    }
  } catch {
    // Ignore storage write errors
  }

  return attribution;
}

/**
 * Retrieves the active attribution data for the current session
 */
export function getAttribution(): AttributionData {
  if (typeof window === 'undefined') {
    return {
      campaign: DEFAULT_CAMPAIGN,
      source: DEFAULT_SOURCE,
      medium: 'direct',
      referrer: '',
      landingPage: '/',
      firstVisitTimestamp: Date.now()
    };
  }

  try {
    const raw = sessionStorage.getItem(STORAGE_KEY) || localStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Ignore error
  }

  return initAttribution();
}

// In-memory click tracking to prevent duplicate attribution events within 2.5 seconds
let lastLaunchEventTime = 0;
let lastLaunchPlacement = '';

/**
 * Dispatches a deduplicated cyberwrap_launch_clicked analytics event
 */
export function recordCyberWrapLaunchClick(placement: string): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  // Prevent duplicate events within 2500ms for the exact same placement
  if (now - lastLaunchEventTime < 2500 && lastLaunchPlacement === placement) {
    return;
  }

  lastLaunchEventTime = now;
  lastLaunchPlacement = placement;

  const attr = getAttribution();
  const visitor_id = getVisitorId();
  const session_id = getSessionId();
  const player_id = getPlayerId();

  const eventPayload = {
    visitor_id,
    session_id,
    player_id,
    campaign: attr.campaign,
    event: 'cyberwrap_launch_clicked',
    event_category: 'daily_run',
    source: attr.source,
    medium: attr.medium,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    page: window.location.pathname,
    path: window.location.pathname + window.location.search,
    timestamp: now,
    game_version: 'v1.4.2',
    data: {
      campaign: attr.campaign,
      source: attr.source,
      medium: attr.medium,
      placement,
      visitor_id,
      session_id
    }
  };

  try {
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(eventPayload)
    }).catch((err) => {
      console.debug('Attribution launch event log:', err);
    });
  } catch {}
}

/**
 * Builds an outbound CyberWrap game URL with tracked campaign, source, placement,
 * visitor_id, and session_id attribution and dispatches a deduplicated launch event.
 */
export function buildCyberWrapLaunchUrl(placement: string): string {
  const base = 'https://cyberwrap.dailybreadshawarma.store';
  const attr = getAttribution();
  const visitor_id = getVisitorId();
  const session_id = getSessionId();
  const player_id = getPlayerId();

  // Record attribution event without duplication
  recordCyberWrapLaunchClick(placement);

  const url = new URL(base);
  url.searchParams.set('campaign', attr.campaign);
  url.searchParams.set('source', attr.source);
  url.searchParams.set('medium', attr.medium);
  url.searchParams.set('placement', placement);
  url.searchParams.set('visitor_id', visitor_id);
  url.searchParams.set('session_id', session_id);
  if (player_id) {
    url.searchParams.set('player_id', player_id);
  }

  return url.toString();
}
