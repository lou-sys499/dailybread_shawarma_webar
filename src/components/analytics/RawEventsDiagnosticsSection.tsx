import React, { useState, useMemo } from 'react';
import { 
  Database, Search, Filter, Download, Eye, ChevronLeft, ChevronRight, Copy, Check, X 
} from 'lucide-react';
import { AnalyticsEvent } from '../../types/analytics';

interface RawEventsDiagnosticsSectionProps {
  events: AnalyticsEvent[];
}

export const RawEventsDiagnosticsSection: React.FC<RawEventsDiagnosticsSectionProps> = ({
  events = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedEvent, setSelectedEvent] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSource, setSelectedSource] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [inspectEvent, setInspectEvent] = useState<AnalyticsEvent | null>(null);
  const [copied, setCopied] = useState(false);

  // Extract unique events, categories, and sources for dropdowns
  const uniqueEvents = useMemo(() => {
    return Array.from(new Set(events.map(e => e.event))).sort();
  }, [events]);

  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(events.map(e => e.event_category || 'other'))).sort();
  }, [events]);

  const uniqueSources = useMemo(() => {
    return Array.from(new Set(events.map(e => e.source || 'website'))).sort();
  }, [events]);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      if (selectedEvent !== 'all' && e.event !== selectedEvent) return false;
      if (selectedCategory !== 'all' && (e.event_category || 'other') !== selectedCategory) return false;
      if (selectedSource !== 'all' && (e.source || 'website') !== selectedSource) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const inEvent = e.event.toLowerCase().includes(q);
        const inVisitor = (e.visitor_id || '').toLowerCase().includes(q);
        const inSession = (e.session_id || '').toLowerCase().includes(q);
        const inCampaign = (e.campaign || '').toLowerCase().includes(q);
        if (!inEvent && !inVisitor && !inSession && !inCampaign) return false;
      }
      return true;
    });
  }, [events, selectedEvent, selectedCategory, selectedSource, searchQuery]);

  // Paginate
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const paginatedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage, pageSize]);

  const maskToken = (token?: string | null) => {
    if (!token) return 'anonymous';
    if (token.length <= 10) return token;
    return `${token.slice(0, 6)}...${token.slice(-4)}`;
  };

  const handleCopyJson = () => {
    if (!inspectEvent) return;
    navigator.clipboard.writeText(JSON.stringify(inspectEvent, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const exportCSV = () => {
    if (!filteredEvents.length) return;
    const headers = ['ID', 'Created At', 'Event', 'Category', 'Source', 'Visitor ID', 'Session ID', 'Campaign', 'Data'];
    const rows = filteredEvents.map(e => [
      e.id,
      e.created_at,
      e.event,
      e.event_category || '',
      e.source || '',
      e.visitor_id || '',
      e.session_id,
      e.campaign,
      JSON.stringify(e.data || {}).replace(/"/g, '""')
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(f => `"${f}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `dailybread_analytics_export_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-2">
            <Database size={16} className="text-orange-400" />
            <span>9. Raw Telemetry Diagnostics</span>
          </h2>
          <p className="text-xs text-slate-400">
            Audit trail of ingested events with search, category filters, and payload inspection
          </p>
        </div>

        <button
          onClick={exportCSV}
          disabled={filteredEvents.length === 0}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
        >
          <Download size={13} />
          <span>Export CSV ({filteredEvents.length})</span>
        </button>
      </div>

      {/* Filters Toolbar */}
      <div className="bg-[#121722] border border-slate-800 rounded-2xl p-4 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search event, session, visitor ID..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-[#0a0d14] border border-slate-700 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Event Filter */}
          <select
            value={selectedEvent}
            onChange={(e) => {
              setSelectedEvent(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0a0d14] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Events ({uniqueEvents.length})</option>
            {uniqueEvents.map(ev => (
              <option key={ev} value={ev}>{ev}</option>
            ))}
          </select>

          {/* Category Filter */}
          <select
            value={selectedCategory}
            onChange={(e) => {
              setSelectedCategory(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0a0d14] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          {/* Source Filter */}
          <select
            value={selectedSource}
            onChange={(e) => {
              setSelectedSource(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-[#0a0d14] border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-orange-500"
          >
            <option value="all">All Sources</option>
            {uniqueSources.map(src => (
              <option key={src} value={src}>{src}</option>
            ))}
          </select>
        </div>

        {/* Diagnostics Table */}
        <div className="overflow-x-auto border border-slate-800 rounded-xl">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-[#0a0d14] text-slate-400 uppercase text-[10px] border-b border-slate-800">
              <tr>
                <th className="px-3 py-2.5">Time</th>
                <th className="px-3 py-2.5">Event</th>
                <th className="px-3 py-2.5">Category</th>
                <th className="px-3 py-2.5">Source</th>
                <th className="px-3 py-2.5">Visitor ID</th>
                <th className="px-3 py-2.5">Session ID</th>
                <th className="px-3 py-2.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 bg-[#0a0d14]/40">
              {paginatedEvents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500 font-mono">
                    No matching events found.
                  </td>
                </tr>
              ) : (
                paginatedEvents.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-3 py-2 text-slate-400 whitespace-nowrap">
                      {new Date(e.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="px-3 py-2 font-bold text-slate-200">
                      {e.event}
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                        {e.event_category || 'generic'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-slate-400">
                      {e.source || 'website'}
                    </td>
                    <td className="px-3 py-2 text-slate-500 font-mono">
                      {maskToken(e.visitor_id)}
                    </td>
                    <td className="px-3 py-2 text-slate-500 font-mono">
                      {maskToken(e.session_id)}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => setInspectEvent(e)}
                        className="text-orange-400 hover:text-orange-300 p-1 rounded hover:bg-slate-800 transition-colors cursor-pointer"
                        title="View JSON payload"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 pt-1">
          <div>
            Showing <strong className="text-slate-200">{paginatedEvents.length}</strong> of{' '}
            <strong className="text-slate-200">{filteredEvents.length}</strong> events
          </div>

          <div className="flex items-center gap-2">
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="bg-[#0a0d14] border border-slate-700 rounded-lg px-2 py-1 text-xs text-slate-300 font-mono"
            >
              <option value={10}>10 / page</option>
              <option value={15}>15 / page</option>
              <option value={25}>25 / page</option>
              <option value={50}>50 / page</option>
            </select>

            <button
              onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
              disabled={currentPage <= 1}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            <span>
              Page <strong className="text-slate-200">{currentPage}</strong> of{' '}
              <strong className="text-slate-200">{totalPages}</strong>
            </span>
            <button
              onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
              disabled={currentPage >= totalPages}
              className="p-1 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 transition-colors cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Inspect JSON Modal */}
      {inspectEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs animate-fade-in">
          <div className="bg-[#121722] border border-slate-700 rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2 font-mono">
                <span className="text-xs font-bold text-slate-200">Event Payload:</span>
                <span className="text-xs text-orange-400 font-bold">{inspectEvent.event}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyJson}
                  className="flex items-center gap-1 text-xs font-mono text-slate-300 bg-slate-800 hover:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-700 transition-colors cursor-pointer"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{copied ? 'Copied' : 'Copy JSON'}</span>
                </button>
                <button
                  onClick={() => setInspectEvent(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 overflow-y-auto bg-[#0a0d14] flex-1 font-mono text-xs text-slate-300">
              <pre className="whitespace-pre-wrap break-all leading-relaxed">
                {JSON.stringify(inspectEvent, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
