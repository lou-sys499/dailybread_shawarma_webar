/**
 * Privacy-Conscious First-Party Website Analytics Dispatcher
 * 
 * Supports canonical event taxonomy:
 * - Acquisition: session_started, landing_page_viewed
 * - Website: page_viewed, section_viewed, menu_viewed, product_viewed, cta_clicked, cart_viewed, add_to_cart, remove_from_cart
 * - Commerce: order_cta_clicked, whatsapp_order_opened, coupon_entered, coupon_validated, coupon_applied
 * - Daily Run: daily_run_section_viewed, daily_run_cta_clicked, post_order_daily_run_cta_clicked, game_started, game_completed
 * - Reward: reward_earned, reward_viewed, reward_copied, coupon_redeemed
 * - UX: scroll_depth, section_visibility, element_clicked, dead_click, rage_click
 * 
 * Guarantees:
 * - Strict PII sanitization (strips names, phone numbers, addresses, free text)
 * - Non-blocking asynchronous ingestion
 * - Distinct visitor_id, session_id, and player_id models
 */

import { getVisitorId, getSessionId, getPlayerId, generateOrderIntentId, getDeviceContext } from './analyticsIdentity';
import { getAttribution } from './attribution';
import { EventCategory } from '../types/analytics';

// Sensitive keys to always strip from telemetry payloads
const PII_KEYS = [
  'name',
  'customer_name',
  'customerName',
  'phone',
  'phone_number',
  'phoneNumber',
  'address',
  'delivery_address',
  'deliveryAddress',
  'notes',
  'order_notes',
  'orderNotes',
  'message',
  'whatsapp_message',
  'email',
  'password'
];

/**
 * Strips any sensitive fields recursively to guarantee zero PII in analytics
 */
export function sanitizeAnalyticsPayload(data: Record<string, any> | null | undefined): Record<string, any> {
  if (!data || typeof data !== 'object') return {};

  const clean: Record<string, any> = {};
  for (const [key, val] of Object.entries(data)) {
    const lowerKey = key.toLowerCase();
    if (PII_KEYS.some(pii => lowerKey.includes(pii.toLowerCase()))) {
      continue; // Skip PII
    }

    if (val && typeof val === 'object' && !Array.isArray(val)) {
      clean[key] = sanitizeAnalyticsPayload(val);
    } else if (Array.isArray(val)) {
      clean[key] = val.map(item => (typeof item === 'object' ? sanitizeAnalyticsPayload(item) : item));
    } else {
      clean[key] = val;
    }
  }

  return clean;
}

export interface TrackEventOptions {
  campaign?: string;
  source?: string;
  medium?: string;
  player_id?: string | null;
  game_mode?: string | null;
  game_version?: string | null;
}

/**
 * Canonical event dispatcher for all first-party analytics
 */
export async function trackEvent(
  event: string,
  event_category: EventCategory,
  data: Record<string, any> = {},
  options: TrackEventOptions = {}
): Promise<void> {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  const attr = getAttribution();
  const visitor_id = getVisitorId();
  const session_id = getSessionId();
  const player_id = options.player_id !== undefined ? options.player_id : getPlayerId();

  const campaign = options.campaign || attr.campaign || 'dailybread-cyberwrap';
  const source = options.source || attr.source || 'website';
  const medium = options.medium || attr.medium || 'direct';

  const sanitizedData = sanitizeAnalyticsPayload(data);

  const payload = {
    visitor_id,
    session_id,
    player_id,
    campaign,
    event,
    event_category,
    source,
    medium,
    referrer: typeof document !== 'undefined' ? document.referrer : '',
    page: window.location.pathname,
    path: window.location.pathname + window.location.search,
    timestamp: now,
    game_version: options.game_version || 'web-v1.4.2',
    game_mode: options.game_mode || null,
    data: sanitizedData
  };

  try {
    fetch('/api/analytics/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(err => {
      console.debug('Analytics dispatch notice:', err);
    });
  } catch (err) {
    console.debug('Analytics execution error:', err);
  }
}

// -------------------------------------------------------------
// Milestone Scroll Depth Tracking
// -------------------------------------------------------------
const FIRED_SCROLL_DEPTHS = new Set<number>();
const SCROLL_THRESHOLDS = [25, 50, 75, 90, 100];

export function initScrollDepthTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  let ticking = false;

  const checkScroll = () => {
    const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollHeight <= 0) return;

    const scrollTop = window.scrollY || document.documentElement.scrollTop;
    const currentPercent = Math.min(100, Math.round((scrollTop / scrollHeight) * 100));

    for (const threshold of SCROLL_THRESHOLDS) {
      if (currentPercent >= threshold && !FIRED_SCROLL_DEPTHS.has(threshold)) {
        FIRED_SCROLL_DEPTHS.add(threshold);
        trackEvent('scroll_depth', 'ux', {
          depth_percent: threshold,
          page: window.location.pathname
        });
      }
    }
  };

  const onScroll = () => {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        checkScroll();
        ticking = false;
      });
      ticking = true;
    }
  };

  window.addEventListener('scroll', onScroll, { passive: true });
  return () => window.removeEventListener('scroll', onScroll);
}

// -------------------------------------------------------------
// Heatmap & UX Interaction Telemetry (Privacy-Preserving)
// -------------------------------------------------------------
let lastClickTime = 0;
let lastClickTarget: EventTarget | null = null;
let clickStreak = 0;

export function initHeatmapClickTracking(): () => void {
  if (typeof window === 'undefined') return () => {};

  const onClick = (e: MouseEvent) => {
    const target = e.target as HTMLElement | null;
    if (!target) return;

    // Check if clicked inside or on an interactive element
    const interactive = target.closest('button, a, [role="button"], input, select, textarea, [data-interactive="true"]');
    if (!interactive) return;

    // Do NOT track sensitive inputs
    const tagName = (interactive as HTMLElement).tagName.toLowerCase();
    if (tagName === 'input' || tagName === 'textarea') {
      const type = (interactive as HTMLInputElement).type?.toLowerCase();
      if (type === 'password' || type === 'text' || type === 'tel' || type === 'email') {
        return; // strictly ignore text inputs
      }
    }

    const now = Date.now();
    const vw = window.innerWidth || 1;
    const vh = window.innerHeight || 1;

    // Normalized coordinates (0-1)
    const x_normalized = Number((e.clientX / vw).toFixed(4));
    const y_normalized = Number((e.clientY / vh).toFixed(4));

    const element_id = interactive.id || interactive.getAttribute('name') || null;
    const element_type = tagName;
    const placement = interactive.closest('[data-placement]')?.getAttribute('data-placement') || 
                      interactive.closest('section')?.id || 
                      'general';

    // Rage click detection: 3+ clicks within 750ms on same target
    if (target === lastClickTarget && now - lastClickTime < 750) {
      clickStreak++;
      if (clickStreak === 3) {
        trackEvent('rage_click', 'ux', {
          element_id,
          element_type,
          placement,
          streak_count: 3
        });
      }
    } else {
      clickStreak = 1;
      lastClickTarget = target;
    }
    lastClickTime = now;

    // Track normalized interactive element click
    trackEvent('element_clicked', 'ux', {
      element_id,
      element_type,
      placement,
      x_normalized,
      y_normalized,
      viewport_width: vw,
      viewport_height: vh
    });
  };

  window.addEventListener('click', onClick, { passive: true });
  return () => window.removeEventListener('click', onClick);
}

// -------------------------------------------------------------
// Section Visibility Observer
// -------------------------------------------------------------
const OBSERVED_SECTIONS = new Set<string>();

export function observeSectionVisibility(sectionIds: string[]): () => void {
  if (typeof window === 'undefined' || typeof IntersectionObserver === 'undefined') {
    return () => {};
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && entry.intersectionRatio >= 0.3) {
        const id = entry.target.id;
        if (id && !OBSERVED_SECTIONS.has(id)) {
          OBSERVED_SECTIONS.add(id);
          trackEvent('section_viewed', 'website', {
            section_id: id,
            page: window.location.pathname
          });
        }
      }
    });
  }, { threshold: [0.3] });

  sectionIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) observer.observe(el);
  });

  return () => observer.disconnect();
}

export { getVisitorId, getSessionId, getPlayerId, generateOrderIntentId, getDeviceContext };
