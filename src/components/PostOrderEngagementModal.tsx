import React from 'react';
import { Play, Sparkles, CheckCircle2, X, ArrowRight, MessageSquare } from 'lucide-react';
import { buildCyberWrapLaunchUrl } from '../lib/attribution';
import { trackEvent } from '../lib/analytics';

interface PostOrderEngagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlayClick?: () => void;
  customerName?: string;
  orderIntentId?: string | null;
  placement?: string;
  source?: string;
}

export const PostOrderEngagementModal: React.FC<PostOrderEngagementModalProps> = ({
  isOpen,
  onClose,
  onPlayClick,
  customerName,
  orderIntentId,
  placement = 'post_order_engagement',
  source
}) => {
  if (!isOpen) return null;

  const handlePlay = () => {
    if (onPlayClick) onPlayClick();

    // 1. Record post_order_daily_run_cta_clicked with order_intent_id
    trackEvent('post_order_daily_run_cta_clicked', 'daily_run', {
      placement,
      origin: 'whatsapp_order_intent',
      order_intent_id: orderIntentId || null,
      source: source || 'post_order_modal'
    });

    // 2. Build CyberWrap launch URL (transfers visitor_id & session_id) and open
    const url = buildCyberWrapLaunchUrl(placement);
    window.open(url, '_blank', 'noopener,noreferrer');

    // 3. Close modal
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 border border-orange-500/30 text-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 font-mono">
          <MessageSquare size={13} className="text-emerald-400" />
          <span>WhatsApp Chat Opened</span>
        </div>

        {/* Header with Accurate Copy */}
        <div className="space-y-2 mb-4">
          <h3 className="text-2xl font-black font-heading tracking-tight text-white">
            Order Ready in WhatsApp!
          </h3>
          <p className="text-stone-300 text-xs sm:text-sm leading-relaxed">
            {customerName ? `Thanks, ${customerName}! ` : ''}Your customized order has been compiled. Please make sure to hit <strong>Send</strong> in WhatsApp to confirm your order with our kitchen.
          </p>
        </div>

        {/* While You Wait Card */}
        <div className="bg-gradient-to-r from-orange-500/15 via-amber-500/15 to-orange-500/10 border border-orange-500/30 rounded-2xl p-4 sm:p-5 mb-6 space-y-3">
          <div className="flex items-center justify-between text-xs font-mono text-orange-400 font-bold">
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} className="animate-spin" />
              <span>While you wait for your shawarma...</span>
            </span>
            <span className="bg-orange-500/20 px-2 py-0.5 rounded text-[10px]">200 PTS = 20% OFF</span>
          </div>

          <div className="space-y-1">
            <h4 className="text-base font-black text-white flex items-center gap-2">
              <span>🎮 Take Today&apos;s Daily Run</span>
            </h4>
            <p className="text-stone-300 text-xs leading-relaxed">
              Play today&apos;s Daily Run and earn 20% OFF your next order. Explore 3D Buea, deliver shawarmas, and score 200 points!
            </p>
          </div>

          <button
            onClick={handlePlay}
            className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-xs uppercase tracking-wider cursor-pointer font-bold"
          >
            <Play size={15} fill="currentColor" />
            <span>🎮 PLAY YOUR DAILY RUN</span>
            <ArrowRight size={15} />
          </button>
        </div>

        {/* Dismiss Button */}
        <div className="text-center">
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-200 text-xs font-semibold underline underline-offset-4 cursor-pointer"
          >
            Back to Restaurant Storefront
          </button>
        </div>
      </div>
    </div>
  );
};
