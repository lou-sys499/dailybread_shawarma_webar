import React, { useState, useEffect } from 'react';
import { Gamepad2, Sparkles, ExternalLink, X, Trophy, ChevronRight } from 'lucide-react';

interface CyberWrapBannerProps {
  onPlayClick?: () => void;
}

export const CyberWrapBanner: React.FC<CyberWrapBannerProps> = ({ onPlayClick }) => {
  const [isDismissed, setIsDismissed] = useState<boolean>(false);

  // Check if dismissed previously in session
  useEffect(() => {
    try {
      const stored = sessionStorage.getItem('cyberwrap_banner_dismissed');
      if (stored === 'true') {
        setIsDismissed(true);
      }
    } catch {
      // Ignore sessionStorage errors
    }
  }, []);

  const handleDismiss = () => {
    setIsDismissed(true);
    try {
      sessionStorage.setItem('cyberwrap_banner_dismissed', 'true');
    } catch {
      // Ignore
    }
  };

  const handleRestore = () => {
    setIsDismissed(false);
    try {
      sessionStorage.removeItem('cyberwrap_banner_dismissed');
    } catch {
      // Ignore
    }
  };

  if (isDismissed) {
    return (
      <div 
        id="cyberwrap-minimized-pill"
        className="bg-[#12161f] border-b border-amber-500/20 py-1.5 px-4 text-xs text-stone-300 font-sans flex items-center justify-between gap-3 shadow-inner"
      >
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 overflow-hidden">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse shrink-0" />
            <span className="text-amber-400 font-bold truncate text-[11px] sm:text-xs">
              Play CyberWrap in browser & win 20% discount coupons!
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <a
              id="cyberwrap-minimized-play-link"
              href="https://cyberwrap.dailybreadshawarma.store"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onPlayClick}
              className="inline-flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold px-2.5 py-1 rounded-md text-[11px] transition-transform hover:scale-105"
            >
              <Gamepad2 size={12} />
              <span>Play Now</span>
              <ExternalLink size={10} />
            </a>

            <button
              type="button"
              id="cyberwrap-restore-banner-btn"
              onClick={handleRestore}
              className="text-stone-400 hover:text-stone-200 text-[11px] underline ml-1 cursor-pointer"
              title="Show details"
            >
              Details
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <aside
      id="cyberwrap-banner"
      aria-label="CyberWrap Arcade and Rewards Announcement"
      className="relative bg-[#11151e] text-stone-100 border-b border-amber-500/30 shadow-md transition-all font-sans overflow-hidden"
    >
      {/* Subtle background ambient glow */}
      <div 
        aria-hidden="true" 
        className="absolute top-0 left-1/4 w-96 h-20 bg-amber-500/10 rounded-full blur-2xl pointer-events-none"
      />
      <div 
        aria-hidden="true" 
        className="absolute bottom-0 right-1/4 w-72 h-16 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"
      />

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-3 sm:py-3.5 relative z-10">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-3 lg:gap-6">
          
          {/* Content side */}
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            {/* Game Badge / Icon */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/15 border border-amber-400/30 flex items-center justify-center shrink-0 text-amber-400 shadow-sm mt-0.5 sm:mt-0">
              <Gamepad2 size={22} className="animate-pulse" />
            </div>

            <div className="space-y-1 min-w-0 flex-1">
              {/* Badges row */}
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <span className="inline-flex items-center gap-1 bg-amber-400/15 text-amber-300 border border-amber-400/30 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider font-mono">
                  <Sparkles size={11} className="text-amber-400" />
                  <span>Interactive 3D & AR</span>
                </span>

                <span className="inline-flex items-center gap-1 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider font-mono">
                  <Trophy size={11} className="text-emerald-400" />
                  <span>Win 20% OFF Coupons</span>
                </span>

                <span className="bg-stone-800 text-stone-300 border border-stone-700 px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider hidden sm:inline-block">
                  No App Install Required
                </span>
              </div>

              {/* Main message */}
              <p className="text-xs sm:text-sm text-stone-200 leading-snug">
                Play <strong className="text-amber-400 font-extrabold tracking-wide">"CyberWrap"</strong> — experience arcade gameplay, city exploration, real-world rewards, and interactive AR experiences without installing an app, and win <span className="text-emerald-400 font-bold underline decoration-emerald-400/40">20% discount coupons</span> redeemable on your DailyBread Shawarma orders!
              </p>
            </div>
          </div>

          {/* Action Call & Dismiss Controls */}
          <div className="flex items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end shrink-0 pt-1 lg:pt-0">
            <a
              id="cyberwrap-play-link"
              href="https://cyberwrap.dailybreadshawarma.store"
              target="_blank"
              rel="noopener noreferrer"
              onClick={onPlayClick}
              className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-stone-950 font-black px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm tracking-wide shadow-md hover:shadow-amber-500/20 transition-all transform hover:scale-[1.03] active:scale-[0.98] min-h-[44px] cursor-pointer"
              title="Launch CyberWrap Game in your browser (opens in new tab)"
            >
              <Gamepad2 size={16} className="shrink-0" />
              <span className="font-ui">PLAY CYBERWRAP</span>
              <ExternalLink size={14} className="shrink-0 text-stone-900" />
            </a>

            <button
              type="button"
              id="cyberwrap-banner-dismiss-btn"
              onClick={handleDismiss}
              className="p-2 text-stone-400 hover:text-stone-100 hover:bg-stone-800/80 rounded-lg transition-colors cursor-pointer shrink-0 min-w-[36px] min-h-[36px] flex items-center justify-center"
              title="Minimize banner"
              aria-label="Dismiss CyberWrap announcement banner"
            >
              <X size={16} />
            </button>
          </div>

        </div>
      </div>
    </aside>
  );
};
