import React, { useState, useEffect } from 'react';
import { Shield, ShieldAlert, Lock, ArrowLeft, KeyRound, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { getCurrentAdminUser, authenticateAdmin, logoutAdmin } from '../lib/supabaseClient';
import { AuthUserProfile } from '../types/rewards';

interface AdminGuardProps {
  children: React.ReactNode;
  onBackToHome: () => void;
  requiredRole?: string;
}

export const AdminGuard: React.FC<AdminGuardProps> = ({ children, onBackToHome, requiredRole = 'admin' }) => {
  const [currentUser, setCurrentUser] = useState<AuthUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [adminInput, setAdminInput] = useState<string>('admin');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    checkSession();
  }, []);

  const checkSession = async () => {
    setIsLoading(true);
    try {
      const user = await getCurrentAdminUser();
      setCurrentUser(user);
    } catch {
      setCurrentUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setIsSubmitting(true);

    try {
      const result = await authenticateAdmin(adminInput, passwordInput || undefined);
      if (result.success && result.user) {
        setCurrentUser(result.user);
      } else {
        setLoginError(result.error || 'Authentication failed. Please verify credentials.');
      }
    } catch (err: any) {
      setLoginError(err.message || 'An unexpected error occurred during login.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await logoutAdmin();
    setCurrentUser(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-slate-200 flex flex-col items-center justify-center p-6 font-sans">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="text-orange-500 animate-spin" />
          <p className="text-sm text-slate-400 font-medium tracking-wide">
            Verifying Admin Security Clearance & Supabase Auth...
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated and authorized
  if (currentUser && currentUser.isAdmin) {
    return (
      <div className="relative">
        {/* Top Admin Status Strip */}
        <div className="bg-[#161b22] border-b border-orange-500/30 px-4 py-2 flex items-center justify-between text-xs text-slate-300 font-mono z-40">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <Shield size={14} className="text-orange-400" />
            <span className="font-semibold text-orange-400">ADMIN SESSION:</span>
            <span className="text-slate-300 truncate max-w-[200px]">{currentUser.email}</span>
            <span className="bg-orange-500/20 text-orange-300 px-2 py-0.5 rounded text-[10px] font-bold uppercase">
              {currentUser.role}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onBackToHome}
              className="text-slate-400 hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
            >
              <ArrowLeft size={13} />
              <span>Back to Store</span>
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={handleLogout}
              className="text-red-400 hover:text-red-300 transition-colors cursor-pointer"
            >
              Sign Out
            </button>
          </div>
        </div>

        {children}
      </div>
    );
  }

  // 403 / Access Denied Screen with Login Form
  return (
    <div className="min-h-screen bg-[#0a0d12] text-slate-200 flex flex-col items-center justify-center p-4 sm:p-6 font-sans">
      <div className="w-full max-w-md bg-[#161b22] border border-red-500/30 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        {/* Top visual glow */}
        <div className="absolute -top-16 -right-16 w-32 h-32 bg-red-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl" />

        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-400">
            <ShieldAlert size={26} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Admin Access Restricted</h1>
            <p className="text-xs text-slate-400 font-mono">403 Forbidden - High Security Route</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 mb-6 leading-relaxed">
          The <strong className="text-orange-400">Cyberwrap Rewards & Coupons Portal</strong> requires verified administrator privileges to inspect player claims, issue rewards, and manage Supabase records.
        </p>

        {loginError && (
          <div className="mb-5 p-3.5 bg-red-950/50 border border-red-500/40 rounded-xl flex items-start gap-2.5 text-xs text-red-200">
            <AlertCircle size={16} className="text-red-400 shrink-0 mt-0.5" />
            <span>{loginError}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Admin Identifier / Email
            </label>
            <div className="relative">
              <input
                type="text"
                value={adminInput}
                onChange={(e) => setAdminInput(e.target.value)}
                placeholder="admin@cyberwrap.io or admin"
                className="w-full bg-[#0d1117] border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Admin Password / Key
            </label>
            <div className="relative">
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="Enter password or leave blank for demo"
                className="w-full bg-[#0d1117] border border-slate-700 focus:border-orange-500 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none transition-colors"
              />
            </div>
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Enter <code className="text-orange-400 bg-slate-800 px-1 py-0.5 rounded">admin</code> for quick developer clearance.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-3">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-lg flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <>
                  <KeyRound size={16} />
                  <span>Authenticate Admin Session</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={onBackToHome}
              className="w-full bg-[#0d1117] hover:bg-slate-800 text-slate-300 font-medium py-2.5 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-2 border border-slate-700 cursor-pointer"
            >
              <ArrowLeft size={14} />
              <span>Return to Customer Storefront</span>
            </button>
          </div>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <CheckCircle2 size={12} className="text-emerald-400" />
            Supabase RBAC Protocol
          </span>
          <span className="font-mono">v1.4.2-sec</span>
        </div>
      </div>
    </div>
  );
};
