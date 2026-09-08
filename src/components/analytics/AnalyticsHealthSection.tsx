import React from 'react';
import { ShieldCheck, Database, CheckCircle2, AlertTriangle, Clock, Code } from 'lucide-react';
import { AnalyticsHealthStatus } from '../../types/analytics';

interface AnalyticsHealthSectionProps {
  health?: AnalyticsHealthStatus;
  dataSource: 'supabase' | 'simulated_fallback';
  onOpenSchemaModal?: () => void;
}

export const AnalyticsHealthSection: React.FC<AnalyticsHealthSectionProps> = ({
  health,
  dataSource,
  onOpenSchemaModal
}) => {
  const isSupabaseLive = dataSource === 'supabase';

  return (
    <section className="bg-[#121722] border border-slate-800 rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck size={16} className="text-emerald-400" />
          <h3 className="text-sm font-bold text-white font-mono uppercase tracking-wider">
            10. Analytics Pipeline Health & System Status
          </h3>
        </div>
        {onOpenSchemaModal && (
          <button
            onClick={onOpenSchemaModal}
            className="flex items-center gap-1.5 text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 px-3 py-1 rounded-xl transition-colors cursor-pointer"
          >
            <Code size={13} className="text-orange-400" />
            <span>View Database Schema DDL</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Supabase Storage */}
        <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Database Engine
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className={`w-2 h-2 rounded-full ${isSupabaseLive ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`}></span>
            <span className={`text-xs font-bold font-mono ${isSupabaseLive ? 'text-emerald-400' : 'text-amber-400'}`}>
              {isSupabaseLive ? 'Supabase Live' : 'Simulated In-Memory'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            {isSupabaseLive ? 'Persistent cloud storage' : 'In-memory telemetry'}
          </span>
        </div>

        {/* Telemetry Ingestion */}
        <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Event Ingestion
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="text-xs font-bold font-mono text-emerald-400">
              Active & Healthy
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            Client beacon + fetch API
          </span>
        </div>

        {/* Visitor Tracking */}
        <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Visitor Identity
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="text-xs font-bold font-mono text-emerald-400">
              PII-Safe Anonymous
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            visitor_id persistent token
          </span>
        </div>

        {/* Session Tracking */}
        <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Session Window
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="text-xs font-bold font-mono text-emerald-400">
              30-Min Active
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            session_id timeout reset
          </span>
        </div>

        {/* Daily Run Attribution */}
        <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Daily Run Linkage
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <CheckCircle2 size={13} className="text-emerald-400" />
            <span className="text-xs font-bold font-mono text-emerald-400">
              Cross-Attributed
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            player_id ➔ visitor_id
          </span>
        </div>

        {/* Revenue Attribution */}
        <div className="bg-[#0a0d14] border border-slate-800 rounded-xl p-3 space-y-1">
          <span className="text-[10px] font-mono uppercase text-slate-400 block">
            Revenue Attribution
          </span>
          <div className="flex items-center gap-1.5 pt-0.5">
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span className="text-xs font-bold font-mono text-amber-300 truncate">
              Pending Confirm.
            </span>
          </div>
          <span className="text-[10px] text-slate-500 font-mono block">
            WhatsApp manual handoff
          </span>
        </div>
      </div>
    </section>
  );
};
