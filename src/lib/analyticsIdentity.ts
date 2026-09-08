/**
 * Privacy-Conscious First-Party Analytics Identity Utility
 * 
 * Manages anonymous client identifiers:
 * - visitor_id: Persistent anonymous browser identifier (localStorage)
 * - session_id: Browsing session identifier (sessionStorage)
 * - player_id: Daily Run player identifier (delegates to rewardsApi.getLocalPlayerId())
 * - order_intent_id: Ephemeral identifier for WhatsApp order attempts
 * 
 * Never contains or collects PII.
 */

import { rewardsApi } from '../services/rewardsApi';

const VISITOR_STORAGE_KEY = 'dailybread_visitor_id';
const SESSION_STORAGE_KEY = 'dailybread_session_id';

/**
 * Generates a cryptographically secure UUIDv4 or random fallback identifier
 */
export function generateSecureId(prefix?: string): string {
  let uuid: string;
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    uuid = crypto.randomUUID();
  } else {
    // Fallback using random values
    const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    uuid = `${s4()}${s4()}-${s4()}-4${s4().substr(0, 3)}-a${s4().substr(0, 3)}-${s4()}${s4()}${s4()}`;
  }
  return prefix ? `${prefix}_${uuid}` : uuid;
}

/**
 * Returns the persistent anonymous visitor ID for this browser.
 * Persisted in localStorage across sessions.
 */
export function getVisitorId(): string {
  if (typeof window === 'undefined') {
    return 'vis_server_default';
  }

  try {
    let visitorId = localStorage.getItem(VISITOR_STORAGE_KEY);
    if (!visitorId || !visitorId.trim()) {
      visitorId = generateSecureId();
      localStorage.setItem(VISITOR_STORAGE_KEY, visitorId);
    }
    return visitorId;
  } catch {
    return generateSecureId();
  }
}

/**
 * Returns the anonymous session ID for this browsing session.
 * Persisted in sessionStorage for the duration of the browser tab.
 */
export function getSessionId(): string {
  if (typeof window === 'undefined') {
    return 'sess_server_default';
  }

  try {
    let sessionId = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (!sessionId || !sessionId.trim()) {
      sessionId = generateSecureId();
      sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
    }
    return sessionId;
  } catch {
    return generateSecureId();
  }
}

/**
 * Returns the player ID if one exists from the Daily Run / rewards system.
 * Authoritative source: rewardsApi.getLocalPlayerId()
 */
export function getPlayerId(): string | null {
  return rewardsApi.getLocalPlayerId();
}

/**
 * Generates an anonymous order_intent_id for a WhatsApp order attempt.
 * Format: oi_<uuid>
 */
export function generateOrderIntentId(): string {
  const raw = generateSecureId();
  return `oi_${raw.replace(/-/g, '')}`;
}

/**
 * Basic non-fingerprinting device context helper
 */
export function getDeviceContext(): { device_type: 'mobile' | 'tablet' | 'desktop'; browser: string; os: string } {
  if (typeof window === 'undefined') {
    return { device_type: 'desktop', browser: 'unknown', os: 'unknown' };
  }

  const ua = navigator.userAgent || '';
  let device_type: 'mobile' | 'tablet' | 'desktop' = 'desktop';

  if (/tablet|ipad|playbook|silk/i.test(ua)) {
    device_type = 'tablet';
  } else if (/mobile|iphone|ipod|android|blackberry|iemobile|kindle/i.test(ua)) {
    device_type = 'mobile';
  }

  let browser = 'other';
  if (/chrome|crios/i.test(ua) && !/edge|edg|opr|opera/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome|crios/i.test(ua)) browser = 'Safari';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/edge|edg/i.test(ua)) browser = 'Edge';

  let os = 'other';
  if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ipod/i.test(ua)) os = 'iOS';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/windows/i.test(ua)) os = 'Windows';
  else if (/linux/i.test(ua)) os = 'Linux';

  return { device_type, browser, os };
}
