import React from 'react';
import { Calendar, ChevronDown } from 'lucide-react';
import { DateRangePreset } from '../../types/analytics';

interface DateRangeSelectorProps {
  preset: DateRangePreset;
  onSelectPreset: (preset: DateRangePreset) => void;
  customStartDate: string;
  customEndDate: string;
  onCustomStartChange: (val: string) => void;
  onCustomEndChange: (val: string) => void;
  onApplyCustom: () => void;
  activeStartDate?: string;
  activeEndDate?: string;
  previousStartDate?: string;
  previousEndDate?: string;
}

const PRESET_OPTIONS: { id: DateRangePreset; label: string }[] = [
  { id: 'today', label: 'Today' },
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Last 90 Days' },
  { id: 'all', label: 'All Time' },
  { id: 'custom', label: 'Custom' }
];

export const DateRangeSelector: React.FC<DateRangeSelectorProps> = ({
  preset,
  onSelectPreset,
  customStartDate,
  customEndDate,
  onCustomStartChange,
  onCustomEndChange,
  onApplyCustom,
  activeStartDate,
  activeEndDate,
  previousStartDate,
  previousEndDate
}) => {
  const formatDateDisplay = (dStr?: string) => {
    if (!dStr) return '';
    try {
      const d = new Date(dStr);
      return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dStr;
    }
  };

  return (
    <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-orange-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            Date Range & Comparison
          </span>
        </div>

        {/* Range Presets Buttons */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#0a0d14] p-1 rounded-xl border border-slate-800">
          {PRESET_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => onSelectPreset(opt.id)}
              className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors cursor-pointer ${
                preset === opt.id
                  ? 'bg-orange-500 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Inputs (when custom is selected) */}
      {preset === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>Start Date:</span>
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => onCustomStartChange(e.target.value)}
              className="bg-[#0a0d14] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500"
            />
          </div>
          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span>End Date:</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => onCustomEndChange(e.target.value)}
              className="bg-[#0a0d14] border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500"
            />
          </div>
          <button
            onClick={onApplyCustom}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-mono font-bold px-3 py-1 rounded-lg transition-colors cursor-pointer"
          >
            Apply Range
          </button>
        </div>
      )}

      {/* Interval Comparison Indicator */}
      {activeStartDate && activeEndDate && (
        <div className="flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400 pt-1">
          <div>
            Current Period:{' '}
            <span className="text-slate-200 font-semibold">
              {formatDateDisplay(activeStartDate)} – {formatDateDisplay(activeEndDate)}
            </span>
          </div>
          {previousStartDate && previousEndDate && (
            <div className="text-slate-500">
              Comparing to:{' '}
              <span className="text-slate-400">
                {formatDateDisplay(previousStartDate)} – {formatDateDisplay(previousEndDate)}
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
