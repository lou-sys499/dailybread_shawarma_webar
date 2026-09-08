import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { AuthUserProfile } from '../types/rewards';

// Extract public environment variables safely
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = metaEnv.VITE_SUPABASE_URL || '';
const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || '';

let browserClient: SupabaseClient | null = null;

/**
 * Returns the Supabase browser client if environment variables are provided.
 */
export function getSupabaseBrowserClient(): SupabaseClient | null {
  if (!supabaseUrl || !supabaseAnonKey) {
    return null;
  }

  if (!browserClient) {
    try {
      browserClient = createClient(supabaseUrl, supabaseAnonKey, {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
        },
      });
    } catch (err) {
      console.warn('Could not initialize Supabase browser client:', err);
      return null;
    }
  }

  return browserClient;
}

/**
 * Checks if client-side Supabase credentials are configured
 */
export function isSupabaseClientConfigured(): boolean {
  return Boolean(supabaseUrl && supabaseAnonKey);
}

// Local mock admin session for offline/preview mode
const MOCK_ADMIN_KEY = 'cyberwrap_admin_auth_session';

export interface LocalAuthSession {
  user: AuthUserProfile;
  token: string;
  expiresAt: number;
}

/**
 * Helper to get active admin user from either Supabase Auth or local demo session
 */
export async function getCurrentAdminUser(): Promise<AuthUserProfile | null> {
  const client = getSupabaseBrowserClient();

  if (client) {
    try {
      const { data: { session }, error } = await client.auth.getSession();
      if (!error && session?.user) {
        const user = session.user;
        const role = user.app_metadata?.role || user.user_metadata?.role || (user.email?.includes('admin') ? 'admin' : 'user');
        const isAdmin = role === 'admin' || user.app_metadata?.is_admin === true || user.user_metadata?.is_admin === true;

        if (isAdmin) {
          return {
            id: user.id,
            email: user.email || 'admin@cyberwrap.io',
            role: 'admin',
            isAdmin: true,
          };
        }
      }
    } catch (err) {
      console.error('Error fetching Supabase user session:', err);
    }
  }

  // Fallback to local admin session (e.g. for development or preview demo)
  try {
    const raw = localStorage.getItem(MOCK_ADMIN_KEY);
    if (raw) {
      const session: LocalAuthSession = JSON.parse(raw);
      if (session.expiresAt > Date.now()) {
        return session.user;
      }
      localStorage.removeItem(MOCK_ADMIN_KEY);
    }
  } catch {
    // Ignore storage parse errors
  }

  return null;
}

/**
 * Quick admin login method supporting both Supabase auth or fallback admin key pass.
 */
export async function authenticateAdmin(emailOrPass: string, password?: string): Promise<{ success: boolean; user?: AuthUserProfile; error?: string }> {
  const client = getSupabaseBrowserClient();

  // 1. Try Supabase Auth if credentials provided and configured
  if (client && emailOrPass.includes('@') && password) {
    try {
      const { data, error } = await client.auth.signInWithPassword({
        email: emailOrPass,
        password,
      });

      if (error) {
        return { success: false, error: error.message };
      }

      if (data.user) {
        const role = data.user.app_metadata?.role || data.user.user_metadata?.role || 'admin';
        const isAdmin = role === 'admin' || data.user.app_metadata?.is_admin === true;
        
        const userProfile: AuthUserProfile = {
          id: data.user.id,
          email: data.user.email || emailOrPass,
          role: isAdmin ? 'admin' : 'user',
          isAdmin,
        };

        if (!isAdmin) {
          return { success: false, error: 'User does not possess Administrator privileges in Supabase.' };
        }

        return { success: true, user: userProfile };
      }
    } catch (err: any) {
      return { success: false, error: err.message || 'Supabase authentication failed.' };
    }
  }

  // 2. Admin Key / Password validation (dailybread@99)
  const isDevOrUnconfigured = !metaEnv.PROD || !isSupabaseClientConfigured();
  if (isDevOrUnconfigured) {
    const cleanEmailOrPass = emailOrPass.trim();
    const cleanPassword = (password || '').trim();
    const ADMIN_SECRET_PASSWORD = 'dailybread@99';

    // The user explicitly configured the password to be "dailybread@99"
    const isPasswordMatch = cleanPassword === ADMIN_SECRET_PASSWORD || cleanEmailOrPass === ADMIN_SECRET_PASSWORD;

    if (isPasswordMatch) {
      const mockUser: AuthUserProfile = {
        id: 'usr_admin_' + Math.floor(Math.random() * 90000 + 10000),
        email: cleanEmailOrPass.includes('@') && cleanEmailOrPass !== ADMIN_SECRET_PASSWORD ? cleanEmailOrPass : 'admin@dailybreadshawarma.com',
        role: 'admin',
        isAdmin: true,
      };

      const session: LocalAuthSession = {
        user: mockUser,
        token: 'jwt_admin_' + Date.now(),
        expiresAt: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      };

      localStorage.setItem(MOCK_ADMIN_KEY, JSON.stringify(session));
      return { success: true, user: mockUser };
    } else {
      return {
        success: false,
        error: 'Incorrect administrator password. Access denied.'
      };
    }
  }

  return { 
    success: false, 
    error: isSupabaseClientConfigured()
      ? 'Invalid administrator credentials. Please sign in with your registered Supabase Admin account.'
      : 'Invalid administrator password. Access denied.'
  };
}

/**
 * Log out administrator session
 */
export async function logoutAdmin(): Promise<void> {
  const client = getSupabaseBrowserClient();
  if (client) {
    try {
      await client.auth.signOut();
    } catch (err) {
      console.warn('Supabase signout failed:', err);
    }
  }
  localStorage.removeItem(MOCK_ADMIN_KEY);
}
